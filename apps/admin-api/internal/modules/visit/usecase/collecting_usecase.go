package usecase

import (
	"context"
	employeeEntity "hrsaas-admin-api/internal/modules/employee/entity"
	employeeRepo "hrsaas-admin-api/internal/modules/employee/repository"
	"hrsaas-admin-api/internal/modules/visit/entity"
	"hrsaas-admin-api/internal/modules/visit/model"
	"hrsaas-admin-api/internal/modules/visit/repository"
	"hrsaas-admin-api/pkg/excel"
	pkg "hrsaas-admin-api/pkg/s3"

	"time"

	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
	"github.com/xuri/excelize/v2"
	"gorm.io/gorm"
)

type CollectingUseCase struct {
	DB                      *gorm.DB
	Log                     *logrus.Logger
	Validate                *validator.Validate
	RemidialVisitRepository *repository.CollectingRepository
	EmployeeRepository      *employeeRepo.EmployeeRepository
	S3Client                *pkg.S3Client
}

func NewCollectingUseCase(
	db *gorm.DB,
	log *logrus.Logger,
	validate *validator.Validate,
	remidialVisitRepo *repository.CollectingRepository,
	employeeRepo *employeeRepo.EmployeeRepository,
	s3 *pkg.S3Client,
) *CollectingUseCase {
	return &CollectingUseCase{
		DB:                      db,
		Log:                     log,
		Validate:                validate,
		RemidialVisitRepository: remidialVisitRepo,
		EmployeeRepository:      employeeRepo,
		S3Client:                s3,
	}
}

func (c *CollectingUseCase) SearchNasabah(ctx context.Context, request *model.SearchNasabahRequest) ([]model.SearchNasabahResponse, error) {
	if err := c.Validate.Struct(request); err != nil {
		c.Log.WithError(err).Error("Failed to validate request body")
		return nil, fiber.ErrBadRequest
	}

	data, err := c.RemidialVisitRepository.SearchNasabah(ctx, request)
	if err != nil {
		return nil, err
	}

	var responses []model.SearchNasabahResponse
	for _, nasabah := range data {
		responses = append(responses, model.SearchNasabahResponse{
			BranchCode:                nasabah.KodeCabang,
			NoPjm:                     nasabah.NoPjm,
			NasabahID:                 nasabah.NasabahID,
			NasabahName:               nasabah.Nama,
			NIK:                       nasabah.NIK,
			PlaceOfBirth:              nasabah.TmpLahir,
			DateOfBirth:               nasabah.TglLahir,
			Address:                   nasabah.Alamat,
			Phone:                     nasabah.Phone,
			Email:                     nasabah.Email,
			LoanType:                  nasabah.JnsPjm,
			Unit:                      nasabah.Unit,
			Collectibility:            nasabah.Col,
			LoanLimit:                 nasabah.Plafond,
			OutstandingBalance:        nasabah.Saldo,
			OverduePrincipal:          nasabah.TunggakanPokok,
			OverdueInterest:           nasabah.TunggakanBunga,
			OverdueTotal:              nasabah.TunggakanTotal,
			OverduePrincipalFrequency: nasabah.TunggakanPokokFrek,
			OverdueInterestFrequency:  nasabah.TunggakanBungaFrek,
			OverduePrincipalDays:      nasabah.TunggakanPokokHari,
			OverdueInterestDays:       nasabah.TunggakanBungaHari,
			LoanStatus:                nasabah.StatusPinjaman,
		})
	}

	return responses, nil
}

