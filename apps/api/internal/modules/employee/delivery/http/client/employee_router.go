package client

import (
	"hrsaas/pkg/middleware"

	"github.com/gofiber/fiber/v2"
)

func (c *EmployeeController) RegisterRoutes(
	router fiber.Router,
	client middleware.ClientMiddleware,
) {
	route := router.Group("/employees")

	route.Get("/", client(c.ListEmployee)...)
	route.Get("/_current", client(c.GetCurrent)...)
	route.Put("/_current", client(c.UpdateCurrent)...)
}
