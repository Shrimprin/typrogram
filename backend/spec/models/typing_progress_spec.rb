# frozen_string_literal: true

require 'rails_helper'

RSpec.describe TypingProgress, type: :model do
  let(:file_item) { create(:file_item) }
  let(:valid_typos_params) do
    [
      {
        row: 1,
        column: 1,
        character: 'a'
      },
      {
        row: 2,
        column: 2,
        character: 'b'
      }
    ]
  end

  def expect_typo(typo, expected_row, expected_column, expected_character)
    expect(typo.row).to eq(expected_row)
    expect(typo.column).to eq(expected_column)
    expect(typo.character).to eq(expected_character)
  end

  describe '#save_with_typos' do
    let(:typing_progress) { build(:typing_progress, file_item:) }

    context 'when saved successfully' do
      it 'returns true' do
        expect(typing_progress.save_with_typos(valid_typos_params)).to be true
      end

      it 'creates a typing_progress' do
        expect do
          typing_progress.save_with_typos(valid_typos_params)
        end.to change(described_class, :count).by(1)
      end

      it 'creates typos' do
        expect do
          typing_progress.save_with_typos(valid_typos_params)
        end.to change(Typo, :count).by(2)
      end
    end

    context 'when save failed' do
      before do
        allow(typing_progress).to receive(:save).and_return(false)
      end

      it 'returns nil' do
        expect(typing_progress.save_with_typos(valid_typos_params)).to be_nil
      end

      it 'does not create a typing_progress' do
        expect do
          typing_progress.save_with_typos(valid_typos_params)
        end.not_to change(described_class, :count)
      end
    end

    context 'when save_typos failed' do
      before do
        allow(typing_progress).to receive(:save_typos).and_return(nil)
      end

      it 'returns nil' do
        expect(typing_progress.save_with_typos(valid_typos_params)).to be_nil
      end

      it 'rolls back the transaction and does not create a typing_progress' do
        expect do
          typing_progress.save_with_typos(valid_typos_params)
        end.not_to change(described_class, :count)
      end
    end
  end

  describe '#update_with_typos' do
    let(:typing_progress) { create(:typing_progress, :with_typos, file_item:) }
    let(:update_params) do
      {
        row: 10,
        column: 20,
        elapsed_seconds: 100,
        total_correct_type_count: 50,
        total_typo_count: 5
      }
    end

    context 'when successful' do
      it 'returns true' do
        expect(typing_progress.update_with_typos(update_params, valid_typos_params)).to be true
      end

      it 'updates the typing_progress' do
        typing_progress.update_with_typos(update_params, valid_typos_params)
        typing_progress.reload

        expect(typing_progress.row).to eq(10)
        expect(typing_progress.column).to eq(20)
        expect(typing_progress.elapsed_seconds).to eq(100)
        expect(typing_progress.total_correct_type_count).to eq(50)
        expect(typing_progress.total_typo_count).to eq(5)
      end

      it 'updates typos' do
        typing_progress.update_with_typos(update_params, valid_typos_params)
        typing_progress.reload

        expect_typo(typing_progress.typos[0], 1, 1, 'a')
        expect_typo(typing_progress.typos[1], 2, 2, 'b')
      end
    end

    context 'when update failed' do
      before do
        allow(typing_progress).to receive(:update).and_return(false)
      end

      it 'returns nil' do
        expect(typing_progress.update_with_typos(update_params, valid_typos_params)).to be_nil
      end

      it 'does not update the typing_progress' do
        original_attributes = typing_progress.attributes.except('created_at', 'updated_at')

        typing_progress.update_with_typos(update_params, valid_typos_params)
        typing_progress.reload

        expect(typing_progress.attributes.except('created_at', 'updated_at')).to eq(original_attributes)
      end
    end

    context 'when save_typos failed' do
      before do
        allow(typing_progress).to receive(:save_typos).and_return(false)
      end

      it 'returns nil' do
        expect(typing_progress.update_with_typos(update_params, valid_typos_params)).to be_nil
      end

      it 'rolls back the transaction and does not update the typing_progress' do
        original_attributes = typing_progress.attributes.except('created_at', 'updated_at')

        typing_progress.update_with_typos(update_params, valid_typos_params)
        typing_progress.reload

        expect(typing_progress.attributes.except('created_at', 'updated_at')).to eq(original_attributes)
      end
    end
  end
end
