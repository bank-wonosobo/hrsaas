package usecase

import (
	"context"
	"errors"
	"fmt"
	"io"
	"math"
	"strconv"

	"hrsaas/internal/modules/attendance/entity"
	"hrsaas/internal/modules/attendance/model"
	"hrsaas/internal/modules/attendance/repository"
	employeeEntity "hrsaas/internal/modules/employee/entity"
	employeeRepo "hrsaas/internal/modules/employee/repository"
	"hrsaas/internal/modules/upload"
	userEntity "hrsaas/internal/modules/user/entity"
	userRepo "hrsaas/internal/modules/user/repository"
	distances "hrsaas/pkg/distance"
	excel "hrsaas/pkg/excel"
	face "hrsaas/pkg/face_recognition"
	timedifference "hrsaas/pkg/time_difference"

	"mime/multipart"
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

func (c *AttendanceUseCase) RegisterFace(
	ctx context.Context,
	request *model.RegisterFaceRequest,
) (*model.RegisterFaceResponse, error) {
	if err := c.Validate.Struct(request); err != nil {
		c.Log.WithError(err).Error("Failed to validate request body")
		return nil, fiber.ErrBadRequest
	}

	employee := new(employeeEntity.Employee)
	if err := c.EmployeeRepository.FindByUserIdAndCompany(c.DB.WithContext(ctx), employee, request.UserId, request.CompanyID); err != nil {
		c.Log.WithError(err).Error("Failed to find employee by user ID")
		return nil, fiber.ErrNotFound
	}

	// get image

	// s3 usage
	image, err := c.UploadUseCase.S3Client.GetObjectBytes(request.ObjectKey, true)
	if err != nil {
		return nil, err
	}

	//
	// image, err := readMultipart(request.File)
	// if err != nil {
	// 	c.Log.WithError(err).Error("Failed to read face image")
	// 	return nil, fiber.ErrBadRequest
	// }

	// image, err = resizeImage(image, 1080) // compress dulu
	// if err != nil {
	// 	c.Log.WithError(err).Error("Failed to resize image")
	// 	return nil, fiber.ErrBadRequest
	// }

	if err := face.RegisterFace(c.FaceServiceURL+"/register", employee.ID, request.ObjectKey, image); err != nil {
		c.Log.WithError(err).Error("Failed to register face")
		return nil, fiber.NewError(fiber.StatusBadGateway, "Gagal mendaftarkan wajah")
	}

	if err != nil {
		c.Log.WithError(err).Error("Failed to upload face image")
		return nil, fiber.NewError(fiber.StatusInternalServerError, "Gagal mengunggah wajah")
	}

	user := new(userEntity.User)
	if err := c.UserRepository.FindById(c.DB.WithContext(ctx), user, employee.UserID); err != nil {
		c.Log.WithError(err).Error("Failed to find user")
		return nil, fiber.NewError(fiber.StatusInternalServerError, "Gagal menemukan data user")
	}

	imageUrl := c.UploadUseCase.S3Client.GetPublicURL(request.ObjectKey)
	user.Image = &imageUrl

	if err := c.UserRepository.Update(c.DB.WithContext(ctx), user); err != nil {
		c.Log.WithError(err).Error("Failed to update user image")
		return nil, fiber.NewError(fiber.StatusInternalServerError, "Gagal memperbarui data user")
	}

	return &model.RegisterFaceResponse{
		EmployeeID:   employee.ID,
		FaceImageURL: imageUrl,
	}, nil
}

func (c *AttendanceUseCase) FaceStatus(
	ctx context.Context,
	userID, companyID string,
) (*model.FaceStatusResponse, error) {
	employee := new(employeeEntity.Employee)
	if err := c.EmployeeRepository.FindByUserIdAndCompany(c.DB.WithContext(ctx), employee, userID, companyID); err != nil {
		c.Log.WithError(err).Error("Failed to find employee by ID")
		return nil, fiber.ErrNotFound
	}

	result := face.CheckFaceExistence(c.FaceServiceURL+"/check-exists", employee.ID)
	return &model.FaceStatusResponse{
		EmployeeID: employee.ID,
		Registered: result.Registered,
	}, nil
}

func (c *AttendanceUseCase) DeleteFace(ctx context.Context, UserID, companyID string) error {
	employee := new(employeeEntity.Employee)
	if err := c.EmployeeRepository.FindByUserIdAndCompany(c.DB.WithContext(ctx), employee, UserID, companyID); err != nil {
		c.Log.WithError(err).Error("Failed to find employee by ID")
		return fiber.ErrNotFound
	}

	if err := face.DeleteFace(c.FaceServiceURL+"/delete", employee.ID); err != nil {
		c.Log.WithError(err).Error("Failed to delete face")
		return fiber.NewError(fiber.StatusBadGateway, "Gagal menghapus wajah")
	}

	return nil
}

func (c *AttendanceUseCase) uploadFace(
	ctx context.Context,
	file *multipart.FileHeader,
) (string, error) {
	uploaded, err := c.UploadUseCase.Upload(ctx, &upload.UploadRequest{File: file})
	if err != nil {
		c.Log.WithError(err).Error("Failed to upload face image")
		return "", err
	}
	return uploaded.Url, nil
}

func readMultipart(file *multipart.FileHeader) ([]byte, error) {
	src, err := file.Open()
	if err != nil {
		return nil, err
	}
	defer src.Close()
	return io.ReadAll(src)
}

func (c *AttendanceUseCase) verifyAndStoreFace(
	ctx context.Context,
	employeeID string,
	file *multipart.FileHeader,
) (string, *face.FaceRecognizeResponse, error) {
	image, err := readMultipart(file)
	if err != nil {
		c.Log.WithError(err).Error("Failed to read face image")
		return "", nil, fiber.ErrBadRequest
	}

	result, err := face.RecognizeFace(
		c.FaceServiceURL+"/recognize",
		employeeID,
		file.Filename,
		image,
	)
	if err != nil {
		c.Log.WithError(err).Error("Failed to recognize face")
		return "", nil, fiber.NewError(
			fiber.StatusInternalServerError,
			"Gagal memverifikasi wajah !",
		)
	}

	if !result.Match {
		return "", result, nil
	}

	uploadURL, err := c.uploadFace(ctx, file)
	if err != nil {
		c.Log.WithError(err).Error("Failed to upload face image")
		return "", nil, fiber.NewError(fiber.StatusInternalServerError, "Gagal menyimpan wajah !")
	}

	return uploadURL, result, nil
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
			diffStr, _ := timedifference.GetTimeDifference("07:45:00", tIn.Format("15:04:05"))
			if diffStr != "" {
				lateCheckIn = diffStr
			}
		}

		var lateCheckOut string = "-"
		var catatan string
		if attendance.CheckOutTime > 0 {
			tOut := time.UnixMilli(attendance.CheckOutTime)
			expectedOutStr := "17:00:00"
			if tOut.Weekday() == time.Saturday {
				expectedOutStr = "12:00:00"
			}
			diffStr, _ := timedifference.GetTimeDifference(tOut.Format("15:04:05"), expectedOutStr)
			if diffStr != "" {
				lateCheckOut = diffStr
			}
		}

		if attendance.TotalBreakMinutes > 60 {
			catatan = fmt.Sprintf(
				"Jam istirahat terlampau: %d menit",
				attendance.TotalBreakMinutes-60,
			)
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

func (c *AttendanceUseCase) CheckIn(
	ctx context.Context,
	request *model.CheckInAttendanceRequest,
) (*model.AttendanceResponse, error) {
	if request.EmployeeID == "" {
		return nil, fiber.NewError(400, "User tidak bisa melakukan check-in karena bukan karyawan")
	}

	if err := c.Validate.Struct(request); err != nil {
		c.Log.WithError(err).Error("Failed to validate check in request")
		return nil, fiber.ErrBadRequest
	}

	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	distance, isLocationVerified, err := c.verifyCheckInLocation(tx, request)
	if err != nil {
		return nil, err
	}

	now := time.Now()

	attendance := new(entity.Attendance)
	err = c.AttendanceRepository.FindByEmployeeIDAndDate(
		tx, attendance, request.EmployeeID, now.UnixMilli(),
	)
	isCheckOut := err == nil
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		c.Log.WithError(err).Error("Failed to find today attendance")
		return nil, fiber.ErrInternalServerError
	}
	if isCheckOut && attendance.CheckOutTime > 0 {
		return nil, fiber.NewError(fiber.StatusConflict, "Anda sudah melakukan check-out hari ini")
	}

	faceImageURL, err := c.UploadUseCase.SaveToS3(ctx, request.File)
	if err != nil {
		c.Log.WithError(err).Error("Failed to upload check in selfie")
		return nil, fiber.ErrInternalServerError
	}

	logType := "CHECK_IN"
	if isCheckOut {
		logType = "CHECK_OUT"
		attendance.CheckOutTime = now.UnixMilli()
		attendance.TotalWorkMinutes = int(
			(attendance.CheckOutTime - attendance.CheckInTime) / 60000,
		)

		if err := c.AttendanceRepository.Update(tx, attendance); err != nil {
			c.Log.WithError(err).Error("Failed to update attendance on check out")
			return nil, fiber.ErrInternalServerError
		}
	} else {
		status, err := c.resolveCheckInStatus(tx, request.EmployeeID, now)
		if err != nil {
			return nil, err
		}

		startOfDay := time.Date(
			now.Year(), now.Month(), now.Day(),
			0, 0, 0, 0,
			now.Location(),
		).UnixMilli()

		attendance = &entity.Attendance{
			CompanyID:   request.CompanyID,
			EmployeeID:  request.EmployeeID,
			Date:        startOfDay,
			CheckInTime: now.UnixMilli(),
			Status:      status,
			CreatedAt:   now.UnixMilli(),
			UpdatedAt:   now.UnixMilli(),
		}

		if err := c.AttendanceRepository.Create(tx, attendance); err != nil {
			c.Log.WithError(err).Error("Failed to create attendance on check in")
			return nil, fiber.ErrInternalServerError
		}
	}

	attendanceLog := &entity.AttendanceLog{
		AttendanceID:       attendance.ID,
		Type:               logType,
		Time:               now.UnixMilli(),
		Lat:                request.Lat,
		Lng:                request.Lng,
		LocationDistance:   distance,
		IsLocationVerified: isLocationVerified,
		FaceImageURL:       *faceImageURL,
		IsApproved:         isLocationVerified,
		DeviceInfo:         request.DeviceInfo,
	}

	if err := c.AttendanceLogRepo.Create(tx, attendanceLog); err != nil {
		c.Log.WithError(err).Error("Failed to create attendance log")
		return nil, fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Failed to commit transaction")
		return nil, fiber.ErrInternalServerError
	}

	return c.DetailToday(ctx, request.EmployeeID, request.CompanyID)
}

func (c *AttendanceUseCase) CheckOut(
	ctx context.Context,
	request *model.CheckInAttendanceRequest,
) (*model.AttendanceResponse, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	if request.EmployeeID == "" {
		return nil, fiber.NewError(400, "User tidak bisa melakukan check-out karena bukan karyawan")
	}

	if err := c.Validate.Struct(request); err != nil {
		c.Log.WithError(err).Error("Failed to validate request body")
		return nil, fiber.ErrBadRequest
	}

	now := time.Now()
	nowMilli := now.UnixMilli()

	var attendance entity.Attendance
	err := c.AttendanceRepository.FindByEmployeeIDAndDate(
		tx,
		&attendance,
		request.EmployeeID,
		nowMilli,
	)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fiber.NewError(fiber.StatusBadRequest, "Belum check-in hari ini")
		}
		return nil, fiber.ErrInternalServerError
	}

	if attendance.CheckOutTime != 0 {
		return nil, fiber.NewError(fiber.StatusBadRequest, "Sudah check-out hari ini")
	}

	isInRange := false
	locationDistance := 0.0
	locations, err := c.LocationRepository.GetByEmployeeID(tx, request.EmployeeID)
	if err != nil {
		return nil, fiber.ErrInternalServerError
	}

	for _, location := range locations {
		lat, err := strconv.ParseFloat(location.Lat, 64)
		if err != nil {
			continue
		}
		lng, err := strconv.ParseFloat(location.Lng, 64)
		if err != nil {
			continue
		}
		distance := distances.DistanceMeter(request.Lat, request.Lng, lat, lng)
		if distance <= float64(location.Radius) {
			isInRange = true
			locationDistance = distance
			break
		}
	}

	isApproved := isInRange

	faceImageURL, faceResult, err := c.verifyAndStoreFace(ctx, request.EmployeeID, request.File)
	if err != nil {
		return nil, err
	}
	if !faceResult.Match {
		return nil, fiber.NewError(fiber.StatusBadRequest, faceResult.Message)
	}

	attendance.CheckOutTime = nowMilli

	checkInTime := time.UnixMilli(attendance.CheckInTime)
	totalWorkMinutes := max(int(now.Sub(checkInTime).Minutes())-attendance.TotalBreakMinutes, 0)
	attendance.TotalWorkMinutes = totalWorkMinutes

	if err := c.AttendanceRepository.Update(tx, &attendance); err != nil {
		c.Log.WithError(err).Error("Failed to update attendance")
		return nil, fiber.ErrInternalServerError
	}

	attendanceLog := &entity.AttendanceLog{
		AttendanceID:       attendance.ID,
		Type:               "CHECK_OUT",
		Time:               nowMilli,
		Lat:                request.Lat,
		Lng:                request.Lng,
		LocationDistance:   locationDistance,
		IsLocationVerified: isInRange,
		IsFaceVerified:     faceResult.Match,
		// FaceConfidence:     0, // Python /recognize belum mengembalikan confidence
		FaceImageURL: faceImageURL,
		DeviceInfo:   request.DeviceInfo,
		IsApproved:   isApproved,
	}

	if err := c.AttendanceLogRepo.Create(tx, attendanceLog); err != nil {
		c.Log.WithError(err).Error("Failed to create attendance log")
		return nil, fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Failed to commit transaction")
		return nil, fiber.ErrInternalServerError
	}

	return model.AttendandeToResponse(&attendance), nil
}

