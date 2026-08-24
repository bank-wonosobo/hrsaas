package client

import (
	"hrsaas/pkg/middleware"

	"github.com/gofiber/fiber/v2"
)

func (c *EmployeeEducationController) RegisterRoutes(
	router fiber.Router,
	client middleware.ClientMiddleware,
) {
	route := router.Group("/employee-educations")

	route.Get("/", client(c.ListCurrent)...)
	route.Put("/:education_id", client(c.UpdateCurrent)...)
}
