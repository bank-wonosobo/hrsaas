package usecase

import (
	"context"
	"fmt"
	"time"

	employeeRepository "hrsaas/internal/modules/employee/repository"
	"hrsaas/internal/modules/payroll/entity"
	"hrsaas/internal/modules/payroll/model"
	"hrsaas/internal/modules/payroll/repository"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type PayrollUseCase struct {
	DB       *gorm.DB
	Log      *logrus.Logger
	Validate *validator.Validate

	Repo           *repository.PayrollRepository
	DetailRepo     *repository.PayrollDetailRepository
	ItemRepo       *repository.PayrollItemRepository
	AdjustmentRepo *repository.PayrollAdjustmentRepository
	PaymentRepo    *repository.PayrollPaymentRepository
	ApprovalRepo   *repository.PayrollApprovalRepository

	EmployeeRepository          *employeeRepository.EmployeeRepository
	EmployeeSalaryRepository    *employeeRepository.EmployeeSalaryRepository
	EmployeeAllowanceRepository *employeeRepository.EmployeeAllowanceRepository
	EmployeeDeductionRepository *employeeRepository.EmployeeDeductionRepository
}

func NewPayrollUseCase(
	db *gorm.DB,
	log *logrus.Logger,
	validate *validator.Validate,
	repo *repository.PayrollRepository,
	detailRepo *repository.PayrollDetailRepository,
	itemRepo *repository.PayrollItemRepository,
	adjustmentRepo *repository.PayrollAdjustmentRepository,
	paymentRepo *repository.PayrollPaymentRepository,
	approvalRepo *repository.PayrollApprovalRepository,
	employeeRepo *employeeRepository.EmployeeRepository,
	employeeSalaryRepo *employeeRepository.EmployeeSalaryRepository,
	employeeAllowanceRepo *employeeRepository.EmployeeAllowanceRepository,
	employeeDeductionRepo *employeeRepository.EmployeeDeductionRepository,
) *PayrollUseCase {
	return &PayrollUseCase{
		DB:                          db,
		Log:                         log,
		Validate:                    validate,
		Repo:                        repo,
		DetailRepo:                  detailRepo,
		ItemRepo:                    itemRepo,
		AdjustmentRepo:              adjustmentRepo,
		PaymentRepo:                 paymentRepo,
		ApprovalRepo:                approvalRepo,
		EmployeeRepository:          employeeRepo,
		EmployeeSalaryRepository:    employeeSalaryRepo,
		EmployeeAllowanceRepository: employeeAllowanceRepo,
		EmployeeDeductionRepository: employeeDeductionRepo,
	}
}

// Create opens a new DRAFT payroll for a period. A company can only have one
// payroll per period_month/period_year (enforced by a unique index too).
func (c *PayrollUseCase) Create(ctx context.Context, companyID string, userID string, request *model.CreatePayrollRequest) (*model.PayrollResponse, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	if err := c.Validate.Struct(request); err != nil {
		c.Log.WithError(err).Error("Failed to validate request body")
		return nil, fiber.ErrBadRequest
	}

	if _, err := c.Repo.FindByPeriod(tx, companyID, request.PeriodMonth, request.PeriodYear); err == nil {
		return nil, fiber.NewError(fiber.StatusConflict, "Payroll for this period already exists")
	}

	total, err := c.Repo.CountByCompanyAndYear(tx, companyID, request.PeriodYear)
	if err != nil {
		c.Log.WithError(err).Error("Failed to count payrolls")
		return nil, fiber.ErrInternalServerError
	}

	payrollNumber := fmt.Sprintf("PR-%d%02d-%04d", request.PeriodYear, request.PeriodMonth, total+1)

	item := &entity.Payroll{
		CompanyID:     companyID,
		PayrollNumber: payrollNumber,
		PeriodMonth:   request.PeriodMonth,
		PeriodYear:    request.PeriodYear,
		Status:        model.PayrollStatusDraft,
		CreatedBy:     &userID,
	}

	if err := c.Repo.Create(tx, item); err != nil {
		c.Log.WithError(err).Error("Failed to create payroll")
		return nil, fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Failed to commit transaction")
		return nil, fiber.ErrInternalServerError
	}

	return model.PayrollToResponse(item), nil
}

func (c *PayrollUseCase) List(ctx context.Context, request *model.SearchPayrollRequest) ([]model.PayrollResponse, int64, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	if err := c.Validate.Struct(request); err != nil {
		c.Log.WithError(err).Error("Failed to validate search query")
		return nil, 0, fiber.ErrBadRequest
	}

	items, total, err := c.Repo.List(tx, request)
	if err != nil {
		c.Log.WithError(err).Error("Failed to list payrolls")
		return nil, 0, fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Failed to commit transaction")
		return nil, 0, fiber.ErrInternalServerError
	}

	return model.PayrollsToResponse(items), total, nil
}

func (c *PayrollUseCase) Detail(ctx context.Context, id string, companyID string) (*model.PayrollResponse, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	item, err := c.findOwned(tx, id, companyID, true)
	if err != nil {
		return nil, err
	}

	response := model.PayrollToResponse(item)
	response.Details = model.PayrollDetailsToResponse(item.Details)
	c.attachEmployeeSummaries(tx, response.Details)

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Failed to commit transaction")
		return nil, fiber.ErrInternalServerError
	}

	return response, nil
}

