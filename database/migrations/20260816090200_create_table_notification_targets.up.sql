-- BROADCAST TARGETS, RESOLVED INTO notification_recipients BY THE APPLICATION.
-- PERSONAL NOTIFICATIONS SKIP THIS TABLE AND INSERT notification_recipients DIRECTLY.
CREATE TABLE notification_targets (
  id VARCHAR(36) NOT NULL,
  notification_id VARCHAR(36) NOT NULL,
  target_type VARCHAR(30) NOT NULL, -- USER, DIVISION, POSITION, OFFICE_LOCATION, ROLE, ALL
  target_id VARCHAR(100) NULL, -- NULL WHEN target_type = ALL
  created_at BIGINT NOT NULL,
  PRIMARY KEY (id),

  CONSTRAINT fk_notification_targets_notification_id
    FOREIGN KEY (notification_id) REFERENCES notifications (id)
    ON DELETE CASCADE
);

CREATE INDEX idx_notification_targets_notification_id ON notification_targets (notification_id);
