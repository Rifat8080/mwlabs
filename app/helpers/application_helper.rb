module ApplicationHelper
  def default_meta_description
    "M&W Labs helps startups and businesses build, market, automate, and scale with websites, software, digital marketing, branding, content, AI automation, and growth strategy."
  end

  def admin_meta_description
    "M&W Labs Control Center for managing leads, clients, quotes, projects, tasks, invoices, files, payments, expenses, follow-ups, and client portal collaboration."
  end

  def meta_description_content(default: default_meta_description)
    strip_tags(content_for(:meta_description).presence || default).squish
  end

  def admin_field_label(field)
    field[:label].presence || field[:name].to_s.humanize
  end

  def admin_value(value)
    return value.display_name if value.respond_to?(:display_name)

    case value
    when nil
      "—"
    when Date, Time, ActiveSupport::TimeWithZone
      value.to_date.to_fs(:long)
    when BigDecimal
      number_to_currency(value)
    when TrueClass
      "Yes"
    when FalseClass
      "No"
    else
      value.presence || "—"
    end
  end

  def admin_value_copyable?(value)
    value.is_a?(String) && value.present? && !admin_value_link?(value)
  end

  def admin_value_link?(value)
    return false unless value.is_a?(String)

    normalized = value.strip
    normalized.match?(/\A(?:https?:\/\/|mailto:|tel:|www\.)/i) || normalized.match?(/\A[^@\s]+@[^@\s]+\.[^@\s]+\z/)
  end

  def admin_value_link_url(value)
    return value unless value.is_a?(String)

    normalized = value.strip
    if normalized.match?(/\Awww\./i)
      "https://#{normalized}"
    else
      normalized
    end
  end

  def admin_status_class(status)
    case status.to_s
    when "Won", "Accepted", "Paid", "Done", "Completed", "Delivered", "Active", "Approved", "Published"
      "bg-emerald-50 text-emerald-700 ring-emerald-200"
    when "Lost", "Rejected", "Cancelled", "Overdue", "Archived"
      "bg-rose-50 text-rose-700 ring-rose-200"
    when "Draft", "To Do", "New", "Open", "Idea", "Inbox"
      "bg-slate-50 text-slate-700 ring-slate-200"
    else
      "bg-amber-50 text-amber-700 ring-amber-200"
    end
  end

  def render_toast(type: "info", title:, message: nil)
    render "shared/toast", type: type, title: title, message: message
  end

  def admin_priority_class(priority)
    case priority.to_s
    when "Critical"
      "bg-rose-100 text-rose-700"
    when "High"
      "bg-amber-100 text-amber-700"
    when "Medium"
      "bg-blue-100 text-blue-700"
    else
      "bg-slate-100 text-slate-600"
    end
  end

  def agency_task_category_badge_class(category)
    case category&.color
    when "slate"
      "bg-slate-100 text-slate-700"
    when "blue"
      "bg-blue-50 text-blue-700"
    when "emerald"
      "bg-emerald-50 text-emerald-700"
    when "purple"
      "bg-purple-50 text-purple-700"
    when "pink"
      "bg-pink-50 text-pink-700"
    when "amber"
      "bg-amber-50 text-amber-700"
    when "cyan"
      "bg-cyan-50 text-cyan-700"
    when "rose"
      "bg-rose-50 text-rose-700"
    else
      "bg-slate-100 text-slate-700"
    end
  end

  def admin_initials(name)
    parts = name.to_s.split(/\s+/).reject(&:blank?)
    return "?" if parts.empty?

    parts.first(2).map { |part| part[0] }.join.upcase
  end

  def admin_resource_icon(resource_model)
    {
      "Lead" => "fa-user-plus",
      "Client" => "fa-address-book",
      "Reminder" => "fa-bell",
      "Service" => "fa-layer-group",
      "Quote" => "fa-file-signature",
      "Project" => "fa-diagram-project",
      "FileUpload" => "fa-folder-open",
      "Invoice" => "fa-file-invoice-dollar",
      "Payment" => "fa-credit-card",
      "Expense" => "fa-receipt",
      "User" => "fa-users",
      "Task" => "fa-list-check",
      "BlogPost" => "fa-newspaper",
      "AgencyTask" => "fa-list-check",
      "AgencyTaskCategory" => "fa-tags",
      "MarketingItem" => "fa-bullhorn",
      "DailyPlan" => "fa-calendar-day"
    }.fetch(resource_model.name, "fa-layer-group")
  end

  def admin_resource_record_title(resource)
    return "Record" if resource.blank?

    resource.try(:display_name) || resource.try(:name) || resource.class.model_name.human
  end

  def admin_file_download_allowed?(file_upload)
    file_upload.file.attached? && (!client_user? || file_upload.downloadable?)
  end

  def admin_file_size(file_upload)
    return "No file" unless file_upload.file.attached?

    number_to_human_size(file_upload.file_size)
  end

  def admin_cover_image_preview(attachment, resize: [ 480, 270 ], **options)
    return unless attachment.attached?

    options = options.reverse_merge(alt: "Cover image preview")

    if resize.present?
      begin
        return image_tag attachment.variant(resize_to_limit: resize), **options
      rescue StandardError
        # Fall back to the original blob when variants are unavailable.
      end
    end

    image_tag rails_blob_path(attachment, only_path: true), **options
  end
end
