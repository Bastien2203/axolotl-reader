package repositories

import (
	"github.com/Bastien2203/comics-reader/models"
	"gorm.io/gorm"
)

type SeriesRepository struct {
	DB *gorm.DB
}

func (r *SeriesRepository) FindAll(page int) ([]models.Series, error) {
	var series []models.Series
	if err := r.DB.
		Preload("Tags").
		Limit(PAGE_SIZE).
		Offset((page - 1) * PAGE_SIZE).
		Order("name ASC").
		Find(&series).Error; err != nil {
		return nil, err
	}
	return series, nil
}

func (r *SeriesRepository) Count() (int64, error) {
	var count int64
	if err := r.DB.Model(&models.Series{}).Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}

func (r *SeriesRepository) FindOneByID(id string) (*models.Series, error) {
	var series models.Series
	if err := r.DB.
		Where("id = ?", id).
		First(&series).
		Error; err != nil {
		return nil, err
	}
	return &series, nil
}

func (r *SeriesRepository) FindByTag(tagID string, page int) ([]models.Series, error) {
	var series []models.Series
	if err := r.DB.
		Preload("Tags").
		Joins("JOIN series_tags ON series_tags.series_id = series.id").
		Where("series_tags.tag_id = ?", tagID).
		Limit(PAGE_SIZE).
		Offset((page - 1) * PAGE_SIZE).
		Order("name ASC").
		Find(&series).Error; err != nil {
		return nil, err
	}
	return series, nil
}

func (r *SeriesRepository) CountByTag(tagID string) (int64, error) {
	var count int64
	if err := r.DB.Model(&models.Series{}).
		Joins("JOIN series_tags ON series_tags.series_id = series.id").
		Where("series_tags.tag_id = ?", tagID).
		Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}

func (r *SeriesRepository) FindOneByIDWithComics(id string, page int) (*models.Series, error) {
	var series models.Series
	if err := r.DB.
		Preload("Tags").
		Preload("Comics", func(db *gorm.DB) *gorm.DB {
			return db.
				Limit(PAGE_SIZE).
				Offset((page - 1) * PAGE_SIZE).
				Order("series_position ASC")
		}).
		Preload("Comics.Authors").
		Where("id = ?", id).
		First(&series).
		Error; err != nil {
		return nil, err
	}
	return &series, nil
}

func (r *SeriesRepository) Delete(series *models.Series) error {
	if err := r.DB.Delete(series).Error; err != nil {
		return err
	}
	return nil
}

func (r *SeriesRepository) FindByNameOrCreate(series *models.Series) (*models.Series, error) {
	if err := r.DB.
		Where("name = ?", series.Name).
		FirstOrCreate(series).
		Error; err != nil {
		return nil, err
	}
	return series, nil
}
