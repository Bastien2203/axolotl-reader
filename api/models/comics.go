package models

import "gorm.io/gorm"

type Comic struct {
	gorm.Model
	Title      string
	Author     string
	Identifier string
	CoverURL   string
	FileURL    string
}
