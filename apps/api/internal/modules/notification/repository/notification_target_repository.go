package repository

import (
	"hrsaas/internal/modules/notification/entity"
	"hrsaas/internal/modules/notification/model"
	"hrsaas/pkg/repository"

	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type NotificationTargetRepository struct {
	repository.Repository[entity.NotificationTarget]
	Log *logrus.Logger
}

func NewNotificationTargetRepository(log *logrus.Logger) *NotificationTargetRepository {
	return &NotificationTargetRepository{Log: log}
}

// ResolveUserIDs expands a broadcast target (division/position/office
// location/role/all) into the list of user IDs it reaches. It reads directly
// from the employee/user/role tables instead of depending on those modules'
// repositories, so the notification module stays decoupled from their
// internals — the same reasoning behind reference_type/reference_id on
// notifications itself.
func (r *NotificationTargetRepository) ResolveUserIDs(db *gorm.DB, companyID string, targetType string, targetID *string) ([]string, error) {
	var ids []string

	switch targetType {
	case model.TargetTypeUser:
		if targetID == nil || *targetID == "" {
			return nil, nil
		}
		return []string{*targetID}, nil

	case model.TargetTypeDivision:
		if targetID == nil || *targetID == "" {
			return nil, nil
		}
		err := db.Table("employees AS e").
			Joins("JOIN employee_contracts AS ec ON ec.employee_id = e.id AND ec.is_active = true").
			Where("e.company_id = ? AND e.is_active = true AND ec.division_id = ?", companyID, *targetID).
			Distinct().
			Pluck("e.user_id", &ids).Error
		return ids, err

	case model.TargetTypePosition:
		if targetID == nil || *targetID == "" {
			return nil, nil
		}
		err := db.Table("employees AS e").
			Joins("JOIN employee_contracts AS ec ON ec.employee_id = e.id AND ec.is_active = true").
			Where("e.company_id = ? AND e.is_active = true AND ec.position_id = ?", companyID, *targetID).
			Distinct().
			Pluck("e.user_id", &ids).Error
		return ids, err

	case model.TargetTypeOfficeLocation:
		if targetID == nil || *targetID == "" {
			return nil, nil
		}
		err := db.Table("employees AS e").
			Joins("JOIN employee_office_locations AS eol ON eol.employee_id = e.id").
			Where("e.company_id = ? AND e.is_active = true AND eol.office_location_id = ?", companyID, *targetID).
			Distinct().
			Pluck("e.user_id", &ids).Error
		return ids, err

	case model.TargetTypeRole:
		if targetID == nil || *targetID == "" {
			return nil, nil
		}
		err := db.Table("users AS u").
			Joins("JOIN user_roles AS ur ON ur.user_id = u.id").
			Where("u.company_id = ? AND ur.role_id = ?", companyID, *targetID).
			Distinct().
			Pluck("u.id", &ids).Error
		return ids, err

	case model.TargetTypeAll:
		err := db.Table("employees AS e").
			Where("e.company_id = ? AND e.is_active = true", companyID).
			Distinct().
			Pluck("e.user_id", &ids).Error
		return ids, err
	}

	return ids, nil
}
