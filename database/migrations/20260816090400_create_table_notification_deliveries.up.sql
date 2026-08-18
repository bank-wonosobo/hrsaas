-- PER-CHANNEL DELIVERY STATUS FOR ONE RECIPIENT (IN_APP, EMAIL, PUSH, SMS),
-- KEPT SEPARATE FROM notification_recipients SO EACH CHANNEL CAN BE RETRIED/AUDITED ON ITS OWN.
CREATE TABLE notification_deliveries (
  id VARCHAR(36) NOT NULL,
  notification_id VARCHAR(36) NOT NULL,
  recipient_id VARCHAR(36) NOT NULL,
  channel VARCHAR(20) NOT NULL, -- IN_APP, EMAIL, PUSH, SMS
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING, PROCESSING, SENT, DELIVERED, FAILED
  sent_at BIGINT NULL,
  delivered_at BIGINT NULL,
  failed_at BIGINT NULL,
  error_message TEXT NULL,
  attempt_count SMALLINT NOT NULL DEFAULT 0,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL,
  PRIMARY KEY (id),

  CONSTRAINT fk_notification_deliveries_notification_id
    FOREIGN KEY (notification_id) REFERENCES notifications (id)
    ON DELETE CASCADE,

  CONSTRAINT fk_notification_deliveries_recipient_id
    FOREIGN KEY (recipient_id) REFERENCES notification_recipients (id)
    ON DELETE CASCADE
);

CREATE INDEX idx_notification_deliveries_recipient_id ON notification_deliveries (recipient_id);
CREATE INDEX idx_notification_deliveries_status ON notification_deliveries (status);
CREATE INDEX idx_notification_deliveries_channel ON notification_deliveries (channel);
