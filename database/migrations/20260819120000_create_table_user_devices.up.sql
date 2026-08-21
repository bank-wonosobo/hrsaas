-- STORES ONE ROW PER USER'S REGISTERED DEVICE (FOR PUSH NOTIFICATIONS).
-- PUSH_TOKEN IS GLOBALLY UNIQUE: RE-REGISTERING THE SAME DEVICE (REINSTALL,
-- RE-LOGIN AS A DIFFERENT USER, ETC.) REASSIGNS OWNERSHIP INSTEAD OF
-- DUPLICATING.
CREATE TABLE user_devices (
  id VARCHAR(36) NOT NULL,

  user_id VARCHAR(36) NOT NULL,

  device_id VARCHAR(255),
  device_name VARCHAR(255),
  app_version VARCHAR(30),
  push_token VARCHAR(500) NOT NULL,

  provider VARCHAR(20) NOT NULL,
  platform VARCHAR(20) NOT NULL,

  is_active BOOLEAN NOT NULL DEFAULT TRUE,

  last_seen_at BIGINT,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL,

  PRIMARY KEY (id),

  CONSTRAINT uq_user_devices_push_token UNIQUE (push_token),

  CONSTRAINT fk_user_devices_user_id
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE
);

CREATE INDEX idx_user_devices_user_id ON user_devices (user_id);
