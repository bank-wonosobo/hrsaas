package client

import (
	"hrsaas/pkg/middleware"

	"github.com/gofiber/fiber/v2"
)

func (c *VisitController) RegisterRoutes(
	router fiber.Router,
	client middleware.ClientMiddleware,
) {
	route := router.Group("/visits")

	route.Get("/", client(c.ListCurrent)...)
	route.Post("/", client(c.Create)...)
}
