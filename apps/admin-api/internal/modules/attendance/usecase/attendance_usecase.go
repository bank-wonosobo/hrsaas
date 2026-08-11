package usecase

import (
	"context"
	"errors"
	"fmt"
	"hrsaas-admin-api/internal/modules/attendance/entity"
	"hrsaas-admin-api/internal/modules/attendance/model"
	"hrsaas-admin-api/internal/modules/attendance/repository"
	employeeRepo "hrsaas-admin-api/internal/modules/employee/repository"
	userRepo "hrsaas-admin-api/internal/modules/user/repository"
	excel "hrsaas-admin-api/pkg/excel"
	upload "hrsaas-admin-api/pkg/upload"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
	"github.com/xuri/excelize/v2"
	"gorm.io/gorm"
)

type AttendanceUseCase struct {
	DB                   *gorm.DB
	Log                  *logrus.Logger
	Validate             *validator.Validate
	AttendanceRepository *repository.AttendanceRepository
	LocationRepository   *repository.OfficeLocationRepository
	ShiftRepository      *repository.ShiftRepository
	ShiftDayRepo         *repository.ShiftDayRepository
	AttendanceLogRepo    *repository.AttendanceLogRepository
	EmployeeRepository   *employeeRepo.EmployeeRepository
	UserRepository       *userRepo.UserRepository
	UploadUseCase        *upload.UploadUseCase
	FaceServiceURL       string
}

func NewAttendanceUseCase(
	db *gorm.DB,
	log *logrus.Logger,
	validate *validator.Validate,
	attendanceRepository *repository.AttendanceRepository,
	locationRepository *repository.OfficeLocationRepository,
	shiftRepository *repository.ShiftRepository,
	shiftDayRepo *repository.ShiftDayRepository,
	attendanceLogRepo *repository.AttendanceLogRepository,
	employeeRepository *employeeRepo.EmployeeRepository,
	userRepository *userRepo.UserRepository,
	uploadUseCase *upload.UploadUseCase,
	faceServiceURL string,
) *AttendanceUseCase {
	return &AttendanceUseCase{
		DB:                   db,
		Log:                  log,
		Validate:             validate,
		AttendanceRepository: attendanceRepository,
		LocationRepository:   locationRepository,
		ShiftRepository:      shiftRepository,
		ShiftDayRepo:         shiftDayRepo,
		AttendanceLogRepo:    attendanceLogRepo,
		EmployeeRepository:   employeeRepository,
		UserRepository:       userRepository,
		UploadUseCase:        uploadUseCase,
		FaceServiceURL:       faceServiceURL,
	}
}

func (c *AttendanceUseCase) Search(
	ctx context.Context,
	request *model.SearchAttendanceRequest,
) ([]model.AttendanceResponse, int64, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	if err := c.Validate.Struct(request); err != nil {
		c.Log.WithError(err).Error("error validating request body")
		return nil, 0, fiber.ErrBadRequest
	}

	attendances, total, err := c.AttendanceRepository.Search(tx, request)
	if err != nil {
		c.Log.WithError(err).Error("error getting attendances")
		return nil, 0, fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Failed to commit transaction")
		return nil, 0, fiber.ErrInternalServerError
	}

	responses := make([]model.AttendanceResponse, len(attendances))
	for i, attendance := range attendances {
		responses[i] = *model.AttendandeToResponse(&attendance)
	}

	return responses, total, nil
}

