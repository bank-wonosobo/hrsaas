package bootstrap

import (
	httpSallary "hrsaas-client-api/internal/modules/salary/delivery/http"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type BootstrapConfig struct {
	App       *fiber.App
	DB        *gorm.DB
	Log       *logrus.Logger
	Validator *validator.Validate
}

func Bootstrap(cfg *BootstrapConfig) {
	api := cfg.App.Group("/api")

	// Salary module
	salaryHandler := httpSallary.NewSalaryHandler(cfg.Log)
	salaryHandler.RegisterRoutes(api)

}
