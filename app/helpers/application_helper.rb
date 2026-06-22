module ApplicationHelper
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

  def admin_status_class(status)
    case status.to_s
    when "Won", "Accepted", "Paid", "Done", "Completed", "Delivered", "Active", "Approved", "Published"
      "bg-emerald-50 text-emerald-700 ring-emerald-200"
    when "Lost", "Rejected", "Cancelled", "Overdue"
      "bg-rose-50 text-rose-700 ring-rose-200"
    when "Draft", "To Do", "New", "Open"
      "bg-slate-50 text-slate-700 ring-slate-200"
    else
      "bg-amber-50 text-amber-700 ring-amber-200"
    end
  end

  def render_toast(type: "info", title:, message: nil)
    render "shared/toast", type: type, title: title, message: message
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
      "BlogPost" => "fa-newspaper"
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
