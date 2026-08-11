-- BONUS / THR / KOREKSI, DICATAT TERPISAH DARI KOMPONEN GAJI TETAP
CREATE TABLE payroll_adjustments (
  id VARCHAR(36) NOT NULL,
  payroll_detail_id VARCHAR(36) NOT NULL,
  type VARCHAR(20) NOT NULL, -- BONUS, THR, JASPROD, INCENTIVE, CORRECTION
  name VARCHAR(100) NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  description TEXT NULL,
  created_at BIGINT NOT NULL,
  PRIMARY KEY (id),

  CONSTRAINT fk_payroll_adjustments_payroll_detail_id
    FOREIGN KEY (payroll_detail_id) REFERENCES payroll_details (id)
    ON DELETE CASCADE
);
