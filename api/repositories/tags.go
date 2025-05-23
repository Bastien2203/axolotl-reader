package repositories

import (
	"github.com/Bastien2203/comics-reader/models"
	"gorm.io/gorm"
)

type TagRepository struct {
	DB *gorm.DB
}

func (r *TagRepository) FindAll() ([]models.Tag, error) {
	var tags []models.Tag
	if err := r.DB.
		Order("name ASC").
		Find(&tags).Error; err != nil {
		return nil, err
	}
	return tags, nil
}

func (r *TagRepository) FindByNameOrCreate(tag *models.Tag) (*models.Tag, error) {
	models.SanitizeTag(tag)
	if err := r.DB.
		Where("name = ?", tag.Name).
		FirstOrCreate(&tag).
		Error; err != nil {
		return nil, err
	}
	return tag, nil
}
