package admin

import (
	"hrsaas/pkg/middleware"

	"github.com/gofiber/fiber/v2"
)

func (c *VisitController) RegisterRoutes(
	router fiber.Router,
	protected middleware.ProtectedMiddleware) {
	route := router.Group("/visits")
	route.Get("/", protected("VISIT", c.List)...)
	route.Put("/:id", protected("VISIT", c.Update)...)
	route.Delete("/:id", protected("VISIT", c.Delete)...)
}
