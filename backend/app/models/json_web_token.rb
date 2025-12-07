# frozen_string_literal: true

class JsonWebToken
  def self.encode(user_id, expires_at)
    payload = { user_id:, exp: expires_at.to_i }
    JWT.encode(payload, Rails.application.credentials.secret_key_base) # デフォルトではHS256アルゴリズムが使用される
  end

  def self.decode(token)
    decoded = JWT.decode(token, Rails.application.credentials.secret_key_base)[0]
    ActiveSupport::HashWithIndifferentAccess.new(decoded)
  rescue JWT::DecodeError => e
    # トークンの有効切れの際はnilを返す
    LogUtils.log_error(e, 'JsonWebToken.decode')
    nil
  end
end
