package opds_v2

import (
	"fmt"
	"os"
	"time"

	"github.com/Bastien2203/comics-reader/models"
)

func paginationLinks(page, totalPage int, uri string) []Link {
	API_HOST := os.Getenv("API_HOST")
	links := make([]Link, 0)

	if page > 1 {
		links = append(links, Link{
			Href: fmt.Sprintf("%s%s?page=%d", API_HOST, uri, page-1),
			Rel:  []string{"prev"},
			Type: "application/opds+json",
		})
	}
	if page < totalPage {
		links = append(links, Link{
			Href: fmt.Sprintf("%s%s?page=%d", API_HOST, uri, page+1),
			Rel:  []string{"next"},
			Type: "application/opds+json",
		})
	}

	if totalPage > 1 {
		links = append(links, Link{
			Href: fmt.Sprintf("%s%s?page=%d", API_HOST, uri, totalPage),
			Rel:  []string{"last"},
			Type: "application/opds+json",
		})
		links = append(links, Link{
			Href: fmt.Sprintf("%s%s?page=1", API_HOST, uri),
			Rel:  []string{"first"},
			Type: "application/opds+json",
		})
	}

	return links
}

func BuildGlobalFeed(
	series []models.Series,
	tags []models.Tag, page,
	totalPage int,
	root string,
	currentTag *models.Tag,
) Feed {
	API_HOST := os.Getenv("API_HOST")

	links := make([]Link, 0)
	links = append(links, paginationLinks(page, totalPage, root)...)

	publications := make([]Publication, len(series))
	for i, s := range series {
		tags := []string{}
		for _, tag := range s.Tags {
			tags = append(tags, tag.Name)
		}
		publications[i] = Publication{
			Metadata: Metadata{
				Title: s.Name,
				Tags:  tags,
			},
			Links: []Link{
				{Href: API_HOST + s.CoverURL, Rel: []string{"http://opds-spec.org/image/thumbnail"}, Type: "image/png"},
				{
					Href: fmt.Sprintf("%s%s/series/%d", API_HOST, root, s.ID),
					Rel:  []string{"subsection"},
					Type: "application/opds+json",
				},
			},
			ID: fmt.Sprintf("%d", s.ID),
		}
	}

	tagFacetLinks := make([]Link, 0)
	for _, tag := range tags {
		isActive := currentTag != nil && tag.ID == currentTag.ID
		properties := map[string]string{}
		if isActive {
			properties["active"] = "true"
		}
		tagFacetLinks = append(tagFacetLinks, Link{
			Href:       fmt.Sprintf("%s%s?tags=%d", API_HOST, root, tag.ID),
			Rel:        []string{"http://opds-spec.org/facet"},
			Type:       "application/opds+json",
			Properties: properties,
			Title:      tag.Name,
		})
	}
	tagFacet := Facet{
		Metadata{
			Title: "Tags",
		},
		tagFacetLinks,
	}

	return Feed{
		Context:      "https://opds.io/schema/context.jsonld",
		ID:           "urn:uuid:root",
		Type:         "NavigationDocument",
		Metadata:     Metadata{Title: "Axolotl Reader Feed", Updated: time.Now().Format(time.RFC3339)},
		Publications: publications,
		Links: append([]Link{
			{Href: API_HOST + root, Rel: []string{"self", "start"}, Type: "application/opds+json"},
		}, links...),
		Facets: []Facet{
			tagFacet,
		},
	}
}

func BuildSeriesFeed(series models.Series, page, totalPage int, root string) Feed {
	API_HOST := os.Getenv("API_HOST")

	links := make([]Link, 0)
	links = append(links, paginationLinks(page, totalPage, fmt.Sprintf("%s/series/%d", root, series.ID))...)

	publications := make([]Publication, len(series.Comics))
	for i, comic := range series.Comics {
		authors := []string{}
		for _, a := range comic.Authors {
			authors = append(authors, a.Name)
		}

		publications[i] = Publication{
			ID: comic.Identifier,
			Metadata: Metadata{
				Title:   comic.Title,
				Authors: authors,
			},
			Links: []Link{
				{Href: API_HOST + comic.FileURL, Rel: []string{"http://opds-spec.org/acquisition"}, Type: "application/x-cbz"},
				{Href: API_HOST + comic.CoverURL, Rel: []string{"http://opds-spec.org/image/thumbnail"}, Type: "image/png"},
				{Href: API_HOST + comic.CoverURL, Rel: []string{"http://opds-spec.org/image"}, Type: "image/png"},
			},
		}
	}

	tags := []string{}
	for _, tag := range series.Tags {
		tags = append(tags, tag.Name)
	}

	links = append(links,
		Link{Href: fmt.Sprintf("%s%s/series/%d", API_HOST, root, series.ID), Rel: []string{"self"}, Type: "application/opds+json"},
		Link{Href: API_HOST + root, Rel: []string{"up"}, Type: "application/opds+json"},
	)

	return Feed{
		Context:      "https://opds.io/schema/context.jsonld",
		ID:           fmt.Sprintf("%d", series.ID),
		Type:         "NavigationDocument",
		Metadata:     Metadata{Title: series.Name, Updated: time.Now().Format(time.RFC3339), Tags: tags},
		Publications: publications,
		Links:        links,
	}
}
