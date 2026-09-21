package repository

import (
	"hrsaas/internal/modules/payroll/entity"
	"hrsaas/pkg/repository"

	"gorm.io/gorm"
)

type PayrollItemRepository interface {
	Create(
		db *gorm.DB,
		entity *entity.PayrollItem,
	) error
}

type payrollItemRepository struct {
	repository.Repository[entity.PayrollItem]
}

func NewPayrollItemRepository(db *gorm.DB) PayrollItemRepository {
	return &payrollItemRepository{
		Repository: repository.Repository[entity.PayrollItem]{
			DB: db,
		},
	}
}