func (c *PayrollUseCase) DetailByDetailID(ctx context.Context, detailID string) (*model.PayrollDetailResponse, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	item, err := c.DetailRepo.FindByID(tx, detailID, true)
	if err != nil {
		c.Log.WithError(err).Error("Payroll detail not found")
		return nil, fiber.ErrNotFound
	}

	response := model.PayrollDetailToResponse(item)
	c.attachEmployeeSummaries(tx, []model.PayrollDetailResponse{*response})

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Failed to commit transaction")
		return nil, fiber.ErrInternalServerError
	}

	return response, nil
}

func (c *PayrollUseCase) CurrentByEmployee(ctx context.Context, employeeID string) ([]model.PayrollDetailResponse, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	items, err := c.DetailRepo.ListByEmployee(tx, employeeID)
	if err != nil {
		c.Log.WithError(err).Error("Failed to find employee payroll details")
		return nil, fiber.ErrNotFound
	}

	responses := model.PayrollDetailsToResponse(items)
	if len(responses) == 0 {
		return nil, fiber.ErrNotFound
	}
	c.attachEmployeeSummaries(tx, responses)

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Failed to commit transaction")
		return nil, fiber.ErrInternalServerError
	}

	return responses, nil
}

// Calculate generates payroll_details and payroll_items for every active employee
// of the company, snapshotting their basic salary plus active allowances/deductions
// in effect for the payroll period. It can only run once per payroll (from DRAFT);
// once CALCULATED, adjustments are the only supported edits so totals stay traceable.
func (c *PayrollUseCase) Calculate(ctx context.Context, id string, companyID string) (*model.PayrollResponse, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	payroll, err := c.findOwned(tx, id, companyID, false)
	if err != nil {
		return nil, err
	}

	if payroll.Status != model.PayrollStatusDraft {
		return nil, fiber.NewError(fiber.StatusBadRequest, "Only a DRAFT payroll can be calculated")
	}

	employees, err := c.EmployeeRepository.ListActiveByCompany(tx, companyID)
	if err != nil {
		c.Log.WithError(err).Error("Failed to list active employees")
		return nil, fiber.ErrInternalServerError
	}

	asOf := endOfMonth(payroll.PeriodYear, payroll.PeriodMonth)

	var totalGross, totalDeduction, totalNet float64

	for _, employee := range employees {
		salary, err := c.EmployeeSalaryRepository.FindActiveByEmployee(tx, employee.ID, asOf)
		if err != nil {
			c.Log.WithField("employee_id", employee.ID).Warn("Skipping employee without an active basic salary for this period")
			continue
		}

		detail := &entity.PayrollDetail{
			PayrollID:   payroll.ID,
			EmployeeID:  employee.ID,
			BasicSalary: salary.BasicSalary,
		}
		if err := c.DetailRepo.Create(tx, detail); err != nil {
			c.Log.WithError(err).Error("Failed to create payroll detail")
			return nil, fiber.ErrInternalServerError
		}

		grossSalary := salary.BasicSalary
		if err := c.ItemRepo.Create(tx, &entity.PayrollItem{
			PayrollDetailID: detail.ID,
			Name:            "Basic Salary",
			Type:            model.SalaryComponentTypeEarning,
			Amount:          salary.BasicSalary,
		}); err != nil {
			c.Log.WithError(err).Error("Failed to create basic salary payroll item")
			return nil, fiber.ErrInternalServerError
		}

		allowances, err := c.EmployeeAllowanceRepository.FindActiveByEmployee(tx, employee.ID, asOf)
		if err != nil {
			c.Log.WithError(err).Error("Failed to load employee allowances")
			return nil, fiber.ErrInternalServerError
		}
		for _, allowance := range allowances {
			amount, calcValue := resolveComponentAmount(allowance.Amount, allowance.Percentage, salary.BasicSalary)
			grossSalary += amount

			componentID := allowance.SalaryComponentID
			if err := c.ItemRepo.Create(tx, &entity.PayrollItem{
				PayrollDetailID:   detail.ID,
				SalaryComponentID: &componentID,
				Name:              allowance.SalaryComponent.Name,
				Type:              model.SalaryComponentTypeEarning,
				Amount:            amount,
				CalculationValue:  calcValue,
			}); err != nil {
				c.Log.WithError(err).Error("Failed to create allowance payroll item")
				return nil, fiber.ErrInternalServerError
			}
		}

		var totalDeductionForEmployee float64
		deductions, err := c.EmployeeDeductionRepository.FindActiveByEmployee(tx, employee.ID, asOf)
		if err != nil {
			c.Log.WithError(err).Error("Failed to load employee deductions")
			return nil, fiber.ErrInternalServerError
		}
		for _, deduction := range deductions {
			amount, calcValue := resolveComponentAmount(deduction.Amount, deduction.Percentage, salary.BasicSalary)
			totalDeductionForEmployee += amount

			componentID := deduction.SalaryComponentID
			if err := c.ItemRepo.Create(tx, &entity.PayrollItem{
				PayrollDetailID:   detail.ID,
				SalaryComponentID: &componentID,
				Name:              deduction.SalaryComponent.Name,
				Type:              model.SalaryComponentTypeDeduction,
				Amount:            amount,
				CalculationValue:  calcValue,
			}); err != nil {
				c.Log.WithError(err).Error("Failed to create deduction payroll item")
				return nil, fiber.ErrInternalServerError
			}
		}

		detail.GrossSalary = grossSalary
		detail.TotalEarning = grossSalary
		detail.TotalDeduction = totalDeductionForEmployee
		detail.NetSalary = grossSalary - totalDeductionForEmployee

		if err := c.DetailRepo.Update(tx, detail); err != nil {
			c.Log.WithError(err).Error("Failed to update payroll detail totals")
			return nil, fiber.ErrInternalServerError
		}

		totalGross += detail.GrossSalary
		totalDeduction += detail.TotalDeduction
		totalNet += detail.NetSalary
	}

	payroll.TotalGross = totalGross
	payroll.TotalDeduction = totalDeduction
	payroll.TotalNet = totalNet
	payroll.Status = model.PayrollStatusCalculated

	if err := c.Repo.Update(tx, payroll); err != nil {
		c.Log.WithError(err).Error("Failed to update payroll totals")
		return nil, fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Failed to commit transaction")
		return nil, fiber.ErrInternalServerError
	}

	return c.Detail(ctx, id, companyID)
}

