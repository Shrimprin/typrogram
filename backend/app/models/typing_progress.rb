# frozen_string_literal: true

class TypingProgress < ApplicationRecord
  belongs_to :file_item
  has_many :typos, dependent: :destroy

  accepts_nested_attributes_for :typos, allow_destroy: true

  validates :row, :column, :elapsed_seconds, :total_correct_type_count, :total_typo_count,
            presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
end
