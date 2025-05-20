package models

type Author struct {
	ID   uint   `gorm:"primaryKey" xml:"-" json:"id"`
	Name string `gorm:"unique;not null" xml:"name" json:"name"`
}
