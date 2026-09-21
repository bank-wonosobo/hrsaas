package util

type MaritalStatusInfo struct {
	HasSpouse  bool
	ChildCount int
}

func GetMaritalStatusInfo(status string) MaritalStatusInfo {
	switch status {
	case "BK":
		return MaritalStatusInfo{
			HasSpouse:  false,
			ChildCount: 0,
		}

	case "K0":
		return MaritalStatusInfo{
			HasSpouse:  true,
			ChildCount: 0,
		}

	case "K1":
		return MaritalStatusInfo{
			HasSpouse:  true,
			ChildCount: 1,
		}

	case "K2":
		return MaritalStatusInfo{
			HasSpouse:  true,
			ChildCount: 2,
		}

	case "K3":
		return MaritalStatusInfo{
			HasSpouse:  true,
			ChildCount: 2,
		}

	case "TK0":
		return MaritalStatusInfo{
			HasSpouse:  false,
			ChildCount: 0,
		}

	case "TK1":
		return MaritalStatusInfo{
			HasSpouse:  false,
			ChildCount: 1,
		}

	case "TK2":
		return MaritalStatusInfo{
			HasSpouse:  false,
			ChildCount: 2,
		}

	case "TK3":
		return MaritalStatusInfo{
			HasSpouse:  false,
			ChildCount: 2,
		}

	default:
		return MaritalStatusInfo{}
	}
}
