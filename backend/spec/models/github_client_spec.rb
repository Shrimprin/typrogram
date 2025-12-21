# frozen_string_literal: true

require 'rails_helper'

RSpec.describe GithubClient, type: :model do
  let(:github_client) { described_class.new }
  let(:octokit_client_mock) { instance_double(Octokit::Client) }
  let(:repository_url) { 'username/repository' }

  before do
    allow(ENV).to receive(:fetch).with('GITHUB_ACCESS_TOKEN').and_return('github_access_token')
    allow(Octokit::Client).to receive(:new).and_return(octokit_client_mock)
  end

  describe '#build_repository' do
    let(:user) { create(:user) }
    let(:extensions_attributes) { [{ name: '.rb', is_active: true }, { name: '.md', is_active: true }] }
    let(:repository_info) { instance_double(Octokit::Repository, name: 'repository') }
    let(:commit) { double('commit', sha: 'commit_hash') }

    before do
      allow(octokit_client_mock).to receive(:repository).with(repository_url).and_return(repository_info)
      allow(octokit_client_mock).to receive(:commits).with(repository_url).and_return([commit])
    end

    it 'builds repository with correct attributes' do
      repository = github_client.build_repository(user, repository_url, extensions_attributes)

      expect(repository.name).to eq('repository')
      expect(repository.url).to eq(repository_url)
      expect(repository.commit_hash).to eq('commit_hash')
      expect(repository.extensions.length).to eq(2)
    end
  end

  describe '#build_repository_preview_data' do
    let(:repository_info) { instance_double(Octokit::Repository, name: 'repository') }
    let(:commit) { double('commit', sha: 'commit_hash') }
    let(:nodes) do
      [
        double('node', path: 'ruby_file1.rb', type: 'blob'),
        double('node', path: 'ruby_file2.rb', type: 'blob'),
        double('node', path: 'html_file1.html', type: 'blob'),
        double('node', path: 'Gemfile', type: 'blob'),
        double('node', path: '.gitignore', type: 'blob')
      ]
    end
    let(:tree_response) { double('tree_response', tree: nodes) }

    before do
      allow(octokit_client_mock).to receive(:repository).with(repository_url).and_return(repository_info)
      allow(octokit_client_mock).to receive(:commits).with(repository_url).and_return([commit])
      allow(octokit_client_mock).to receive(:tree)
        .with(repository_url, 'commit_hash', recursive: true)
        .and_return(tree_response)
    end

    it 'returns repository preview data with name and url' do
      result = github_client.build_repository_preview_data(repository_url)

      expect(result[:name]).to eq('repository')
      expect(result[:url]).to eq(repository_url)
    end

    it 'returns extensions sorted by file count and name' do
      result = github_client.build_repository_preview_data(repository_url)

      extensions = result[:extensions]
      expect(extensions.length).to eq(4)
      expect(extensions[0]).to eq({ name: '.rb', file_count: 2, is_active: true })
      expect(extensions[1]).to eq({ name: '.gitignore', file_count: 1, is_active: true })
      expect(extensions[2]).to eq({ name: '.html', file_count: 1, is_active: true })
      expect(extensions[3]).to eq({ name: Extension::NO_EXTENSION_NAME, file_count: 1, is_active: true })
    end
  end
end