func (c *CollectingUseCase) Create(ctx context.Context, request *model.CreateRemidialVisitRequest) (*model.RemidialVisitResponse, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	if err := c.Validate.Struct(request); err != nil {
		c.Log.WithError(err).Error("Failed to validate request body")
		return nil, fiber.ErrBadRequest
	}

	visit := &entity.RemidialVisit{
		CompanyID:                 request.CompanyID,
		EmployeeID:                request.EmployeeID,
		Img_Url:                   request.ImgUrl,
		Latitude:                  request.Lat,
		Longitude:                 request.Lng,
		NasabahID:                 request.Pinjaman.NasabahID,
		NasabahName:               request.Pinjaman.NasabahName,
		NoPjm:                     request.Pinjaman.NoPjm,
		LoanType:                  request.Pinjaman.LoanType,
		Unit:                      request.Pinjaman.Unit,
		Collectibility:            request.Pinjaman.Collectibility,
		LoanLimit:                 request.Pinjaman.LoanLimit,
		OutstandingBalance:        request.Pinjaman.OutstandingBalance,
		OverduePrincipal:          request.Pinjaman.OverduePrincipal,
		OverdueInterest:           request.Pinjaman.OverdueInterest,
		OverdueTotal:              request.Pinjaman.OverdueTotal,
		OverduePrincipalFrequency: request.Pinjaman.OverduePrincipalFrequency,
		OverdueInterestFrequency:  request.Pinjaman.OverdueInterestFrequency,
		OverduePrincipalDays:      request.Pinjaman.OverduePrincipalDays,
		OverdueInterestDays:       request.Pinjaman.OverdueInterestDays,
		LoanStatus:                request.Pinjaman.LoanStatus,
		TotalPaid:                 request.TotalPaid,
		Commitment:                request.Commitment,
	}

	if err := c.RemidialVisitRepository.Create(tx, visit); err != nil {
		c.Log.WithError(err).Error("Failed to create remidial visit")
		return nil, fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Failed to commit transaction")
		return nil, fiber.ErrInternalServerError
	}

	return c.toResponse(ctx, visit), nil
}

func (c *CollectingUseCase) List(ctx context.Context, request *model.SearchRemidialVisitRequest) ([]model.RemidialVisitResponse, int64, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	if err := c.Validate.Struct(request); err != nil {
		c.Log.WithError(err).Error("Failed to validate request body")
		return nil, 0, fiber.ErrBadRequest
	}

	items, total, err := c.RemidialVisitRepository.List(tx, request)
	if err != nil {
		c.Log.WithError(err).Error("Failed to get list of remidial visits")
		return nil, 0, fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Failed to commit transaction")
		return nil, 0, fiber.ErrInternalServerError
	}

	responses := make([]model.RemidialVisitResponse, len(items))
	presignUrl := s3.NewPresignClient(c.S3Client.Client)
	for i, item := range items {
		url, err := c.S3Client.GenerateDownloadURL(presignUrl, items[i].Img_Url)
		if err != nil {
			return nil, 0, err
		}
		item.Img_Url = url
		responses[i] = *c.toResponse(ctx, &item)
	}

	return responses, total, nil
}