func (c *AttendanceUseCase) Export(
	ctx context.Context,
	request *model.SearchAttendanceRequest,
) (*excelize.File, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	if err := c.Validate.Struct(request); err != nil {
		c.Log.WithError(err).Error("error validating request body")
		return nil, fiber.ErrBadRequest
	}

	attendances, err := c.AttendanceRepository.SearchAll(tx, request)
	if err != nil {
		c.Log.WithError(err).Error("error getting attendances for export")
		return nil, fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Failed to commit transaction")
		return nil, fiber.ErrInternalServerError
	}

	employeeMap := make(map[string]*model.AttendanceSheet)
	for _, attendance := range attendances {
		empID := attendance.EmployeeID
		if _, exists := employeeMap[empID]; !exists {
			employeeMap[empID] = &model.AttendanceSheet{
				Name:  attendance.Employee.Fullname,
				Data:  []model.AttendanceRow{},
				Total: 0,
			}
		}

		status := attendance.Status
		if status == "" {
			status = "Belum Ada Status (TS)"
		}

		var lateCheckIn string = "-"
		if attendance.CheckInTime > 0 {
			tIn := time.UnixMilli(attendance.CheckInTime)
			expectedIn := time.Date(tIn.Year(), tIn.Month(), tIn.Day(), 7, 45, 0, 0, tIn.Location())
			diffIn := tIn.Sub(expectedIn)
			if diffIn > 0 {
				hours := int(diffIn.Hours())
				minutes := int(diffIn.Minutes()) % 60
				if hours > 0 || minutes > 0 {
					lateCheckIn = fmt.Sprintf("%02d jam %02d menit", hours, minutes)
				}
			}
		}

		var lateCheckOut string = "-"
		var catatan string
		if attendance.CheckOutTime > 0 {
			tOut := time.UnixMilli(attendance.CheckOutTime)
			hourOut := 17
			if tOut.Weekday() == time.Saturday {
				hourOut = 12
			}
			expectedOut := time.Date(
				tOut.Year(),
				tOut.Month(),
				tOut.Day(),
				hourOut,
				0,
				0,
				0,
				tOut.Location(),
			)
			diffOut := expectedOut.Sub(tOut)
			if diffOut > 0 {
				hours := int(diffOut.Hours())
				minutes := int(diffOut.Minutes()) % 60
				if hours > 0 || minutes > 0 {
					lateCheckOut = fmt.Sprintf("%02d jam %02d menit", hours, minutes)
				}
			}
		}

		row := model.AttendanceRow{
			No:           len(employeeMap[empID].Data) + 1,
			Date:         attendance.Date,
			Status:       status,
			CheckInTime:  attendance.CheckInTime,
			CheckOutTime: attendance.CheckOutTime,
			LateCheckIn:  lateCheckIn,
			LateCheckOut: lateCheckOut,
			Note:         catatan,
		}

		if status == "HADIR" || status == "TERLAMBAT" {
			employeeMap[empID].Total++
		}

		employeeMap[empID].Data = append(employeeMap[empID].Data, row)
	}

	var sheets []model.AttendanceSheet
	for _, sheet := range employeeMap {
		sheets = append(sheets, *sheet)
	}

	periodeData := "Semua Periode"
	if request.StartDate != "" && request.EndDate != "" {
		periodeData = request.StartDate + " s/d " + request.EndDate
	} else if request.Date != "" {
		periodeData = request.Date
	}

	file, err := excel.ExportAbsensiToExcel(sheets, periodeData)
	if err != nil {
		c.Log.WithError(err).Error("Failed to generate excel")
		return nil, fiber.ErrInternalServerError
	}

	return file, nil
}

func (c *AttendanceUseCase) SearchLog(
	ctx context.Context,
	request *model.SearchAttendanceLogRequest,
) ([]model.AttendanceLogResponse, int64, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	if err := c.Validate.Struct(request); err != nil {
		c.Log.WithError(err).Error("error validating request body")
		return nil, 0, fiber.ErrBadRequest
	}

	logs, total, err := c.AttendanceLogRepo.Search(tx, request)
	if err != nil {
		c.Log.WithError(err).Error("error getting attendance logs")
		return nil, 0, fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Failed to commit transaction")
		return nil, 0, fiber.ErrInternalServerError
	}

	responses := make([]model.AttendanceLogResponse, len(logs))
	for i, log := range logs {
		responses[i] = *model.AttendanceLogToResponse(&log)
	}

	return responses, total, nil
}

func (c *AttendanceUseCase) Detail(
	ctx context.Context,
	requestID string,
	companyID string,
) (*model.AttendanceResponse, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	attendance := new(entity.Attendance)
	if err := c.AttendanceRepository.FindByIdAndCompany(tx, attendance, requestID, companyID, "Employee", "Employee.EmployeeContract", "Employee.EmployeeContract.Position"); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fiber.NewError(fiber.StatusNotFound, "Attendance tidak ditemukan")
		}
		c.Log.WithError(err).Error("Failed to find attendance")
		return nil, fiber.ErrInternalServerError
	}

	logs, err := c.AttendanceLogRepo.FindByAttendanceID(tx, attendance.ID)
	if err != nil {
		c.Log.WithError(err).Error("Failed to find attendance logs")
		return nil, fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Failed to commit transaction")
		return nil, fiber.ErrInternalServerError
	}

	response := model.AttendandeToResponse(attendance)
	response.Logs = make([]model.AttendanceLogResponse, len(logs))
	for i, log := range logs {
		response.Logs[i] = *model.AttendanceLogToResponse(&log)
	}

	return response, nil
}

