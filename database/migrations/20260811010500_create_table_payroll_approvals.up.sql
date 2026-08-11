-- APPROVAL WORKFLOW, TERPISAH DARI EKSEKUSI PEMBAYARAN
CREATE TABLE payroll_approvals (
  id VARCHAR(36) NOT NULL,
  payroll_id VARCHAR(36) NOT NULL,
  approver_id VARCHAR(36) NOT NULL,
  level SMALLINT NOT NULL DEFAULT 1,
  status VARCHAR(20) NOT NULL, -- APPROVED, REJECTED
  notes TEXT NULL,
  approved_at BIGINT NULL,
  created_at BIGINT NOT NULL,
  PRIMARY KEY (id),

  CONSTRAINT fk_payroll_approvals_payroll_id
    FOREIGN KEY (payroll_id) REFERENCES payrolls (id)
    ON DELETE CASCADE,

  CONSTRAINT fk_payroll_approvals_approver_id
    FOREIGN KEY (approver_id) REFERENCES users (id)
);
