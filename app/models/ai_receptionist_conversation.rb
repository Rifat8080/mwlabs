class AiReceptionistConversation < ApplicationRecord
  CHANNELS = %w[website whatsapp messenger manual].freeze
  STATUSES = %w[open qualified handed_off closed].freeze

  belongs_to :lead, optional: true
  has_many :ai_receptionist_messages, dependent: :destroy

  validates :channel, inclusion: { in: CHANNELS }
  validates :status, inclusion: { in: STATUSES }
  validates :visitor_token, presence: true, uniqueness: true
  validates :external_id, uniqueness: { scope: :channel, allow_blank: true }

  before_validation :ensure_visitor_token
  before_validation :normalize_phone_number

  def display_name
    name.presence || company_name.presence || email.presence || phone.presence || "Website visitor"
  end

  def captured_details
    {
      name: name,
      email: email,
      phone: phone,
      country: country,
      company_name: company_name,
      service_interest: service_interest,
      budget: budget,
      urgency: urgency
    }.compact_blank
  end

  def missing_lead_fields
    fields = []
    fields << "name" if name.blank?
    fields << "email or WhatsApp number" if email.blank? && phone.blank?
    fields << "country for phone code" if phone_country_code_missing?
    fields << "service need" if service_interest.blank?
    fields << "budget" if budget.blank?
    fields << "timeline or urgency" if urgency.blank?
    fields
  end

  def recent_messages(limit: 10)
    ai_receptionist_messages.order(created_at: :desc).limit(limit).reverse
  end

  private

  def ensure_visitor_token
    self.visitor_token ||= SecureRandom.uuid
  end

  def normalize_phone_number
    canonical_country = AiReceptionist::PhoneNumberNormalizer.canonical_country_for(country)
    self.country = canonical_country if canonical_country.present?
    self.phone = AiReceptionist::LeadExtractor.normalize_phone(phone, country: country)
  end

  def phone_country_code_missing?
    phone.present? && !phone.start_with?("+") && country.blank?
  end
end
