package http

import (
	"hrsaas-admin-api/pkg/middleware"

	"github.com/gofiber/fiber/v2"
)

func (c *UserController) RegisterRoutes(
	router fiber.Router,
	authMiddleware fiber.Handler,
	protected middleware.ProtectedMiddleware,
) {
	route := router.Group("/users")

	// Self-service: authenticated users do not need a USERS permission.
	route.Get("/_current", authMiddleware, c.GetCurrentUser)
	// route.Patch("/_change-password", authMiddleware, c.ChangePassword)

	// User management: requires the USERS permission.
	route.Get("/", protected("USERS", c.List)...)
	route.Get("/:id", protected("USERS", c.Detail)...)
	route.Put("/:id", protected("USERS", c.Update)...)
	route.Delete("/:id", protected("USERS", c.Delete)...)
	route.Patch("/:id/_reset-password", protected("USERS", c.ResetPassword)...)
}
