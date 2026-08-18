package admin

import (
	"hrsaas/pkg/middleware"

	"github.com/gofiber/fiber/v2"
)

func (c *PositionController) RegisterRoutes(
	router fiber.Router,
	protected middleware.ProtectedMiddleware,
) {
	route := router.Group("/positions")

	route.Get("/", protected("POSITIONS", c.ListPosition)...)
	route.Post("/", protected("POSITIONS", c.Create)...)
	route.Get("/:id", protected("POSITIONS", c.Detail)...)
	route.Put("/:id", protected("POSITIONS", c.Update)...)
	route.Delete("/:id", protected("POSITIONS", c.Delete)...)
}
