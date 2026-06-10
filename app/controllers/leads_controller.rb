class LeadsController < ApplicationController
  layout "visitor"

  def create
    @lead = Lead.new(lead_params.merge(source: lead_source))

    if spam_submission?
      redirect_to contact_path, notice: "Thanks. We received your request and will get back to you shortly."
    elsif save_lead_and_account
      redirect_to contact_path, notice: "Thanks. Your project request was sent successfully. We also prepared your client portal account using your email."
    else
      flash.now[:alert] = "Please check the form and try again."
      render "pages/contact", status: :unprocessable_entity
    end
  end

  private

  def lead_params
    params.require(:lead).permit(
      :name,
      :phone,
      :email,
      :company_name,
      :country,
      :service_interest,
      :budget,
      :urgency,
      :message
    )
  end

  def lead_source
    params.dig(:lead, :source).presence_in(Lead::SOURCES) || "Website Contact Form"
  end

  def spam_submission?
    params[:website].present?
  end

  def save_lead_and_account
    ActiveRecord::Base.transaction do
      @lead.save!
      create_client_account!
    end
    true
  rescue ActiveRecord::RecordInvalid
    false
  end

  def create_client_account!
    return if @lead.email.blank?

    user = User.find_or_initialize_by(email: @lead.email.downcase)
    user.assign_attributes(client_account_attributes(user))
    user.password = SecureRandom.hex(18) if user.new_record?
    user.password_confirmation = user.password if user.new_record?
    user.save!

    ActivityLog.record!(
      subject: @lead,
      user: user,
      action: user.previously_new_record? ? "Client portal account created" : "Client portal account linked",
      details: "Account email: #{user.email}"
    )
  end

  def client_account_attributes(user)
    attributes = {
      name: @lead.name,
      phone: @lead.phone,
      status: "Active"
    }
    attributes[:role] = "client" if user.new_record?
    attributes.compact
  end
end
