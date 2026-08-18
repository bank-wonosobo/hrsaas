package usecase

import (
	"context"

	"hrsaas/internal/modules/visit/entity"
	"hrsaas/internal/modules/visit/model"
	"hrsaas/internal/modules/visit/repository"
	"hrsaas/pkg/excel"
	pkg "hrsaas/pkg/s3"

	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
	"github.com/xuri/excelize/v2"
	"gorm.io/gorm"
)

type VisitUseCase struct {
	DB       *gorm.DB
	Log      *logrus.Logger
	Validate *validator.Validate
	Repo     *repository.VisitRepository
	S3Client *pkg.S3Client
}

func NewVisitUseCase(
	db *gorm.DB,
	log *logrus.Logger,
	validate *validator.Validate,
	repo *repository.VisitRepository,
	s3Client *pkg.S3Client) *VisitUseCase {
	return &VisitUseCase{
		DB:       db,
		Log:      log,
		Validate: validate,
		Repo:     repo,
		S3Client: s3Client,
	}
}

func (c *VisitUseCase) List(
	ctx context.Context,
	request *model.SearchVisitRequest,
) ([]model.VisitResponse, int64, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	if err := c.Validate.Struct(request); err != nil {
		c.Log.WithError(err).Error("Gagal memvalidasi body permintaan")
		return nil, 0, fiber.ErrBadRequest
	}
	if request.SortBy != "" && request.SortBy != "newest" && request.SortBy != "oldest" {
		return nil, 0, fiber.NewError(fiber.StatusBadRequest, "sort_by must be newest or oldest")
	}
	if request.StartDate != "" {
		if _, err := time.Parse("2006-01-02", request.StartDate); err != nil {
			return nil, 0, fiber.NewError(fiber.StatusBadRequest, "Tanggal mulai tidak valid")
		}
	}
	if request.EndDate != "" {
		if _, err := time.Parse("2006-01-02", request.EndDate); err != nil {
			return nil, 0, fiber.NewError(fiber.StatusBadRequest, "Tanggal selesai tidak valid")
		}
	}

	items, total, err := c.Repo.List(tx, request, true)
	if err != nil {
		c.Log.WithError(err).Error("Gagal memuat daftar kunjungan")
		return nil, 0, fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Gagal menyelesaikan transaksi")
		return nil, 0, fiber.ErrInternalServerError
	}

	responses := make([]model.VisitResponse, len(items))
	presignClient := s3.NewPresignClient(c.S3Client.Client)
	for i := range items {
		for idx, v := range items[i].Details {
			url, err := c.S3Client.GenerateDownloadURL(presignClient, *v.FileUrl)
			if err != nil {
				return nil, 0, err
			}
			items[i].Details[idx].FileUrl = &url
		}
		responses[i] = *model.VisitToResponse(&items[i])
	}

	return responses, total, nil
}

func (c *VisitUseCase) Update(
	ctx context.Context,
	id string,
	request *model.UpdateVisitRequest,
) (*model.VisitResponse, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	if err := c.Validate.Struct(request); err != nil {
		c.Log.WithError(err).Error("Gagal memvalidasi body permintaan")
		return nil, fiber.ErrBadRequest
	}

	if _, err := c.Repo.FindByID(tx, id, true); err != nil {
		c.Log.WithError(err).Error("Kunjungan tidak ditemukan")
		return nil, fiber.ErrNotFound
	}

	if request.Latitude != nil || request.Longitude != nil {
		if request.Latitude == nil || request.Longitude == nil {
			return nil, fiber.NewError(
				fiber.StatusBadRequest,
				"lokasi tidak valid. Latitude dan longitude harus diisi bersamaan",
			)
		}
	}

	nowMilli := time.Now().UnixMilli()

	visitUpdates := map[string]any{
		"updated_at": nowMilli,
	}
	if request.ClientName != nil {
		clientName := strings.TrimSpace(*request.ClientName)
		if clientName == "" {
			return nil, fiber.NewError(fiber.StatusBadRequest, "Nama klien tidak boleh kosong")
		}
		visitUpdates["client_name"] = clientName
	}

	if len(visitUpdates) > 1 {
		if err := tx.Model(&entity.Visit{}).Where("id = ?", id).Updates(visitUpdates).Error; err != nil {
			c.Log.WithError(err).Error("Gagal memperbarui kunjungan")
			return nil, fiber.ErrInternalServerError
		}
	}

	detail, err := c.Repo.FindLatestDetailByVisitID(tx, id)
	if err != nil {
		c.Log.WithError(err).Error("Detail kunjungan tidak ditemukan")
		return nil, fiber.ErrInternalServerError
	}

	detailUpdates := map[string]any{
		"updated_at": nowMilli,
	}
	if request.FileUrl != nil {
		detailUpdates["file_url"] = request.FileUrl
	}
	if request.Address != nil {
		detailUpdates["address"] = request.Address
	}
	if request.Note != nil {
		detailUpdates["note"] = request.Note
	}
	if request.Latitude != nil && request.Longitude != nil {
		location := strings.TrimSpace(
			*request.Latitude,
		) + ", " + strings.TrimSpace(
			*request.Longitude,
		)
		detailUpdates["location"] = location
	}

	if len(detailUpdates) > 1 {
		if err := tx.Model(&entity.VisitDetail{}).Where("id = ?", detail.ID).Updates(detailUpdates).Error; err != nil {
			c.Log.WithError(err).Error("Gagal memperbarui detail kunjungan")
			return nil, fiber.ErrInternalServerError
		}
	}

	result, err := c.Repo.FindByID(tx, id, true)
	if err != nil {
		c.Log.WithError(err).Error("Gagal memuat kunjungan yang diperbarui")
		return nil, fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Gagal menyelesaikan transaksi")
		return nil, fiber.ErrInternalServerError
	}

	return model.VisitToResponse(result), nil
}

