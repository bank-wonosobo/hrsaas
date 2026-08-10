package http

import (
	"net/http"

	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
)

type SalaryHandler struct {
	log *logrus.Logger
}

func NewSalaryHandler(log *logrus.Logger) *SalaryHandler {
	return &SalaryHandler{log: log}
}

// ─── Account ──────────────────────────────────────────────────────────────────

func (h *SalaryHandler) List(c *fiber.Ctx) error {
	return c.Status(http.StatusCreated).JSON("OK")
}
