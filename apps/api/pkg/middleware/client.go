package middleware

import (
	authUsecase "hrsaas/internal/modules/auth/usecase"
	employeeUsecase "hrsaas/internal/modules/employee/usecase"

	"github.com/gofiber/fiber/v2"
)

type ClientMiddleware func(handlers ...fiber.Handler) []fiber.Handler

func NewClient(
	authUseCase *authUsecase.AuthUseCase,
	employeeUseCase *employeeUsecase.EmployeeUseCase,
) (fiber.Handler, ClientMiddleware) {
	authMiddleware := NewAuth(authUseCase)
	employeeMiddleware := NewEmployee(employeeUseCase)

	client := func(handlers ...fiber.Handler) []fiber.Handler {
		return append([]fiber.Handler{authMiddleware, employeeMiddleware}, handlers...)
	}

	return authMiddleware, client
}
