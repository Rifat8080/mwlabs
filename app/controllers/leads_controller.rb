class LeadsController < ApplicationController
  layout "visitor"

  def create
    @lead = Lead.new(lead_params.merge(source: lead_source))

    if spam_submission?
      redirect_to contact_path, notice: "Thanks. We received your request and will get back to you shortly."
    elsif @lead.save
      redirect_to contact_path, notice: "Thanks. Your project request was sent to M&W Labs successfully."
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
end
