package http

import (
	"hrsaas-admin-api/pkg/middleware"

	"github.com/gofiber/fiber/v2"
)

func (h *SalaryController) RegisterRoutes(
	router fiber.Router,
	protected middleware.ProtectedMiddleware,
) {
	salary := router.Group("/salaries")

	// Product catalogue
	salary.Get("/", protected("SALARY", h.List)...)
}
