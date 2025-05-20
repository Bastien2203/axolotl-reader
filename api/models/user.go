package models

import (
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	ID             uint     `gorm:"primaryKey" json:"id"`
	Username       string   `gorm:"unique;not null" json:"username"`
	Password       string   `gorm:"not null" json:"password"`
	Role           string   `gorm:"default:'user'" json:"role"`
	FavoriteSeries []Series `gorm:"many2many:user_favorite_series" json:"-"`
}

func (u *User) BeforeCreate(tx *gorm.DB) (err error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(u.Password), 14)
	if err != nil {
		return err
	}
	u.Password = string(bytes)
	return
}

func (u *User) CheckPassword(pw string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(pw))
	return err == nil
}
