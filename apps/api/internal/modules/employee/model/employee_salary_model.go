package model

import (
	"hrsaas/internal/modules/employee/entity"
)

type EmployeeSalaryResponse struct {
	ID            string            `json:"id"`
	EmployeeID    string            `json:"employee_id"`
	BasicSalary   float64           `json:"basic_salary"`
	EffectiveDate int64             `json:"effective_date"`
	EndDate       *int64            `json:"end_date,omitempty"`
	CreatedAt     int64             `json:"created_at"`
	UpdatedAt     int64             `json:"updated_at"`
	Employee      *EmployeeResponse `json:"employee,omitempty"`
}

type CreateEmployeeSalaryRequest struct {
	EmployeeID    string  `json:"employee_id" validate:"required"`
	BasicSalary   float64 `json:"basic_salary" validate:"required,min=0"`
	EffectiveDate string  `json:"effective_date" validate:"required"`
	EndDate       *string `json:"end_date"`
}

type UpdateEmployeeSalaryRequest struct {
	BasicSalary   *float64 `json:"basic_salary,omitempty" validate:"omitempty,min=0"`
	EffectiveDate *string  `json:"effective_date,omitempty"`
	EndDate       *string  `json:"end_date,omitempty"`
}

type SearchEmployeeSalaryRequest struct {
	EmployeeID string `json:"employee_id" validate:"max=100"`
	ActiveOnly bool   `json:"active_only"`
	Page       int    `json:"page" validate:"min=1"`
	Size       int    `json:"size" validate:"min=1,max=100"`
}

func EmployeeSalaryToResponse(item *entity.EmployeeSalary) *EmployeeSalaryResponse {
	if item == nil {
		return nil
	}

	response := &EmployeeSalaryResponse{
		ID:            item.ID,
		EmployeeID:    item.EmployeeID,
		BasicSalary:   item.BasicSalary,
		EffectiveDate: item.EffectiveDate,
		EndDate:       item.EndDate,
		CreatedAt:     item.CreatedAt,
		UpdatedAt:     item.UpdatedAt,
	}

	if item.Employee.ID != "" {
		response.Employee = EmployeeSummaryToResponse(&item.Employee)
	}

	return response
}

func EmployeeSalariesToResponse(items []entity.EmployeeSalary) []EmployeeSalaryResponse {
	if len(items) == 0 {
		return nil
	}

	responses := make([]EmployeeSalaryResponse, 0, len(items))
	for i := range items {
		if response := EmployeeSalaryToResponse(&items[i]); response != nil {
			responses = append(responses, *response)
		}
	}

	return responses
}
