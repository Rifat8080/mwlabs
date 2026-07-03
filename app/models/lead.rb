class Lead < ApplicationRecord
  SOURCES = [
    "Website Contact Form", "AI Receptionist", "Landing Page", "Quotation Form", "Facebook", "Messenger",
    "Google Ads", "WhatsApp", "Referral", "Cold Email", "LinkedIn", "Manual Entry"
  ].freeze
  STATUSES = [
    "New", "Contacted", "Need Requirement", "Quote Preparing", "Quote Sent",
    "Follow Up", "Won", "Lost", "Future Prospect"
  ].freeze
  URGENCIES = [ "Low", "Normal", "High", "Urgent" ].freeze

  belongs_to :assigned_to, class_name: "User", optional: true, inverse_of: :assigned_leads
  belongs_to :client, optional: true
  has_many :quotes, dependent: :nullify
  has_many :activity_logs, as: :subject, dependent: :destroy
  has_many :reminders, as: :remindable, dependent: :destroy
  has_many :ai_receptionist_conversations, dependent: :nullify

  validates :name, presence: true
  validates :email, format: { with: URI::MailTo::EMAIL_REGEXP }, allow_blank: true
  validates :status, inclusion: { in: STATUSES }

  before_validation :normalize_custom_fields

  after_create_commit :record_created_activity
  after_save_commit :sync_follow_up_reminder, if: :saved_change_to_follow_up_date?
  after_save :sync_client_from_status, if: :saved_change_to_status?
  after_update_commit :record_status_activity, if: :saved_change_to_status?

  scope :followups_due, -> { where.not(follow_up_date: nil).where(follow_up_date: ..Date.current) }
  scope :new_this_month, -> { where(created_at: Time.current.beginning_of_month..) }

  def self.custom_fields_supported?
    column_names.include?("custom_fields")
  end

  def custom_fields
    return [] unless self.class.custom_fields_supported?

    read_attribute(:custom_fields).presence || []
  end

  def custom_fields=(value)
    return unless self.class.custom_fields_supported?

    write_attribute(:custom_fields, value)
  end

  def display_name
    company_name.present? ? "#{name} (#{company_name})" : name
  end

  def next_action
    case status
    when "New"
      "Contact the lead and confirm the requirement."
    when "Contacted"
      "Book a meeting or collect deeper requirements."
    when "Need Requirement"
      "Collect missing business details, assets, and scope."
    when "Quote Preparing"
      "Prepare and send the quote."
    when "Quote Sent", "Follow Up"
      "Follow up and handle objections."
    when "Won"
      "Start project onboarding."
    when "Lost"
      "Record why the lead was lost."
    when "Future Prospect"
      "Schedule a future nurture follow-up."
    else
      "Review lead status."
    end
  end

  def cold_call_script_steps
    [
      {
        title: "Step 1: Introduction",
        lines: [
          "Hello, is this #{company_name.present? ? company_name : '[Business Owner Name]'}?",
          "Hi [Name], my name is [Your Name] from M&W Labs.",
          "I’m not calling to sell anything right now. I was looking at businesses in your area and noticed your online presence, so I wanted to ask you a quick question.",
          "Have I caught you at a bad time?"
        ]
      },
      {
        title: "Step 2: If they say no",
        lines: [
          "If they have a website: I had a look at your website before calling. Can I ask, are you getting enough enquiries or customers from it right now?",
          "If they do not have a website: I noticed you don’t currently have a website. Are most of your customers finding you through referrals, social media, or something else?"
        ]
      },
      {
        title: "Step 3: Ask questions",
        lines: [
          "How do most of your customers find you?",
          "Would you like to get more enquiries or customers this year?",
          "What’s the biggest challenge in growing the business right now?"
        ]
      },
      {
        title: "Step 4: Relate their problem",
        lines: [
          "I understand. We speak with a lot of business owners who have the same challenge.",
          "The problem is that many businesses lose customers online because their website isn’t converting visitors into enquiries."
        ]
      },
      {
        title: "Step 5: Explain what M&W Labs does",
        lines: [
          "At M&W Labs, we help businesses attract more customers online.",
          "We build modern websites and improve existing ones so they generate more enquiries, build trust, and help businesses grow."
        ]
      },
      {
        title: "Step 6: Offer free value",
        lines: [
          "We’re currently offering a free website and online presence review.",
          "We’ll show you what’s working, what’s not working, and what improvements could help bring in more customers."
        ]
      },
      {
        title: "Step 7: Book a meeting",
        lines: [
          "Would you be open to a quick 15-minute call with one of our specialists this week?"
        ]
      }
    ]
  end

  def cold_call_note_prompts
    [
      "How do most customers find you?",
      "Would you like more enquiries or customers this year?",
      "What is the biggest challenge in growing the business right now?",
      "Next step / meeting booked"
    ]
  end

  def cold_call_questions
    cold_call_note_prompts.map do |prompt|
      {
        key: prompt.parameterize(separator: "_"),
        label: prompt
      }
    end
  end

  def cold_call_answer_values
    values = { question_answers: {}, client_answers: "", caller_notes: "" }
    return values if notes.blank?

    current_section = nil
    notes.to_s.lines.each do |line|
      line = line.chomp
      case line.strip
      when "Client answers:"
        current_section = :client_answers
        next
      when "Question answers:"
        current_section = :question_answers
        next
      when "Caller notes:"
        current_section = :caller_notes
        next
      end

      next if line.strip.blank?

      case current_section
      when :question_answers
        if line =~ /\A(.+?):\s*(.*)\z/
          label = Regexp.last_match(1).strip
          answer = Regexp.last_match(2).strip
          question_key = cold_call_questions.find { |item| item[:label] == label }&.dig(:key) || label.parameterize(separator: "_")
          values[:question_answers][question_key] = answer
        end
      when :client_answers
        values[:client_answers] += "\n" unless values[:client_answers].blank?
        values[:client_answers] += line
      when :caller_notes
        values[:caller_notes] += "\n" unless values[:caller_notes].blank?
        values[:caller_notes] += line
      end
    end

    values
  end

  def cold_call_note_template
    <<~TEXT
      Prospect summary:
      - Customer needs:
      - Main objection:
      - Follow-up plan:
      - Next step / meeting booked:
    TEXT
  end

  def append_cold_call_feedback!(client_answers:, caller_notes:, question_answers: {})
    safe_question_answers = question_answers.respond_to?(:to_unsafe_h) ? question_answers.to_unsafe_h : question_answers.to_h

    payload = []
    payload << "Client answers:" if client_answers.present?
    payload << client_answers.to_s.strip if client_answers.present?

    question_lines = safe_question_answers.transform_values(&:to_s).filter_map do |key, answer|
      answer_text = answer.strip
      next if answer_text.blank?
      question = cold_call_questions.find { |item| item[:key] == key }
      "#{question ? question[:label] : key.to_s.humanize}: #{answer_text}"
    end

    if question_lines.any?
      payload << "Question answers:"
      payload.concat(question_lines)
    end

    payload << "Caller notes:" if caller_notes.present?
    payload << caller_notes.to_s.strip if caller_notes.present?

    combined = [ notes.presence, payload.join("\n") ].compact.join("\n\n")
    update!(notes: combined)
  end

  def convert_to_client!
    return client if client.present?

    created_client = Client.create!(
      name: name,
      company_name: company_name,
      email: email,
      phone: phone,
      country: country,
      source: source,
      notes: notes,
      follow_up_date: follow_up_date
    )

    update!(client: created_client, status: "Won")
    created_client
  end

  def add_custom_field!(label:, value:)
    return false unless self.class.custom_fields_supported?

    normalized_label = label.to_s.strip
    normalized_value = value.to_s.strip
    return false if normalized_label.blank? && normalized_value.blank?

    update!(custom_fields: custom_fields + [ { "label" => normalized_label, "value" => normalized_value } ])
  end

  def remove_custom_field_at!(index)
    return false unless self.class.custom_fields_supported?

    fields = custom_fields.dup
    return false unless index.between?(0, fields.length - 1)

    fields.delete_at(index)
    update!(custom_fields: fields)
  end

  private

  def normalize_custom_fields
    return unless self.class.custom_fields_supported?

    entries = case read_attribute(:custom_fields)
    when ActionController::Parameters, Hash
      custom_fields.values
    else
      Array(custom_fields)
    end

    self.custom_fields = entries.filter_map do |field|
      label = field["label"].to_s.strip
      value = field["value"].to_s.strip
      next if label.blank? && value.blank?

      { "label" => label, "value" => value }
    end
  end

  def sync_client_from_status
    case status
    when "Won"
      convert_to_client!
    when "Lost"
      remove_client_for_lost_lead!
    end
  end

  def remove_client_for_lost_lead!
    linked_client = client
    return if linked_client.blank?

    update_column(:client_id, nil)

    if linked_client.projects.exists? || linked_client.invoices.exists?
      linked_client.update!(status: "Inactive")
      ActivityLog.record!(
        subject: self,
        action: "Client archived",
        details: "Linked client was marked inactive because project or invoice history exists."
      )
    elsif linked_client.leads.where.not(id: id).none?
      linked_client.destroy!
      ActivityLog.record!(subject: self, action: "Client removed", details: "Linked client was removed after the lead was lost.")
    end
  end

  def record_created_activity
    ActivityLog.record!(subject: self, action: "Lead created", details: "Lead entered from #{source.presence || 'manual entry'}.")
  end

  def record_status_activity
    ActivityLog.record!(subject: self, action: "Lead status changed", details: "Moved to #{status}.")
  end

  def sync_follow_up_reminder
    return if follow_up_date.blank?

    reminders.where(status: "Open").first_or_initialize.tap do |reminder|
      reminder.user = assigned_to || User.where(role: "admin").first || User.first
      reminder.title = "Follow up with #{display_name}"
      reminder.due_date = follow_up_date
      reminder.next_action = "Follow up about #{service_interest.presence || 'their requirement'}"
      reminder.note = notes
      reminder.save! if reminder.user.present?
    end
  end
end
