# frozen_string_literal: true

class FileItem < ApplicationRecord
  self.inheritance_column = nil # typeカラムを使うため単一テーブル継承を無効

  belongs_to :repository
  has_one :typing_progress, dependent: :destroy
  has_closure_tree

  validates :name, :status, :type, :path, presence: true

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

  NON_ASCII_REGEXP = /[^\x00-\x7F]/

  def full_path
    "#{repository.name}/#{path}"
  end

  def fetch_file_content_and_update_parent_status
    return true if content.present? || dir?

    github_client = GithubClient.new
    file_content = github_client.file_content(repository.url, path, repository.commit_hash)
    return true unless file_content

    decoded_content = decode_file_content(file_content)
    update_params = { content: decoded_content }
    update_params[:status] = :unsupported if contains_non_ascii?(decoded_content)
    update_with_parent(update_params)
  end

  def update_parent_status
    return true unless parent

    children = parent.children
    is_all_completed = children.all? { |child| child.typed? || child.unsupported? }
    return true unless is_all_completed

    parent.update(status: :typed) && parent.update_parent_status
  end

  def update_with_parent(params, is_timestamp: false)
    is_success = false
    transaction do
      is_success = update_with_typing_progress(params, is_timestamp:) && update_parent_status
      raise ActiveRecord::Rollback unless is_success
    end

    is_success
  end

  def update_with_typing_progress(params, is_timestamp: false)
    is_success = false
    transaction do
      is_success = update(params.except(:typing_progress)) && save_typing_progress(params)
      is_success &&= repository.update(last_typed_at: Time.zone.now) if is_timestamp # touchはバリデーションを無視するためupdate
      raise ActiveRecord::Rollback unless is_success

      true
    end

    is_success
  end

  private

  def save_typing_progress(params)
    return true if params[:typing_progress].blank?

    typing_progress_params = params[:typing_progress].except(:typos)
    typos_params = params[:typing_progress][:typos]

    is_typing_progress_present = typing_progress.present?
    target_typing_progress = typing_progress || build_typing_progress(typing_progress_params)

    is_saved = if is_typing_progress_present
                 target_typing_progress.update_with_typos(typing_progress_params, typos_params)
               else
                 target_typing_progress.save_with_typos(typos_params)
               end

    return true if is_saved

    add_typing_progress_errors(target_typing_progress)
    nil
  end

  def add_typing_progress_errors(failed_typing_progress)
    failed_typing_progress.errors.each do |error|
      errors.add("typing_progress.#{error.attribute}", error.message)
    end
  end

  def contains_non_ascii?(file_content)
    return false if file_content.blank?

    # ASCII文字以外（英数字、記号、空白文字以外）が含まれているかチェック
    file_content.match?(NON_ASCII_REGEXP)
  end

  def decode_file_content(file_content)
    decoded_file_content = Base64.decode64(file_content).force_encoding('UTF-8')

    # UTF-8エンコーディングの確認と修正
    unless decoded_file_content.valid_encoding?
      decoded_file_content = decoded_file_content.encode('UTF-8', invalid: :replace, undef: :replace, replace: '')
    end

    # nullバイトを削除（PostgreSQLの文字列型は保存不可のため）
    # 主にバイナリファイル（画像、フォント、実行ファイルなど）に含まれるためタイピング対象になることは少なそうだが、
    # 全てのバイナリファイルの拡張子をアプリ側で制限することは難しいため、nullバイトを削除することで対処する
    decoded_file_content.delete("\0")
  end
end
