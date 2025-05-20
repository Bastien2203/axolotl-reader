package opds_v2

type Link struct {
	Href       string            `json:"href"`
	Rel        []string          `json:"rel,omitempty"`
	Type       string            `json:"type,omitempty"`
	Properties map[string]string `json:"properties,omitempty"`
	Title      string            `json:"title,omitempty"`
}

type Metadata struct {
	Title   string   `json:"title"`
	Updated string   `json:"modified"`
	Authors []string `json:"authors,omitempty"`
	Tags    []string `json:"tags,omitempty"`
}

type Publication struct {
	Metadata Metadata `json:"metadata"`
	Links    []Link   `json:"links,omitempty"`
	ID       string   `json:"id"`
}

type Feed struct {
	Context      string        `json:"@context"`
	ID           string        `json:"id"`
	Type         string        `json:"type"`
	Metadata     Metadata      `json:"metadata"`
	Publications []Publication `json:"publications,omitempty"`
	Links        []Link        `json:"links,omitempty"`
	Facets       []Facet       `json:"facets,omitempty"`
}

type Facet struct {
	Metadata Metadata `json:"metadata"`
	Links    []Link   `json:"links,omitempty"`
}
