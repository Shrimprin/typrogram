# frozen_string_literal: true

class User < ApplicationRecord
  has_many :repositories, dependent: :destroy

  validates :github_id, presence: true, uniqueness: true
  validates :is_mute, inclusion: { in: [true, false] }
  validates :name, presence: true

  # dependent: :destroyはレコードを1つ1つ削除するため処理が遅い
  # リポジトリごとに一括で関連レコードを削除するために自前のメソッドを用意
  def destroy_with_associations
    transaction do
      repositories.each(&:destroy_with_associations)
      destroy!
    end
  end
end
