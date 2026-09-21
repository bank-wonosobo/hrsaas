package repository

import (
	"hrsaas/internal/modules/payroll/entity"
	"hrsaas/pkg/repository"

	"gorm.io/gorm"
)

type PayrollDetailRepository interface {
	Create(
		db *gorm.DB,
		entity *entity.PayrollDetail,
	) error
}

type payrollDetailRepository struct {
	repository.Repository[entity.PayrollDetail]
}

func NewPayrollDetailRepository(db *gorm.DB) PayrollDetailRepository {
	return &payrollDetailRepository{
		Repository: repository.Repository[entity.PayrollDetail]{
			DB: db,
		},
	}
}