func (c *PayrollUseCase) Submit(ctx context.Context, id string, companyID string) (*model.PayrollResponse, error) {
	return c.transition(ctx, id, companyID, []string{model.PayrollStatusCalculated}, model.PayrollStatusSubmitted, nil)
}

func (c *PayrollUseCase) Cancel(ctx context.Context, id string, companyID string) (*model.PayrollResponse, error) {
	return c.transition(ctx, id, companyID, []string{
		model.PayrollStatusDraft, model.PayrollStatusCalculated, model.PayrollStatusSubmitted,
	}, model.PayrollStatusCancelled, nil)
}

// Approve records an APPROVED decision and moves the payroll to APPROVED, ready for payment.
func (c *PayrollUseCase) Approve(ctx context.Context, id string, companyID string, approverID string) (*model.PayrollResponse, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	payroll, err := c.findOwned(tx, id, companyID, false)
	if err != nil {
		return nil, err
	}
	if payroll.Status != model.PayrollStatusSubmitted {
		return nil, fiber.NewError(fiber.StatusBadRequest, "Only a SUBMITTED payroll can be approved")
	}

	level, err := c.ApprovalRepo.CountByPayroll(tx, payroll.ID)
	if err != nil {
		c.Log.WithError(err).Error("Failed to count payroll approvals")
		return nil, fiber.ErrInternalServerError
	}

	now := time.Now().UnixMilli()
	if err := c.ApprovalRepo.Create(tx, &entity.PayrollApproval{
		PayrollID:  payroll.ID,
		ApproverID: approverID,
		Level:      int(level) + 1,
		Status:     model.ApprovalStatusApproved,
		ApprovedAt: &now,
	}); err != nil {
		c.Log.WithError(err).Error("Failed to create payroll approval")
		return nil, fiber.ErrInternalServerError
	}

	payroll.Status = model.PayrollStatusApproved
	payroll.ApprovedBy = &approverID
	payroll.ApprovedAt = &now

	if err := c.Repo.Update(tx, payroll); err != nil {
		c.Log.WithError(err).Error("Failed to update payroll")
		return nil, fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Failed to commit transaction")
		return nil, fiber.ErrInternalServerError
	}

	return model.PayrollToResponse(payroll), nil
}

