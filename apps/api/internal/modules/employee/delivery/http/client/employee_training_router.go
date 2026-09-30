package client

import (
	"hrsaas/pkg/middleware"

	"github.com/gofiber/fiber/v2"
)

func (c *EmployeeTrainingController) RegisterRoutes(
	router fiber.Router,
	client middleware.ClientMiddleware,
) {
	route := router.Group("/employee-trainings")

	route.Post("/", client(c.Create)...)
	route.Get("/", client(c.ListCurrent)...)
	route.Put("/_current/:training_id", client(c.UpdateCurrent)...)
}
