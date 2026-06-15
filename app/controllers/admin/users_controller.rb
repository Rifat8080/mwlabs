module Admin
  class UsersController < ResourceController
    configure(
      model: User,
      title: "Users",
      description: "Manage admins, team members, and future client portal users.",
      columns: %i[ display_name email role status skill payment_type ],
      fields: [
        { name: :name, type: :text },
        { name: :email, type: :email },
        { name: :phone, type: :text },
        { name: :role, type: :select, collection: User::ROLES },
        { name: :status, type: :select, collection: User::STATUSES },
        { name: :skill, type: :text },
        { name: :payment_type, type: :select, collection: User::PAYMENT_TYPES },
        { name: :rate, type: :decimal },
        { name: :password, type: :password },
        { name: :password_confirmation, type: :password }
      ]
    )

    private

    def resource_params
      permitted = super
      return permitted unless permitted[:password].blank?

      permitted.except(:password, :password_confirmation)
    end
  end
end