// Reject records a REJECTED decision and sends the payroll back to CALCULATED for correction.
func (c *PayrollUseCase) Reject(ctx context.Context, id string, companyID string, approverID string, request *model.RejectPayrollRequest) (*model.PayrollResponse, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	if err := c.Validate.Struct(request); err != nil {
		c.Log.WithError(err).Error("Failed to validate request body")
		return nil, fiber.ErrBadRequest
	}

	payroll, err := c.findOwned(tx, id, companyID, false)
	if err != nil {
		return nil, err
	}
	if payroll.Status != model.PayrollStatusSubmitted {
		return nil, fiber.NewError(fiber.StatusBadRequest, "Only a SUBMITTED payroll can be rejected")
	}

	level, err := c.ApprovalRepo.CountByPayroll(tx, payroll.ID)
	if err != nil {
		c.Log.WithError(err).Error("Failed to count payroll approvals")
		return nil, fiber.ErrInternalServerError
	}

	now := time.Now().UnixMilli()
	if err := c.ApprovalRepo.Create(tx, &entity.PayrollApproval{
		PayrollID:  payroll.ID,
		ApproverID: approverID,
		Level:      int(level) + 1,
		Status:     model.ApprovalStatusRejected,
		Notes:      &request.Notes,
		ApprovedAt: &now,
	}); err != nil {
		c.Log.WithError(err).Error("Failed to create payroll approval")
		return nil, fiber.ErrInternalServerError
	}

	payroll.Status = model.PayrollStatusCalculated

	if err := c.Repo.Update(tx, payroll); err != nil {
		c.Log.WithError(err).Error("Failed to update payroll")
		return nil, fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Failed to commit transaction")
		return nil, fiber.ErrInternalServerError
	}

	return model.PayrollToResponse(payroll), nil
}

