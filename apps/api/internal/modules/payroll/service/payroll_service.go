package service

import (
	"context"
	"fmt"
	employeeRepo "hrsaas/internal/modules/employee/repository"
	"hrsaas/internal/modules/payroll/dto"
	"hrsaas/internal/modules/payroll/entity"
	"hrsaas/internal/modules/payroll/repository"
	oldentity "hrsaas/internal/modules/payroll_old/entity"
	"time"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type PayrollService interface {
	Create(
		ctx context.Context,
		companyID string,
		userID string,
		req *dto.CreatePayrollRequest,
	) (*dto.PayrollResponse, error)

	Calculate(
		ctx context.Context,
		companyID, id string,
	) (*dto.PayrollResponse, error)
	List(ctx context.Context, companyID string, request *dto.SearchPayrollRequest) ([]dto.PayrollResponse, int64, error)
	Detail(ctx context.Context, companyID, id string) (*dto.PayrollResponse, error)
	Delete(ctx context.Context, companyID, id string) error
	ListPayments(ctx context.Context, request *dto.SearchPayrollRequest) ([]dto.PayrollPaymentResponse, int64, error)
	PaymentDetail(ctx context.Context, id string) (*dto.PayrollPaymentResponse, error)
	UpdatePaymentStatus(ctx context.Context, id string, request *dto.UpdatePayrollPaymentStatusRequest) (*dto.PayrollPaymentResponse, error)
}

type payrollService struct {
	DB *gorm.DB

	PayrollRepo         repository.PayrollRepository
	PayrollDetailRepo   repository.PayrollDetailRepository
	PayrollItemRepo     repository.PayrollItemRepository
	SalaryComponentRepo repository.SalaryComponentRepository

	EmployeeRepo          employeeRepo.EmployeeRepository
	EmployeeSalaryRepo    employeeRepo.EmployeeSalaryRepository
	EmployeeAllowanceRepo employeeRepo.EmployeeAllowanceRepository
	EmployeeDeductionRepo employeeRepo.EmployeeDeductionRepository
}

func (s *payrollService) List(ctx context.Context, companyID string, r *dto.SearchPayrollRequest) ([]dto.PayrollResponse, int64, error) {
	q := s.DB.WithContext(ctx).Model(&entity.Payroll{}).Where("company_id = ?", companyID)
	if r.Status != "" {
		q = q.Where("status = ?", r.Status)
	}
	if r.PeriodYear != 0 {
		q = q.Where("period_year = ?", r.PeriodYear)
	}
	var total int64
	if err := q.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	var items []entity.Payroll
	if err := q.Order("created_at DESC").Offset((r.Page - 1) * r.Size).Limit(r.Size).Find(&items).Error; err != nil {
		return nil, 0, err
	}
	result := make([]dto.PayrollResponse, len(items))
	for i := range items {
		result[i] = *dto.PayrollToResponse(&items[i])
	}
	return result, total, nil
}

func (s *payrollService) Detail(ctx context.Context, companyID, id string) (*dto.PayrollResponse, error) {
	var p entity.Payroll
	if err := s.DB.WithContext(ctx).Where("id = ? AND company_id = ?", id, companyID).First(&p).Error; err != nil {
		return nil, fiber.ErrNotFound
	}
	return dto.PayrollToResponse(&p), nil
}

func (s *payrollService) Delete(ctx context.Context, companyID, id string) error {
	var p entity.Payroll
	if err := s.DB.WithContext(ctx).Where("id = ? AND company_id = ?", id, companyID).First(&p).Error; err != nil {
		return fiber.ErrNotFound
	}
	if p.Status != dto.PayrollStatusDraft {
		return fiber.NewError(fiber.StatusBadRequest, "Only a DRAFT payroll can be deleted")
	}
	return s.DB.WithContext(ctx).Delete(&p).Error
}

func (s *payrollService) ListPayments(ctx context.Context, r *dto.SearchPayrollRequest) ([]dto.PayrollPaymentResponse, int64, error) {
	q := s.DB.WithContext(ctx).Model(&oldentity.PayrollPayment{})
	if r.Status != "" {
		q = q.Where("status = ?", r.Status)
	}
	if r.PayrollID != "" {
		q = q.Joins("JOIN payroll_details ON payroll_details.id = payroll_payments.payroll_detail_id").Where("payroll_details.payroll_id = ?", r.PayrollID)
	}
	var total int64
	if err := q.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	var items []oldentity.PayrollPayment
	if err := q.Order("payroll_payments.created_at DESC").Offset((r.Page - 1) * r.Size).Limit(r.Size).Find(&items).Error; err != nil {
		return nil, 0, err
	}
	result := make([]dto.PayrollPaymentResponse, len(items))
	for i := range items {
		result[i] = *dto.PayrollPaymentToResponse(&items[i])
	}
	return result, total, nil
}

func (s *payrollService) PaymentDetail(ctx context.Context, id string) (*dto.PayrollPaymentResponse, error) {
	var p oldentity.PayrollPayment
	if err := s.DB.WithContext(ctx).First(&p, "id = ?", id).Error; err != nil {
		return nil, fiber.ErrNotFound
	}
	return dto.PayrollPaymentToResponse(&p), nil
}

func (s *payrollService) UpdatePaymentStatus(ctx context.Context, id string, r *dto.UpdatePayrollPaymentStatusRequest) (*dto.PayrollPaymentResponse, error) {
	var p oldentity.PayrollPayment
	db := s.DB.WithContext(ctx)
	if err := db.First(&p, "id = ?", id).Error; err != nil {
		return nil, fiber.ErrNotFound
	}
	p.Status = r.Status
	p.PaymentReference = r.PaymentReference
	if r.Status == dto.PaymentStatusSuccess {
		now := time.Now().UnixMilli()
		p.PaidAt = &now
	}
	if err := db.Save(&p).Error; err != nil {
		return nil, err
	}
	return dto.PayrollPaymentToResponse(&p), nil
}

func NewPayrollService(
	db *gorm.DB,

	payrollRepo repository.PayrollRepository,
	payrollDetailRepo repository.PayrollDetailRepository,
	payrollItemRepo repository.PayrollItemRepository,
	salaryComponentRepo repository.SalaryComponentRepository,

	employeeRepository employeeRepo.EmployeeRepository,
	employeeSalaryRepository employeeRepo.EmployeeSalaryRepository,
	employeeAllowanceRepository employeeRepo.EmployeeAllowanceRepository,
	employeeDeductionRepo employeeRepo.EmployeeDeductionRepository,
) PayrollService {
	return &payrollService{
		DB: db,

		PayrollRepo:         payrollRepo,
		PayrollDetailRepo:   payrollDetailRepo,
		PayrollItemRepo:     payrollItemRepo,
		SalaryComponentRepo: salaryComponentRepo,

		EmployeeRepo:          employeeRepository,
		EmployeeSalaryRepo:    employeeSalaryRepository,
		EmployeeAllowanceRepo: employeeAllowanceRepository,
		EmployeeDeductionRepo: employeeDeductionRepo,
	}
}

// Create implements PayrollService.
func (s *payrollService) Create(
	ctx context.Context,
	companyID string,
	userID string,
	req *dto.CreatePayrollRequest,
) (*dto.PayrollResponse, error) {

	// count payroll
	total, err := s.PayrollRepo.CountByCompanyAndYear(s.DB, companyID, req.PeriodYear)

	// payroll number
	payrollNumber := fmt.Sprintf("BW-%d%02d-%04d", req.PeriodYear, req.PeriodMonth, total+1)

	payroll := &entity.Payroll{
		CompanyID:     companyID,
		PayrollNumber: payrollNumber,
		PeriodYear:    req.PeriodYear,
		PeriodMonth:   req.PeriodMonth,
		Status:        dto.PayrollStatusDraft,
		CreatedBy:     &userID,
	}

	err = s.PayrollRepo.Create(s.DB.WithContext(ctx), payroll)
	if err != nil {
		return nil, err
	}

	return dto.PayrollToResponse(payroll), nil
}

// Calculate implements [PayrollService].
func (s *payrollService) Calculate(
	ctx context.Context,
	companyID, id string,
) (*dto.PayrollResponse, error) {

	// find payroll
	payroll := new(entity.Payroll)
	err := s.PayrollRepo.FindById(s.DB.WithContext(ctx), payroll, id)
	if err != nil {
		return nil, err
	}

	// check status must draft
	if payroll.Status != dto.PayrollStatusDraft {
		return nil, fiber.NewError(fiber.StatusBadRequest, "Only a DRAFT payroll can be calculated")
	}

	// get all employee active
	employees, err := s.EmployeeRepo.ListActiveByCompany(s.DB.WithContext(ctx), companyID)
	if err != nil {
		return nil, err
	}

	asOf := endOfMonth(payroll.PeriodYear, payroll.PeriodMonth)

	var totalGross, totalDeduction float64

	if err = s.DB.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		for _, employee := range employees {
			// get salary
			salary, err := s.EmployeeSalaryRepo.FindActiveByEmployee(s.DB.WithContext(ctx), employee.ID, asOf)
			if err != nil {
				continue
			}

			// payroll detail
			payrollDetail := &entity.PayrollDetail{
				EmployeeID:  employee.ID,
				PayrollID:   payroll.ID,
				BasicSalary: salary.BasicSalary,
			}

			if err := s.PayrollDetailRepo.Create(tx, payrollDetail); err != nil {
				return err
			}

			totalGross += salary.BasicSalary

			// create item salary
			if err = s.PayrollItemRepo.Create(tx, &entity.PayrollItem{
				PayrollDetailID: payrollDetail.ID,
				Name:            "Gaji Pokok",
				Type:            dto.SalaryComponentTypeEarning,
				Amount:          salary.BasicSalary,
			}); err != nil {
				return err
			}

			// calculate item payroll for allowance
			allowances, err := s.EmployeeAllowanceRepo.FindActiveByEmployee(tx, employee.ID, asOf)
			if err != nil {
				return err
			}

			var grossAllowance float64
			for _, allowance := range allowances {

				salaryComponentID := allowance.SalaryComponentID

				// find salary component
				salaryComponent, err := s.SalaryComponentRepo.FindByID(tx, salaryComponentID)
				if err != nil {
					return err
				}

				allowanceAmount, calculationValue := calculateComponentAmount(
					salaryComponent.CalculationType, allowance.Amount, allowance.Percentage,
					salary.BasicSalary, salary.BasicSalary+grossAllowance, employee.MaritalStatus,
				)

				grossAllowance += allowanceAmount

				if err = s.PayrollItemRepo.Create(tx, &entity.PayrollItem{
					PayrollDetailID:   payrollDetail.ID,
					SalaryComponentID: &salaryComponentID,
					Name:              salaryComponent.Name,
					Type:              dto.SalaryComponentTypeEarning,
					Amount:            allowanceAmount,
					CalculationValue:  calculationValue,
				}); err != nil {
					return err
				}

			}

			totalGross += grossAllowance

			// create item payroll for deduction
			deductions, err := s.EmployeeDeductionRepo.FindActiveByEmployee(tx, employee.ID, asOf)
			if err != nil {
				return err
			}

			for _, deduction := range deductions {
				salaryComponentID := deduction.SalaryComponentID
				salaryComponent, err := s.SalaryComponentRepo.FindByID(tx, salaryComponentID)
				if err != nil {
					return err
				}

				deductionAmount, calculationValue := calculateComponentAmount(
					salaryComponent.CalculationType, deduction.Amount, deduction.Percentage,
					salary.BasicSalary, salary.BasicSalary+grossAllowance, employee.MaritalStatus,
				)
				totalDeduction += deductionAmount

				if err = s.PayrollItemRepo.Create(tx, &entity.PayrollItem{
					PayrollDetailID:   payrollDetail.ID,
					SalaryComponentID: &salaryComponentID,
					Name:              salaryComponent.Name,
					Type:              dto.SalaryComponentTypeDeduction,
					Amount:            deductionAmount,
					CalculationValue:  calculationValue,
				}); err != nil {
					return err
				}

			}
			payroll.TotalDeduction = totalDeduction
			payroll.TotalGross = totalGross
			payroll.TotalNet = totalGross - totalDeduction

			if err := s.PayrollRepo.Update(tx, payroll); err != nil {
				return err
			}

		}
		return nil
	}); err != nil {
		fmt.Println(err)
		return nil, fiber.ErrInternalServerError
	}

	return dto.PayrollToResponse(payroll), nil
}

