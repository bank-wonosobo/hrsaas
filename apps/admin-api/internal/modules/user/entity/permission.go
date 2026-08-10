package entity

type Permission struct {
	ID   string `gorm:"column:id;primaryKey"`
	Name string `gorm:"column:name;not null"`
}

func (p *Permission) TableName() string {
	return "permissions"
}
