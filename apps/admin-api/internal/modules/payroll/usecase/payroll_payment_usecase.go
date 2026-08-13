package usecase

import (
	"context"
	"time"

	"hrsaas-admin-api/internal/modules/payroll/model"
	"hrsaas-admin-api/internal/modules/payroll/repository"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type PayrollPaymentUseCase struct {
	DB       *gorm.DB
	Log      *logrus.Logger
	Validate *validator.Validate
	Repo     *repository.PayrollPaymentRepository
}

func NewPayrollPaymentUseCase(
	db *gorm.DB,
	log *logrus.Logger,
	validate *validator.Validate,
	repo *repository.PayrollPaymentRepository,
) *PayrollPaymentUseCase {
	return &PayrollPaymentUseCase{DB: db, Log: log, Validate: validate, Repo: repo}
}

func (c *PayrollPaymentUseCase) List(ctx context.Context, request *model.SearchPayrollPaymentRequest) ([]model.PayrollPaymentResponse, int64, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	if err := c.Validate.Struct(request); err != nil {
		c.Log.WithError(err).Error("Failed to validate search query")
		return nil, 0, fiber.ErrBadRequest
	}

	items, total, err := c.Repo.List(tx, request)
	if err != nil {
		c.Log.WithError(err).Error("Failed to list payroll payments")
		return nil, 0, fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Failed to commit transaction")
		return nil, 0, fiber.ErrInternalServerError
	}

	return model.PayrollPaymentsToResponse(items), total, nil
}

func (c *PayrollPaymentUseCase) Detail(ctx context.Context, id string) (*model.PayrollPaymentResponse, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	item, err := c.Repo.FindByID(tx, id)
	if err != nil {
		c.Log.WithError(err).Error("Payroll payment not found")
		return nil, fiber.ErrNotFound
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Failed to commit transaction")
		return nil, fiber.ErrInternalServerError
	}

	return model.PayrollPaymentToResponse(item), nil
}

// UpdateStatus updates a payment's disbursement status, e.g. from a bank
// integration callback (PENDING -> PROCESSING -> SUCCESS/FAILED).
func (c *PayrollPaymentUseCase) UpdateStatus(ctx context.Context, id string, request *model.UpdatePayrollPaymentStatusRequest) (*model.PayrollPaymentResponse, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	if err := c.Validate.Struct(request); err != nil {
		c.Log.WithError(err).Error("Failed to validate request body")
		return nil, fiber.ErrBadRequest
	}

	item, err := c.Repo.FindByID(tx, id)
	if err != nil {
		c.Log.WithError(err).Error("Payroll payment not found")
		return nil, fiber.ErrNotFound
	}

	item.Status = request.Status
	if request.PaymentReference != nil {
		item.PaymentReference = request.PaymentReference
	}
	if request.Status == model.PaymentStatusSuccess {
		now := time.Now().UnixMilli()
		item.PaidAt = &now
	}

	if err := c.Repo.Update(tx, item); err != nil {
		c.Log.WithError(err).Error("Failed to update payroll payment")
		return nil, fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Failed to commit transaction")
		return nil, fiber.ErrInternalServerError
	}

	return model.PayrollPaymentToResponse(item), nil
}