// Pay generates one PENDING PayrollPayment per payroll detail (using the employee's
// registered bank account) and moves the payroll to PAID. Actual bank disbursement
// status is then tracked and updated separately through the payments endpoints.
func (c *PayrollUseCase) Pay(ctx context.Context, id string, companyID string) (*model.PayrollResponse, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	payroll, err := c.findOwned(tx, id, companyID, false)
	if err != nil {
		return nil, err
	}
	if payroll.Status != model.PayrollStatusApproved {
		return nil, fiber.NewError(fiber.StatusBadRequest, "Only an APPROVED payroll can be paid")
	}

	details, err := c.DetailRepo.ListByPayroll(tx, payroll.ID)
	if err != nil {
		c.Log.WithError(err).Error("Failed to list payroll details")
		return nil, fiber.ErrInternalServerError
	}

	for _, detail := range details {
		var employee struct {
			BankName    string
			BankAccount string
			Fullname    string
		}
		if err := tx.Table("employees").
			Select("bank_name, bank_account, fullname").
			Where("id = ?", detail.EmployeeID).
			Take(&employee).Error; err != nil {
			c.Log.WithError(err).Error("Failed to load employee bank info")
			return nil, fiber.ErrInternalServerError
		}

		payment := &entity.PayrollPayment{
			PayrollDetailID: detail.ID,
			EmployeeID:      detail.EmployeeID,
			Amount:          detail.NetSalary,
			Status:          model.PaymentStatusPending,
		}
		if employee.BankName != "" {
			payment.BankName = &employee.BankName
		}
		if employee.BankAccount != "" {
			payment.BankAccount = &employee.BankAccount
		}
		if employee.Fullname != "" {
			payment.AccountName = &employee.Fullname
		}

		if err := c.PaymentRepo.Create(tx, payment); err != nil {
			c.Log.WithError(err).Error("Failed to create payroll payment")
			return nil, fiber.ErrInternalServerError
		}
	}

	now := time.Now().UnixMilli()
	payroll.PaymentDate = &now
	payroll.Status = model.PayrollStatusPaid

	if err := c.Repo.Update(tx, payroll); err != nil {
		c.Log.WithError(err).Error("Failed to update payroll")
		return nil, fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Failed to commit transaction")
		return nil, fiber.ErrInternalServerError
	}

	return model.PayrollToResponse(payroll), nil
}

func (c *PayrollUseCase) Delete(ctx context.Context, id string, companyID string) error {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	payroll, err := c.findOwned(tx, id, companyID, false)
	if err != nil {
		return err
	}
	if payroll.Status != model.PayrollStatusDraft {
		return fiber.NewError(fiber.StatusBadRequest, "Only a DRAFT payroll can be deleted")
	}

	if err := c.Repo.Delete(tx, payroll); err != nil {
		c.Log.WithError(err).Error("Failed to delete payroll")
		return fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Failed to commit transaction")
		return fiber.ErrInternalServerError
	}

	return nil
}

func (c *PayrollUseCase) ListApprovals(ctx context.Context, id string, companyID string) ([]model.PayrollApprovalResponse, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	if _, err := c.findOwned(tx, id, companyID, false); err != nil {
		return nil, err
	}

	items, err := c.ApprovalRepo.ListByPayroll(tx, id)
	if err != nil {
		c.Log.WithError(err).Error("Failed to list payroll approvals")
		return nil, fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Failed to commit transaction")
		return nil, fiber.ErrInternalServerError
	}

	return model.PayrollApprovalsToResponse(items), nil
}

// ─── Payroll Adjustments (Bonus / THR / Correction) ─────────────────────────

func (c *PayrollUseCase) ListAdjustments(ctx context.Context, payrollDetailID string) ([]model.PayrollAdjustmentResponse, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	items, err := c.AdjustmentRepo.ListByPayrollDetail(tx, payrollDetailID)
	if err != nil {
		c.Log.WithError(err).Error("Failed to list payroll adjustments")
		return nil, fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Failed to commit transaction")
		return nil, fiber.ErrInternalServerError
	}

	return model.PayrollAdjustmentsToResponse(items), nil
}

