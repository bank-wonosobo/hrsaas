package admin

import (
	"hrsaas/pkg/middleware"

	"github.com/gofiber/fiber/v2"
)

func (c *SanctionController) RegisterRoutes(
	router fiber.Router,
	protected middleware.ProtectedMiddleware,
) {
	route := router.Group("/sanctions")
	route.Get("/", protected("SANCTIONS", c.ListSanction)...)
	route.Post("/", protected("SANCTIONS", c.Create)...)
	route.Get("/:id", protected("SANCTIONS", c.Detail)...)
	route.Put("/:id", protected("SANCTIONS", c.Update)...)
	route.Delete("/:id", protected("SANCTIONS", c.Delete)...)
}
