-- PER-USER, PER-NOTIFICATION-TYPE CHANNEL OPT-IN/OUT.
-- ABSENCE OF A ROW MEANS "USE DEFAULTS" (ALL CHANNELS ENABLED), HANDLED IN APPLICATION CODE.
CREATE TABLE notification_preferences (
  id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  notification_type VARCHAR(100) NOT NULL,
  in_app_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  email_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  push_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL,
  PRIMARY KEY (id),

  CONSTRAINT uq_notification_preferences_user_type UNIQUE (user_id, notification_type),

  CONSTRAINT fk_notification_preferences_user_id
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE
);

CREATE INDEX idx_notification_preferences_user_id ON notification_preferences (user_id);
