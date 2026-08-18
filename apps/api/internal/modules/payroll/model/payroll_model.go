package model

import (
	"hrsaas/internal/modules/payroll/entity"
)

const (
	PayrollStatusDraft      = "DRAFT"
	PayrollStatusCalculated = "CALCULATED"
	PayrollStatusSubmitted  = "SUBMITTED"
	PayrollStatusApproved   = "APPROVED"
	PayrollStatusPaid       = "PAID"
	PayrollStatusCancelled  = "CANCELLED"
)

// PayrollEmployeeSummary is a minimal, self-contained employee snapshot embedded in
// payroll responses. It is populated by the usecase (which is free to depend on the
// employee module) rather than mapped from entity.PayrollDetail, because payroll/entity
// deliberately has no relation to employee/entity to avoid an import cycle (the employee
// module already depends on payroll/entity for salary components).
type PayrollEmployeeSummary struct {
	ID             string `json:"id"`
	EmployeeNumber string `json:"employee_number,omitempty"`
	Fullname       string `json:"fullname,omitempty"`
	BankName       string `json:"bank_name,omitempty"`
	BankAccount    string `json:"bank_account,omitempty"`
}

type PayrollResponse struct {
	ID             string                  `json:"id"`
	CompanyID      string                  `json:"company_id"`
	PayrollNumber  string                  `json:"payroll_number"`
	PeriodMonth    int                     `json:"period_month"`
	PeriodYear     int                     `json:"period_year"`
	PaymentDate    *int64                  `json:"payment_date,omitempty"`
	Status         string                  `json:"status"`
	TotalGross     float64                 `json:"total_gross"`
	TotalDeduction float64                 `json:"total_deduction"`
	TotalNet       float64                 `json:"total_net"`
	CreatedBy      *string                 `json:"created_by,omitempty"`
	ApprovedBy     *string                 `json:"approved_by,omitempty"`
	ApprovedAt     *int64                  `json:"approved_at,omitempty"`
	CreatedAt      int64                   `json:"created_at"`
	UpdatedAt      int64                   `json:"updated_at"`
	Details        []PayrollDetailResponse `json:"details,omitempty"`
}

type PayrollItemResponse struct {
	ID                string   `json:"id"`
	PayrollDetailID   string   `json:"payroll_detail_id"`
	SalaryComponentID *string  `json:"salary_component_id,omitempty"`
	Name              string   `json:"name"`
	Type              string   `json:"type"`
	Amount            float64  `json:"amount"`
	CalculationValue  *float64 `json:"calculation_value,omitempty"`
	CreatedAt         int64    `json:"created_at"`
}

type PayrollDetailResponse struct {
	ID             string                      `json:"id"`
	PayrollID      string                      `json:"payroll_id"`
	EmployeeID     string                      `json:"employee_id"`
	BasicSalary    float64                     `json:"basic_salary"`
	GrossSalary    float64                     `json:"gross_salary"`
	TotalEarning   float64                     `json:"total_earning"`
	TotalDeduction float64                     `json:"total_deduction"`
	NetSalary      float64                     `json:"net_salary"`
	CreatedAt      int64                       `json:"created_at"`
	UpdatedAt      int64                       `json:"updated_at"`
	Employee       *PayrollEmployeeSummary     `json:"employee,omitempty"`
	Items          []PayrollItemResponse       `json:"items,omitempty"`
	Adjustments    []PayrollAdjustmentResponse `json:"adjustments,omitempty"`
}

type CreatePayrollRequest struct {
	PeriodMonth int `json:"period_month" validate:"required,min=1,max=12"`
	PeriodYear  int `json:"period_year" validate:"required,min=2000,max=2100"`
}

type SearchPayrollRequest struct {
	CompanyID  string `json:"company_id" validate:"required"`
	Status     string `json:"status" validate:"max=20"`
	PeriodYear int    `json:"period_year" validate:"omitempty,min=2000,max=2100"`
	Page       int    `json:"page" validate:"min=1"`
	Size       int    `json:"size" validate:"min=1,max=100"`
}

type RejectPayrollRequest struct {
	Notes string `json:"notes" validate:"required"`
}

func PayrollToResponse(item *entity.Payroll) *PayrollResponse {
	if item == nil {
		return nil
	}

	return &PayrollResponse{
		ID:             item.ID,
		CompanyID:      item.CompanyID,
		PayrollNumber:  item.PayrollNumber,
		PeriodMonth:    item.PeriodMonth,
		PeriodYear:     item.PeriodYear,
		PaymentDate:    item.PaymentDate,
		Status:         item.Status,
		TotalGross:     item.TotalGross,
		TotalDeduction: item.TotalDeduction,
		TotalNet:       item.TotalNet,
		CreatedBy:      item.CreatedBy,
		ApprovedBy:     item.ApprovedBy,
		ApprovedAt:     item.ApprovedAt,
		CreatedAt:      item.CreatedAt,
		UpdatedAt:      item.UpdatedAt,
	}
}

func PayrollsToResponse(items []entity.Payroll) []PayrollResponse {
	if len(items) == 0 {
		return nil
	}

	responses := make([]PayrollResponse, 0, len(items))
	for i := range items {
		if response := PayrollToResponse(&items[i]); response != nil {
			responses = append(responses, *response)
		}
	}

	return responses
}

func PayrollItemToResponse(item *entity.PayrollItem) *PayrollItemResponse {
	if item == nil {
		return nil
	}

	return &PayrollItemResponse{
		ID:                item.ID,
		PayrollDetailID:   item.PayrollDetailID,
		SalaryComponentID: item.SalaryComponentID,
		Name:              item.Name,
		Type:              item.Type,
		Amount:            item.Amount,
		CalculationValue:  item.CalculationValue,
		CreatedAt:         item.CreatedAt,
	}
}

func PayrollItemsToResponse(items []entity.PayrollItem) []PayrollItemResponse {
	if len(items) == 0 {
		return nil
	}

	responses := make([]PayrollItemResponse, 0, len(items))
	for i := range items {
		if response := PayrollItemToResponse(&items[i]); response != nil {
			responses = append(responses, *response)
		}
	}

	return responses
}

func PayrollDetailToResponse(item *entity.PayrollDetail) *PayrollDetailResponse {
	if item == nil {
		return nil
	}

	return &PayrollDetailResponse{
		ID:             item.ID,
		PayrollID:      item.PayrollID,
		EmployeeID:     item.EmployeeID,
		BasicSalary:    item.BasicSalary,
		GrossSalary:    item.GrossSalary,
		TotalEarning:   item.TotalEarning,
		TotalDeduction: item.TotalDeduction,
		NetSalary:      item.NetSalary,
		CreatedAt:      item.CreatedAt,
		UpdatedAt:      item.UpdatedAt,
		Items:          PayrollItemsToResponse(item.Items),
		Adjustments:    PayrollAdjustmentsToResponse(item.Adjustments),
	}
}

func PayrollDetailsToResponse(items []entity.PayrollDetail) []PayrollDetailResponse {
	if len(items) == 0 {
		return nil
	}

	responses := make([]PayrollDetailResponse, 0, len(items))
	for i := range items {
		if response := PayrollDetailToResponse(&items[i]); response != nil {
			responses = append(responses, *response)
		}
	}

	return responses
}
