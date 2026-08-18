package usecase

import (
	"context"
	"hrsaas/internal/modules/payroll/entity"
	"hrsaas/internal/modules/payroll/model"
	"hrsaas/internal/modules/payroll/repository"
	"strings"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type SalaryComponentUseCase struct {
	DB       *gorm.DB
	Log      *logrus.Logger
	Validate *validator.Validate
	Repo     *repository.SalaryComponentRepository
}

func NewSalaryComponentUseCase(
	db *gorm.DB,
	log *logrus.Logger,
	validate *validator.Validate,
	repo *repository.SalaryComponentRepository,
) *SalaryComponentUseCase {
	return &SalaryComponentUseCase{DB: db, Log: log, Validate: validate, Repo: repo}
}

func (c *SalaryComponentUseCase) Create(ctx context.Context, request *model.CreateSalaryComponentRequest) (*model.SalaryComponentResponse, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	if err := c.Validate.Struct(request); err != nil {
		c.Log.WithError(err).Error("Failed to validate request body")
		return nil, fiber.ErrBadRequest
	}

	code := strings.ToUpper(strings.TrimSpace(request.Code))

	count, err := c.Repo.CountByCode(tx, code, "")
	if err != nil {
		c.Log.WithError(err).Error("Failed to count salary component by code")
		return nil, fiber.ErrInternalServerError
	}
	if count > 0 {
		return nil, fiber.NewError(fiber.StatusConflict, "Code already in use")
	}

	item := &entity.SalaryComponent{
		Code:            code,
		Name:            strings.TrimSpace(request.Name),
		Type:            request.Type,
		CalculationType: request.CalculationType,
		IsTaxable:       request.IsTaxable,
		IsBpjsBase:      request.IsBpjsBase,
		IsActive:        true,
	}

	if err := c.Repo.Create(tx, item); err != nil {
		c.Log.WithError(err).Error("Failed to create salary component")
		return nil, fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Failed to commit transaction")
		return nil, fiber.ErrInternalServerError
	}

	return model.SalaryComponentToResponse(item), nil
}

func (c *SalaryComponentUseCase) List(ctx context.Context, request *model.SearchSalaryComponentRequest) ([]model.SalaryComponentResponse, int64, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	if err := c.Validate.Struct(request); err != nil {
		c.Log.WithError(err).Error("Failed to validate search query")
		return nil, 0, fiber.ErrBadRequest
	}

	items, total, err := c.Repo.List(tx, request)
	if err != nil {
		c.Log.WithError(err).Error("Failed to list salary components")
		return nil, 0, fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Failed to commit transaction")
		return nil, 0, fiber.ErrInternalServerError
	}

	return model.SalaryComponentsToResponse(items), total, nil
}

func (c *SalaryComponentUseCase) Detail(ctx context.Context, id string) (*model.SalaryComponentResponse, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	item, err := c.Repo.FindByID(tx, id)
	if err != nil {
		c.Log.WithError(err).Error("Salary component not found")
		return nil, fiber.ErrNotFound
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Failed to commit transaction")
		return nil, fiber.ErrInternalServerError
	}

	return model.SalaryComponentToResponse(item), nil
}

func (c *SalaryComponentUseCase) Update(ctx context.Context, id string, request *model.UpdateSalaryComponentRequest) (*model.SalaryComponentResponse, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	if err := c.Validate.Struct(request); err != nil {
		c.Log.WithError(err).Error("Failed to validate request body")
		return nil, fiber.ErrBadRequest
	}

	item, err := c.Repo.FindByID(tx, id)
	if err != nil {
		c.Log.WithError(err).Error("Salary component not found")
		return nil, fiber.ErrNotFound
	}

	if request.Name != nil {
		name := strings.TrimSpace(*request.Name)
		if name == "" {
			return nil, fiber.NewError(fiber.StatusBadRequest, "name cannot be empty")
		}
		item.Name = name
	}
	if request.Type != nil {
		item.Type = *request.Type
	}
	if request.CalculationType != nil {
		item.CalculationType = *request.CalculationType
	}
	if request.IsTaxable != nil {
		item.IsTaxable = *request.IsTaxable
	}
	if request.IsBpjsBase != nil {
		item.IsBpjsBase = *request.IsBpjsBase
	}
	if request.IsActive != nil {
		item.IsActive = *request.IsActive
	}

	if err := c.Repo.Update(tx, item); err != nil {
		c.Log.WithError(err).Error("Failed to update salary component")
		return nil, fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Failed to commit transaction")
		return nil, fiber.ErrInternalServerError
	}

	return model.SalaryComponentToResponse(item), nil
}

func (c *SalaryComponentUseCase) Delete(ctx context.Context, id string) error {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	item, err := c.Repo.FindByID(tx, id)
	if err != nil {
		c.Log.WithError(err).Error("Salary component not found")
		return fiber.ErrNotFound
	}

	if err := c.Repo.Delete(tx, item); err != nil {
		c.Log.WithError(err).Error("Failed to delete salary component")
		if strings.Contains(strings.ToLower(err.Error()), "foreign key") || strings.Contains(err.Error(), "SQLSTATE 23503") {
			return fiber.NewError(fiber.StatusConflict, "Salary component is still used by other records")
		}
		return fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Failed to commit transaction")
		return fiber.ErrInternalServerError
	}

	return nil
}
