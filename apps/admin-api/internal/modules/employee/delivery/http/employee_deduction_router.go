package http

import (
	"hrsaas-admin-api/pkg/middleware"

	"github.com/gofiber/fiber/v2"
)

func (c *EmployeeDeductionController) RegisterRoutes(
	router fiber.Router,
	protected middleware.ProtectedMiddleware,
) {
	route := router.Group("/employee-deductions")
	route.Get("/", protected("EMPLOYEE_DEDUCTIONS", c.List)...)
	route.Post("/", protected("EMPLOYEE_DEDUCTIONS", c.Create)...)
	route.Get("/:id", protected("EMPLOYEE_DEDUCTIONS", c.Detail)...)
	route.Put("/:id", protected("EMPLOYEE_DEDUCTIONS", c.Update)...)
	route.Delete("/:id", protected("EMPLOYEE_DEDUCTIONS", c.Delete)...)
}
