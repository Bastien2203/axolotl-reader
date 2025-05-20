package models

import "gorm.io/gorm"

type Comic struct {
	gorm.Model
	Title          string   `gorm:"not null"`
	Authors        []Author `gorm:"many2many:comic_authors"`
	Identifier     string   `gorm:"unique;not null"`
	CoverURL       string   `gorm:"not null"`
	FileURL        string   `gorm:"not null"`
	CoverPath      string   `gorm:"not null"`
	FilePath       string   `gorm:"not null"`
	Series         Series   `gorm:"foreignKey:SeriesID"`
	SeriesID       uint
	SeriesPosition int `gorm:"null"`
}
