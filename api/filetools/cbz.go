package filetools

import (
	"archive/zip"
	"bytes"
	"image"
	_ "image/jpeg"
	_ "image/png"
	"log"
	"strings"
)

func GetFirstImageFromCBZ(path string) image.Image {
	r, err := zip.OpenReader(path)
	if err != nil {
		log.Fatal(err)
	}
	defer r.Close()

	for _, f := range r.File {
		if !isImageFile(f.Name) {
			continue
		}
		rc, err := f.Open()
		if err != nil {
			continue
		}
		defer rc.Close()

		buf := new(bytes.Buffer)
		_, err = buf.ReadFrom(rc)
		if err != nil {
			continue
		}

		img, _, err := image.Decode(bytes.NewReader(buf.Bytes()))
		if err == nil {
			return img
		}
	}

	return nil
}

func isImageFile(name string) bool {
	name = strings.ToLower(name)
	return strings.HasSuffix(name, ".jpg") || strings.HasSuffix(name, ".jpeg") || strings.HasSuffix(name, ".png") || strings.HasSuffix(name, ".gif")
}
