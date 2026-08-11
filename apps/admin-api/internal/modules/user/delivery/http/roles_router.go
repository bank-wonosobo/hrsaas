package http

import (
	"hrsaas-admin-api/pkg/middleware"

	"github.com/gofiber/fiber/v2"
)

func (c *RoleController) RegisterRoutes(
	router fiber.Router,
	protected middleware.ProtectedMiddleware,
) {
	route := router.Group("/roles")
	route.Get("/", protected("ROLES", c.List)...)
	route.Post("/", protected("ROLES", c.Create)...)
	route.Get("/:id", protected("ROLES", c.Detail)...)
	route.Put("/:id", protected("ROLES", c.Update)...)
	route.Delete("/:id", protected("ROLES", c.Delete)...)
	route.Patch("/:id/_assign-permissions", protected("ROLES", c.AssignPermissions)...)
}
