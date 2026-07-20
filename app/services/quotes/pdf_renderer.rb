require "prawn"
require "prawn-svg"
require "prawn/table"

module Quotes
  class PdfRenderer
    def initialize(quote)
      @quote = quote
    end

    def render
      Prawn::Document.new(page_size: "A4", margin: 48) do |pdf|
        pdf.font "Helvetica"

        render_header(pdf)
        pdf.move_down 18

        pdf.stroke_horizontal_rule
        pdf.move_down 16

        info_rows.each do |label, value|
          pdf.text "<b>#{label}:</b> #{value}", inline_format: true, size: 10
          pdf.move_down 6
        end

        pdf.move_down 12
        pdf.text "Line Items", size: 12, style: :bold
        pdf.move_down 8

        table_data = [ [ "Item", "Qty", "Unit Price", "Total" ] ]
        @quote.quote_items.each do |item|
          table_data << [
            [ item.name, item.description ].compact.join("\n"),
            item.quantity.to_s,
            format_money(item.unit_price),
            format_money(item.total)
          ]
        end

        pdf.table(table_data, width: pdf.bounds.width, header: true) do
          row(0).font_style = :bold
          row(0).background_color = "EFF6FF"
          cells.padding = [ 8, 10, 8, 10 ]
          cells.borders = [ :bottom ]
          cells.border_color = "E2E8F0"
          cells.size = 9
        end

        pdf.move_down 16
        totals.each do |label, value|
          pdf.text "#{label}: #{value}", align: :right, size: 10
          pdf.move_down 4
        end

        pdf.move_down 12
        pdf.text "Payment Terms", size: 11, style: :bold
        pdf.text(@quote.payment_terms.presence || "As discussed with M&W Labs.", size: 9)
        pdf.move_down 8

        pdf.text "Delivery Timeline", size: 11, style: :bold
        pdf.text(@quote.delivery_timeline.presence || "To be confirmed after acceptance.", size: 9)
        pdf.move_down 8

        if @quote.notes.present?
          pdf.text "Notes", size: 11, style: :bold
          pdf.text @quote.notes, size: 9
          pdf.move_down 8
        end

        pdf.fill_color "1D4ED8"
        pdf.text "Need changes?", size: 11, style: :bold
        pdf.fill_color "334155"
        pdf.text "Open your M&W Labs client portal to review this quote, request revisions, and continue negotiation before acceptance.", size: 9
        pdf.move_down 10
        pdf.text "Reference: #{@quote.quote_reference}", size: 8, color: "64748B"
      end.render
    end

    private

    def render_header(pdf)
      render_logo(pdf) || render_text_logo(pdf)

      pdf.fill_color "0F172A"
      pdf.text "Professional Quotation", size: 14, style: :bold
    end

    def render_logo(pdf)
      return false unless File.exist?(logo_path)

      pdf.svg File.read(logo_path), width: 140, enable_web_requests: false
      pdf.move_down 8
      true
    rescue StandardError => e
      Rails.logger.error("[Quotes::PdfRenderer] failed to render logo.svg: #{e.class}: #{e.message}")
      false
    end

    def render_text_logo(pdf)
      pdf.fill_color "1D4ED8"
      pdf.text "M&W Labs", size: 22, style: :bold
      pdf.fill_color "0F172A"
      pdf.move_down 4
    end

    def logo_path
      Rails.root.join("app/assets/images/logo.svg")
    end

    def info_rows
      [
        [ "Quote reference", @quote.quote_reference ],
        [ "Prepared for", @quote.recipient_name ],
        [ "Email", @quote.recipient_email.presence || "Not provided" ],
        [ "Status", @quote.status ],
        [ "Currency", @quote.currency ],
        [ "Issue date", @quote.created_at&.strftime("%B %d, %Y") || Date.current.strftime("%B %d, %Y") ],
        [ "Valid until", @quote.validity_date&.strftime("%B %d, %Y") || "Open" ]
      ]
    end

    def totals
      [
        [ "Subtotal", format_money(@quote.subtotal) ],
        [ "Discount", format_money(@quote.discount) ],
        [ "Tax", format_money(@quote.tax) ],
        [ "Total", format_money(@quote.total_amount) ]
      ]
    end

    def format_money(amount)
      format("%s%.2f", @quote.currency_pdf_symbol, amount.to_d)
    end
  end
end
