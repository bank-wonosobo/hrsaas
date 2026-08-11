package usecase

import (
	"context"
	"hrsaas-admin-api/internal/modules/employee/entity"
	"hrsaas-admin-api/internal/modules/employee/model"
	"hrsaas-admin-api/internal/modules/employee/repository"
	payrollModel "hrsaas-admin-api/internal/modules/payroll/model"
	payrollRepository "hrsaas-admin-api/internal/modules/payroll/repository"
	pkg "hrsaas-admin-api/pkg/time"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type EmployeeDeductionUseCase struct {
	DB                        *gorm.DB
	Log                       *logrus.Logger
	Validate                  *validator.Validate
	Repo                      *repository.EmployeeDeductionRepository
	SalaryComponentRepository *payrollRepository.SalaryComponentRepository
}

func NewEmployeeDeductionUseCase(
	db *gorm.DB,
	log *logrus.Logger,
	validate *validator.Validate,
	repo *repository.EmployeeDeductionRepository,
	salaryComponentRepository *payrollRepository.SalaryComponentRepository,
) *EmployeeDeductionUseCase {
	return &EmployeeDeductionUseCase{
		DB:                        db,
		Log:                       log,
		Validate:                  validate,
		Repo:                      repo,
		SalaryComponentRepository: salaryComponentRepository,
	}
}

func (c *EmployeeDeductionUseCase) Create(ctx context.Context, request *model.CreateEmployeeDeductionRequest) (*model.EmployeeDeductionResponse, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	if err := c.Validate.Struct(request); err != nil {
		c.Log.WithError(err).Error("Failed to validate request body")
		return nil, fiber.ErrBadRequest
	}

	component, err := c.SalaryComponentRepository.FindByID(tx, request.SalaryComponentID)
	if err != nil {
		return nil, fiber.NewError(fiber.StatusBadRequest, "salary_component_id tidak ditemukan")
	}
	if component.Type != payrollModel.SalaryComponentTypeDeduction {
		return nil, fiber.NewError(fiber.StatusBadRequest, "salary_component_id harus bertipe DEDUCTION")
	}

	effectiveDate, err := pkg.ParseDateToUnixMilli(request.EffectiveDate)
	if err != nil {
		return nil, fiber.NewError(fiber.StatusBadRequest, "effective_date tidak valid")
	}

	var endDate *int64
	if request.EndDate != nil && *request.EndDate != "" {
		parsed, err := pkg.ParseDateToUnixMilli(*request.EndDate)
		if err != nil {
			return nil, fiber.NewError(fiber.StatusBadRequest, "end_date tidak valid")
		}
		endDate = &parsed
	}

	item := &entity.EmployeeDeduction{
		EmployeeID:        request.EmployeeID,
		SalaryComponentID: request.SalaryComponentID,
		Amount:            request.Amount,
		Percentage:        request.Percentage,
		EffectiveDate:     effectiveDate,
		EndDate:           endDate,
	}

	if err := c.Repo.Create(tx, item); err != nil {
		c.Log.WithError(err).Error("Failed to create employee deduction")
		return nil, fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Failed to commit transaction")
		return nil, fiber.ErrInternalServerError
	}

	return model.EmployeeDeductionToResponse(item), nil
}

func (c *EmployeeDeductionUseCase) List(ctx context.Context, request *model.SearchEmployeeDeductionRequest) ([]model.EmployeeDeductionResponse, int64, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	if err := c.Validate.Struct(request); err != nil {
		c.Log.WithError(err).Error("Failed to validate search query")
		return nil, 0, fiber.ErrBadRequest
	}

	items, total, err := c.Repo.List(tx, request, true)
	if err != nil {
		c.Log.WithError(err).Error("Failed to list employee deductions")
		return nil, 0, fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Failed to commit transaction")
		return nil, 0, fiber.ErrInternalServerError
	}

	return model.EmployeeDeductionsToResponse(items), total, nil
}

func (c *EmployeeDeductionUseCase) Detail(ctx context.Context, id string) (*model.EmployeeDeductionResponse, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	item, err := c.Repo.FindByID(tx, id, true)
	if err != nil {
		c.Log.WithError(err).Error("Employee deduction not found")
		return nil, fiber.ErrNotFound
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Failed to commit transaction")
		return nil, fiber.ErrInternalServerError
	}

	return model.EmployeeDeductionToResponse(item), nil
}

func (c *EmployeeDeductionUseCase) Update(ctx context.Context, id string, request *model.UpdateEmployeeDeductionRequest) (*model.EmployeeDeductionResponse, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	if err := c.Validate.Struct(request); err != nil {
		c.Log.WithError(err).Error("Failed to validate request body")
		return nil, fiber.ErrBadRequest
	}

	item, err := c.Repo.FindByID(tx, id, false)
	if err != nil {
		c.Log.WithError(err).Error("Employee deduction not found")
		return nil, fiber.ErrNotFound
	}

	if request.Amount != nil {
		item.Amount = *request.Amount
	}
	if request.Percentage != nil {
		item.Percentage = *request.Percentage
	}
	if request.EffectiveDate != nil {
		effectiveDate, err := pkg.ParseDateToUnixMilli(*request.EffectiveDate)
		if err != nil {
			return nil, fiber.NewError(fiber.StatusBadRequest, "effective_date tidak valid")
		}
		item.EffectiveDate = effectiveDate
	}
	if request.EndDate != nil {
		if *request.EndDate == "" {
			item.EndDate = nil
		} else {
			endDate, err := pkg.ParseDateToUnixMilli(*request.EndDate)
			if err != nil {
				return nil, fiber.NewError(fiber.StatusBadRequest, "end_date tidak valid")
			}
			item.EndDate = &endDate
		}
	}

	if item.EndDate != nil && item.EffectiveDate > *item.EndDate {
		return nil, fiber.NewError(fiber.StatusBadRequest, "effective_date tidak boleh lebih besar dari end_date")
	}

	if err := c.Repo.Update(tx, item); err != nil {
		c.Log.WithError(err).Error("Failed to update employee deduction")
		return nil, fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Failed to commit transaction")
		return nil, fiber.ErrInternalServerError
	}

	return model.EmployeeDeductionToResponse(item), nil
}

func (c *EmployeeDeductionUseCase) Delete(ctx context.Context, id string) error {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	item, err := c.Repo.FindByID(tx, id, false)
	if err != nil {
		c.Log.WithError(err).Error("Employee deduction not found")
		return fiber.ErrNotFound
	}

	if err := c.Repo.Delete(tx, item); err != nil {
		c.Log.WithError(err).Error("Failed to delete employee deduction")
		return fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Failed to commit transaction")
		return fiber.ErrInternalServerError
	}

	return nil
}
