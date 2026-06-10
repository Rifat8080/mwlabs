module ApplicationHelper
  def admin_field_label(field)
    field[:label].presence || field[:name].to_s.humanize
  end

  def admin_value(value)
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
    when "Won", "Accepted", "Paid", "Done", "Completed", "Delivered", "Active", "Approved"
      "bg-emerald-50 text-emerald-700 ring-emerald-200"
    when "Lost", "Rejected", "Cancelled", "Overdue"
      "bg-rose-50 text-rose-700 ring-rose-200"
    when "Draft", "To Do", "New", "Open"
      "bg-slate-50 text-slate-700 ring-slate-200"
    else
      "bg-amber-50 text-amber-700 ring-amber-200"
    end
  end
end
