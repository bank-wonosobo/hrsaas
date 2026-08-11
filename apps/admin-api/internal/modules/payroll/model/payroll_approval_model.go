package model

import (
	"hrsaas-admin-api/internal/modules/payroll/entity"
)

const (
	ApprovalStatusApproved = "APPROVED"
	ApprovalStatusRejected = "REJECTED"
)

type PayrollApprovalResponse struct {
	ID         string  `json:"id"`
	PayrollID  string  `json:"payroll_id"`
	ApproverID string  `json:"approver_id"`
	Level      int     `json:"level"`
	Status     string  `json:"status"`
	Notes      *string `json:"notes,omitempty"`
	ApprovedAt *int64  `json:"approved_at,omitempty"`
	CreatedAt  int64   `json:"created_at"`
}

func PayrollApprovalToResponse(item *entity.PayrollApproval) *PayrollApprovalResponse {
	if item == nil {
		return nil
	}

	return &PayrollApprovalResponse{
		ID:         item.ID,
		PayrollID:  item.PayrollID,
		ApproverID: item.ApproverID,
		Level:      item.Level,
		Status:     item.Status,
		Notes:      item.Notes,
		ApprovedAt: item.ApprovedAt,
		CreatedAt:  item.CreatedAt,
	}
}

func PayrollApprovalsToResponse(items []entity.PayrollApproval) []PayrollApprovalResponse {
	if len(items) == 0 {
		return nil
	}

	responses := make([]PayrollApprovalResponse, 0, len(items))
	for i := range items {
		if response := PayrollApprovalToResponse(&items[i]); response != nil {
			responses = append(responses, *response)
		}
	}

	return responses
}
