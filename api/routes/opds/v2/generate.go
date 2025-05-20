package opds_v2

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/Bastien2203/comics-reader/logs"
	"github.com/Bastien2203/comics-reader/models"
	"github.com/Bastien2203/comics-reader/repositories"
	"go.uber.org/zap"
)

func GenerateGlobalFeed(
	seriesRepository *repositories.SeriesRepository,
	tagRepository *repositories.TagRepository,
	comicRepository *repositories.ComicRepository,
) error {

	totalSeries, err := seriesRepository.Count()
	if err != nil {
		return err
	}

	totalPages := (int(totalSeries) + repositories.PAGE_SIZE - 1) / repositories.PAGE_SIZE
	existingSeries := make(map[string]struct{}, totalSeries)

	if totalPages == 0 {
		feed := BuildGlobalFeed([]models.Series{}, []models.Tag{}, 1, 1, "/opds/v2", nil)
		err = WriteFeedToFile(feed, 1, nil)
		if err != nil {
			return err
		}
		return nil
	}

	tags, err := tagRepository.FindAll()
	if err != nil {
		return err
	}

	for page := 1; page <= totalPages; page++ {
		series, err := seriesRepository.FindAll(page)
		if err != nil {
			return err
		}

		feed := BuildGlobalFeed(series, tags, page, totalPages, "/opds/v2", nil)

		err = WriteFeedToFile(feed, page, nil)
		if err != nil {
			return err
		}

		for _, s := range series {
			existingSeries[fmt.Sprintf("%d", s.ID)] = struct{}{}
			err = GenerateSeriesFeed(seriesRepository, comicRepository, fmt.Sprintf("%d", s.ID), "/opds/v2")
			if err != nil {
				return err
			}
		}
	}

	// Generate the global feed for each tag
	existingTags := make(map[string]struct{}, len(tags))
	for _, tag := range tags {
		err = GenerateGlobalFeedByTag(seriesRepository, &tag, tags)
		existingTags[fmt.Sprintf("%d", tag.ID)] = struct{}{}
		if err != nil {
			return err
		}
	}

	// Delete old tags/series feeds
	entries, err := os.ReadDir("feeds")
	if err != nil {
		return err
	}

	for _, entry := range entries {
		isTag := strings.HasPrefix(entry.Name(), "tag_")
		isSeries := strings.HasPrefix(entry.Name(), "series_")
		if !entry.IsDir() || (!isTag && !isSeries) {
			continue
		}

		parts := strings.SplitN(entry.Name(), "_", 2)
		if len(parts) != 2 {
			continue
		}
		ID := parts[1]

		_, tagExists := existingTags[ID]
		_, seriesExists := existingSeries[ID]

		if (!tagExists && isTag) || (!seriesExists && isSeries) {
			path := filepath.Join("feeds", entry.Name())
			if err := os.RemoveAll(path); err != nil {
				return err
			}
		}
	}

	return nil
}

func GenerateGlobalFeedByTag(
	seriesRepository *repositories.SeriesRepository,
	tag *models.Tag,
	allTags []models.Tag,
) error {
	tagID := fmt.Sprintf("%d", tag.ID)
	totalSeries, err := seriesRepository.CountByTag(tagID)
	if err != nil {
		return err
	}

	totalPages := (int(totalSeries) + repositories.PAGE_SIZE - 1) / repositories.PAGE_SIZE

	if totalPages == 0 {
		feed := BuildGlobalFeed([]models.Series{}, []models.Tag{}, 1, 1, "/opds/v2", tag)
		subdir := fmt.Sprintf("tag_%s", tagID)
		err = WriteFeedToFile(feed, 1, &subdir)
		if err != nil {
			return err
		}
		return nil
	}

	for page := 1; page <= totalPages; page++ {
		series, err := seriesRepository.FindByTag(tagID, page)
		if err != nil {
			return err
		}

		feed := BuildGlobalFeed(series, allTags, page, totalPages, "/opds/v2", tag)
		subdir := fmt.Sprintf("tag_%s", tagID)
		err = WriteFeedToFile(feed, page, &subdir)
		if err != nil {
			return err
		}
	}

	// Delete all page that are > totalPages
	dir := fmt.Sprintf("feeds/tag_%s", tagID)
	entries, err := os.ReadDir(dir)
	if err != nil {
		return err
	}
	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}
		parts := strings.SplitN(entry.Name(), "_", 3)
		if len(parts) != 3 {
			continue
		}
		page, err := strconv.Atoi(strings.TrimSuffix(parts[2], ".json"))
		if err != nil {
			continue
		}
		if page > totalPages {
			path := filepath.Join(dir, entry.Name())
			if err := os.Remove(path); err != nil {
				return err
			}
		}
	}

	return nil
}

