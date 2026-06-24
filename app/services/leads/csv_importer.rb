require "csv"
require "roo"

module Leads
  class CsvImporter
    ImportTable = Data.define(:headers, :rows) do
      def each_with_index
        rows.each_with_index { |row, index| yield(row, index) }
      end
    end

    SUPPORTED_EXTENSIONS = %w[.csv .xlsx .xls].freeze

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
      return failure("Please choose a CSV or Excel file to import.") if file.blank?
      return failure("Unsupported file type. Upload a .csv, .xlsx, or .xls file.") unless supported_format?

      table = parse_upload
      return failure("The uploaded file is empty.") if table.headers.blank?

      plan = build_column_plan(table.headers)
      custom_columns = plan.filter_map { |column| column[:header] if column[:target] == :custom_field }

      if custom_columns.any? && !Lead.custom_fields_supported?
        return failure("This file has extra columns (#{custom_columns.join(', ')}) but custom fields are not enabled yet. Run bin/rails db:migrate on the server, then retry the import.")
      end

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
        lead.source = lead.source.presence || import_source_label

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
    rescue StandardError => error
      return failure("The CSV file could not be read: #{error.message}") if file_format == :csv

      failure("The Excel file could not be read: #{error.message}")
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

    def supported_format?
      file_format.present?
    end

    def file_format
      @file_format ||= detect_file_format
    end

    def detect_file_format
      extension = File.extname(uploaded_filename.to_s).downcase
      return extension.delete_prefix(".").to_sym if SUPPORTED_EXTENSIONS.include?(extension)

      if file.respond_to?(:content_type)
        case file.content_type.to_s.downcase
        when "text/csv", "application/csv"
          return :csv
        when "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          return :xlsx
        when "application/vnd.ms-excel"
          return :xls
        end
      end

      :csv if uploaded_filename.blank?
    end

    def uploaded_filename
      return file.original_filename if file.respond_to?(:original_filename)

      file.path if file.respond_to?(:path)
    end

    def import_source_label
      file_format == :csv ? "CSV Import" : "Excel Import"
    end

    def parse_upload
      case file_format
      when :csv
        parse_csv_table(read_file_content)
      when :xlsx, :xls
        parse_excel_table
      end
    end

    def read_file_content
      io = file.respond_to?(:tempfile) ? file.tempfile : file
      io.rewind if io.respond_to?(:rewind)
      raw = io.read
      raw = raw.delete_prefix("\uFEFF")
      raw.strip
    end

    def parse_csv_table(content)
      return ImportTable.new([], []) if content.blank?

      csv = CSV.parse(
        content,
        headers: true,
        liberal_parsing: true,
        skip_blanks: false
      )

      headers = Array(csv.headers).map { |header| header_label(header) }
      rows = csv.map { |row| row_hash(headers, row.fields) }
      ImportTable.new(headers, rows)
    end

    def parse_excel_table
      spreadsheet = Roo::Spreadsheet.open(import_path, extension: file_format)
      sheet = spreadsheet.sheet(0)

      return ImportTable.new([], []) if sheet.last_row.nil? || sheet.last_row < 1

      headers = sheet.row(1).each_with_index.map do |header, index|
        header_label(header, fallback: "Column #{index + 1}")
      end

      rows = (2..sheet.last_row).map do |row_number|
        row_hash(headers, sheet.row(row_number))
      end

      ImportTable.new(headers, rows)
    end

    def import_path
      return @import_path if defined?(@import_path) && @import_path.present?

      if file.respond_to?(:tempfile)
        @import_path = file.tempfile.path
      elsif file.respond_to?(:path) && File.exist?(file.path.to_s)
        @import_path = file.path
      else
        extension = ".#{file_format}"
        @tempfile = Tempfile.new([ "lead_import", extension ])
        @tempfile.binmode
        @tempfile.write(file.respond_to?(:read) ? file.read : file.to_s)
        @tempfile.flush
        @import_path = @tempfile.path
      end
    end

    def row_hash(headers, values)
      headers.each_with_index.to_h do |header, index|
        [ header, values[index] ]
      end
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

    def header_label(header, fallback: "Imported column")
      header.to_s.strip.presence || fallback
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
      row.values.all? { |value| normalize_cell(value).blank? }
    end

    def build_lead_attributes(row, plan)
      attributes = { custom_fields: [] }

      plan.each do |column|
        value = normalize_cell(row[column[:header]]).strip
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

    def normalize_cell(value)
      return "" if value.nil?
      return value.strftime("%Y-%m-%d") if value.is_a?(Date)
      return value.strftime("%Y-%m-%d") if value.is_a?(Time) || value.is_a?(DateTime)
      if value.is_a?(Float) && value.finite? && value == value.floor
        return value.floor.to_s
      end

      value.to_s.strip
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
        details: "Imported from #{import_source_label}."
      )
    end
  end
end
