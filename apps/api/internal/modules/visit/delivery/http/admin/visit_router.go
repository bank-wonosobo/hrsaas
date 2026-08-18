package admin

import (
	"hrsaas/pkg/middleware"

	"github.com/gofiber/fiber/v2"
)

func (c *VisitController) RegisterRoutes(
	router fiber.Router,
	protected middleware.ProtectedMiddleware) {
	route := router.Group("/visits")
	route.Get("/", protected("VISITS", c.List)...)
	route.Get("/export", protected("VISITS", c.Export)...)
	route.Put("/:id", protected("VISITS", c.Update)...)
	route.Delete("/:id", protected("VISITS", c.Delete)...)
}
