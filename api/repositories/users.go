package repositories

import (
	"github.com/Bastien2203/comics-reader/models"
	"gorm.io/gorm"
)

type UserRepository struct {
	DB *gorm.DB
}

func (r *UserRepository) Count() (int64, error) {
	var count int64
	if err := r.DB.
		Model(&models.User{}).
		Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}

func (r *UserRepository) Create(user *models.User) error {
	if err := r.DB.
		Create(user).
		Error; err != nil {
		return err
	}
	return nil
}

func (r *UserRepository) FindAll() ([]models.User, error) {
	var users []models.User
	if err := r.DB.
		Select("id, username, role").
		Order("username ASC").
		Find(&users).Error; err != nil {
		return nil, err
	}
	return users, nil
}

func (r *UserRepository) FindOneByID(id any) (*models.User, error) {
	var user models.User
	if err := r.DB.
		Where("id = ?", id).
		First(&user).
		Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) AddFavoriteSeries(user *models.User, series *models.Series) error {
	if err := r.DB.
		Model(user).
		Association("FavoriteSeries").
		Append(series); err != nil {
		return err
	}
	return nil
}

func (r *UserRepository) RemoveFavoriteSeries(user *models.User, series *models.Series) error {
	if err := r.DB.
		Model(user).
		Association("FavoriteSeries").
		Delete(series); err != nil {
		return err
	}
	return nil
}

func (r *UserRepository) FindOneByUsername(username string) (*models.User, error) {
	var user models.User
	if err := r.DB.
		Where("username = ?", username).
		First(&user).
		Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) FindOneByIDWithFavoriteSeries(id any, page int) (*models.User, error) {
	var user models.User
	if err := r.DB.
		Preload("FavoriteSeries", func(db *gorm.DB) *gorm.DB {
			return db.
				Limit(PAGE_SIZE).
				Offset((page - 1) * PAGE_SIZE).
				Order("name ASC")
		}).
		Where("id = ?", id).
		First(&user).
		Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) CountByFavoriteSeries(user *models.User) int64 {
	return r.DB.
		Model(user).
		Association("FavoriteSeries").
		Count()
}
