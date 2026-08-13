-- INTEGRASI PEMBAYARAN KE BANK
CREATE TABLE payroll_payments (
  id VARCHAR(36) NOT NULL,
  payroll_detail_id VARCHAR(36) NOT NULL,
  employee_id VARCHAR(36) NOT NULL,
  bank_name VARCHAR(100) NULL,
  bank_account VARCHAR(50) NULL,
  account_name VARCHAR(100) NULL,
  amount DECIMAL(15,2) NOT NULL,
  payment_reference VARCHAR(100) NULL,
  paid_at BIGINT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING, PROCESSING, SUCCESS, FAILED
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL,
  PRIMARY KEY (id),

  CONSTRAINT fk_payroll_payments_payroll_detail_id
    FOREIGN KEY (payroll_detail_id) REFERENCES payroll_details (id)
    ON DELETE CASCADE,

  CONSTRAINT fk_payroll_payments_employee_id
    FOREIGN KEY (employee_id) REFERENCES employees (id)
);