// CreateAdjustment adds a bonus/THR/correction to a payroll detail and immediately
// re-derives that detail's and the parent payroll's totals from their line items,
// keeping totals a reconstruction rather than a separately-maintained value.
func (c *PayrollUseCase) CreateAdjustment(ctx context.Context, payrollDetailID string, request *model.CreatePayrollAdjustmentRequest) (*model.PayrollAdjustmentResponse, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	if err := c.Validate.Struct(request); err != nil {
		c.Log.WithError(err).Error("Failed to validate request body")
		return nil, fiber.ErrBadRequest
	}

	detail, err := c.DetailRepo.FindByID(tx, payrollDetailID, false)
	if err != nil {
		c.Log.WithError(err).Error("Payroll detail not found")
		return nil, fiber.ErrNotFound
	}

	if err := c.assertEditable(tx, detail.PayrollID); err != nil {
		return nil, err
	}

	item := &entity.PayrollAdjustment{
		PayrollDetailID: payrollDetailID,
		Type:            request.Type,
		Name:            request.Name,
		Amount:          request.Amount,
		Description:     request.Description,
	}

	if err := c.AdjustmentRepo.Create(tx, item); err != nil {
		c.Log.WithError(err).Error("Failed to create payroll adjustment")
		return nil, fiber.ErrInternalServerError
	}

	if err := c.recalculateDetail(tx, detail); err != nil {
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Failed to commit transaction")
		return nil, fiber.ErrInternalServerError
	}

	return model.PayrollAdjustmentToResponse(item), nil
}

func (c *PayrollUseCase) DeleteAdjustment(ctx context.Context, adjustmentID string) error {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	adjustment, err := c.AdjustmentRepo.FindByID(tx, adjustmentID)
	if err != nil {
		c.Log.WithError(err).Error("Payroll adjustment not found")
		return fiber.ErrNotFound
	}

	detail, err := c.DetailRepo.FindByID(tx, adjustment.PayrollDetailID, false)
	if err != nil {
		c.Log.WithError(err).Error("Payroll detail not found")
		return fiber.ErrNotFound
	}

	if err := c.assertEditable(tx, detail.PayrollID); err != nil {
		return err
	}

	if err := c.AdjustmentRepo.Delete(tx, adjustment); err != nil {
		c.Log.WithError(err).Error("Failed to delete payroll adjustment")
		return fiber.ErrInternalServerError
	}

	if err := c.recalculateDetail(tx, detail); err != nil {
		return err
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Failed to commit transaction")
		return fiber.ErrInternalServerError
	}

	return nil
}

// ─── helpers ─────────────────────────────────────────────────────────────

func (c *PayrollUseCase) findOwned(tx *gorm.DB, id string, companyID string, withDetails bool) (*entity.Payroll, error) {
	item, err := c.Repo.FindByID(tx, id, withDetails)
	if err != nil || item.CompanyID != companyID {
		c.Log.WithError(err).Error("Payroll not found")
		return nil, fiber.ErrNotFound
	}
	return item, nil
}

// assertEditable ensures adjustments can only be added while a payroll is still
// DRAFT or CALCULATED — once submitted for approval its figures should be stable.
func (c *PayrollUseCase) assertEditable(tx *gorm.DB, payrollID string) error {
	payroll, err := c.Repo.FindByID(tx, payrollID, false)
	if err != nil {
		return fiber.ErrNotFound
	}
	if payroll.Status != model.PayrollStatusDraft && payroll.Status != model.PayrollStatusCalculated {
		return fiber.NewError(fiber.StatusBadRequest, "Payroll adjustments can only be changed while the payroll is DRAFT or CALCULATED")
	}
	return nil
}

