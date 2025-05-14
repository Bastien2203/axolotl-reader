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
	SeriesPosition int   `gorm:"null"`
	Tags           []Tag `gorm:"many2many:comic_tags"`
}

type Author struct {
	ID   uint   `gorm:"primaryKey"`
	Name string `gorm:"unique;not null"`
}

type Tag struct {
	ID   uint   `gorm:"primaryKey"`
	Name string `gorm:"unique;not null"`
}

type Series struct {
	ID   uint   `gorm:"primaryKey"`
	Tags []Tag  `gorm:"many2many:comic_tags"`
	Name string `gorm:"unique;not null"`
}
