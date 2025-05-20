package models

type Author struct {
	ID   uint   `gorm:"primaryKey" xml:"-"`
	Name string `gorm:"unique;not null" xml:"name"`
}
