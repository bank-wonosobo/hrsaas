package admin

import (
	"hrsaas/pkg/middleware"

	"github.com/gofiber/fiber/v2"
)

func (c *NotificationPreferenceController) RegisterRoutes(
	router fiber.Router,
	protected middleware.ProtectedMiddleware,
) {
	route := router.Group("/notification-preferences")

	route.Get("/", protected("NOTIFICATION_PREFERENCES", c.List)...)
	route.Put("/", protected("NOTIFICATION_PREFERENCES", c.Update)...)
}
