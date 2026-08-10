package entity

import (
	authEntity "hrsaas-admin-api/internal/modules/auth/entity"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type User struct {
	ID            string  `gorm:"column:id;primaryKey"`
	Name          string  `gorm:"column:name;not null"`
	Email         string  `gorm:"column:email;uniqueIndex;not null"`
	EmailVerified bool    `gorm:"column:email_verified;default:false"`
	Image         *string `gorm:"column:image"`
	CompanyID     string  `gorm:"column:company_id"`
	Password      string  `gorm:"column:password;not null"`

	Roles     []Role               `gorm:"many2many:user_roles;"`
	CreatedAt int64                `gorm:"column:created_at;autoCreateTime"`
	UpdatedAt int64                `gorm:"column:updated_at;autoUpdateTime"`
	Sessions  []authEntity.Session `gorm:"constraint:OnDelete:CASCADE"`
}

// BeforeCreate hook to set UUID
func (u *User) BeforeCreate(tx *gorm.DB) (err error) {
	u.ID = uuid.NewString()
	u.CreatedAt = int64(time.Now().UnixMilli())
	u.UpdatedAt = int64(time.Now().UnixMilli())
	return nil
}

func (u *User) TableName() string {
	return "users"
}