func (c *AttendanceUseCase) BreakIn(
	ctx context.Context,
	request *model.CheckInAttendanceRequest,
) (*model.AttendanceResponse, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	if request.EmployeeID == "" {
		return nil, fiber.NewError(400, "User tidak bisa melakukan break-in karena bukan karyawan")
	}

	if err := c.Validate.Struct(request); err != nil {
		c.Log.WithError(err).Error("Failed to validate request body")
		return nil, fiber.ErrBadRequest
	}

	nowMilli := time.Now().UnixMilli()

	var attendance entity.Attendance
	if err := c.AttendanceRepository.FindByEmployeeIDAndDate(tx, &attendance, request.EmployeeID, nowMilli); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fiber.NewError(fiber.StatusBadRequest, "Belum check-in hari ini")
		}
		return nil, fiber.ErrInternalServerError
	}

	if attendance.CheckOutTime != 0 {
		return nil, fiber.NewError(fiber.StatusBadRequest, "Sudah check-out, tidak bisa break-in")
	}

	breakInCount, err := c.AttendanceLogRepo.CountByAttendanceIDAndType(
		tx,
		attendance.ID,
		"BREAK_IN",
	)
	if err != nil {
		return nil, fiber.ErrInternalServerError
	}
	breakOutCount, err := c.AttendanceLogRepo.CountByAttendanceIDAndType(
		tx,
		attendance.ID,
		"BREAK_OUT",
	)
	if err != nil {
		return nil, fiber.ErrInternalServerError
	}
	if breakInCount > breakOutCount {
		return nil, fiber.NewError(fiber.StatusBadRequest, "Sedang dalam break")
	}

	// if !request.IsAllowed {
	// 	return nil, fiber.NewError(400, "Anda tidak diizinkan melakukan break-in disini")
	// }

	isInRange := false
	locationDistance := 0.0
	locations, err := c.LocationRepository.GetByEmployeeID(tx, request.EmployeeID)
	if err != nil {
		return nil, fiber.ErrInternalServerError
	}

	for _, location := range locations {
		lat, err := strconv.ParseFloat(location.Lat, 64)
		if err != nil {
			continue
		}
		lng, err := strconv.ParseFloat(location.Lng, 64)
		if err != nil {
			continue
		}
		distance := distances.DistanceMeter(request.Lat, request.Lng, lat, lng)
		if distance <= float64(location.Radius) {
			isInRange = true
			locationDistance = distance
			break
		}
	}

	isApproved := isInRange

	faceImageURL, err := c.uploadFace(ctx, request.File)
	if err != nil {
		return nil, err
	}

	attendanceLog := &entity.AttendanceLog{
		AttendanceID:       attendance.ID,
		Type:               "BREAK_IN",
		Time:               nowMilli,
		Lat:                request.Lat,
		Lng:                request.Lng,
		LocationDistance:   locationDistance,
		IsLocationVerified: isInRange,
		IsFaceVerified:     false,
		FaceConfidence:     0,
		FaceImageURL:       faceImageURL,
		DeviceInfo:         request.DeviceInfo,
		IsApproved:         isApproved,
	}

	if err := c.AttendanceLogRepo.Create(tx, attendanceLog); err != nil {
		c.Log.WithError(err).Error("Failed to create attendance log")
		return nil, fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Failed to commit transaction")
		return nil, fiber.ErrInternalServerError
	}

	return model.AttendandeToResponse(&attendance), nil
}

