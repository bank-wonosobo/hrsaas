package http

import (
	"hrsaas-admin-api/pkg/middleware"

	"github.com/gofiber/fiber/v2"
)

func (c *HolidayController) RegisterRoutes(
	router fiber.Router,
	protected middleware.ProtectedMiddleware) {
	route := router.Group("/holidays")
	route.Post("/", protected("HOLIDAYS", c.Create)...)
	route.Get("/", protected("HOLIDAYS", c.List)...)
	route.Put("/:id", protected("HOLIDAYS", c.Update)...)
	route.Delete("/:id", protected("HOLIDAYS", c.Delete)...)
}
