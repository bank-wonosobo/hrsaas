-- STORES THE CONTENT/EVENT OF A NOTIFICATION, NOT WHO RECEIVES IT.
-- ONE ROW HERE CAN FAN OUT TO MANY notification_recipients (SEE NEXT MIGRATION).
CREATE TABLE notifications (
  id VARCHAR(36) NOT NULL,
  company_id VARCHAR(100) NOT NULL,
  template_id VARCHAR(36) NULL,
  type VARCHAR(50) NOT NULL,
  category VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  priority VARCHAR(20) NOT NULL DEFAULT 'NORMAL', -- LOW, NORMAL, HIGH, URGENT
  -- GENERIC POINTER TO THE SOURCE ENTITY (leave_request, payroll, attendance, ...)
  -- INSTEAD OF A FK PER MODULE, SO THIS TABLE STAYS INDEPENDENT OF OTHER MODULES.
  reference_type VARCHAR(50) NULL,
  reference_id VARCHAR(100) NULL,
  action_url VARCHAR(500) NULL,
  data JSONB NULL,
  created_by VARCHAR(36) NULL,
  scheduled_at BIGINT NULL,
  published_at BIGINT NULL,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL,
  PRIMARY KEY (id),

  CONSTRAINT fk_notifications_company_id
    FOREIGN KEY (company_id) REFERENCES companies (id)
    ON DELETE CASCADE,

  CONSTRAINT fk_notifications_template_id
    FOREIGN KEY (template_id) REFERENCES notification_templates (id)
    ON DELETE SET NULL,

  CONSTRAINT fk_notifications_created_by
    FOREIGN KEY (created_by) REFERENCES users (id)
    ON DELETE SET NULL
);

CREATE INDEX idx_notifications_company_id ON notifications (company_id);
CREATE INDEX idx_notifications_type ON notifications (type);
CREATE INDEX idx_notifications_reference ON notifications (reference_type, reference_id);
CREATE INDEX idx_notifications_scheduled_at ON notifications (scheduled_at);
