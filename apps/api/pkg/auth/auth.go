package auth

import (
	"crypto/rand"
	"encoding/base64"
	"hrsaas/internal/modules/auth/model"
	"strings"

	"github.com/gofiber/fiber/v2"
)

func GenerateToken(length int) (string, error) {
	b := make([]byte, length)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(b), nil
}

func GetUser(ctx *fiber.Ctx) *model.UserResponse {
	return ctx.Locals("user").(*model.UserResponse)
}

func GetCompanyId(ctx *fiber.Ctx) string {
	user := GetUser(ctx)
	return user.CompanyID
}

func HasRole(ctx *fiber.Ctx, roleName string) bool {
	user := GetUser(ctx)
	for _, r := range user.Roles {
		if strings.EqualFold(r.Name, roleName) {
			return true
		}
	}
	return false
}
