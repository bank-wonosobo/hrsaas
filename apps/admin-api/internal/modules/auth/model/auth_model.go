package model

import userModel "hrsaas-admin-api/internal/modules/user/model"

// Authentication uses the user response/request models as its public payloads.
// Keep aliases here so auth consumers can depend on the auth package without
// introducing a second, incompatible set of types.
type UserResponse = userModel.UserResponse
type VerifyUserRequest = userModel.VerifyUserRequest
