# frozen_string_literal: true

require 'rails_helper'

RSpec.describe API::Repositories::PreviewsController, type: :request do
  include_context 'with authenticated user'

  describe 'GET /api/repositories/preview' do
    subject(:get_preview_with_valid_url) do
      get '/api/repositories/preview', params: { repository_preview: { url: valid_url } }, headers: headers
    end

    let(:valid_url) { 'https://github.com/username/repository' }
    let(:valid_repository_url) { 'username/repository' }

    context 'when url is valid' do
      let(:repository_info) do
        instance_double(Octokit::Repository, name: 'repository')
      end

      let(:commit) do
        double('commit', sha: 'commit_hash')
      end

      let(:file_tree_data) do
        double('file_tree_data', tree: [
                 double('node', path: 'directory', type: 'tree'),
                 double('node', path: 'ruby_file1.rb', type: 'blob'),
                 double('node', path: 'ruby_file2.rb', type: 'blob'),
                 double('node', path: 'ruby_file3.rb', type: 'blob'),
                 double('node', path: 'html_file1.html', type: 'blob'),
                 double('node', path: 'html_file2.html', type: 'blob'),
                 double('node', path: 'Gemfile', type: 'blob'),
                 double('node', path: '.gitignore', type: 'blob')
               ])
      end

      before do
        github_client_mock = instance_double(Octokit::Client)
        allow(Octokit::Client).to receive(:new).and_return(github_client_mock)
        allow(github_client_mock).to receive(:repository?).with(valid_repository_url).and_return(true)
        allow(github_client_mock).to receive(:repository).with(valid_repository_url).and_return(repository_info)
        allow(github_client_mock).to receive(:commits).with(valid_repository_url).and_return([commit])

        allow(github_client_mock).to receive(:tree)
          .with(valid_repository_url, 'commit_hash', recursive: true)
          .and_return(file_tree_data)
      end

      it 'returns ok status' do
        get_preview_with_valid_url
        expect(response).to have_http_status(:ok)
      end

      it 'returns repository name and url' do
        get_preview_with_valid_url
        json = response.parsed_body
        expect(json['name']).to eq('repository')
        expect(json['url']).to eq('username/repository')
      end

      it 'returns extensions order by file count and name' do
        get_preview_with_valid_url
        json_extensions = response.parsed_body['extensions']

        expect(json_extensions.length).to eq(4)
        expect(json_extensions[0]).to have_json_attributes(name: '.rb', file_count: 3, is_active: true)
        expect(json_extensions[1]).to have_json_attributes(name: '.html', file_count: 2, is_active: true)
        expect(json_extensions[2]).to have_json_attributes(name: '.gitignore', file_count: 1, is_active: true)
        expect(json_extensions[3]).to have_json_attributes(name: Extension::NO_EXTENSION_NAME, file_count: 1,
                                                           is_active: true)
      end

      it 'does not return directory' do
        get_preview_with_valid_url
        json_extensions = response.parsed_body['extensions']

        directory = json_extensions.find { |extension| extension['name'] == 'directory' }
        expect(directory).to be_nil
      end
    end

    context 'when url is invalid' do
      it 'returns unprocessable_content status' do
        invalid_url = 'https://invalid_url.com'
        get '/api/repositories/preview', params: { repository_preview: { url: invalid_url } }, headers: headers

        expect(response).to have_http_status(:unprocessable_content)
        json = response.parsed_body
        expect(json['message']).to eq('Invalid URL.')
      end
    end

    context 'when repository is non-existent' do
      subject(:get_preview_with_non_existent_url) do
        get '/api/repositories/preview', params: { repository_preview: { url: non_existent_url } }, headers: headers
      end

      let(:non_existent_repository_url) { 'username/invalid_url' }
      let(:non_existent_url) { 'https://github.com/username/invalid_url' }

      before do
        github_client_mock = instance_double(Octokit::Client)
        allow(Octokit::Client).to receive(:new).and_return(github_client_mock)
        allow(github_client_mock).to receive(:repository?).with(non_existent_repository_url).and_return(false)
      end

      it 'returns not found status' do
        get_preview_with_non_existent_url
        expect(response).to have_http_status(:not_found)
        json = response.parsed_body
        expect(json['message']).to eq('Repository not found.')
      end
    end

    context 'when too many requests' do
      before do
        github_client_mock = instance_double(Octokit::Client)
        allow(Octokit::Client).to receive(:new).and_return(github_client_mock)
        allow(github_client_mock).to receive(:repository?).with(valid_repository_url).and_raise(Octokit::TooManyRequests)
      end

      it 'returns too_many_requests status' do
        get_preview_with_valid_url
        expect(response).to have_http_status(:too_many_requests)
        json = response.parsed_body
        expect(json['message']).to eq('Too many requests. Please try again later.')
      end
    end

    context 'when unauthorized' do
      before do
        github_client_mock = instance_double(Octokit::Client)
        allow(Octokit::Client).to receive(:new).and_return(github_client_mock)
        allow(github_client_mock).to receive(:repository?).with(valid_repository_url).and_raise(Octokit::Unauthorized)
      end

      it 'returns unauthorized status' do
        get_preview_with_valid_url
        expect(response).to have_http_status(:unauthorized)
        json = response.parsed_body
        expect(json['message']).to eq('Invalid access token.')
      end
    end

    context 'when unexpected error occurs' do
      before do
        github_client_mock = instance_double(Octokit::Client)
        allow(Octokit::Client).to receive(:new).and_return(github_client_mock)
        allow(github_client_mock).to receive(:repository?).with(valid_repository_url).and_raise(StandardError)
      end

      it 'returns internal_server_error status' do
        get_preview_with_valid_url
        expect(response).to have_http_status(:internal_server_error)
        json = response.parsed_body
        expect(json['message']).to eq('An error occurred. Please try again later.')
      end
    end
  end
end
