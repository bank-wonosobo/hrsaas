package usecase

import (
	"context"
	"hrsaas/internal/modules/employee/entity"
	"hrsaas/internal/modules/employee/model"
	"hrsaas/internal/modules/employee/repository"
	payrollModel "hrsaas/internal/modules/payroll/model"
	payrollRepository "hrsaas/internal/modules/payroll/repository"
	pkg "hrsaas/pkg/time"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type EmployeeAllowanceUseCase struct {
	DB                        *gorm.DB
	Log                       *logrus.Logger
	Validate                  *validator.Validate
	Repo                      *repository.EmployeeAllowanceRepository
	SalaryComponentRepository *payrollRepository.SalaryComponentRepository
}

func NewEmployeeAllowanceUseCase(
	db *gorm.DB,
	log *logrus.Logger,
	validate *validator.Validate,
	repo *repository.EmployeeAllowanceRepository,
	salaryComponentRepository *payrollRepository.SalaryComponentRepository,
) *EmployeeAllowanceUseCase {
	return &EmployeeAllowanceUseCase{
		DB:                        db,
		Log:                       log,
		Validate:                  validate,
		Repo:                      repo,
		SalaryComponentRepository: salaryComponentRepository,
	}
}

func (c *EmployeeAllowanceUseCase) Create(ctx context.Context, request *model.CreateEmployeeAllowanceRequest) (*model.EmployeeAllowanceResponse, error) {
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
	if component.Type != payrollModel.SalaryComponentTypeEarning {
		return nil, fiber.NewError(fiber.StatusBadRequest, "salary_component_id harus bertipe EARNING")
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

	item := &entity.EmployeeAllowance{
		EmployeeID:        request.EmployeeID,
		SalaryComponentID: request.SalaryComponentID,
		Amount:            request.Amount,
		Percentage:        request.Percentage,
		EffectiveDate:     effectiveDate,
		EndDate:           endDate,
	}

	if err := c.Repo.Create(tx, item); err != nil {
		c.Log.WithError(err).Error("Failed to create employee allowance")
		return nil, fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Failed to commit transaction")
		return nil, fiber.ErrInternalServerError
	}

	return model.EmployeeAllowanceToResponse(item), nil
}

func (c *EmployeeAllowanceUseCase) List(ctx context.Context, request *model.SearchEmployeeAllowanceRequest) ([]model.EmployeeAllowanceResponse, int64, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	if err := c.Validate.Struct(request); err != nil {
		c.Log.WithError(err).Error("Failed to validate search query")
		return nil, 0, fiber.ErrBadRequest
	}

	items, total, err := c.Repo.List(tx, request, true)
	if err != nil {
		c.Log.WithError(err).Error("Failed to list employee allowances")
		return nil, 0, fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Failed to commit transaction")
		return nil, 0, fiber.ErrInternalServerError
	}

	return model.EmployeeAllowancesToResponse(items), total, nil
}

func (c *EmployeeAllowanceUseCase) Detail(ctx context.Context, id string) (*model.EmployeeAllowanceResponse, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	item, err := c.Repo.FindByID(tx, id, true)
	if err != nil {
		c.Log.WithError(err).Error("Employee allowance not found")
		return nil, fiber.ErrNotFound
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Failed to commit transaction")
		return nil, fiber.ErrInternalServerError
	}

	return model.EmployeeAllowanceToResponse(item), nil
}

func (c *EmployeeAllowanceUseCase) Update(ctx context.Context, id string, request *model.UpdateEmployeeAllowanceRequest) (*model.EmployeeAllowanceResponse, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	if err := c.Validate.Struct(request); err != nil {
		c.Log.WithError(err).Error("Failed to validate request body")
		return nil, fiber.ErrBadRequest
	}

	item, err := c.Repo.FindByID(tx, id, false)
	if err != nil {
		c.Log.WithError(err).Error("Employee allowance not found")
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
		c.Log.WithError(err).Error("Failed to update employee allowance")
		return nil, fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Failed to commit transaction")
		return nil, fiber.ErrInternalServerError
	}

	return model.EmployeeAllowanceToResponse(item), nil
}

func (c *EmployeeAllowanceUseCase) Delete(ctx context.Context, id string) error {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	item, err := c.Repo.FindByID(tx, id, false)
	if err != nil {
		c.Log.WithError(err).Error("Employee allowance not found")
		return fiber.ErrNotFound
	}

	if err := c.Repo.Delete(tx, item); err != nil {
		c.Log.WithError(err).Error("Failed to delete employee allowance")
		return fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Failed to commit transaction")
		return fiber.ErrInternalServerError
	}

	return nil
}
