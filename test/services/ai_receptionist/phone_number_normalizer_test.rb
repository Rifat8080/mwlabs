require "test_helper"

module AiReceptionist
  class PhoneNumberNormalizerTest < ActiveSupport::TestCase
    test "keeps explicit international phone numbers" do
      assert_equal "+442071234567", PhoneNumberNormalizer.normalize("+44 20 7123 4567")
      assert_equal "+442071234567", PhoneNumberNormalizer.normalize("00442071234567")
    end

    test "does not add a default country code when country is unknown" do
      assert_equal "01944998080", PhoneNumberNormalizer.normalize("01944998080")
    end

    test "normalizes national numbers with country context" do
      assert_equal "+919876543210", PhoneNumberNormalizer.normalize("09876543210", country: "India")
      assert_equal "+12025550145", PhoneNumberNormalizer.normalize("(202) 555-0145", country: "USA")
      assert_equal "+971501234567", PhoneNumberNormalizer.normalize("050 123 4567", country: "UAE")
      assert_equal "+8801944998080", PhoneNumberNormalizer.normalize("01944998080", country: "Bangladesh")
    end

    test "detects country names and aliases" do
      assert_equal "United Arab Emirates", PhoneNumberNormalizer.extract_country("We are based in the UAE.")
      assert_equal "United Kingdom", PhoneNumberNormalizer.extract_country("This is for a UK company.")
      assert_equal "United States", PhoneNumberNormalizer.extract_country("Please call our USA office.")
      assert_equal "Cote d'Ivoire", PhoneNumberNormalizer.extract_country("Client is in C\u00f4te d\u2019Ivoire.")
    end
  end
end
