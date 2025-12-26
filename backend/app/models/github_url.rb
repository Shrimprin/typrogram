# frozen_string_literal: true

class GithubUrl
  GITHUB_REPOSITORY_PATH_PATTERN = %r{^/[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$}

  class << self
    def extract_repository_path(url)
      return nil unless valid?(url)

      normalized_path(url)
    end

    private

    def valid?(url)
      return false unless url.is_a?(String) && url.ascii_only?

      parsed_uri = URI.parse(url)
      return false unless parsed_uri
      return false unless parsed_uri.scheme == 'https'
      return false unless parsed_uri.host == 'github.com'

      parsed_uri.path.match?(GITHUB_REPOSITORY_PATH_PATTERN) # /owner/repositoryの形式になっているかチェック
    end

    def normalized_path(url)
      parsed_uri = URI.parse(url)
      parsed_uri.path.delete_prefix('/')
    end
  end
end
