# frozen_string_literal: true

class FileItem < ApplicationRecord
  self.inheritance_column = nil # typeカラムを使うため単一テーブル継承を無効

  belongs_to :repository
  has_one :typing_progress, dependent: :destroy
  has_closure_tree

  validates :name, presence: true
  validates :status, presence: true
  validates :type, presence: true
  validates :path, presence: true

  enum :type, {
    file: 0,
    dir: 1
  }

  enum :status, {
    untyped: 0,
    typing: 1,
    typed: 2,
    unsupported: 3
  }

  def self.contains_non_ascii?(file_content)
    return false if file_content.blank?

    # ASCII文字以外（英数字、記号、空白文字以外）が含まれているかチェック
    file_content.match?(/[^\x00-\x7F]/)
  end

  def self.decode_file_content(file_content)
    decoded_file_content = Base64.decode64(file_content).force_encoding('UTF-8')

    # UTF-8エンコーディングの確認と修正
    unless decoded_file_content.valid_encoding?
      decoded_file_content = decoded_file_content.encode('UTF-8', invalid: :replace, undef: :replace, replace: '')
    end

    # nullバイトを削除
    decoded_file_content.delete("\0")
  end

  def full_path
    "#{repository.name}/#{path}"
  end

  def update_parent_status
    return true unless parent

    children = parent.children
    is_all_completed = children.all? { |child| child.typed? || child.unsupported? }
    return true unless is_all_completed

    parent.update(status: :typed) && parent.update_parent_status
  end

  def update_with_parent(params)
    transaction do
      is_updated = update_with_typing_progress(params) && update_parent_status
      raise ActiveRecord::Rollback unless is_updated

      true
    end
  end

  def update_with_typing_progress(params)
    transaction do
      is_updated = update(params.except(:typing_progress)) && save_typing_progress(params)
      raise ActiveRecord::Rollback unless is_updated

      true
    end
  end

  private

  def save_typing_progress(params)
    return nil if params[:typing_progress].blank?

    typing_progress_params = params[:typing_progress].except(:typos)
    typos_params = params[:typing_progress][:typos]

    target_typing_progress = typing_progress || build_typing_progress(typing_progress_params)

    is_saved = if typing_progress.present?
                 target_typing_progress.update_with_typos(typing_progress_params, typos_params)
               else
                 target_typing_progress.save_with_typos(typos_params)
               end

    return true if is_saved

    add_typing_progress_errors(target_typing_progress)
    nil
  end

  def add_typing_progress_errors(typing_progress_instance)
    typing_progress_instance.errors.each do |error|
      errors.add("typing_progress.#{error.attribute}", error.message)
    end
  end
end