func (c *AttendanceUseCase) BreakOut(
	ctx context.Context,
	request *model.CheckInAttendanceRequest,
) (*model.AttendanceResponse, error) {
	tx := c.DB.WithContext(ctx).Begin()
	defer tx.Rollback()

	if request.EmployeeID == "" {
		return nil, fiber.NewError(400, "User tidak bisa melakukan break-out karena bukan karyawan")
	}

	if err := c.Validate.Struct(request); err != nil {
		c.Log.WithError(err).Error("Failed to validate request body")
		return nil, fiber.ErrBadRequest
	}

	now := time.Now()
	nowMilli := now.UnixMilli()

	var attendance entity.Attendance
	if err := c.AttendanceRepository.FindByEmployeeIDAndDate(tx, &attendance, request.EmployeeID, nowMilli); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fiber.NewError(fiber.StatusBadRequest, "Belum check-in hari ini")
		}
		return nil, fiber.ErrInternalServerError
	}

	if attendance.CheckOutTime != 0 {
		return nil, fiber.NewError(fiber.StatusBadRequest, "Sudah check-out, tidak bisa break-out")
	}

	breakInCount, err := c.AttendanceLogRepo.CountByAttendanceIDAndType(
		tx,
		attendance.ID,
		"BREAK_IN",
	)
	if err != nil {
		return nil, fiber.ErrInternalServerError
	}
	breakOutCount, err := c.AttendanceLogRepo.CountByAttendanceIDAndType(
		tx,
		attendance.ID,
		"BREAK_OUT",
	)
	if err != nil {
		return nil, fiber.ErrInternalServerError
	}
	if breakInCount == breakOutCount {
		return nil, fiber.NewError(fiber.StatusBadRequest, "Belum break-in")
	}

	var lastBreakIn entity.AttendanceLog
	if err := c.AttendanceLogRepo.FindLastByAttendanceIDAndType(tx, &lastBreakIn, attendance.ID, "BREAK_IN"); err != nil {
		return nil, fiber.ErrInternalServerError
	}

	// if !request.IsAllowed {
	// 	return nil, fiber.NewError(400, "Anda tidak diizinkan melakukan break-out disini")
	// }

	isInRange := false
	locationDistance := 0.0
	locations, err := c.LocationRepository.GetByEmployeeID(tx, request.EmployeeID)
	if err != nil {
		return nil, fiber.ErrInternalServerError
	}

	for _, location := range locations {
		lat, err := strconv.ParseFloat(location.Lat, 64)
		if err != nil {
			continue
		}
		lng, err := strconv.ParseFloat(location.Lng, 64)
		if err != nil {
			continue
		}
		distance := distances.DistanceMeter(request.Lat, request.Lng, lat, lng)
		if distance <= float64(location.Radius) {
			isInRange = true
			locationDistance = distance
			break
		}
	}

	isApproved := isInRange

	breakDuration := int(now.Sub(time.UnixMilli(lastBreakIn.Time)).Minutes())
	attendance.TotalBreakMinutes += breakDuration

	if err := c.AttendanceRepository.Update(tx, &attendance); err != nil {
		c.Log.WithError(err).Error("Failed to update attendance")
		return nil, fiber.ErrInternalServerError
	}

	faceImageURL, err := c.uploadFace(ctx, request.File)
	if err != nil {
		return nil, err
	}

	attendanceLog := &entity.AttendanceLog{
		AttendanceID:       attendance.ID,
		Type:               "BREAK_OUT",
		Time:               nowMilli,
		Lat:                request.Lat,
		Lng:                request.Lng,
		LocationDistance:   locationDistance,
		IsLocationVerified: isInRange,
		IsFaceVerified:     false,
		FaceConfidence:     0,
		FaceImageURL:       faceImageURL,
		DeviceInfo:         request.DeviceInfo,
		IsApproved:         isApproved,
	}

	if err := c.AttendanceLogRepo.Create(tx, attendanceLog); err != nil {
		c.Log.WithError(err).Error("Failed to create attendance log")
		return nil, fiber.ErrInternalServerError
	}

	if err := tx.Commit().Error; err != nil {
		c.Log.WithError(err).Error("Failed to commit transaction")
		return nil, fiber.ErrInternalServerError
	}

	return model.AttendandeToResponse(&attendance), nil
}

