# Allow span tags with typography classes from the admin Trix toolbar.
Rails.application.config.to_prepare do
  sanitizer = ActionText::ContentHelper.sanitizer
  default_tags = sanitizer.class.allowed_tags + [
    ActionText::Attachment.tag_name, "figure", "figcaption", "span"
  ]
  ActionText::ContentHelper.allowed_tags = default_tags.uniq
end
