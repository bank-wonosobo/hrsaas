package http

import "github.com/gofiber/fiber/v2"

func (h *SalaryHandler) RegisterRoutes(router fiber.Router) {
	salary := router.Group("/salaries")

	// Product catalogue
	salary.Get("/", h.List)
}
