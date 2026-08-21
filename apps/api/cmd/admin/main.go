package main

import (
	"fmt"
	"hrsaas/internal/bootstrap"
	"hrsaas/pkg/config"
	"hrsaas/pkg/database"
	"hrsaas/pkg/fiber"
	"hrsaas/pkg/logger"
	"hrsaas/pkg/pushnotification"
	pkg "hrsaas/pkg/s3"

	"github.com/go-playground/validator/v10"
)

func main() {
	logger := logger.NewDefault()

	config := config.New(logger)

	db := database.New(config, logger)

	app := fiber.New(config)

	s3 := pkg.NewS3Client(config)

	expoClient := pushnotification.NewExpoClient(config)

	bootstrap.BootstrapAdmin(&bootstrap.AdminBootstrapConfig{
		App:       app,
		DB:        db,
		Log:       logger,
		Validator: validator.New(),
		Config:    config,
		S3Client:  s3,
		PushNotif: expoClient,
	})

	addr := fmt.Sprintf("%s:%d", config.GetString("app.host"), config.GetInt("app.port"))
	logger.Infof("starting %s on %s", config.GetString("app.name"), addr)

	if err := app.Listen(addr); err != nil {
		logger.Fatalf("failed to start server: %v", err)
	}
}
