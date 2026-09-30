package timezone

import "time"

// WIB = UTC+7. FixedZone dipakai supaya tidak bergantung pada data di server.
var WIB = time.FixedZone("WIB", 7*60*60)

// Now mengembalikan waktu sekarang di WIB.
func Now() time.Time {
	return time.Now().In(WIB)
}

// FromMilli mengubah epoch milli menjadi time.Time di WIB.
func FromMilli(ms int64) time.Time {
	return time.UnixMilli(ms).In(WIB)
}

// StartOfDay mengembalikan jam 00:00 WIB pada hari dari t.
func StartOfDay(t time.Time) time.Time {
	t = t.In(WIB)
	return time.Date(t.Year(), t.Month(), t.Day(), 0, 0, 0, 0, WIB)
}
