CREATE TABLE salary_components
(
    id VARCHAR(36) NOT NULL,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL, -- tipe : EARNING, DEDUCTION
    calculation_type VARCHAR(20) NOT NULL, -- calculation_type: FIXED, PERCENTAGE, FORMULA, MANUAL
    is_taxable BOOLEAN NOT NULL DEFAULT FALSE,
    is_bpjs_base BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL,

    PRIMARY KEY (id),
    CONSTRAINT uq_salary_components_code UNIQUE (code)
);
