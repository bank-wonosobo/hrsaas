package admin

import (
	"hrsaas/pkg/middleware"

	"github.com/gofiber/fiber/v2"
)

func (c *EmployeeDocumentController) RegisterRoutes(
	router fiber.Router,
	protected middleware.ProtectedMiddleware,
) {
	route := router.Group("/employee-documents")

	route.Get("/", protected("EMPLOYEE_DOCUMENTS", c.List)...)
	route.Post("/", protected("EMPLOYEE_DOCUMENTS", c.Create)...)
	route.Put("/:id", protected("EMPLOYEE_DOCUMENTS", c.Update)...)
	route.Delete("/:id", protected("EMPLOYEE_DOCUMENTS", c.Delete)...)
}
