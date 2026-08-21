package client

import (
	"hrsaas/pkg/middleware"

	"github.com/gofiber/fiber/v2"
)

func (c *TimeOffRequestController) RegisterRoutes(
	router fiber.Router,
	client middleware.ClientMiddleware,
) {
	route := router.Group("/time-off-requests")

	route.Get("/", client(c.ListCurrent)...)
	route.Post("/", client(c.Create)...)
}
