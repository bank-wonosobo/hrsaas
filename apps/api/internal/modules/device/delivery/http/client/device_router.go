package client

import "github.com/gofiber/fiber/v2"

// RegisterRoutes only requires the caller to be logged in (no specific
// permission) — registering your own device is self-service, same as
// GET /users/_current.
func (c *DeviceController) RegisterRoutes(router fiber.Router, authMiddleware fiber.Handler) {
	router.Post("/devices", authMiddleware, c.Register)
}
