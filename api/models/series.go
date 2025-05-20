package models

type Series struct {
	ID       uint    `gorm:"primaryKey" json:"id"`
	Tags     []Tag   `gorm:"many2many:series_tags" json:"tags"`
	Name     string  `gorm:"unique;not null" json:"name"`
	CoverURL string  `gorm:"not null" json:"cover_url"`
	Comics   []Comic `gorm:"foreignKey:SeriesID" json:"comics"`
}
