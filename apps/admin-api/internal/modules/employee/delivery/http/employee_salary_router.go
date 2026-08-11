package http

import (
	"hrsaas-admin-api/pkg/middleware"

	"github.com/gofiber/fiber/v2"
)

func (c *EmployeeSalaryController) RegisterRoutes(
	router fiber.Router,
	protected middleware.ProtectedMiddleware,
) {
	route := router.Group("/employee-salaries")
	route.Get("/", protected("EMPLOYEE_SALARIES", c.List)...)
	route.Post("/", protected("EMPLOYEE_SALARIES", c.Create)...)
	route.Get("/:id", protected("EMPLOYEE_SALARIES", c.Detail)...)
	route.Put("/:id", protected("EMPLOYEE_SALARIES", c.Update)...)
	route.Delete("/:id", protected("EMPLOYEE_SALARIES", c.Delete)...)
}
