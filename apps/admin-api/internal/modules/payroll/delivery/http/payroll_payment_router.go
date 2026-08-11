package http

import (
	"hrsaas-admin-api/pkg/middleware"

	"github.com/gofiber/fiber/v2"
)

func (c *PayrollPaymentController) RegisterRoutes(
	router fiber.Router,
	protected middleware.ProtectedMiddleware,
) {
	route := router.Group("/payroll-payments")
	route.Get("/", protected("PAYROLL_PAYMENTS", c.List)...)
	route.Get("/:id", protected("PAYROLL_PAYMENTS", c.Detail)...)
	route.Patch("/:id/status", protected("PAYROLL_PAYMENTS", c.UpdateStatus)...)
}