func (c *AttendanceUseCase) verifyCheckInLocation(
	tx *gorm.DB,
	request *model.CheckInAttendanceRequest,
) (float64, bool, error) {
	locations, err := c.LocationRepository.GetByEmployeeID(tx, request.EmployeeID)
	if err != nil {
		c.Log.WithError(err).Error("Failed to find employee office locations")
		return 0, false, fiber.ErrInternalServerError
	}
	if len(locations) == 0 {
		return 0, false, fiber.NewError(
			fiber.StatusBadRequest,
			"Karyawan belum memiliki lokasi kantor",
		)
	}

	nearest := math.MaxFloat64
	verified := false

	for _, location := range locations {
		lat, err := strconv.ParseFloat(location.Lat, 64)
		if err != nil {
			continue
		}
		lng, err := strconv.ParseFloat(location.Lng, 64)
		if err != nil {
			continue
		}

		distance := distances.DistanceMeter(request.Lat, request.Lng, lat, lng)
		if distance < nearest {
			nearest = distance
		}
		if distance <= float64(location.Radius) {
			verified = true
		}
	}

	if nearest == math.MaxFloat64 {
		return 0, false, fiber.NewError(
			fiber.StatusBadRequest,
			"Koordinat lokasi kantor tidak valid",
		)
	}

	if !verified && !request.IsAllowed {
		return nearest, false, fiber.NewError(
			fiber.StatusBadRequest,
			fmt.Sprintf("Anda berada %.0f meter di luar radius lokasi kantor", nearest),
		)
	}

	return nearest, verified, nil
}

func (c *AttendanceUseCase) resolveCheckInStatus(
	tx *gorm.DB,
	employeeID string,
	now time.Time,
) (string, error) {
	shifts, err := c.ShiftRepository.FindByEmployeeID(tx, employeeID)
	if err != nil {
		c.Log.WithError(err).Error("Failed to find employee shifts")
		return "", fiber.ErrInternalServerError
	}
	if len(shifts) == 0 {
		return "HADIR", nil
	}

	shift := shifts[0]
	shiftDay := new(entity.ShiftDay)
	if err := c.ShiftDayRepo.FindByShiftIDAndWeekday(tx, shiftDay, shift.ID, int(now.Weekday())); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return "HADIR", nil
		}
		c.Log.WithError(err).Error("Failed to find shift day")
		return "", fiber.ErrInternalServerError
	}

	scheduled := time.UnixMilli(shiftDay.CheckIn)
	deadline := time.Date(
		now.Year(), now.Month(), now.Day(),
		scheduled.Hour(), scheduled.Minute(), 0, 0,
		now.Location(),
	).Add(time.Duration(shift.LateTolerance) * time.Minute)

	if now.After(deadline) {
		return "TERLAMBAT", nil
	}

	return "HADIR", nil
}
