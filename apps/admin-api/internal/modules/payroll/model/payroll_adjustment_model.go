package model

import (
	"hrsaas-admin-api/internal/modules/payroll/entity"
)

const (
	AdjustmentTypeBonus      = "BONUS"
	AdjustmentTypeThr        = "THR"
	AdjustmentTypeJasprod    = "JASPROD"
	AdjustmentTypeIncentive  = "INCENTIVE"
	AdjustmentTypeCorrection = "CORRECTION"
)

type PayrollAdjustmentResponse struct {
	ID              string  `json:"id"`
	PayrollDetailID string  `json:"payroll_detail_id"`
	Type            string  `json:"type"`
	Name            string  `json:"name"`
	Amount          float64 `json:"amount"`
	Description     *string `json:"description,omitempty"`
	CreatedAt       int64   `json:"created_at"`
}

type CreatePayrollAdjustmentRequest struct {
	Type        string  `json:"type" validate:"required,oneof=BONUS THR JASPROD INCENTIVE CORRECTION"`
	Name        string  `json:"name" validate:"required,max=100"`
	Amount      float64 `json:"amount" validate:"required"`
	Description *string `json:"description"`
}

func PayrollAdjustmentToResponse(item *entity.PayrollAdjustment) *PayrollAdjustmentResponse {
	if item == nil {
		return nil
	}

	return &PayrollAdjustmentResponse{
		ID:              item.ID,
		PayrollDetailID: item.PayrollDetailID,
		Type:            item.Type,
		Name:            item.Name,
		Amount:          item.Amount,
		Description:     item.Description,
		CreatedAt:       item.CreatedAt,
	}
}

func PayrollAdjustmentsToResponse(items []entity.PayrollAdjustment) []PayrollAdjustmentResponse {
	if len(items) == 0 {
		return nil
	}

	responses := make([]PayrollAdjustmentResponse, 0, len(items))
	for i := range items {
		if response := PayrollAdjustmentToResponse(&items[i]); response != nil {
			responses = append(responses, *response)
		}
	}

	return responses
}
