package http

import (
	"hrsaas-admin-api/pkg/middleware"

	"github.com/gofiber/fiber/v2"
)

func (c *PermissionController) RegisterRoutes(
	router fiber.Router,
	protected middleware.ProtectedMiddleware,
) {
	route := router.Group("/permissions")
	route.Get("/", protected("PERMISSIONS", c.List)...)
	route.Post("/", protected("PERMISSIONS", c.Create)...)
	route.Get("/:id", protected("PERMISSIONS", c.Detail)...)
	route.Put("/:id", protected("PERMISSIONS", c.Update)...)
	route.Delete("/:id", protected("PERMISSIONS", c.Delete)...)
}
