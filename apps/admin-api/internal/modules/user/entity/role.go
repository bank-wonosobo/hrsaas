package entity

type Role struct {
	ID          string       `gorm:"column:id;primaryKey"`
	Name        string       `gorm:"column:name;not null"`
	Permissions []Permission `gorm:"many2many:role_permissions"`
}

func (r *Role) TableName() string {
	return "roles"
}
