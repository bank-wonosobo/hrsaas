package main

import (
	"fmt"
	"hrsaas-client-api/internal/bootstrap"
	"hrsaas-client-api/pkg/config"
	"hrsaas-client-api/pkg/database"
	"hrsaas-client-api/pkg/fiber"
	"hrsaas-client-api/pkg/logger"
	"hrsaas-client-api/pkg/validator"
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
	})

	addr := fmt.Sprintf("%s:%d", config.GetString("app.host"), config.GetInt("app.port"))
	logger.Infof("starting %s on %s", config.GetString("app.name"), addr)

	if err := app.Listen(addr); err != nil {
		logger.Fatalf("failed to start server: %v", err)
	}
}
