package admin

import (
	"hrsaas/pkg/middleware"

	"github.com/gofiber/fiber/v2"
)

func (h *PayrollHandler) RegisterRoutes(
	router fiber.Router,
	protected middleware.ProtectedMiddleware,
) {
	payrolls := router.Group("/payrolls")
	payrolls.Get("/", protected("PAYROLLS", h.List)...)
	payrolls.Post("/", protected("PAYROLLS", h.Create)...)
	payrolls.Get("/:id", protected("PAYROLLS", h.Detail)...)
	payrolls.Delete("/:id", protected("PAYROLLS", h.Delete)...)
	payrolls.Post("/:id/calculate", protected("PAYROLLS", h.Calculate)...)

	payments := router.Group("/payroll-payments")
	payments.Get("/", protected("PAYROLL_PAYMENTS", h.ListPayments)...)
	payments.Get("/:id", protected("PAYROLL_PAYMENTS", h.PaymentDetail)...)
	payments.Patch("/:id/status", protected("PAYROLL_PAYMENTS", h.UpdatePaymentStatus)...)
}
