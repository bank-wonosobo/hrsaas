package dto

import (
	"hrsaas/internal/modules/payroll/entity"
	oldentity "hrsaas/internal/modules/payroll_old/entity"
)

const (
	PayrollStatusDraft      = "DRAFT"
	PayrollStatusCalculated = "CALCULATED"
	PayrollStatusSubmitted  = "SUBMITTED"
	PayrollStatusApproved   = "APPROVED"
	PayrollStatusPaid       = "PAID"
	PayrollStatusCancelled  = "CANCELLED"
)

type CreatePayrollRequest struct {
	PeriodMonth int `json:"period_month" validate:"required,min=1,max=12"`
	PeriodYear  int `json:"period_year" validate:"required,min=2000,max=2100"`
}

type PayrollResponse struct {
	ID             string  `json:"id"`
	CompanyID      string  `json:"company_id"`
	PayrollNumber  string  `json:"payroll_number"`
	PeriodMonth    int     `json:"period_month"`
	PeriodYear     int     `json:"period_year"`
	PaymentDate    *int64  `json:"payment_date,omitempty"`
	Status         string  `json:"status"`
	TotalGross     float64 `json:"total_gross"`
	TotalDeduction float64 `json:"total_deduction"`
	TotalNet       float64 `json:"total_net"`
	CreatedBy      *string `json:"created_by,omitempty"`
	ApprovedBy     *string `json:"approved_by,omitempty"`
	ApprovedAt     *int64  `json:"approved_at,omitempty"`
	CreatedAt      int64   `json:"created_at"`
	UpdatedAt      int64   `json:"updated_at"`
}

type SearchPayrollRequest struct {
	PayrollID  string
	Status     string
	PeriodYear int
	Page       int
	Size       int
}

const (
	PaymentStatusPending    = "PENDING"
	PaymentStatusProcessing = "PROCESSING"
	PaymentStatusSuccess    = "SUCCESS"
	PaymentStatusFailed     = "FAILED"
)

type PayrollPaymentResponse struct {
	ID               string  `json:"id"`
	PayrollDetailID  string  `json:"payroll_detail_id"`
	EmployeeID       string  `json:"employee_id"`
	BankName         *string `json:"bank_name,omitempty"`
	BankAccount      *string `json:"bank_account,omitempty"`
	AccountName      *string `json:"account_name,omitempty"`
	Amount           float64 `json:"amount"`
	PaymentReference *string `json:"payment_reference,omitempty"`
	PaidAt           *int64  `json:"paid_at,omitempty"`
	Status           string  `json:"status"`
	CreatedAt        int64   `json:"created_at"`
	UpdatedAt        int64   `json:"updated_at"`
}

type UpdatePayrollPaymentStatusRequest struct {
	Status           string  `json:"status" validate:"required,oneof=PENDING PROCESSING SUCCESS FAILED"`
	PaymentReference *string `json:"payment_reference"`
}

func PayrollPaymentToResponse(p *oldentity.PayrollPayment) *PayrollPaymentResponse {
	if p == nil {
		return nil
	}
	return &PayrollPaymentResponse{ID: p.ID, PayrollDetailID: p.PayrollDetailID, EmployeeID: p.EmployeeID, BankName: p.BankName, BankAccount: p.BankAccount, AccountName: p.AccountName, Amount: p.Amount, PaymentReference: p.PaymentReference, PaidAt: p.PaidAt, Status: p.Status, CreatedAt: p.CreatedAt, UpdatedAt: p.UpdatedAt}
}

//

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
