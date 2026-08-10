package middleware

import (
	"hrsaas-admin-api/internal/modules/auth/model"
	"hrsaas-admin-api/internal/modules/auth/usecase"

	"github.com/gofiber/fiber/v2"
)

func NewAuth(authUseCase *usecase.AuthUseCase) fiber.Handler {
	return func(ctx *fiber.Ctx) error {

		token := ctx.Cookies("token")
		if token == "" {
			return ctx.Status(401).JSON(fiber.Map{"message": "Unauthorized No token provided"})
		}

		request := &model.VerifyUserRequest{Token: token}

		user, err := authUseCase.Verify(ctx.UserContext(), request)

		if err != nil {
			authUseCase.Log.Warnf("Failed find user by token : %+v", err)
			return err
		}

		// Simpan user ke context agar bisa diakses di handler & middleware permission per-router
		ctx.Locals("user", user)

		return ctx.Next()
	}
}
