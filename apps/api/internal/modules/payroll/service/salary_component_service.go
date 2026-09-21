package service

import (
	"context"
	"hrsaas/internal/modules/payroll/dto"
	"hrsaas/internal/modules/payroll/entity"
	"hrsaas/internal/modules/payroll/repository"
	"strings"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type SalaryComponentService interface {
	Create(
		ctx context.Context,
		req *dto.CreateSalaryComponentRequest,
	) (*dto.SalaryComponentResponse, error)
	List(
		ctx context.Context,
		request *dto.SearchSalaryComponentRequest,
	) ([]dto.SalaryComponentResponse, int64, error)
}

func (s *salaryComponentService) List(ctx context.Context, request *dto.SearchSalaryComponentRequest) ([]dto.SalaryComponentResponse, int64, error) {
	items, total, err := s.SalaryComponentRepo.List(s.DB.WithContext(ctx), request)
	if err != nil {
		return nil, 0, fiber.ErrInternalServerError
	}
	return dto.SalaryComponentsToResponse(items), total, nil
}

type salaryComponentService struct {
	DB *gorm.DB

	SalaryComponentRepo *repository.SalaryComponentRepository
}

func NewSalaryComponentService(
	db *gorm.DB,

	salaryComponentRepo *repository.SalaryComponentRepository,
) SalaryComponentService {
	return &salaryComponentService{
		DB:                  db,
		SalaryComponentRepo: salaryComponentRepo,
	}
}

// Create implements SalaryComponentService.
func (s *salaryComponentService) Create(ctx context.Context, req *dto.CreateSalaryComponentRequest) (*dto.SalaryComponentResponse, error) {

	code := strings.ToUpper(strings.TrimSpace(req.Code))

	// validate existing item
	count, err := s.SalaryComponentRepo.CountByCode(s.DB.WithContext(ctx), code, "")
	if err != nil {
		return nil, fiber.ErrInternalServerError
	}
	if count > 0 {
		return nil, fiber.NewError(fiber.StatusConflict, "Code already in use")
	}

	salaryComponent := &entity.SalaryComponent{
		Code:            code,
		Name:            strings.TrimSpace(req.Name),
		Type:            req.Type,
		CalculationType: req.CalculationType,
		IsTaxable:       req.IsTaxable,
		IsBpjsBase:      req.IsBpjsBase,
		IsActive:        true,
	}

	if err = s.SalaryComponentRepo.Create(
		s.DB.WithContext(ctx),
		salaryComponent,
	); err != nil {
		return nil, fiber.ErrInternalServerError
	}

	return dto.SalaryComponentToResponse(salaryComponent), nil
}