func GenerateSeriesFeed(
	seriesRepository *repositories.SeriesRepository,
	comicRepository *repositories.ComicRepository,
	seriesID string,
	root string,
) error {

	totalComics, err := comicRepository.CountBySeries(seriesID)
	if err != nil {
		return err
	}

	totalPages := (int(totalComics) + repositories.PAGE_SIZE - 1) / repositories.PAGE_SIZE

	for page := 1; page <= totalPages; page++ {

		series, err := seriesRepository.FindOneByIDWithComics(seriesID, page)
		if err != nil {
			logs.Logger.Error("failed to find series", zap.String("seriesID", seriesID), zap.Error(err))
			return err
		}

		feed := BuildSeriesFeed(series, page, totalPages, root)
		subdir := fmt.Sprintf("series_%s", seriesID)
		err = WriteFeedToFile(feed, page, &subdir)
		if err != nil {
			return err
		}
	}

	// Delete all page that are > totalPages
	dir := fmt.Sprintf("feeds/series_%s", seriesID)
	entries, err := os.ReadDir(dir)
	if err != nil {
		return err
	}
	for _, entry := range entries {

		if entry.IsDir() {
			continue
		}
		parts := strings.SplitN(entry.Name(), "_", 3)
		if len(parts) != 3 {
			continue
		}
		page, err := strconv.Atoi(strings.TrimSuffix(parts[2], ".json"))
		if err != nil {
			continue
		}

		if page > totalPages {
			path := filepath.Join(dir, entry.Name())
			if err := os.Remove(path); err != nil {
				return err
			}
		}
	}

	return nil
}

func WriteFeedToFile(feed Feed, page int, subdir *string) error {
	// Create a directory for the feeds if it doesn't exist
	feedDir := "feeds"
	if subdir != nil {
		feedDir = fmt.Sprintf("%s/%s", feedDir, *subdir)
	}

	if _, err := os.Stat(feedDir); os.IsNotExist(err) {
		err := os.Mkdir(feedDir, 0755)
		if err != nil {
			return err
		}
	}

	// Write the feed to a file
	filePath := fmt.Sprintf("%s/feed_page_%d.json", feedDir, page)
	file, err := os.Create(filePath)
	if err != nil {
		return err
	}
	defer file.Close()

	encoder := json.NewEncoder(file)
	encoder.SetIndent("", "  ")
	return encoder.Encode(feed)
}

func ReadFeedFromFile(page int, subdir *string) (Feed, error) {
	feed := Feed{}
	feedDir := "feeds"
	if subdir != nil {
		feedDir = fmt.Sprintf("%s/%s", feedDir, *subdir)
	}

	filePath := fmt.Sprintf("%s/feed_page_%d.json", feedDir, page)
	file, err := os.Open(filePath)
	if err != nil {
		return feed, err
	}
	defer file.Close()

	decoder := json.NewDecoder(file)
	err = decoder.Decode(&feed)
	if err != nil {
		return feed, err
	}

	return feed, nil
}
