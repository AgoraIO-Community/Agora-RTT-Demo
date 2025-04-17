package error

import "fmt"

type CustomErr struct {
	StatusCode int
	Detail     string
	Reason     string
}

func NewCustomErr(statusCode int, detail string, reason string) *CustomErr {
	return &CustomErr{
		StatusCode: statusCode,
		Detail:     detail,
		Reason:     reason,
	}
}

func (c *CustomErr) Error() string {
	return fmt.Sprintf("statusCode:%d,detail: %s, reason: %s", c.StatusCode, c.Detail, c.Reason)
}
