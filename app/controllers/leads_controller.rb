class LeadsController < ApplicationController
  layout "visitor"

  def create
    @lead = Lead.new(lead_params.merge(source: lead_source))

    if spam_submission?
      redirect_to contact_path, notice: "Thanks. We received your request and will get back to you shortly."
    elsif save_lead_and_account
      if @created_client_account
        sign_in(:user, @created_client_user)
        session[:password_setup_user_id] = @created_client_user.id
        redirect_to edit_password_setup_path, notice: "Thanks. Your request was sent successfully. Please set your client portal password to continue."
      else
        redirect_to contact_path, notice: "Thanks. Your project request was sent successfully. We also prepared your client portal account using your email."
      end
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
    @created_client_user = nil
    @created_client_account = false

    ActiveRecord::Base.transaction do
      @lead.save!
      @created_client_user, @created_client_account = create_client_account!
    end
    true
  rescue ActiveRecord::RecordInvalid
    false
  end

  def create_client_account!
    return [ nil, false ] if @lead.email.blank?

    user = User.find_or_initialize_by(email: @lead.email.downcase)
    created_account = user.new_record?
    user.assign_attributes(client_account_attributes(user))
    user.password = SecureRandom.hex(18) if created_account
    user.password_confirmation = user.password if created_account
    user.save!

    ActivityLog.record!(
      subject: @lead,
      user: user,
      action: created_account ? "Client portal account created" : "Client portal account linked",
      details: "Account email: #{user.email}"
    )

    [ user, created_account ]
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
