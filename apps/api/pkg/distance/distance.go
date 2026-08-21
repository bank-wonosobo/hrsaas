package distance

import "math"

// DistanceMeter menghitung jarak antara dua koordinat dalam satuan meter.
func DistanceMeter(lat1, lng1, lat2, lng2 float64) float64 {
	const earthRadius = 6371000.0

	rad := math.Pi / 180
	dLat := (lat2 - lat1) * rad
	dLng := (lng2 - lng1) * rad

	a := math.Sin(dLat/2)*math.Sin(dLat/2) +
		math.Cos(lat1*rad)*math.Cos(lat2*rad)*math.Sin(dLng/2)*math.Sin(dLng/2)

	return earthRadius * 2 * math.Atan2(math.Sqrt(a), math.Sqrt(1-a))
}
