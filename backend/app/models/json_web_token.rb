# frozen_string_literal: true

class JsonWebToken
  class << self
    def encode(user_id, expires_at)
      payload = { user_id:, exp: expires_at.to_i }
      JWT.encode(payload, Rails.application.credentials.secret_key_base) # デフォルトではHS256アルゴリズムが使用される
    end

    def decode(token)
      decoded = JWT.decode(token, Rails.application.credentials.secret_key_base)[0]
      ActiveSupport::HashWithIndifferentAccess.new(decoded)
    rescue JWT::DecodeError
      # トークンの有効切れの際はnilを返す
      nil
    end
  end
end
