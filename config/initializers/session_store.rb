# Share the session cookie across www and apex hostnames so Action Cable
# WebSocket handshakes receive the Devise session on mwlabs.digital.
Rails.application.config.session_store :cookie_store,
  key: "_mwlabs_session",
  secure: Rails.env.production?,
  same_site: :lax,
  domain: Rails.env.production? ? ".mwlabs.digital" : nil
