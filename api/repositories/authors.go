package repositories

import (
	"github.com/Bastien2203/comics-reader/models"
	"gorm.io/gorm"
)

type AuthorRepository struct {
	DB *gorm.DB
}

func (r *AuthorRepository) FindAll() ([]models.Author, error) {
	var authors []models.Author
	if err := r.DB.
		Order("name ASC").
		Find(&authors).Error; err != nil {
		return nil, err
	}
	return authors, nil
}

func (r *AuthorRepository) FindByNameOrCreate(author *models.Author) (*models.Author, error) {
	if err := r.DB.
		Where("name = ?", author.Name).
		FirstOrCreate(&author).
		Error; err != nil {
		return nil, err
	}
	return author, nil
}
