-- ONE RECORD PER PAYROLL PERIOD
CREATE TABLE payrolls (
  id VARCHAR(36) NOT NULL,
  company_id VARCHAR(36) NOT NULL,
  payroll_number VARCHAR(50) NOT NULL,
  period_month SMALLINT NOT NULL,
  period_year SMALLINT NOT NULL,
  payment_date BIGINT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'DRAFT', -- DRAFT, CALCULATED, SUBMITTED, APPROVED, PAID, CANCELLED
  total_gross DECIMAL(18,2) NOT NULL DEFAULT 0,
  total_deduction DECIMAL(18,2) NOT NULL DEFAULT 0,
  total_net DECIMAL(18,2) NOT NULL DEFAULT 0,
  created_by VARCHAR(36) NULL,
  approved_by VARCHAR(36) NULL,
  approved_at BIGINT NULL,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL,
  PRIMARY KEY (id),

  CONSTRAINT uq_payrolls_company_period UNIQUE (company_id, period_year, period_month),
  CONSTRAINT uq_payrolls_number UNIQUE (payroll_number),

  CONSTRAINT fk_payrolls_company_id
    FOREIGN KEY (company_id) REFERENCES companies (id)
    ON DELETE CASCADE,

  CONSTRAINT fk_payrolls_created_by
    FOREIGN KEY (created_by) REFERENCES users (id),

  CONSTRAINT fk_payrolls_approved_by
    FOREIGN KEY (approved_by) REFERENCES users (id)
);

-- ONE EMPLOYEE = ONE PAYROLL DETAIL PER PAYROLL
CREATE TABLE payroll_details (
  id VARCHAR(36) NOT NULL,
  payroll_id VARCHAR(36) NOT NULL,
  employee_id VARCHAR(36) NOT NULL,
  basic_salary DECIMAL(15,2) NOT NULL DEFAULT 0,
  gross_salary DECIMAL(15,2) NOT NULL DEFAULT 0,
  total_earning DECIMAL(15,2) NOT NULL DEFAULT 0,
  total_deduction DECIMAL(15,2) NOT NULL DEFAULT 0,
  net_salary DECIMAL(15,2) NOT NULL DEFAULT 0,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL,
  PRIMARY KEY (id),

  CONSTRAINT uq_payroll_details_payroll_employee UNIQUE (payroll_id, employee_id),

  CONSTRAINT fk_payroll_details_payroll_id
    FOREIGN KEY (payroll_id) REFERENCES payrolls (id)
    ON DELETE CASCADE,

  CONSTRAINT fk_payroll_details_employee_id
    FOREIGN KEY (employee_id) REFERENCES employees (id)
);

-- SNAPSHOT OF EVERY SALARY COMPONENT PER PAYROLL DETAIL
CREATE TABLE payroll_items (
  id VARCHAR(36) NOT NULL,
  payroll_detail_id VARCHAR(36) NOT NULL,
  salary_component_id VARCHAR(36) NULL,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL, -- EARNING, DEDUCTION
  amount DECIMAL(15,2) NOT NULL,
  calculation_value DECIMAL(15,2) NULL,
  created_at BIGINT NOT NULL,
  PRIMARY KEY (id),

  CONSTRAINT fk_payroll_items_payroll_detail_id
    FOREIGN KEY (payroll_detail_id) REFERENCES payroll_details (id)
    ON DELETE CASCADE,

  CONSTRAINT fk_payroll_items_salary_component_id
    FOREIGN KEY (salary_component_id) REFERENCES salary_components (id)
);
