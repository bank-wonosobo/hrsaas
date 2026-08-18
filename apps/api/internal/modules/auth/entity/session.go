package entity

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Session struct {
	ID        string  `gorm:"column:id;primaryKey"`
	ExpiredAt int64   `gorm:"column:expired_at"`
	Token     string  `gorm:"column:token;uniqueIndex"`
	IPAddress *string `gorm:"column:ip_address"`
	UserAgent *string `gorm:"column:user_agent"`
	UserID    string  `gorm:"column:user_id;type:uuid;not null"`
	// User      userEntity.User `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE"`

	CreatedAt int64 `gorm:"column:created_at;autoCreateTime"`
	UpdatedAt int64 `gorm:"column:updated_at;autoUpdateTime"`
}

func (Session) TableName() string {
	return "sessions"
}

func (s *Session) BeforeCreate(tx *gorm.DB) (err error) {
	s.ID = uuid.NewString()
	s.CreatedAt = int64(time.Now().UnixMilli())
	s.UpdatedAt = int64(time.Now().UnixMilli())
	return nil
}
