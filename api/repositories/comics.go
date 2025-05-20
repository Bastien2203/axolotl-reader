package repositories

import (
	"github.com/Bastien2203/comics-reader/models"
	"gorm.io/gorm"
)

type ComicRepository struct {
	DB *gorm.DB
}

func (r *ComicRepository) CountBySeries(seriesID string) (int64, error) {
	var count int64
	if err := r.DB.Model(&models.Comic{}).
		Where("series_id = ?", seriesID).
		Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}

func (r *ComicRepository) FindOneByIdentifier(identifier string) (*models.Comic, error) {
	var comic models.Comic
	if err := r.DB.Where("identifier = ?", identifier).First(&comic).Error; err != nil {
		return nil, err
	}
	return &comic, nil
}

func (r *ComicRepository) DeleteByIdentifier(identifier string) error {
	if err := r.DB.Where("identifier = ?", identifier).Delete(&models.Comic{}).Error; err != nil {
		return err
	}
	return nil
}

func (r *ComicRepository) FindBySeries(seriesID uint) ([]models.Comic, error) {
	var comics []models.Comic
	if err := r.DB.Where("series_id = ?", seriesID).Find(&comics).Error; err != nil {
		return nil, err
	}
	return comics, nil
}

func (r *ComicRepository) Create(comic *models.Comic) error {
	if err := r.DB.Create(comic).Error; err != nil {
		return err
	}
	return nil
}
