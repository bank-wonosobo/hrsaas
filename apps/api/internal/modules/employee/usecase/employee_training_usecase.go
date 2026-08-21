package usecase

import (
	"context"
	"hrsaas/internal/modules/employee/model"
	"hrsaas/internal/modules/employee/repository"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type EmployeeTrainingUseCase struct {
	DB       *gorm.DB
	Log      *logrus.Logger
	Validate *validator.Validate
	Repo     *repository.EmployeeTrainingRepository
}

func NewEmployeeTrainingUseCase(
	db *gorm.DB,
	log *logrus.Logger,
	validate *validator.Validate,
	repo *repository.EmployeeTrainingRepository,
) *EmployeeTrainingUseCase {
	return &EmployeeTrainingUseCase{DB: db, Log: log, Validate: validate, Repo: repo}
}

func (c *EmployeeTrainingUseCase) List(
	ctx context.Context,
	request *model.SearchEmployeeTrainingRequest,
) ([]model.EmployeeTrainingResponse, int64, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	if err := c.Validate.Struct(request); err != nil {
		c.Log.WithError(err).Error("Failed to validate search query")
		return nil, 0, fiber.ErrBadRequest
	}

	items, total, err := c.Repo.List(tx, request)
	if err != nil {
		c.Log.WithError(err).Error("Failed to list employee trainings")
		return nil, 0, fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Failed to commit transaction")
		return nil, 0, fiber.ErrInternalServerError
	}

	return model.EmployeeTrainingsToResponse(items), total, nil
}
