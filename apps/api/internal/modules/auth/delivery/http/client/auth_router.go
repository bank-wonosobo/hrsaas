package client

import "github.com/gofiber/fiber/v2"

func (c *AuthController) RegisterRoutes(
	router fiber.Router,
) {

	router.Post("/_login", c.Login)
	router.Delete("/users/_logout", c.Logout)
}
