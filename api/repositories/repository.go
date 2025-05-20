package repositories

import "gorm.io/gorm"

type Repository struct {
	DB *gorm.DB
}

var (
	PAGE_SIZE = 10
)
