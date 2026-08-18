package middleware

import (
	"hrsaas/internal/modules/auth/usecase"

	"github.com/gofiber/fiber/v2"
)

// ProtectedMiddleware is the middleware factory used by routes that require
// both authentication and a specific permission.
type ProtectedMiddleware func(permission string, handlers ...fiber.Handler) []fiber.Handler

// NewProtected initializes authentication once and returns it for routes that
// only require a logged-in user, together with a factory for protected routes.
func NewProtected(authUseCase *usecase.AuthUseCase) (fiber.Handler, ProtectedMiddleware) {
	authMiddleware := NewAuth(authUseCase)

	protected := func(permission string, handlers ...fiber.Handler) []fiber.Handler {
		return append([]fiber.Handler{
			authMiddleware,
			NewAdmin(permission),
		}, handlers...)
	}

	return authMiddleware, protected
}

// Protected menggabungkan AuthMiddleware (verifikasi login) dan AdminMiddleware
// (cek permission) menjadi satu rangkaian handler untuk route yang butuh akses
// admin tertentu, agar tidak perlu diimplementasikan ulang di tiap module.
func Protected(authMW fiber.Handler, adminMW func(permission string) fiber.Handler, permission string, handlers ...fiber.Handler) []fiber.Handler {
	return append([]fiber.Handler{authMW, adminMW(permission)}, handlers...)
}