// TODO: Consider soft delete if audits are required.
func (c *VisitUseCase) Delete(ctx context.Context, id string) error {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	item, err := c.Repo.FindByID(tx, id, false)
	if err != nil {
		c.Log.WithError(err).Error("Kunjungan tidak ditemukan")
		return fiber.ErrNotFound
	}

	if err := c.Repo.Delete(tx, item); err != nil {
		c.Log.WithError(err).Error("Gagal menghapus kunjungan")
		return fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Gagal menyelesaikan transaksi")
		return fiber.ErrInternalServerError
	}

	return nil
}

func (c *VisitUseCase) ExportToExcel(
	ctx context.Context,
	request *model.SearchVisitRequest,
) (*excelize.File, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	if err := c.Validate.Struct(request); err != nil {
		c.Log.WithError(err).Error("Gagal memvalidasi body permintaan")
		return nil, fiber.ErrBadRequest
	}
	if request.SortBy != "" && request.SortBy != "newest" && request.SortBy != "oldest" {
		return nil, fiber.NewError(fiber.StatusBadRequest, "sort_by must be newest or oldest")
	}
	if request.StartDate != "" {
		if _, err := time.Parse("2006-01-02", request.StartDate); err != nil {
			return nil, fiber.NewError(fiber.StatusBadRequest, "Tanggal mulai tidak valid")
		}
	}
	if request.EndDate != "" {
		if _, err := time.Parse("2006-01-02", request.EndDate); err != nil {
			return nil, fiber.NewError(fiber.StatusBadRequest, "Tanggal selesai tidak valid")
		}
	}

	// Export mengambil seluruh data, bukan per halaman.
	request.Page = 0
	request.Size = 0

	items, _, err := c.Repo.List(tx, request, true)
	if err != nil {
		c.Log.WithError(err).Error("Gagal memuat daftar kunjungan untuk export")
		return nil, fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Gagal menyelesaikan transaksi")
		return nil, fiber.ErrInternalServerError
	}

	employeeMap := make(map[string]*model.VisitSheet)
	employeeOrder := make([]string, 0, len(items))
	for i := range items {
		visit := items[i]
		empID := visit.EmployeeID
		if _, exists := employeeMap[empID]; !exists {
			employeeMap[empID] = &model.VisitSheet{
				Name:  visit.Employee.Fullname,
				Data:  []model.ExportVisitResponse{},
				Total: 0,
			}
			employeeOrder = append(employeeOrder, empID)
		}

		// Detail IN menandai awal kunjungan, detail OUT menandai akhir kunjungan.
		var inDetail, outDetail *entity.VisitDetail
		for j := range visit.Details {
			detail := &visit.Details[j]
			switch detail.VisitType {
			case "IN":
				if inDetail == nil || detail.CreatedAt < inDetail.CreatedAt {
					inDetail = detail
				}
			case "OUT":
				if outDetail == nil || detail.CreatedAt > outDetail.CreatedAt {
					outDetail = detail
				}
			}
		}

		row := model.ExportVisitResponse{
			EmployeeName: visit.Employee.Fullname,
			StartDate:    formatVisitAt(inDetail),
			EndDate:      formatVisitAt(outDetail),
			ClientName:   visit.ClientName,
			Address: firstNonEmpty(
				inDetail,
				outDetail,
				func(d *entity.VisitDetail) *string { return d.Address },
			),
			Note: firstNonEmpty(
				inDetail,
				outDetail,
				func(d *entity.VisitDetail) *string { return d.Note },
			),
		}

		employeeMap[empID].Data = append(employeeMap[empID].Data, row)
		employeeMap[empID].Total++
	}

	sheets := make([]model.VisitSheet, 0, len(employeeOrder))
	for _, empID := range employeeOrder {
		sheets = append(sheets, *employeeMap[empID])
	}

	periodeData := "Semua Periode"
	if request.StartDate != "" && request.EndDate != "" {
		periodeData = request.StartDate + " s/d " + request.EndDate
	} else if request.StartDate != "" {
		periodeData = "Mulai " + request.StartDate
	} else if request.EndDate != "" {
		periodeData = "Sampai " + request.EndDate
	}

	file, err := excel.ExportVisitToExcel(sheets, periodeData)
	if err != nil {
		c.Log.WithError(err).Error("Gagal membuat file excel kunjungan")
		return nil, fiber.ErrInternalServerError
	}

	return file, nil
}

// formatVisitAt menggabungkan tanggal dan jam kunjungan menjadi "2006-01-02 15:04:05".
func formatVisitAt(detail *entity.VisitDetail) string {
	if detail == nil {
		return "-"
	}
	value := strings.TrimSpace(detail.DateVisit + " " + detail.VisitAt)
	if value == "" {
		return "-"
	}
	return value
}

// firstNonEmpty mengambil nilai dari detail IN, dan jatuh ke detail OUT bila kosong.
func firstNonEmpty(
	inDetail, outDetail *entity.VisitDetail,
	get func(*entity.VisitDetail) *string,
) *string {
	for _, detail := range []*entity.VisitDetail{inDetail, outDetail} {
		if detail == nil {
			continue
		}
		if value := get(detail); value != nil && strings.TrimSpace(*value) != "" {
			return value
		}
	}
	return nil
}
