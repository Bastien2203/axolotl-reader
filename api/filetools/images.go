package filetools

import (
	"image"
	"image/png"
	"os"
)

func SaveImage(img image.Image, path string) error {
	out, err := os.Create(path)
	if err != nil {
		return err
	}
	defer out.Close()
	err = png.Encode(out, img)
	if err != nil {
		return err
	}
	return nil
}
