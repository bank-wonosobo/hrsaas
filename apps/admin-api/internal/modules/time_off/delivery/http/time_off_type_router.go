package http

import (
	"hrsaas-admin-api/pkg/middleware"

	"github.com/gofiber/fiber/v2"
)

func (c *TimeOffTypeController) RegisterRoutes(
	router fiber.Router,
	protected middleware.ProtectedMiddleware,
) {
	route := router.Group("/time-off-types")
	route.Post("/", protected("TIME_OFF_TYPES", c.CreateType)...)
	route.Put("/:id", protected("TIME_OFF_TYPES", c.UpdateType)...)
	route.Delete("/:id", protected("TIME_OFF_TYPES", c.DeleteType)...)
}
