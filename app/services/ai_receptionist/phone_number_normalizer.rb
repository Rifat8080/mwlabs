module AiReceptionist
  class PhoneNumberNormalizer
    COUNTRY_DIAL_CODES = {
      "Afghanistan" => "93",
      "Albania" => "355",
      "Algeria" => "213",
      "Andorra" => "376",
      "Angola" => "244",
      "Antigua and Barbuda" => "1",
      "Argentina" => "54",
      "Armenia" => "374",
      "Australia" => "61",
      "Austria" => "43",
      "Azerbaijan" => "994",
      "Bahamas" => "1",
      "Bahrain" => "973",
      "Bangladesh" => "880",
      "Barbados" => "1",
      "Belarus" => "375",
      "Belgium" => "32",
      "Belize" => "501",
      "Benin" => "229",
      "Bhutan" => "975",
      "Bolivia" => "591",
      "Bosnia and Herzegovina" => "387",
      "Botswana" => "267",
      "Brazil" => "55",
      "Brunei" => "673",
      "Bulgaria" => "359",
      "Burkina Faso" => "226",
      "Burundi" => "257",
      "Cabo Verde" => "238",
      "Cambodia" => "855",
      "Cameroon" => "237",
      "Canada" => "1",
      "Central African Republic" => "236",
      "Chad" => "235",
      "Chile" => "56",
      "China" => "86",
      "Colombia" => "57",
      "Comoros" => "269",
      "Congo" => "242",
      "Costa Rica" => "506",
      "Cote d'Ivoire" => "225",
      "Croatia" => "385",
      "Cuba" => "53",
      "Cyprus" => "357",
      "Czechia" => "420",
      "Democratic Republic of the Congo" => "243",
      "Denmark" => "45",
      "Djibouti" => "253",
      "Dominica" => "1",
      "Dominican Republic" => "1",
      "Ecuador" => "593",
      "Egypt" => "20",
      "El Salvador" => "503",
      "Equatorial Guinea" => "240",
      "Eritrea" => "291",
      "Estonia" => "372",
      "Eswatini" => "268",
      "Ethiopia" => "251",
      "Fiji" => "679",
      "Finland" => "358",
      "France" => "33",
      "Gabon" => "241",
      "Gambia" => "220",
      "Georgia" => "995",
      "Germany" => "49",
      "Ghana" => "233",
      "Greece" => "30",
      "Grenada" => "1",
      "Guatemala" => "502",
      "Guinea" => "224",
      "Guinea-Bissau" => "245",
      "Guyana" => "592",
      "Haiti" => "509",
      "Honduras" => "504",
      "Hong Kong" => "852",
      "Hungary" => "36",
      "Iceland" => "354",
      "India" => "91",
      "Indonesia" => "62",
      "Iran" => "98",
      "Iraq" => "964",
      "Ireland" => "353",
      "Israel" => "972",
      "Italy" => "39",
      "Jamaica" => "1",
      "Japan" => "81",
      "Jordan" => "962",
      "Kazakhstan" => "7",
      "Kenya" => "254",
      "Kiribati" => "686",
      "Kosovo" => "383",
      "Kuwait" => "965",
      "Kyrgyzstan" => "996",
      "Laos" => "856",
      "Latvia" => "371",
      "Lebanon" => "961",
      "Lesotho" => "266",
      "Liberia" => "231",
      "Libya" => "218",
      "Liechtenstein" => "423",
      "Lithuania" => "370",
      "Luxembourg" => "352",
      "Macau" => "853",
      "Madagascar" => "261",
      "Malawi" => "265",
      "Malaysia" => "60",
      "Maldives" => "960",
      "Mali" => "223",
      "Malta" => "356",
      "Marshall Islands" => "692",
      "Mauritania" => "222",
      "Mauritius" => "230",
      "Mexico" => "52",
      "Micronesia" => "691",
      "Moldova" => "373",
      "Monaco" => "377",
      "Mongolia" => "976",
      "Montenegro" => "382",
      "Morocco" => "212",
      "Mozambique" => "258",
      "Myanmar" => "95",
      "Namibia" => "264",
      "Nauru" => "674",
      "Nepal" => "977",
      "Netherlands" => "31",
      "New Zealand" => "64",
      "Nicaragua" => "505",
      "Niger" => "227",
      "Nigeria" => "234",
      "North Korea" => "850",
      "North Macedonia" => "389",
      "Norway" => "47",
      "Oman" => "968",
      "Pakistan" => "92",
      "Palau" => "680",
      "Palestine" => "970",
      "Panama" => "507",
      "Papua New Guinea" => "675",
      "Paraguay" => "595",
      "Peru" => "51",
      "Philippines" => "63",
      "Poland" => "48",
      "Portugal" => "351",
      "Qatar" => "974",
      "Romania" => "40",
      "Russia" => "7",
      "Rwanda" => "250",
      "Saint Kitts and Nevis" => "1",
      "Saint Lucia" => "1",
      "Saint Vincent and the Grenadines" => "1",
      "Samoa" => "685",
      "San Marino" => "378",
      "Sao Tome and Principe" => "239",
      "Saudi Arabia" => "966",
      "Senegal" => "221",
      "Serbia" => "381",
      "Seychelles" => "248",
      "Sierra Leone" => "232",
      "Singapore" => "65",
      "Slovakia" => "421",
      "Slovenia" => "386",
      "Solomon Islands" => "677",
      "Somalia" => "252",
      "South Africa" => "27",
      "South Korea" => "82",
      "South Sudan" => "211",
      "Spain" => "34",
      "Sri Lanka" => "94",
      "Sudan" => "249",
      "Suriname" => "597",
      "Sweden" => "46",
      "Switzerland" => "41",
      "Syria" => "963",
      "Taiwan" => "886",
      "Tajikistan" => "992",
      "Tanzania" => "255",
      "Thailand" => "66",
      "Timor-Leste" => "670",
      "Togo" => "228",
      "Tonga" => "676",
      "Trinidad and Tobago" => "1",
      "Tunisia" => "216",
      "Turkey" => "90",
      "Turkmenistan" => "993",
      "Tuvalu" => "688",
      "Uganda" => "256",
      "Ukraine" => "380",
      "United Arab Emirates" => "971",
      "United Kingdom" => "44",
      "United States" => "1",
      "Uruguay" => "598",
      "Uzbekistan" => "998",
      "Vanuatu" => "678",
      "Vatican City" => "379",
      "Venezuela" => "58",
      "Vietnam" => "84",
      "Yemen" => "967",
      "Zambia" => "260",
      "Zimbabwe" => "263"
    }.freeze

    COUNTRY_ALIASES = {
      "America" => "United States",
      "Burma" => "Myanmar",
      "Cape Verde" => "Cabo Verde",
      "Congo-Brazzaville" => "Congo",
      "Congo-Kinshasa" => "Democratic Republic of the Congo",
      "Cote d'Ivoire" => "Ivory Coast",
      "Czech Republic" => "Czechia",
      "DR Congo" => "Democratic Republic of the Congo",
      "East Timor" => "Timor-Leste",
      "England" => "United Kingdom",
      "Great Britain" => "United Kingdom",
      "Iran, Islamic Republic of" => "Iran",
      "Ivory Coast" => "Cote d'Ivoire",
      "Korea, Republic of" => "South Korea",
      "Northern Ireland" => "United Kingdom",
      "Republic of Korea" => "South Korea",
      "Scotland" => "United Kingdom",
      "Swaziland" => "Eswatini",
      "Syria Arab Republic" => "Syria",
      "Tanzania, United Republic of" => "Tanzania",
      "Turkiye" => "Turkey",
      "UAE" => "United Arab Emirates",
      "UK" => "United Kingdom",
      "United States of America" => "United States",
      "US" => "United States",
      "USA" => "United States",
      "U.S." => "United States",
      "U.S.A." => "United States",
      "Viet Nam" => "Vietnam",
      "Wales" => "United Kingdom"
    }.freeze

    KEY_NORMALIZER = ->(value) { ActiveSupport::Inflector.transliterate(value.to_s).downcase.gsub(/[^a-z0-9]+/, " ").squish }.freeze
    COUNTRY_NAMES_BY_KEY = COUNTRY_DIAL_CODES.keys.to_h { |country| [ KEY_NORMALIZER.call(country), country ] }.freeze
    COUNTRY_DIAL_CODES_BY_KEY = COUNTRY_DIAL_CODES.to_h { |country, code| [ KEY_NORMALIZER.call(country), code ] }.freeze
    COUNTRY_ALIASES_BY_KEY = COUNTRY_ALIASES.to_h { |country_alias, country| [ KEY_NORMALIZER.call(country_alias), country ] }.freeze
    COUNTRY_KEYS_BY_LENGTH = (COUNTRY_NAMES_BY_KEY.keys + COUNTRY_ALIASES_BY_KEY.keys).uniq.sort_by { |key| [ -key.length, key ] }.freeze

    class << self
      def normalize(phone, country: nil)
        raw_phone = phone.to_s.squish
        return if raw_phone.blank?

        digits = raw_phone.gsub(/\D/, "")
        return if digits.blank?
        return "+#{digits}" if raw_phone.start_with?("+")
        return "+#{digits.delete_prefix('00')}" if digits.start_with?("00") && digits.length > 4

        dial_code = dial_code_for(country)
        return normalize_with_country(digits, dial_code) if dial_code.present?
        return digits if country.blank?

        digits
      end

      def extract_country(text)
        normalized_text = normalize_key(text)
        return if normalized_text.blank?

        COUNTRY_KEYS_BY_LENGTH.each do |key|
          next unless normalized_text.match?(/(?:\A|\s)#{Regexp.escape(key)}(?:\s|\z)/)

          return canonical_country_for(key)
        end

        nil
      end

      def canonical_country_for(country)
        normalized_country = normalize_key(country)
        return if normalized_country.blank?

        COUNTRY_NAMES_BY_KEY[normalized_country] || COUNTRY_ALIASES_BY_KEY[normalized_country]
      end

      def dial_code_for(country)
        canonical_country = canonical_country_for(country)
        return if canonical_country.blank?

        COUNTRY_DIAL_CODES[canonical_country]
      end

      private

      def normalize_with_country(digits, dial_code)
        national_number = digits.start_with?(dial_code) ? digits.delete_prefix(dial_code) : digits
        national_number = national_number.sub(/\A0+/, "")
        return if national_number.blank?

        "+#{dial_code}#{national_number}"
      end

      def normalize_key(value)
        KEY_NORMALIZER.call(value)
      end
    end
  end
end
