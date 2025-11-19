# frozen_string_literal: true

class Typo < ApplicationRecord
  belongs_to :typing_progress

  validates :row, :column, presence: true
  validate :character_not_nil_or_empty_string

  private

  def character_not_nil_or_empty_string
    # スペースは許可する
    return unless character.nil? || character == ''

    errors.add(:character, "can't be blank")
  end
end
