package client

import "github.com/gofiber/fiber/v2"

func (c *AnnouncementController) RegisterRoutes(
	router fiber.Router,
	authMiddleware fiber.Handler,
) {
	route := router.Group("/announcements")

	route.Get("/", authMiddleware, c.List)
}
