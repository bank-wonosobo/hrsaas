package admin

import (
	"hrsaas/internal/modules/time_off/usecase"
	"hrsaas/pkg/auth"

	"github.com/gofiber/fiber/v2"
)

func ensureOwnerOrAdmin(
	ctx *fiber.Ctx,
	requestUseCase *usecase.TimeOffRequestUseCase,
	requestID string,
) error {
	user := auth.GetUser(ctx)
	if auth.HasRole(ctx, "ADMIN") {
		return nil
	}

	ownerID, err := requestUseCase.GetRequestOwner(ctx.UserContext(), requestID)
	if err != nil {
		return err
	}
	if ownerID != user.ID {
		return fiber.NewError(fiber.StatusForbidden, "Forbidden")
	}
	return nil
}
