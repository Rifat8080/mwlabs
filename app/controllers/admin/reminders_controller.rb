module Admin
  class RemindersController < ResourceController
    configure(
      model: Reminder,
      title: "Follow-ups",
      description: "Keep next actions and client reminders visible on the dashboard.",
      columns: %i[ title user remindable due_date status next_action ],
      fields: [
        { name: :user_id, label: "Owner", type: :select, collection: -> { User.order(:email).map { |user| [ user.display_name, user.id ] } } },
        { name: :title, type: :text },
        { name: :due_date, type: :date },
        { name: :status, type: :select, collection: Reminder::STATUSES },
        { name: :next_action, type: :text },
        { name: :note, type: :textarea }
      ],
      includes: %i[ user remindable ]
    )

    private

    def prepare_resource
      @resource.user ||= current_user
    end
  end
end
