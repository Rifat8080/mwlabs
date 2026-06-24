# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2026_06_18_163100) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"
  enable_extension "pgcrypto"

  create_table "action_text_rich_texts", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "name", null: false
    t.text "body"
    t.string "record_type", null: false
    t.uuid "record_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["record_type", "record_id", "name"], name: "index_action_text_rich_texts_uniqueness", unique: true
  end

  create_table "active_storage_attachments", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "name", null: false
    t.string "record_type", null: false
    t.uuid "record_id", null: false
    t.uuid "blob_id", null: false
    t.datetime "created_at", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "key", null: false
    t.string "filename", null: false
    t.string "content_type"
    t.text "metadata"
    t.string "service_name", null: false
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.datetime "created_at", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "activity_logs", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "user_id"
    t.string "subject_type", null: false
    t.uuid "subject_id", null: false
    t.string "action"
    t.text "details"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["subject_type", "subject_id"], name: "index_activity_logs_on_subject"
    t.index ["user_id"], name: "index_activity_logs_on_user_id"
  end

  create_table "blog_categories", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "name", null: false
    t.string "slug", null: false
    t.text "description"
    t.integer "position", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_blog_categories_on_name", unique: true
    t.index ["position"], name: "index_blog_categories_on_position"
    t.index ["slug"], name: "index_blog_categories_on_slug", unique: true
  end

  create_table "blog_posts", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "title", null: false
    t.string "slug", null: false
    t.text "excerpt"
    t.string "status", default: "Draft", null: false
    t.uuid "author_id", null: false
    t.datetime "published_at"
    t.string "meta_title"
    t.text "meta_description"
    t.boolean "featured", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.uuid "blog_category_id", null: false
    t.index ["author_id"], name: "index_blog_posts_on_author_id"
    t.index ["blog_category_id"], name: "index_blog_posts_on_blog_category_id"
    t.index ["published_at"], name: "index_blog_posts_on_published_at"
    t.index ["slug"], name: "index_blog_posts_on_slug", unique: true
    t.index ["status"], name: "index_blog_posts_on_status"
  end

  create_table "clients", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "name"
    t.string "company_name"
    t.string "email"
    t.string "phone"
    t.string "country"
    t.string "status", default: "Active", null: false
    t.string "source"
    t.text "notes"
    t.date "follow_up_date"
    t.string "next_action"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_clients_on_email"
    t.index ["status"], name: "index_clients_on_status"
  end

  create_table "expenses", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.date "date"
    t.string "category"
    t.decimal "amount", precision: 12, scale: 2, default: "0.0", null: false
    t.string "payment_method"
    t.uuid "project_id"
    t.uuid "client_id"
    t.text "note"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["client_id"], name: "index_expenses_on_client_id"
    t.index ["project_id"], name: "index_expenses_on_project_id"
  end

  create_table "file_uploads", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "client_id"
    t.uuid "project_id"
    t.uuid "task_id"
    t.string "category"
    t.string "visibility"
    t.boolean "downloadable", default: true, null: false
    t.boolean "needs_approval", default: false, null: false
    t.string "status", default: "Uploaded", null: false
    t.text "note"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["client_id"], name: "index_file_uploads_on_client_id"
    t.index ["project_id"], name: "index_file_uploads_on_project_id"
    t.index ["task_id"], name: "index_file_uploads_on_task_id"
  end

  create_table "invoices", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "client_id", null: false
    t.uuid "project_id"
    t.uuid "quote_id"
    t.string "invoice_number"
    t.date "issue_date"
    t.date "due_date"
    t.decimal "subtotal", precision: 12, scale: 2, default: "0.0", null: false
    t.decimal "discount", precision: 12, scale: 2, default: "0.0", null: false
    t.decimal "tax", precision: 12, scale: 2, default: "0.0", null: false
    t.decimal "total", precision: 12, scale: 2, default: "0.0", null: false
    t.decimal "paid_amount", precision: 12, scale: 2, default: "0.0", null: false
    t.string "status", default: "Draft", null: false
    t.text "notes"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["client_id"], name: "index_invoices_on_client_id"
    t.index ["project_id"], name: "index_invoices_on_project_id"
    t.index ["quote_id"], name: "index_invoices_on_quote_id"
  end

  create_table "leads", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "name"
    t.string "phone"
    t.string "email"
    t.string "company_name"
    t.string "country"
    t.string "source"
    t.string "service_interest"
    t.decimal "budget"
    t.string "urgency"
    t.text "message"
    t.string "status", default: "New", null: false
    t.uuid "assigned_to_id"
    t.date "follow_up_date"
    t.text "notes"
    t.uuid "client_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["assigned_to_id"], name: "index_leads_on_assigned_to_id"
    t.index ["client_id"], name: "index_leads_on_client_id"
  end

  create_table "notifications", force: :cascade do |t|
    t.string "action", null: false
    t.string "recipient_type", null: false
    t.string "notifiable_type"
    t.string "actor_type"
    t.jsonb "params", default: {}
    t.datetime "read_at", precision: nil
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "url"
    t.string "level", default: "info", null: false
    t.string "icon"
    t.uuid "recipient_id", null: false
    t.uuid "notifiable_id"
    t.uuid "actor_id"
    t.index ["level"], name: "index_notifications_on_level"
    t.index ["notifiable_type", "notifiable_id"], name: "index_notifications_on_notifiable"
    t.index ["read_at"], name: "index_notifications_on_read_at"
    t.index ["recipient_type", "recipient_id", "read_at"], name: "index_notifications_on_recipient_and_read"
    t.index ["recipient_type", "recipient_id"], name: "index_notifications_on_recipient"
  end

  create_table "payments", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "invoice_id", null: false
    t.decimal "amount", precision: 12, scale: 2, default: "0.0", null: false
    t.string "payment_method"
    t.string "transaction_reference"
    t.date "payment_date"
    t.text "note"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["invoice_id"], name: "index_payments_on_invoice_id"
  end

  create_table "projects", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "client_id", null: false
    t.uuid "quote_id"
    t.string "name"
    t.string "service_category"
    t.decimal "project_value", precision: 12, scale: 2, default: "0.0", null: false
    t.date "start_date"
    t.date "deadline"
    t.string "status", default: "Not Started", null: false
    t.string "priority", default: "Medium", null: false
    t.uuid "assigned_to_id"
    t.integer "progress", default: 0, null: false
    t.text "internal_notes"
    t.text "client_notes"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["assigned_to_id"], name: "index_projects_on_assigned_to_id"
    t.index ["client_id"], name: "index_projects_on_client_id"
    t.index ["quote_id"], name: "index_projects_on_quote_id"
  end

  create_table "quote_items", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "quote_id", null: false
    t.string "item_type"
    t.string "name"
    t.text "description"
    t.decimal "quantity", precision: 10, scale: 2, default: "1.0", null: false
    t.decimal "unit_price", precision: 12, scale: 2, default: "0.0", null: false
    t.decimal "total", precision: 12, scale: 2, default: "0.0", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["quote_id"], name: "index_quote_items_on_quote_id"
  end

  create_table "quote_messages", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "quote_id", null: false
    t.uuid "user_id", null: false
    t.text "message", null: false
    t.string "kind", default: "message", null: false
    t.boolean "internal", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["quote_id"], name: "index_quote_messages_on_quote_id"
    t.index ["user_id"], name: "index_quote_messages_on_user_id"
  end

  create_table "quotes", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "client_id"
    t.uuid "lead_id"
    t.string "status", default: "Draft", null: false
    t.decimal "subtotal", precision: 12, scale: 2, default: "0.0", null: false
    t.decimal "discount", precision: 12, scale: 2, default: "0.0", null: false
    t.decimal "tax", precision: 12, scale: 2, default: "0.0", null: false
    t.decimal "total_amount", precision: 12, scale: 2, default: "0.0", null: false
    t.text "payment_terms"
    t.string "delivery_timeline"
    t.date "validity_date"
    t.text "notes"
    t.datetime "accepted_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.datetime "sent_at"
    t.uuid "sent_by_id"
    t.string "public_token"
    t.string "negotiation_status", default: "none", null: false
    t.index ["client_id"], name: "index_quotes_on_client_id"
    t.index ["lead_id"], name: "index_quotes_on_lead_id"
    t.index ["public_token"], name: "index_quotes_on_public_token", unique: true
    t.index ["sent_by_id"], name: "index_quotes_on_sent_by_id"
  end

  create_table "reminders", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "user_id", null: false
    t.string "remindable_type"
    t.uuid "remindable_id"
    t.string "title"
    t.date "due_date"
    t.string "status", default: "Open", null: false
    t.string "next_action"
    t.text "note"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["remindable_type", "remindable_id"], name: "index_reminders_on_remindable"
    t.index ["user_id"], name: "index_reminders_on_user_id"
  end

  create_table "services", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "name"
    t.string "category"
    t.text "description"
    t.decimal "base_price", precision: 12, scale: 2, default: "0.0", null: false
    t.string "estimated_delivery_time"
    t.text "required_inputs"
    t.text "default_task_checklist"
    t.string "status", default: "Active", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["category"], name: "index_services_on_category"
    t.index ["status"], name: "index_services_on_status"
  end

  create_table "tasks", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "project_id", null: false
    t.uuid "assigned_to_id"
    t.string "title"
    t.date "due_date"
    t.string "priority", default: "Medium", null: false
    t.string "status", default: "To Do", null: false
    t.text "description"
    t.text "checklist"
    t.boolean "client_visible", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["assigned_to_id"], name: "index_tasks_on_assigned_to_id"
    t.index ["project_id"], name: "index_tasks_on_project_id"
  end

  create_table "users", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "name"
    t.string "phone"
    t.string "role", default: "admin", null: false
    t.string "status", default: "Active", null: false
    t.string "skill"
    t.string "payment_type"
    t.decimal "rate", precision: 12, scale: 2, default: "0.0", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
    t.index ["role"], name: "index_users_on_role"
    t.index ["status"], name: "index_users_on_status"
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "activity_logs", "users"
  add_foreign_key "blog_posts", "blog_categories"
  add_foreign_key "blog_posts", "users", column: "author_id"
  add_foreign_key "expenses", "clients"
  add_foreign_key "expenses", "projects"
  add_foreign_key "file_uploads", "clients"
  add_foreign_key "file_uploads", "projects"
  add_foreign_key "file_uploads", "tasks"
  add_foreign_key "invoices", "clients"
  add_foreign_key "invoices", "projects"
  add_foreign_key "invoices", "quotes"
  add_foreign_key "leads", "clients"
  add_foreign_key "leads", "users", column: "assigned_to_id"
  add_foreign_key "payments", "invoices"
  add_foreign_key "projects", "clients"
  add_foreign_key "projects", "quotes"
  add_foreign_key "projects", "users", column: "assigned_to_id"
  add_foreign_key "quote_items", "quotes"
  add_foreign_key "quote_messages", "quotes"
  add_foreign_key "quote_messages", "users"
  add_foreign_key "quotes", "clients"
  add_foreign_key "quotes", "leads"
  add_foreign_key "quotes", "users", column: "sent_by_id"
  add_foreign_key "reminders", "users"
  add_foreign_key "tasks", "projects"
  add_foreign_key "tasks", "users", column: "assigned_to_id"
end
