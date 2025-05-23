package models

import "strings"

type Tag struct {
	ID   uint   `gorm:"primaryKey" json:"id"`
	Name string `gorm:"unique;not null" json:"name"`
}

func SanitizeTag(tag *Tag) *Tag {
	tag.Name = strings.TrimSpace(tag.Name)
	tag.Name = strings.ToLower(tag.Name)
	return tag
}
