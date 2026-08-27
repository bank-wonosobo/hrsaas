package timedifference

import (
	"fmt"
	"time"
)

func GetTimeDifference(started, ended string) (string, error) {
	layout := "15:04:05"

	start, err := time.Parse(layout, started)
	if err != nil {
		return "", err
	}

	end, err := time.Parse(layout, ended)
	if err != nil {
		return "", err
	}

	diffence := end.Sub(start)
	if diffence <= 0 {
		return "", nil
	}

	hours := int(diffence.Hours())
	minutes := int(diffence.Minutes()) % 60

	if hours > 0 || minutes > 0 {
		result := fmt.Sprintf("%02d jam %02d menit", hours, minutes)
		return result, nil
	}
	return "", nil
}
