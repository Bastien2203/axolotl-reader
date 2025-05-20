package repositories

import (
	"github.com/Bastien2203/comics-reader/models"
	"gorm.io/gorm"
)

var (
	PAGE_SIZE = 10
)

func (r *Repository) FindAllSeries(page int) ([]models.Series, error) {
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

func (r *Repository) CountSeries() (int64, error) {
	var count int64
	if err := r.DB.Model(&models.Series{}).Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}

func (r *Repository) CountComicsBySeriesID(seriesID string) (int64, error) {
	var count int64
	if err := r.DB.Model(&models.Comic{}).
		Where("series_id = ?", seriesID).
		Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}

func (r *Repository) FindSeriesByID(id string, page int) (models.Series, error) {
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
		return models.Series{}, err
	}
	return series, nil
}

func (r *Repository) FindAllSeriesByTagID(tagID string, page int) ([]models.Series, error) {
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

func (r *Repository) CountSeriesByTagID(tagID string) (int64, error) {
	var count int64
	if err := r.DB.Model(&models.Series{}).
		Joins("JOIN series_tags ON series_tags.series_id = series.id").
		Where("series_tags.tag_id = ?", tagID).
		Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}
