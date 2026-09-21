package admin

import (
	"hrsaas/pkg/middleware"

	"github.com/gofiber/fiber/v2"
)

func (h *SalaryComponentHandler) RegisterRoutes(
	router fiber.Router,
	protected middleware.ProtectedMiddleware,
) {
	salaryComponents := router.Group("/salary-components")
	salaryComponents.Get("/", protected("SALARY_COMPONENTS", h.List)...)
	salaryComponents.Post("/", protected("SALARY_COMPONENTS", h.Create)...)
	salaryComponents.Get("/:id", protected("SALARY_COMPONENTS", h.Detail)...)
	salaryComponents.Put("/:id", protected("SALARY_COMPONENTS", h.Update)...)
	salaryComponents.Delete("/:id", protected("SALARY_COMPONENTS", h.Delete)...)
}
