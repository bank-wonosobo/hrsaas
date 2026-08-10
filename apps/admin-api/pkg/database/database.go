package database

import (
	"fmt"
	"time"

	"github.com/sirupsen/logrus"
	"github.com/spf13/viper"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	gormlogger "gorm.io/gorm/logger"
)

func New(v *viper.Viper, log *logrus.Logger) *gorm.DB {
	dsn := fmt.Sprintf(
		"host=%s port=%d user=%s password=%s dbname=%s sslmode=%s TimeZone=Asia/Jakarta",
		v.GetString("database.host"),
		v.GetInt("database.port"),
		v.GetString("database.username"),
		v.GetString("database.password"),
		v.GetString("database.name"),
		v.GetString("database.sslmode"),
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: gormlogger.Default.LogMode(gormlogger.Info),
	})
	if err != nil {
		log.Fatalf("failed to connect database: %v", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		log.Fatalf("failed to get sql.DB: %v", err)
	}

	sqlDB.SetMaxOpenConns(v.GetInt("database.pool.max_open"))
	sqlDB.SetMaxIdleConns(v.GetInt("database.pool.max_idle"))
	sqlDB.SetConnMaxLifetime(time.Duration(v.GetInt("database.pool.max_lifetime")) * time.Second)

	return db
}
