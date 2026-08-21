package client

import "github.com/gofiber/fiber/v2"

func (c *UserController) RegisterRoutes(
	router fiber.Router,
	authMiddleware fiber.Handler,
) {
	route := router.Group("/users")

	route.Get("/_current", authMiddleware, c.GetCurrentUser)
}
