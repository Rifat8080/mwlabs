require "csv"

module Leads
  class CsvImporter
    Result = Data.define(
      :imported_count,
      :failed_count,
      :skipped_count,
      :column_mapping,
      :custom_columns,
      :row_errors,
      :fatal_error
    ) do
      def success?
        fatal_error.blank?
      end

      def total_processed
        imported_count + failed_count
      end

      def summary_message
        return fatal_error if fatal_error.present?

        parts = []
        parts << "#{imported_count} #{'lead'.pluralize(imported_count)} imported" if imported_count.positive?
        parts << "#{failed_count} #{'row'.pluralize(failed_count)} failed" if failed_count.positive?
        parts << "#{skipped_count} blank #{'row'.pluralize(skipped_count)} skipped" if skipped_count.positive?
        parts << "#{custom_columns.size} custom #{'column'.pluralize(custom_columns.size)} created" if custom_columns.any?
        parts.presence&.join(", ") || "No leads were imported."
      end
    end

    ATTRIBUTE_ALIASES = {
      name: %w[name full_name fullname contact_name lead_name person_name contact],
      phone: %w[phone phone_number mobile mobile_number tel telephone whatsapp whatsapp_number contact_number],
      email: %w[email email_address e_mail contact_email mail],
      company_name: %w[company company_name organization organisation org business business_name brand],
      country: %w[country nation region location],
      source: %w[source lead_source channel origin referral_source],
      service_interest: %w[service service_interest interest services product_interest offering],
      budget: %w[budget budget_amount estimated_budget deal_value value],
      urgency: %w[urgency urgency_level priority_level],
      message: %w[message inquiry enquiry project_details requirements customer_message brief],
      status: %w[status lead_status pipeline_stage stage deal_stage],
      follow_up_date: %w[follow_up_date followup_date follow_up next_follow_up followup reminder_date],
      notes: %w[notes internal_notes crm_notes note remarks admin_notes],
      assigned_to_id: %w[assigned_to assigned_to_id assignee owner rep sales_rep assigned_person account_owner],
      client_id: %w[client_id client linked_client existing_client]
    }.freeze

    IMPORTABLE_COLUMNS = %w[
      name phone email company_name country source service_interest budget urgency
      message status follow_up_date notes assigned_to_id client_id
    ].freeze

    RESERVED_COLUMNS = %w[id created_at updated_at].freeze

    def initialize(file:, importer: nil)
      @file = file
      @importer = importer
    end

    def call
      return failure("Please choose a CSV file to import.") if file.blank?

      content = read_file_content
      return failure("The uploaded file is empty.") if content.blank?

      table = parse_csv(content)
      plan = build_column_plan(table.headers)
      custom_columns = plan.filter_map { |column| column[:header] if column[:target] == :custom_field }

      imported_count = 0
      failed_count = 0
      skipped_count = 0
      row_errors = []

      table.each_with_index do |row, index|
        row_number = index + 2

        if row_blank?(row)
          skipped_count += 1
          next
        end

        lead_attributes = build_lead_attributes(row, plan)
        lead = Lead.new(lead_attributes)
        lead.source = lead.source.presence || "CSV Import"

        if lead.save
          imported_count += 1
          record_import_activity(lead)
        else
          failed_count += 1
          row_errors << { row: row_number, message: lead.errors.full_messages.to_sentence }
        end
      end

      Result.new(
        imported_count: imported_count,
        failed_count: failed_count,
        skipped_count: skipped_count,
        column_mapping: mapping_summary(plan),
        custom_columns: custom_columns.uniq,
        row_errors: row_errors,
        fatal_error: nil
      )
    rescue CSV::MalformedCSVError => error
      failure("The CSV file could not be read: #{error.message}")
    end

    private

    attr_reader :file, :importer

    def failure(message)
      Result.new(
        imported_count: 0,
        failed_count: 0,
        skipped_count: 0,
        column_mapping: {},
        custom_columns: [],
        row_errors: [],
        fatal_error: message
      )
    end

    def read_file_content
      raw = file.respond_to?(:read) ? file.read : file.to_s
      raw = raw.delete_prefix("\uFEFF")
      raw.strip
    end

    def parse_csv(content)
      CSV.parse(
        content,
        headers: true,
        liberal_parsing: true,
        skip_blanks: false
      )
    end

    def build_column_plan(headers)
      used_attributes = Set.new

      Array(headers).map do |header|
        normalized = normalize_header(header)
        attribute = resolve_attribute(normalized)

        if attribute && !used_attributes.include?(attribute)
          used_attributes << attribute
          { header: header, target: :attribute, attribute: attribute }
        else
          { header: header, target: :custom_field, label: header_label(header) }
        end
      end
    end

    def resolve_attribute(normalized)
      return nil if normalized.blank?
      return nil if RESERVED_COLUMNS.include?(normalized)
      return normalized.to_sym if IMPORTABLE_COLUMNS.include?(normalized)

      ATTRIBUTE_ALIASES.each do |attribute, aliases|
        return attribute if aliases.include?(normalized)
      end

      nil
    end

    def normalize_header(header)
      header.to_s.strip.downcase.gsub(/[^a-z0-9]+/, "_").gsub(/\A_|_\z/, "")
    end

    def header_label(header)
      header.to_s.strip.presence || "Imported column"
    end

    def mapping_summary(plan)
      plan.each_with_object({}) do |column, summary|
        summary[column[:header]] = if column[:target] == :attribute
          column[:attribute].to_s
        else
          "custom_field"
        end
      end
    end

    def row_blank?(row)
      row.fields.all? { |value| value.to_s.strip.blank? }
    end

    def build_lead_attributes(row, plan)
      attributes = { custom_fields: [] }

      plan.each do |column|
        value = row[column[:header]].to_s.strip
        next if value.blank?

        if column[:target] == :attribute
          assign_attribute(attributes, column[:attribute], column[:header], value)
        else
          attributes[:custom_fields] << { "label" => column[:label], "value" => value }
        end
      end

      attributes[:name] = infer_name(attributes) if attributes[:name].blank?
      attributes[:custom_fields].uniq! { |field| [ field["label"], field["value"] ] }
      attributes
    end

    def assign_attribute(attributes, attribute, header, value)
      case attribute
      when :status
        assign_enum_attribute(attributes, attribute, header, value, Lead::STATUSES)
      when :source
        assign_enum_attribute(attributes, attribute, header, value, Lead::SOURCES)
      when :urgency
        assign_enum_attribute(attributes, attribute, header, value, Lead::URGENCIES)
      when :budget
        assign_decimal_attribute(attributes, attribute, header, value)
      when :follow_up_date
        assign_date_attribute(attributes, attribute, header, value)
      when :assigned_to_id
        assign_user_attribute(attributes, header, value)
      when :client_id
        assign_client_attribute(attributes, header, value)
      else
        attributes[attribute] = value
      end
    end

    def assign_enum_attribute(attributes, attribute, header, value, allowed_values)
      matched = match_enum(value, allowed_values)
      if matched
        attributes[attribute] = matched
      else
        store_custom_field(attributes, header, value)
      end
    end

    def assign_decimal_attribute(attributes, attribute, header, value)
      normalized = value.delete(",").strip
      if normalized.match?(/\A-?\d+(\.\d+)?\z/)
        attributes[attribute] = BigDecimal(normalized)
      else
        store_custom_field(attributes, header, value)
      end
    end

    def assign_date_attribute(attributes, attribute, header, value)
      parsed = parse_date(value)
      if parsed
        attributes[attribute] = parsed
      else
        store_custom_field(attributes, header, value)
      end
    end

    def assign_user_attribute(attributes, header, value)
      user = resolve_user(value)
      if user
        attributes[:assigned_to_id] = user.id
      else
        store_custom_field(attributes, header, value)
      end
    end

    def assign_client_attribute(attributes, header, value)
      client = resolve_client(value)
      if client
        attributes[:client_id] = client.id
      else
        store_custom_field(attributes, header, value)
      end
    end

    def store_custom_field(attributes, header, value)
      attributes[:custom_fields] << { "label" => header_label(header), "value" => value }
    end

    def infer_name(attributes)
      return attributes[:company_name] if attributes[:company_name].present?
      return attributes[:email].to_s.split("@").first.titleize if attributes[:email].present?

      custom_name = attributes[:custom_fields].find do |field|
        field["label"].to_s.match?(/name/i)
      end
      return custom_name["value"] if custom_name.present?

      phone_field = attributes[:custom_fields].find { |field| field["label"].to_s.match?(/phone|mobile/i) }
      return "Imported lead #{phone_field['value']}" if phone_field.present?

      "Imported lead"
    end

    def match_enum(value, allowed_values)
      normalized = value.to_s.strip
      return nil if normalized.blank?

      exact = allowed_values.find { |option| option.casecmp?(normalized) }
      return exact if exact

      allowed_values.find do |option|
        option.downcase.include?(normalized.downcase) || normalized.downcase.include?(option.downcase)
      end
    end

    def parse_date(value)
      return value.to_date if value.respond_to?(:to_date) && !value.is_a?(String)

      string = value.to_s.strip
      return nil if string.blank?

      Date.parse(string)
    rescue ArgumentError, TypeError
      formats = [ "%m/%d/%Y", "%d/%m/%Y", "%Y-%m-%d", "%d-%m-%Y", "%b %d, %Y", "%d %b %Y" ]
      formats.each do |format|
        return Date.strptime(string, format)
      rescue ArgumentError
        next
      end

      nil
    end

    def resolve_user(value)
      normalized = value.to_s.strip
      return nil if normalized.blank?
      return User.find_by(id: normalized) if normalized.match?(/\A[0-9a-f-]{36}\z/i)

      User.find_by("LOWER(email) = ?", normalized.downcase) ||
        User.all.find { |user| user.display_name.to_s.casecmp?(normalized) }
    end

    def resolve_client(value)
      normalized = value.to_s.strip
      return nil if normalized.blank?
      return Client.find_by(id: normalized) if normalized.match?(/\A[0-9a-f-]{36}\z/i)

      Client.find_by("LOWER(email) = ?", normalized.downcase) ||
        Client.where("LOWER(name) = ? OR LOWER(company_name) = ?", normalized.downcase, normalized.downcase).first
    end

    def record_import_activity(lead)
      return unless importer

      ActivityLog.record!(
        subject: lead,
        user: importer,
        action: "Lead imported",
        details: "Imported from CSV."
      )
    end
  end
end
