package http

import (
	"hrsaas-admin-api/pkg/middleware"

	"github.com/gofiber/fiber/v2"
)

func (h *SalaryController) RegisterRoutes(
	router fiber.Router,
	protected middleware.ProtectedMiddleware,
) {
	salary := router.Group("/salary-components")

	salary.Get("/", protected("SALARY_COMPONENTS", h.List)...)
	salary.Post("/", protected("SALARY_COMPONENTS", h.Create)...)
	salary.Get("/:id", protected("SALARY_COMPONENTS", h.Detail)...)
	salary.Put("/:id", protected("SALARY_COMPONENTS", h.Update)...)
	salary.Delete("/:id", protected("SALARY_COMPONENTS", h.Delete)...)
}
