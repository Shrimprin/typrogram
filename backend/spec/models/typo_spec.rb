# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Typo, type: :model do
  describe 'character_not_nil_or_empty_string validation' do
    let(:typing_progress) { create(:typing_progress) }

    context 'when character is nil' do
      it 'adds error' do
        typo = build(:typo, typing_progress: typing_progress, character: nil)
        typo.valid?
        expect(typo.errors[:character]).to include("can't be blank")
      end
    end

    context 'when character is empty string' do
      it 'adds error' do
        typo = build(:typo, typing_progress: typing_progress, character: '')
        typo.valid?
        expect(typo.errors[:character]).to include("can't be blank")
      end
    end

    context 'when character is a space' do
      it 'does not add error' do
        typo = build(:typo, :space_character, typing_progress: typing_progress)
        typo.valid?
        expect(typo.errors[:character]).to be_empty
      end
    end

    context 'when character is a letter' do
      it 'does not add error' do
        typo = build(:typo, typing_progress: typing_progress, character: 'a')
        typo.valid?
        expect(typo.errors[:character]).to be_empty
      end
    end
  end

  describe '.delete_by_repository' do
    let(:user) { create(:user) }
    let!(:first_repository) { create(:repository, user:) }
    let!(:second_repository) { create(:repository, user:) }

    before do
      create(:file_item, :with_typing_progress_and_typos, repository: first_repository)
      create(:file_item, :with_typing_progress_and_typos, repository: second_repository)
    end

    context 'when single repository_id is given' do
      it 'deletes all typos for the repository' do
        expect do
          described_class.delete_by_repository(first_repository.id)
        end.to change(described_class, :count).by(-2)
      end
    end

    context 'when array of repository_ids is given' do
      it 'deletes all typos for the repositories' do
        expect do
          described_class.delete_by_repository([first_repository.id, second_repository.id])
        end.to change(described_class, :count).by(-4)
      end
    end

    context 'when empty array is given' do
      it 'does not delete any typos' do
        expect do
          described_class.delete_by_repository([])
        end.not_to change(described_class, :count)
      end
    end
  end
end
