package response

// type Response[T any] struct {
// 	Success bool   `json:"success"`
// 	Message string `json:"message"`
// 	Data    T      `json:"data,omitempty"`
// }

// type PaginatedResponse[T any] struct {
// 	Success bool   `json:"success"`
// 	Message string `json:"message"`
// 	Data    T      `json:"data,omitempty"`
// 	Meta    Meta   `json:"meta"`
// }

// type Meta struct {
// 	Page      int   `json:"page"`
// 	Size      int   `json:"size"`
// 	TotalData int64 `json:"total_data"`
// 	TotalPage int64 `json:"total_page"`
// }

// func OK[T any](message string, data T) Response[T] {
// 	return Response[T]{Success: true, Message: message, Data: data}
// }

// func Error[T any](message string) Response[T] {
// 	return Response[T]{Success: false, Message: message}
// }

type WebResponse[T any] struct {
	Data   T             `json:"data"`
	Paging *PageMetadata `json:"paging,omitempty"`
	Errors string        `json:"errors,omitempty"`
}

type PageResponse[T any] struct {
	Data         []T          `json:"data,omitempty"`
	PageMetadata PageMetadata `json:"paging,omitempty"`
}

type PageMetadata struct {
	Page      int   `json:"page"`
	Size      int   `json:"size"`
	TotalItem int64 `json:"total_item"`
	TotalPage int64 `json:"total_page"`
}
