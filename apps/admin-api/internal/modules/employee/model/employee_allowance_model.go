package model

import (
	"hrsaas-admin-api/internal/modules/employee/entity"
	payrollModel "hrsaas-admin-api/internal/modules/payroll/model"
)

type EmployeeAllowanceResponse struct {
	ID                string                                `json:"id"`
	EmployeeID        string                                `json:"employee_id"`
	SalaryComponentID string                                `json:"salary_component_id"`
	Amount            float64                               `json:"amount"`
	Percentage        float64                               `json:"percentage"`
	EffectiveDate     int64                                 `json:"effective_date"`
	EndDate           *int64                                `json:"end_date,omitempty"`
	CreatedAt         int64                                 `json:"created_at"`
	UpdatedAt         int64                                 `json:"updated_at"`
	Employee          *EmployeeResponse                     `json:"employee,omitempty"`
	SalaryComponent   *payrollModel.SalaryComponentResponse `json:"salary_component,omitempty"`
}

type CreateEmployeeAllowanceRequest struct {
	EmployeeID        string  `json:"employee_id" validate:"required"`
	SalaryComponentID string  `json:"salary_component_id" validate:"required"`
	Amount            float64 `json:"amount" validate:"omitempty,min=0"`
	Percentage        float64 `json:"percentage" validate:"omitempty,min=0,max=100"`
	EffectiveDate     string  `json:"effective_date" validate:"required"`
	EndDate           *string `json:"end_date"`
}

type UpdateEmployeeAllowanceRequest struct {
	Amount        *float64 `json:"amount,omitempty" validate:"omitempty,min=0"`
	Percentage    *float64 `json:"percentage,omitempty" validate:"omitempty,min=0,max=100"`
	EffectiveDate *string  `json:"effective_date,omitempty"`
	EndDate       *string  `json:"end_date,omitempty"`
}

type SearchEmployeeAllowanceRequest struct {
	EmployeeID string `json:"employee_id" validate:"max=100"`
	ActiveOnly bool   `json:"active_only"`
	Page       int    `json:"page" validate:"min=1"`
	Size       int    `json:"size" validate:"min=1,max=100"`
}

func EmployeeAllowanceToResponse(item *entity.EmployeeAllowance) *EmployeeAllowanceResponse {
	if item == nil {
		return nil
	}

	response := &EmployeeAllowanceResponse{
		ID:                item.ID,
		EmployeeID:        item.EmployeeID,
		SalaryComponentID: item.SalaryComponentID,
		Amount:            item.Amount,
		Percentage:        item.Percentage,
		EffectiveDate:     item.EffectiveDate,
		EndDate:           item.EndDate,
		CreatedAt:         item.CreatedAt,
		UpdatedAt:         item.UpdatedAt,
	}

	if item.Employee.ID != "" {
		response.Employee = EmployeeSummaryToResponse(&item.Employee)
	}
	if item.SalaryComponent.ID != "" {
		response.SalaryComponent = payrollModel.SalaryComponentToResponse(&item.SalaryComponent)
	}

	return response
}

func EmployeeAllowancesToResponse(items []entity.EmployeeAllowance) []EmployeeAllowanceResponse {
	if len(items) == 0 {
		return nil
	}

	responses := make([]EmployeeAllowanceResponse, 0, len(items))
	for i := range items {
		if response := EmployeeAllowanceToResponse(&items[i]); response != nil {
			responses = append(responses, *response)
		}
	}

	return responses
}
