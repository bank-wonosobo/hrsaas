package admin

import (
	"hrsaas/pkg/middleware"

	"github.com/gofiber/fiber/v2"
)

func (c *EmployeeAllowanceController) RegisterRoutes(
	router fiber.Router,
	protected middleware.ProtectedMiddleware,
) {
	route := router.Group("/employee-allowances")
	route.Get("/", protected("EMPLOYEE_ALLOWANCES", c.List)...)
	route.Post("/", protected("EMPLOYEE_ALLOWANCES", c.Create)...)
	route.Get("/:id", protected("EMPLOYEE_ALLOWANCES", c.Detail)...)
	route.Put("/:id", protected("EMPLOYEE_ALLOWANCES", c.Update)...)
	route.Delete("/:id", protected("EMPLOYEE_ALLOWANCES", c.Delete)...)
}
