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
	Detail(ctx context.Context, id string) (*dto.SalaryComponentResponse, error)
	Update(ctx context.Context, id string, req *dto.UpdateSalaryComponentRequest) (*dto.SalaryComponentResponse, error)
	Delete(ctx context.Context, id string) error
}

func (s *salaryComponentService) Detail(ctx context.Context, id string) (*dto.SalaryComponentResponse, error) {
	item, err := s.SalaryComponentRepo.FindByID(s.DB.WithContext(ctx), id)
	if err != nil {
		return nil, fiber.ErrNotFound
	}
	return dto.SalaryComponentToResponse(item), nil
}

func (s *salaryComponentService) Update(ctx context.Context, id string, req *dto.UpdateSalaryComponentRequest) (*dto.SalaryComponentResponse, error) {
	item, err := s.SalaryComponentRepo.FindByID(s.DB.WithContext(ctx), id)
	if err != nil {
		return nil, fiber.ErrNotFound
	}
	if req.Name != nil {
		item.Name = strings.TrimSpace(*req.Name)
	}
	if req.Type != nil {
		item.Type = *req.Type
	}
	if req.CalculationType != nil {
		item.CalculationType = *req.CalculationType
	}
	if req.IsTaxable != nil {
		item.IsTaxable = *req.IsTaxable
	}
	if req.IsBpjsBase != nil {
		item.IsBpjsBase = *req.IsBpjsBase
	}
	if req.IsActive != nil {
		item.IsActive = *req.IsActive
	}
	if err := s.DB.WithContext(ctx).Save(item).Error; err != nil {
		return nil, fiber.ErrInternalServerError
	}
	return dto.SalaryComponentToResponse(item), nil
}

func (s *salaryComponentService) Delete(ctx context.Context, id string) error {
	item, err := s.SalaryComponentRepo.FindByID(s.DB.WithContext(ctx), id)
	if err != nil {
		return fiber.ErrNotFound
	}
	return s.DB.WithContext(ctx).Delete(item).Error
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