func (c *PayrollUseCase) recalculateDetail(tx *gorm.DB, detail *entity.PayrollDetail) error {
	adjustmentSum, err := c.AdjustmentRepo.SumByPayrollDetail(tx, detail.ID)
	if err != nil {
		c.Log.WithError(err).Error("Failed to sum payroll adjustments")
		return fiber.ErrInternalServerError
	}

	detail.TotalEarning = detail.GrossSalary + adjustmentSum
	detail.NetSalary = detail.TotalEarning - detail.TotalDeduction

	if err := c.DetailRepo.Update(tx, detail); err != nil {
		c.Log.WithError(err).Error("Failed to update payroll detail totals")
		return fiber.ErrInternalServerError
	}

	return c.recalculatePayrollTotals(tx, detail.PayrollID)
}

func (c *PayrollUseCase) recalculatePayrollTotals(tx *gorm.DB, payrollID string) error {
	details, err := c.DetailRepo.ListByPayroll(tx, payrollID)
	if err != nil {
		c.Log.WithError(err).Error("Failed to list payroll details")
		return fiber.ErrInternalServerError
	}

	payroll, err := c.Repo.FindByID(tx, payrollID, false)
	if err != nil {
		return fiber.ErrNotFound
	}

	var totalGross, totalDeduction, totalNet float64
	for _, detail := range details {
		totalGross += detail.GrossSalary
		totalDeduction += detail.TotalDeduction
		totalNet += detail.NetSalary
	}

	payroll.TotalGross = totalGross
	payroll.TotalDeduction = totalDeduction
	payroll.TotalNet = totalNet

	if err := c.Repo.Update(tx, payroll); err != nil {
		c.Log.WithError(err).Error("Failed to update payroll totals")
		return fiber.ErrInternalServerError
	}

	return nil
}

func (c *PayrollUseCase) transition(ctx context.Context, id string, companyID string, from []string, to string, notes *string) (*model.PayrollResponse, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	payroll, err := c.findOwned(tx, id, companyID, false)
	if err != nil {
		return nil, err
	}

	allowed := false
	for _, status := range from {
		if payroll.Status == status {
			allowed = true
			break
		}
	}
	if !allowed {
		return nil, fiber.NewError(fiber.StatusBadRequest, fmt.Sprintf("Payroll cannot move from %s to %s", payroll.Status, to))
	}

	payroll.Status = to

	if err := c.Repo.Update(tx, payroll); err != nil {
		c.Log.WithError(err).Error("Failed to update payroll status")
		return nil, fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Failed to commit transaction")
		return nil, fiber.ErrInternalServerError
	}

	return model.PayrollToResponse(payroll), nil
}

// attachEmployeeSummaries enriches payroll detail responses with a minimal employee
// snapshot, joined here (rather than via a gorm relation) to keep payroll/entity free
// of a dependency on the employee module.
func (c *PayrollUseCase) attachEmployeeSummaries(tx *gorm.DB, details []model.PayrollDetailResponse) {
	for i := range details {
		var employee struct {
			ID             string
			EmployeeNumber string
			Fullname       string
			BankName       string
			BankAccount    string
		}
		if err := tx.Table("employees").
			Select("id, employee_number, fullname, bank_name, bank_account").
			Where("id = ?", details[i].EmployeeID).
			Take(&employee).Error; err != nil {
			continue
		}
		details[i].Employee = &model.PayrollEmployeeSummary{
			ID:             employee.ID,
			EmployeeNumber: employee.EmployeeNumber,
			Fullname:       employee.Fullname,
			BankName:       employee.BankName,
			BankAccount:    employee.BankAccount,
		}
	}
}

// resolveComponentAmount computes a component's rupiah amount: percentage-based
// components are derived from the basic salary, otherwise the fixed amount is used.
func resolveComponentAmount(amount float64, percentage float64, basicSalary float64) (float64, *float64) {
	if percentage > 0 {
		computed := basicSalary * percentage / 100
		pct := percentage
		return computed, &pct
	}
	return amount, nil
}

func endOfMonth(year int, month int) int64 {
	firstOfNextMonth := time.Date(year, time.Month(month)+1, 1, 0, 0, 0, 0, time.UTC)
	return firstOfNextMonth.Add(-time.Millisecond).UnixMilli()
}
