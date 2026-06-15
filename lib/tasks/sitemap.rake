require "zlib"
require "stringio"
require "ostruct"

namespace :sitemap do
  desc "Generate sitemap.xml and sitemap.xml.gz in public/"
  task generate: :environment do
    # Build a minimal request-like object so Sitemap can construct absolute URLs.
    request = OpenStruct.new(
      ssl?: Rails.env.production?,
      scheme: Rails.env.production? ? "https" : "http",
      host_with_port: ENV.fetch("APP_HOST", "localhost:3000")
    )

    urls = Sitemap.build(request)

    # Render the sitemap view to preserve same XML structure as runtime.
    xml = ApplicationController.render(
      template: "sitemap/show",
      assigns: { urls: urls },
      formats: [ :xml ]
    )

    public_path = Rails.root.join("public")
    File.write(public_path.join("sitemap.xml"), xml)

    # Write gzipped version for search engines (recommended for large sitemaps)
    gz_path = public_path.join("sitemap.xml.gz")
    File.open(gz_path, "wb") do |f|
      gz = Zlib::GzipWriter.new(f)
      gz.write(xml)
      gz.close
    end

    puts "Wrote #{public_path.join('sitemap.xml')} and #{gz_path}"
  end
end
