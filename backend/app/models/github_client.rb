# frozen_string_literal: true

class GithubClient
  def initialize
    @client = Octokit::Client.new(access_token: ENV.fetch('GITHUB_ACCESS_TOKEN'))
  end

  def build_repository(current_user, repository_url, extensions_attributes)
    latest_commit_hash = latest_commit_hash(repository_url)
    current_user.repositories.build(name: repository_name(repository_url),
                                    url: repository_url,
                                    commit_hash: latest_commit_hash,
                                    extensions_attributes:)
  end

  def build_repository_preview_data(repository_url)
    extensions_data = extract_extensions_data_from_repository(repository_url)
    {
      name: repository_name(repository_url),
      url: repository_url,
      extensions: extensions_data
    }
  end

  def file_tree(repository_url)
    latest_commit_hash = latest_commit_hash(repository_url)
    @client.tree(repository_url, latest_commit_hash, recursive: true)
  end

  def repository?(repository_url)
    @client.repository?(repository_url)
  end

  private

  def repository_name(repository_url)
    @client.repository(repository_url).name
  end

  def latest_commit_hash(repository_url)
    @client.commits(repository_url).first.sha
  end

  def extract_extensions_data_from_repository(repository_url)
    file_tree_data = file_tree(repository_url)
    extension_counts = Hash.new(0) # ex. { '.rb' => 3, '.gitignore' => 1, 'no extension' => 1 }

    file_tree_data.tree.each do |node|
      next unless node.type == 'blob'

      extension_name = Extension.extract_extension_name(node.path)
      extension_counts[extension_name] += 1
    end

    extensions_data = extension_counts.map do |extension_name, file_count|
      {
        name: extension_name,
        file_count:,
        is_active: true
      }
    end

    extensions_data.sort_by { |extension| [-extension[:file_count], extension[:name]] }
  end
end
