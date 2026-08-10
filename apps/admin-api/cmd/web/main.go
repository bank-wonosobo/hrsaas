package main

import (
	"fmt"
	"hrsaas-admin-api/internal/bootstrap"
	"hrsaas-admin-api/pkg/config"
	"hrsaas-admin-api/pkg/database"
	"hrsaas-admin-api/pkg/fiber"
	"hrsaas-admin-api/pkg/logger"

	"github.com/go-playground/validator/v10"
)

func main() {
	logger := logger.NewDefault()

	config := config.New(logger)

	db := database.New(config, logger)

	app := fiber.New(config)

	bootstrap.Bootstrap(&bootstrap.BootstrapConfig{
		App:       app,
		DB:        db,
		Log:       logger,
		Validator: validator.New(),
		Config:    config,
	})

	addr := fmt.Sprintf("%s:%d", config.GetString("app.host"), config.GetInt("app.port"))
	logger.Infof("starting %s on %s", config.GetString("app.name"), addr)

	if err := app.Listen(addr); err != nil {
		logger.Fatalf("failed to start server: %v", err)
	}
}
