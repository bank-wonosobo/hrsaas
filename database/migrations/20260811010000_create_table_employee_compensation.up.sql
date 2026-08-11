-- HISTORY OF EMPLOYEE BASIC SALARY
CREATE TABLE employee_salary (
  id VARCHAR(36) NOT NULL,
  employee_id VARCHAR(36) NOT NULL,
  basic_salary DECIMAL(15,2) NOT NULL,
  effective_date BIGINT NOT NULL,
  end_date BIGINT NULL,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL,
  PRIMARY KEY (id),

  CONSTRAINT fk_employee_salary_employee_id
    FOREIGN KEY (employee_id) REFERENCES employees (id)
    ON DELETE CASCADE
);

-- EMPLOYEE ALLOWANCES (dynamic EARNING components attached to an employee)
CREATE TABLE employee_allowances (
  id VARCHAR(36) NOT NULL,
  employee_id VARCHAR(36) NOT NULL,
  salary_component_id VARCHAR(36) NOT NULL,
  amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
  effective_date BIGINT NOT NULL,
  end_date BIGINT NULL,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL,
  PRIMARY KEY (id),

  CONSTRAINT fk_employee_allowances_employee_id
    FOREIGN KEY (employee_id) REFERENCES employees (id)
    ON DELETE CASCADE,

  CONSTRAINT fk_employee_allowances_salary_component_id
    FOREIGN KEY (salary_component_id) REFERENCES salary_components (id)
);

-- EMPLOYEE DEDUCTIONS (dynamic DEDUCTION components attached to an employee)
CREATE TABLE employee_deductions (
  id VARCHAR(36) NOT NULL,
  employee_id VARCHAR(36) NOT NULL,
  salary_component_id VARCHAR(36) NOT NULL,
  amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
  effective_date BIGINT NOT NULL,
  end_date BIGINT NULL,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL,
  PRIMARY KEY (id),

  CONSTRAINT fk_employee_deductions_employee_id
    FOREIGN KEY (employee_id) REFERENCES employees (id)
    ON DELETE CASCADE,

  CONSTRAINT fk_employee_deductions_salary_component_id
    FOREIGN KEY (salary_component_id) REFERENCES salary_components (id)
);
