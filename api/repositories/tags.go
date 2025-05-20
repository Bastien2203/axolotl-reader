package repositories

import "github.com/Bastien2203/comics-reader/models"

func (r *Repository) FindAllTags() ([]models.Tag, error) {
	var tags []models.Tag
	if err := r.DB.
		Order("name ASC").
		Find(&tags).Error; err != nil {
		return nil, err
	}
	return tags, nil
}
