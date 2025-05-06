package models

import "gorm.io/gorm"

type Comic struct {
	gorm.Model
	Title          string `gorm:"not null"`
	Author         string `gorm:"not null"`
	Identifier     string `gorm:"unique;not null"`
	CoverURL       string `gorm:"not null"`
	FileURL        string `gorm:"not null"`
	CoverPath      string `gorm:"not null"`
	FilePath       string `gorm:"not null"`
	SeriesName     string `gorm:"null"`
	SeriesPosition int    `gorm:"null"`
}