func (c *AttendanceUseCase) DetailToday(
	ctx context.Context,
	employeeID, companyId string,
) (*model.AttendanceResponse, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	attendance := new(entity.Attendance)
	today := time.Now().UnixMilli()

	if err := c.AttendanceRepository.FindByEmployeeIDAndDate(tx, attendance, employeeID, today); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fiber.NewError(fiber.StatusNotFound, "Belum ada absensi hari ini")
		}
		return nil, fiber.ErrInternalServerError
	}

	logs, err := c.AttendanceLogRepo.FindByAttendanceID(tx, attendance.ID)
	if err != nil {
		c.Log.WithError(err).Error("Failed to find attendance logs")
		return nil, fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Failed to commit transaction")
		return nil, fiber.ErrInternalServerError
	}

	response := model.AttendandeToResponse(attendance)
	response.Logs = make([]model.AttendanceLogResponse, len(logs))
	for i, log := range logs {
		response.Logs[i] = *model.AttendanceLogToResponse(&log)
	}

	return response, nil
}

func (c *AttendanceUseCase) Update(
	ctx context.Context,
	requestID string,
	companyID string,
	request *model.UpdateAttendanceRequest,
) (*model.AttendanceResponse, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	if err := c.Validate.Struct(request); err != nil {
		c.Log.WithError(err).Error("Failed to validate request body")
		return nil, fiber.ErrBadRequest
	}

	attendance := new(entity.Attendance)
	if err := c.AttendanceRepository.FindByIdAndCompany(tx, attendance, requestID, companyID, "Employee", "Employee.EmployeeContract", "Employee.EmployeeContract.Position"); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fiber.NewError(fiber.StatusNotFound, "Attendance tidak ditemukan")
		}
		c.Log.WithError(err).Error("Failed to find attendance")
		return nil, fiber.ErrInternalServerError
	}

	if request.Date != nil {
		attendance.Date = *request.Date
	}
	if request.CheckInTime != nil {
		attendance.CheckInTime = *request.CheckInTime
	}
	if request.CheckOutTime != nil {
		attendance.CheckOutTime = *request.CheckOutTime
	}
	if request.TotalWorkMinutes != nil {
		attendance.TotalWorkMinutes = *request.TotalWorkMinutes
	}
	if request.TotalBreakMinutes != nil {
		attendance.TotalBreakMinutes = *request.TotalBreakMinutes
	}
	if request.Status != nil {
		attendance.Status = *request.Status
	}
	if err := c.AttendanceRepository.Update(tx, attendance); err != nil {
		c.Log.WithError(err).Error("Failed to update attendance")
		return nil, fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Failed to commit transaction")
		return nil, fiber.ErrInternalServerError
	}

	return model.AttendandeToResponse(attendance), nil
}

func (c *AttendanceUseCase) Delete(ctx context.Context, requestID string, companyID string) error {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	attendance := new(entity.Attendance)
	if err := c.AttendanceRepository.FindByIdAndCompany(tx, attendance, requestID, companyID); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fiber.NewError(fiber.StatusNotFound, "Attendance tidak ditemukan")
		}
		c.Log.WithError(err).Error("Failed to find attendance")
		return fiber.ErrInternalServerError
	}

	if err := c.AttendanceLogRepo.DeleteByAttendanceID(tx, attendance.ID); err != nil {
		c.Log.WithError(err).Error("Failed to delete attendance logs")
		return fiber.ErrInternalServerError
	}

	if err := c.AttendanceRepository.Delete(tx, attendance); err != nil {
		c.Log.WithError(err).Error("Failed to delete attendance")
		return fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Failed to commit transaction")
		return fiber.ErrInternalServerError
	}

	return nil
}
