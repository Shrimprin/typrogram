# frozen_string_literal: true

class TypingProgress < ApplicationRecord
  belongs_to :file_item
  has_many :typos, dependent: :destroy

  validates :row, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :column, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :elapsed_seconds, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :total_correct_type_count, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :total_typo_count, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 0 }

  def save_with_typos(typos_params)
    transaction do
      is_saved = save && save_typos(typos_params)
      raise ActiveRecord::Rollback unless is_saved

      true
    end
  end

  def update_with_typos(typing_progress_params, typos_params)
    transaction do
      typos.delete_all if typos.exists?

      is_updated = update(typing_progress_params) && save_typos(typos_params)
      raise ActiveRecord::Rollback unless is_updated

      true
    end
  end

  private

  def save_typos?(typos_params)
    return true if typos_params.blank?

    new_typos = typos.build(typos_params)
    result = Typo.import(new_typos, timestamps: true)

    return true unless result.failed_instances.any?

    add_typo_errors(result.failed_instances)
    false
  end

  def add_typo_errors(failed_instances)
    failed_instances.each do |failed_typo|
      failed_typo.errors.each do |error|
        errors.add("typos.#{error.attribute}", error.message)
      end
    end
  end
end
