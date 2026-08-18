-- LINKS ONE notification TO MANY users, WITH PER-USER READ STATE.
CREATE TABLE notification_recipients (
  id VARCHAR(36) NOT NULL,
  notification_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at BIGINT NULL,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL,
  PRIMARY KEY (id),

  CONSTRAINT uq_notification_recipients_notification_user UNIQUE (notification_id, user_id),

  CONSTRAINT fk_notification_recipients_notification_id
    FOREIGN KEY (notification_id) REFERENCES notifications (id)
    ON DELETE CASCADE,

  CONSTRAINT fk_notification_recipients_user_id
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE
);

-- SERVES THE MOST FREQUENT QUERY: UNREAD NOTIFICATIONS FOR A GIVEN USER.
CREATE INDEX idx_notification_recipients_user_unread ON notification_recipients (user_id, is_read);
