# frozen_string_literal: true

class TypingProgress < ApplicationRecord
  belongs_to :file_item
  has_many :typos, dependent: :destroy

  validates :row, :column, :elapsed_seconds, :total_correct_type_count, :total_typo_count,
            presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 0 }

  def save_with_typos(typos_params)
    is_success = false
    transaction do
      is_success = save && save_typos(typos_params)
      raise ActiveRecord::Rollback unless is_success
    end

    is_success
  end

  def update_with_typos(typing_progress_params, typos_params)
    is_success = false
    transaction do
      typos.delete_all if typos.exists?

      is_success = update(typing_progress_params) && save_typos(typos_params)
      raise ActiveRecord::Rollback unless is_success
    end

    is_success
  end

  def self.delete_by_repository(repository_ids)
    repository_ids = Array(repository_ids)
    return if repository_ids.empty?

    joins(file_item: :repository)
      .where(repositories: { id: repository_ids })
      .delete_all
  end

  private

  def save_typos(typos_params)
    return true if typos_params.blank?

    new_typos = typos.build(typos_params)
    result = Typo.import(new_typos, timestamps: true)

    failed_typos = result.failed_instances
    return true unless failed_typos.any?

    add_typo_errors(failed_typos)
    false
  end

  def add_typo_errors(failed_typos)
    failed_typos.each do |failed_typo|
      failed_typo.errors.each do |error|
        errors.add("typos.#{error.attribute}", error.message)
      end
    end
  end
end
