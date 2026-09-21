package dto

import "hrsaas/internal/modules/payroll/entity"

const (
	SalaryComponentTypeEarning   = "EARNING"
	SalaryComponentTypeDeduction = "DEDUCTION"

	CalculationTypeFixed            = "FIXED"
	CalculationTypeSalaryPercentage = "SALARY_PERCENTAGE" // persentase gaji pokok
	CalculationTypeAttendance       = "ATTENDANCE"
	CalculateTypeGrossPercentage    = "GROSS_PERCENTAGE" // total semua pendapatan
	// CalculateTypeMaritalStatus      = "MARITAL_STATUS"
)

type SalaryComponentResponse struct {
	ID              string `json:"id"`
	Code            string `json:"code"`
	Name            string `json:"name"`
	Type            string `json:"type"`
	CalculationType string `json:"calculation_type"`
	IsTaxable       bool   `json:"is_taxable"`
	IsBpjsBase      bool   `json:"is_bpjs_base"`
	IsActive        bool   `json:"is_active"`
	CreatedAt       int64  `json:"created_at"`
	UpdatedAt       int64  `json:"updated_at"`
}

type CreateSalaryComponentRequest struct {
	Code            string `json:"code" validate:"required,max=50"`
	Name            string `json:"name" validate:"required,max=100"`
	Type            string `json:"type" validate:"required,oneof=EARNING DEDUCTION"`
	CalculationType string `json:"calculation_type" validate:"required,oneof=FIXED FORMULA SALARY_PERCENTAGE ATTENDANCE GROSS_PERCENTAGE"`
	IsTaxable       bool   `json:"is_taxable"`
	IsBpjsBase      bool   `json:"is_bpjs_base"`
}

type SearchSalaryComponentRequest struct {
	Key        string `json:"key" validate:"max=100"`
	Type       string `json:"type" validate:"omitempty,oneof=EARNING DEDUCTION"`
	ActiveOnly bool   `json:"active_only"`
	Page       int    `json:"page" validate:"min=1"`
	Size       int    `json:"size" validate:"min=1,max=100"`
}

//

func SalaryComponentToResponse(item *entity.SalaryComponent) *SalaryComponentResponse {
	if item == nil {
		return nil
	}

	return &SalaryComponentResponse{
		ID:              item.ID,
		Code:            item.Code,
		Name:            item.Name,
		Type:            item.Type,
		CalculationType: item.CalculationType,
		IsTaxable:       item.IsTaxable,
		IsBpjsBase:      item.IsBpjsBase,
		IsActive:        item.IsActive,
		CreatedAt:       item.CreatedAt,
		UpdatedAt:       item.UpdatedAt,
	}
}

func SalaryComponentsToResponse(items []entity.SalaryComponent) []SalaryComponentResponse {
	if len(items) == 0 {
		return nil
	}

	responses := make([]SalaryComponentResponse, 0, len(items))
	for i := range items {
		if item := SalaryComponentToResponse(&items[i]); item != nil {
			responses = append(responses, *item)
		}
	}
	return responses
}
