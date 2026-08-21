package client

import (
	"hrsaas/pkg/middleware"

	"github.com/gofiber/fiber/v2"
)

func (c *CollectingController) RegisterRoutes(
	router fiber.Router,
	client middleware.ClientMiddleware,
) {
	route := router.Group("/collecting")

	route.Get("/", client(c.ListCurrent)...)
	route.Post("/_search-nasabah", client(c.SearchNasabah)...)
	route.Post("/", client(c.Create)...)
}
