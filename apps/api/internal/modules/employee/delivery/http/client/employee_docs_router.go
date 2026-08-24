package client

import (
	"hrsaas/pkg/middleware"

	"github.com/gofiber/fiber/v2"
)

func (c *EmployeeDocumentController) RegisterRoutes(
	router fiber.Router,
	client middleware.ClientMiddleware,
) {
	route := router.Group("/employee-docs")

	route.Get("/", client(c.ListCurrent)...)
	route.Put("/:doc_id", client(c.UpdateCurrent)...)
}
