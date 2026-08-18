package model

import (
	"hrsaas/internal/modules/payroll/entity"
)

const (
	PaymentStatusPending    = "PENDING"
	PaymentStatusProcessing = "PROCESSING"
	PaymentStatusSuccess    = "SUCCESS"
	PaymentStatusFailed     = "FAILED"
)

type PayrollPaymentResponse struct {
	ID               string                  `json:"id"`
	PayrollDetailID  string                  `json:"payroll_detail_id"`
	EmployeeID       string                  `json:"employee_id"`
	BankName         *string                 `json:"bank_name,omitempty"`
	BankAccount      *string                 `json:"bank_account,omitempty"`
	AccountName      *string                 `json:"account_name,omitempty"`
	Amount           float64                 `json:"amount"`
	PaymentReference *string                 `json:"payment_reference,omitempty"`
	PaidAt           *int64                  `json:"paid_at,omitempty"`
	Status           string                  `json:"status"`
	CreatedAt        int64                   `json:"created_at"`
	UpdatedAt        int64                   `json:"updated_at"`
	Employee         *PayrollEmployeeSummary `json:"employee,omitempty"`
}

type UpdatePayrollPaymentStatusRequest struct {
	Status           string  `json:"status" validate:"required,oneof=PENDING PROCESSING SUCCESS FAILED"`
	PaymentReference *string `json:"payment_reference"`
}

type SearchPayrollPaymentRequest struct {
	PayrollID string `json:"payroll_id" validate:"max=100"`
	Status    string `json:"status" validate:"max=20"`
	Page      int    `json:"page" validate:"min=1"`
	Size      int    `json:"size" validate:"min=1,max=100"`
}

func PayrollPaymentToResponse(item *entity.PayrollPayment) *PayrollPaymentResponse {
	if item == nil {
		return nil
	}

	return &PayrollPaymentResponse{
		ID:               item.ID,
		PayrollDetailID:  item.PayrollDetailID,
		EmployeeID:       item.EmployeeID,
		BankName:         item.BankName,
		BankAccount:      item.BankAccount,
		AccountName:      item.AccountName,
		Amount:           item.Amount,
		PaymentReference: item.PaymentReference,
		PaidAt:           item.PaidAt,
		Status:           item.Status,
		CreatedAt:        item.CreatedAt,
		UpdatedAt:        item.UpdatedAt,
	}
}

func PayrollPaymentsToResponse(items []entity.PayrollPayment) []PayrollPaymentResponse {
	if len(items) == 0 {
		return nil
	}

	responses := make([]PayrollPaymentResponse, 0, len(items))
	for i := range items {
		if response := PayrollPaymentToResponse(&items[i]); response != nil {
			responses = append(responses, *response)
		}
	}

	return responses
}
