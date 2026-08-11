package usecase

import (
	"context"
	"hrsaas-admin-api/internal/modules/employee/entity"
	"hrsaas-admin-api/internal/modules/employee/model"
	"hrsaas-admin-api/internal/modules/employee/repository"
	pkg "hrsaas-admin-api/pkg/time"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type EmployeeSalaryUseCase struct {
	DB       *gorm.DB
	Log      *logrus.Logger
	Validate *validator.Validate
	Repo     *repository.EmployeeSalaryRepository
}

func NewEmployeeSalaryUseCase(
	db *gorm.DB,
	log *logrus.Logger,
	validate *validator.Validate,
	repo *repository.EmployeeSalaryRepository,
) *EmployeeSalaryUseCase {
	return &EmployeeSalaryUseCase{DB: db, Log: log, Validate: validate, Repo: repo}
}

// Create records a new basic salary effective from a given date. Any previous
// still-open record for the employee is closed the day before, so salary history
// never overlaps and old payslips stay reproducible from their own period.
func (c *EmployeeSalaryUseCase) Create(ctx context.Context, request *model.CreateEmployeeSalaryRequest) (*model.EmployeeSalaryResponse, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	if err := c.Validate.Struct(request); err != nil {
		c.Log.WithError(err).Error("Failed to validate request body")
		return nil, fiber.ErrBadRequest
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

	if err := c.Repo.CloseOpenEndedByEmployee(tx, request.EmployeeID, effectiveDate-1); err != nil {
		c.Log.WithError(err).Error("Failed to close previous employee salary")
		return nil, fiber.ErrInternalServerError
	}

	item := &entity.EmployeeSalary{
		EmployeeID:    request.EmployeeID,
		BasicSalary:   request.BasicSalary,
		EffectiveDate: effectiveDate,
		EndDate:       endDate,
	}

	if err := c.Repo.Create(tx, item); err != nil {
		c.Log.WithError(err).Error("Failed to create employee salary")
		return nil, fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Failed to commit transaction")
		return nil, fiber.ErrInternalServerError
	}

	return model.EmployeeSalaryToResponse(item), nil
}

func (c *EmployeeSalaryUseCase) List(ctx context.Context, request *model.SearchEmployeeSalaryRequest) ([]model.EmployeeSalaryResponse, int64, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	if err := c.Validate.Struct(request); err != nil {
		c.Log.WithError(err).Error("Failed to validate search query")
		return nil, 0, fiber.ErrBadRequest
	}

	items, total, err := c.Repo.List(tx, request, true)
	if err != nil {
		c.Log.WithError(err).Error("Failed to list employee salaries")
		return nil, 0, fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Failed to commit transaction")
		return nil, 0, fiber.ErrInternalServerError
	}

	return model.EmployeeSalariesToResponse(items), total, nil
}

func (c *EmployeeSalaryUseCase) Detail(ctx context.Context, id string) (*model.EmployeeSalaryResponse, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	item, err := c.Repo.FindByID(tx, id, true)
	if err != nil {
		c.Log.WithError(err).Error("Employee salary not found")
		return nil, fiber.ErrNotFound
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Failed to commit transaction")
		return nil, fiber.ErrInternalServerError
	}

	return model.EmployeeSalaryToResponse(item), nil
}

func (c *EmployeeSalaryUseCase) Update(ctx context.Context, id string, request *model.UpdateEmployeeSalaryRequest) (*model.EmployeeSalaryResponse, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	if err := c.Validate.Struct(request); err != nil {
		c.Log.WithError(err).Error("Failed to validate request body")
		return nil, fiber.ErrBadRequest
	}

	item, err := c.Repo.FindByID(tx, id, false)
	if err != nil {
		c.Log.WithError(err).Error("Employee salary not found")
		return nil, fiber.ErrNotFound
	}

	if request.BasicSalary != nil {
		item.BasicSalary = *request.BasicSalary
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
		c.Log.WithError(err).Error("Failed to update employee salary")
		return nil, fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Failed to commit transaction")
		return nil, fiber.ErrInternalServerError
	}

	return model.EmployeeSalaryToResponse(item), nil
}

func (c *EmployeeSalaryUseCase) Delete(ctx context.Context, id string) error {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	item, err := c.Repo.FindByID(tx, id, false)
	if err != nil {
		c.Log.WithError(err).Error("Employee salary not found")
		return fiber.ErrNotFound
	}

	if err := c.Repo.Delete(tx, item); err != nil {
		c.Log.WithError(err).Error("Failed to delete employee salary")
		return fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Failed to commit transaction")
		return fiber.ErrInternalServerError
	}

	return nil
}
