# frozen_string_literal: true

require 'rails_helper'

RSpec.describe User, type: :model do
  describe '#destroy_with_associations' do
    let(:user) { create(:user) }
    let!(:first_repository) { create(:repository, :with_extensions, :with_file_items, user:) }
    let!(:second_repository) { create(:repository, :with_extensions, :with_file_items, user:) }

    before do
      create(:file_item, :with_typing_progress_and_typos, repository: first_repository)
      create(:file_item, :with_typing_progress_and_typos, repository: second_repository)
    end

    it 'deletes the user' do
      expect do
        user.destroy_with_associations
      end.to change(described_class, :count).by(-1)
    end

    it 'deletes all associated repositories' do
      expect do
        user.destroy_with_associations
      end.to change(Repository, :count).by(-2)
    end

    it 'deletes all associated typos' do
      expect do
        user.destroy_with_associations
      end.to change(Typo, :count).by(-4)
    end

    it 'deletes all associated typing_progresses' do
      expect do
        user.destroy_with_associations
      end.to change(TypingProgress, :count).by(-2)
    end

    it 'deletes all associated file_items' do
      expect do
        user.destroy_with_associations
      end.to change(FileItem, :count).by(-14)
    end

    it 'deletes all associated extensions' do
      expect do
        user.destroy_with_associations
      end.to change(Extension, :count).by(-4)
    end
  end
end
