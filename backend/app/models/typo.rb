# frozen_string_literal: true

class Typo < ApplicationRecord
  belongs_to :typing_progress

  validates :row, :column, presence: true
  validate :character_not_nil_or_empty_string

  def self.delete_by_repository(repository_ids)
    repository_ids = Array(repository_ids)
    return if repository_ids.empty?

    joins(typing_progress: { file_item: :repository })
      .where(repositories: { id: repository_ids })
      .delete_all
  end

  private

  def character_not_nil_or_empty_string
    # スペースは許可する
    return unless character.nil? || character == ''

    errors.add(:character, "can't be blank")
  end
end
