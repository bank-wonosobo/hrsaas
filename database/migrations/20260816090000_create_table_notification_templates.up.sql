CREATE TABLE notification_templates (
  id VARCHAR(36) NOT NULL,
  company_id VARCHAR(100) NOT NULL,
  code VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  title_template VARCHAR(255) NOT NULL,
  body_template TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL,
  PRIMARY KEY (id),

  CONSTRAINT uq_notification_templates_company_code UNIQUE (company_id, code),

  CONSTRAINT fk_notification_templates_company_id
    FOREIGN KEY (company_id) REFERENCES companies (id)
    ON DELETE CASCADE
);