func endOfMonth(year int, month int) int64 {
	firstOfNextMonth := time.Date(year, time.Month(month)+1, 1, 0, 0, 0, 0, time.UTC)
	return firstOfNextMonth.Add(-time.Millisecond).UnixMilli()
}

func calculateComponentAmount(calculationType string, amount, percentage, basicSalary, gross float64, maritalStatus string) (float64, *float64) {
	switch calculationType {
	case dto.CalculationTypeSalaryPercentage:
		return basicSalary * percentage / 100, &percentage
	case dto.CalculateTypeGrossPercentage:
		return gross * percentage / 100, &percentage
	case dto.CalculationTypeAttendance:
		attendanceDays := float64(23)
		return amount * attendanceDays, &attendanceDays
	// case dto.CalculateTypeMaritalStatus:
	// 	statusValue := map[string]float64{
	// 		"BK": 0, "K0": 10, "K1": 15, "K2": 20, "K3": 25,
	// 		"TK0": 0, "TK1": 5, "TK2": 10, "TK3": 15,
	// 	}[maritalStatus]
	// 	baseAmount := amount
	// 	if amount == 0 {
	// 		baseAmount = basicSalary
	// 	}
	// 	return baseAmount * statusValue / 100, &statusValue
	default:
		return amount, nil
	}
}