func (c *CollectingUseCase) ExportToExcel(
	ctx context.Context,
	request *model.SearchRemidialVisitRequest,
) (*excelize.File, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	if err := c.Validate.Struct(request); err != nil {
		c.Log.WithError(err).Error("Failed to validate request body")
		return nil, fiber.ErrBadRequest
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

	items, _, err := c.RemidialVisitRepository.List(tx, request)
	if err != nil {
		c.Log.WithError(err).Error("Failed to get remidial visits for export")
		return nil, fiber.ErrInternalServerError
	}

	employeeNames, err := c.employeeNames(tx, items)
	if err != nil {
		c.Log.WithError(err).Error("Failed to get employee names for export")
		return nil, fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Failed to commit transaction")
		return nil, fiber.ErrInternalServerError
	}

	employeeMap := make(map[string]*model.CollectingSheet)
	employeeOrder := make([]string, 0, len(items))
	for _, visit := range items {
		empID := visit.EmployeeID
		employeeName := employeeNames[empID]
		if employeeName == "" {
			employeeName = "Tanpa Nama"
		}

		if _, exists := employeeMap[empID]; !exists {
			employeeMap[empID] = &model.CollectingSheet{
				Name:      employeeName,
				Data:      []model.ExportCollectingResponse{},
				Total:     0,
				TotalPaid: 0,
			}
			employeeOrder = append(employeeOrder, empID)
		}

		row := model.ExportCollectingResponse{
			EmployeeName:       employeeName,
			Date:               visit.CreatedAt,
			NasabahName:        visit.NasabahName,
			NoPjm:              visit.NoPjm,
			Collectibility:     visit.Collectibility,
			OutstandingBalance: visit.OutstandingBalance,
			OverdueTotal:       visit.OverdueTotal,
			TotalPaid:          visit.TotalPaid,
			Commitment:         visit.Commitment,
		}

		employeeMap[empID].Data = append(employeeMap[empID].Data, row)
		employeeMap[empID].Total++
		employeeMap[empID].TotalPaid += visit.TotalPaid
	}

	sheets := make([]model.CollectingSheet, 0, len(employeeOrder))
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

	file, err := excel.ExportCreditCollectionToExcel(sheets, periodeData)
	if err != nil {
		c.Log.WithError(err).Error("Failed to generate excel")
		return nil, fiber.ErrInternalServerError
	}

	return file, nil
}

// employeeNames mengambil nama karyawan sekaligus agar export tidak query per baris.
func (c *CollectingUseCase) employeeNames(
	tx *gorm.DB,
	visits []entity.RemidialVisit,
) (map[string]string, error) {
	names := make(map[string]string)

	ids := make([]string, 0, len(visits))
	for _, visit := range visits {
		if visit.EmployeeID == "" {
			continue
		}
		if _, exists := names[visit.EmployeeID]; exists {
			continue
		}
		names[visit.EmployeeID] = ""
		ids = append(ids, visit.EmployeeID)
	}
	if len(ids) == 0 {
		return names, nil
	}

	var employees []employeeEntity.Employee
	if err := tx.Where("id IN ?", ids).Find(&employees).Error; err != nil {
		return nil, err
	}
	for _, employee := range employees {
		names[employee.ID] = employee.Fullname
	}

	return names, nil
}

func (c *CollectingUseCase) toResponse(ctx context.Context, visit *entity.RemidialVisit) *model.RemidialVisitResponse {
	var employeeName string
	employee := new(employeeEntity.Employee)
	if err := c.EmployeeRepository.FindByIdAndCompany(c.DB.WithContext(ctx), employee, visit.EmployeeID, visit.CompanyID); err == nil {
		employeeName = employee.Fullname
	}

	return &model.RemidialVisitResponse{
		ID:           visit.ID,
		CompanyID:    visit.CompanyID,
		EmployeeID:   visit.EmployeeID,
		EmployeeName: employeeName,
		ImgUrl:       visit.Img_Url,
		Lat:          visit.Latitude,
		Lng:          visit.Longitude,
		Pinjaman: model.DetailPinjamanResponse{
			NasabahID:                 visit.NasabahID,
			NasabahName:               visit.NasabahName,
			NoPjm:                     visit.NoPjm,
			LoanType:                  visit.LoanType,
			Unit:                      visit.Unit,
			Collectibility:            visit.Collectibility,
			LoanLimit:                 visit.LoanLimit,
			OutstandingBalance:        visit.OutstandingBalance,
			OverduePrincipal:          visit.OverduePrincipal,
			OverdueInterest:           visit.OverdueInterest,
			OverdueTotal:              visit.OverdueTotal,
			OverduePrincipalFrequency: visit.OverduePrincipalFrequency,
			OverdueInterestFrequency:  visit.OverdueInterestFrequency,
			OverduePrincipalDays:      visit.OverduePrincipalDays,
			OverdueInterestDays:       visit.OverdueInterestDays,
			LoanStatus:                visit.LoanStatus,
		},
		TotalPaid:  visit.TotalPaid,
		Commitment: visit.Commitment,
		CreatedAt:  visit.CreatedAt,
	}
}

func (c *CollectingUseCase) Update(ctx context.Context, request *model.UpdateRemidialVisitRequest) (*model.RemidialVisitResponse, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	if err := c.Validate.Struct(request); err != nil {
		c.Log.WithError(err).Error("Failed to validate request body")
		return nil, fiber.ErrBadRequest
	}

	visit := new(entity.RemidialVisit)
	if err := c.RemidialVisitRepository.FindById(tx, visit, request.ID); err != nil {
		c.Log.WithError(err).Error("Remidial visit not found")
		return nil, fiber.ErrNotFound
	}

	visit.Img_Url = request.ImgUrl
	visit.Latitude = request.Lat
	visit.Longitude = request.Lng
	visit.TotalPaid = request.TotalPaid
	visit.Commitment = request.Commitment

	if err := c.RemidialVisitRepository.Update(tx, visit); err != nil {
		c.Log.WithError(err).Error("Failed to update remidial visit")
		return nil, fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Failed to commit transaction")
		return nil, fiber.ErrInternalServerError
	}

	return c.toResponse(ctx, visit), nil
}

func (c *CollectingUseCase) Delete(ctx context.Context, id string) error {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	visit := new(entity.RemidialVisit)
	if err := c.RemidialVisitRepository.FindById(tx, visit, id); err != nil {
		c.Log.WithError(err).Error("Kunjungan tidak ditemukan")
		return fiber.ErrNotFound
	}

	if err := c.RemidialVisitRepository.Delete(tx, visit); err != nil {
		c.Log.WithError(err).Error("Gagal menghapus kunjungan")
		return fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Gagal menyelesaikan transaksi")
		return fiber.ErrInternalServerError
	}

	return nil
}
