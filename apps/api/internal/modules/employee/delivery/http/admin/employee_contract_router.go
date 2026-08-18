package admin

import (
	"hrsaas/pkg/middleware"

	"github.com/gofiber/fiber/v2"
)

func (c *EmployeeContractController) RegisterRoutes(
	router fiber.Router,
	protected middleware.ProtectedMiddleware,
) {
	route := router.Group("/employee-contracts")
	route.Get("/", protected("EMPLOYEE_CONTRACTS", c.ListEmployeeContract)...)
	route.Post("/", protected("EMPLOYEE_CONTRACTS", c.CreateEmployeeContract)...)
	route.Get("/:id", protected("EMPLOYEE_CONTRACTS", c.DetailEmployeeContract)...)
	route.Put("/:id", protected("EMPLOYEE_CONTRACTS", c.UpdateEmployeeContract)...)
	route.Delete("/:id", protected("EMPLOYEE_CONTRACTS", c.DeleteEmployeeContract)...)
}
