package admin

import (
	"hrsaas/pkg/middleware"

	"github.com/gofiber/fiber/v2"
)

func (c *DivisionController) RegisterRoutes(
	router fiber.Router,
	protected middleware.ProtectedMiddleware,
) {
	route := router.Group("/divisions")

	route.Get("/", protected("DIVISIONS", c.List)...)
	route.Post("/", protected("DIVISIONS", c.Create)...)
	route.Get("/:id", protected("DIVISIONS", c.Detail)...)
	route.Put("/:id", protected("DIVISIONS", c.Update)...)
	route.Delete("/:id", protected("DIVISIONS", c.Delete)...)
}
