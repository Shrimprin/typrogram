# frozen_string_literal: true

require 'rails_helper'

RSpec.describe GithubUrl do
  describe '.extract_repository_path' do
    context 'when url is invalid' do
      it 'returns repository path' do
        url = 'https://github.com/shrimprin/typrogram'
        expect(described_class.extract_repository_path(url)).to eq('shrimprin/typrogram')
      end
    end

    context 'when url is nil' do
      it 'returns nil' do
        expect(described_class.extract_repository_path(nil)).to be_nil
      end
    end

    context 'when url is not a string' do
      it 'returns nil' do
        expect(described_class.extract_repository_path(123)).to be_nil
      end
    end

    context 'when url contains non-ASCII characters' do
      it 'returns nil' do
        url = 'https://github.com/ユーザー/リポジトリ'
        expect(described_class.extract_repository_path(url)).to be_nil
      end
    end

    context 'when scheme is missing' do
      it 'returns nil' do
        url = 'github.com/shrimprin/typrogram'
        expect(described_class.extract_repository_path(url)).to be_nil
      end
    end

    context 'when host is not github.com' do
      it 'returns nil' do
        url = 'https://gitlab.com/shrimprin/typrogram'
        expect(described_class.extract_repository_path(url)).to be_nil
      end
    end

    context 'when path has more than two segments' do
      it 'returns nil' do
        url = 'https://github.com/shrimprin/typrogram/backend'
        expect(described_class.extract_repository_path(url)).to be_nil
      end
    end
  end
end
