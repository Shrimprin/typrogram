# frozen_string_literal: true

class Extension < ApplicationRecord
  belongs_to :repository

  validates :name, presence: true
  validates :is_active, inclusion: { in: [true, false] }
  validates :name, uniqueness: { scope: :repository_id }

  NO_EXTENSION_NAME = 'no extension'

  class << self
    def extract_extension_name(path)
      basename = File.basename(path)
      basename.start_with?('.') ? extract_extension_from_dotfile(basename) : extract_full_extension(basename)
    end

    private

    def extract_full_extension(basename)
      parts = basename.split('.')
      parts.length <= 1 ? NO_EXTENSION_NAME : ".#{parts[1..].join('.')}"
    end

    def extract_extension_from_dotfile(basename)
      extension_name = File.extname(basename)
      extension_name.empty? ? basename : extension_name
    end
  end
end
