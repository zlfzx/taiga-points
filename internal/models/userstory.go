package models

type UserStoryStatus struct {
	ID         int    `json:"id"`
	ProjectID  int    `json:"project"`
	Name       string `json:"name"`
	Color      string `json:"color"`
	Slug       string `json:"slug"`
	Order      int    `json:"order"`
	IsClosed   bool   `json:"is_closed"`
	IsArchived bool   `json:"is_archived"`
}

type UserStory struct {
	ID               int              `json:"id"`
	Ref              int              `json:"ref"`
	ProjectID        int              `json:"project"`
	Subject          string           `json:"subject"`
	Status           int              `json:"status"`
	StatusExtraInfo  StatusExtraInfo  `json:"status_extra_info"`
	Swimlane         int              `json:"swimlane"`
	Points           map[string]int   `json:"points"`
	Point            float64          `json:"point"`
	TotalPoints      float64          `json:"total_points"`
	IsClosed         bool             `json:"is_closed"`
	AssignedUsers    []int            `json:"assigned_users"`
	Milestone        int              `json:"milestone"`
	MilestoneName    string           `json:"milestone_name"`
	MilestoneSlug    string           `json:"milestone_slug"`
	URL              string           `json:"url"`
	ProjectExtraInfo ProjectExtraInfo `json:"project_extra_info"`
	Tags             [][]string       `json:"tags"`

	// CustomAttribute holds the value of the project's selected custom
	// attribute (user_story_custom_attribute_filter) for this story. It is empty
	// when no custom field is configured or the story has no value for it.
	CustomAttribute *CustomAttributeValue `json:"custom_attribute"`
}

type CustomAttributeValue struct {
	Attribute string `json:"attribute"`
	Value     string `json:"value"`
}

type UserStoryCustomAttribute struct {
	ID          int      `json:"id"`
	ProjectID   int      `json:"project"`
	Name        string   `json:"name"`
	Description string   `json:"description"`
	Type        string   `json:"type"`
	Order       int      `json:"order"`
	Extra       []string `json:"extra"`
}

// UserStoryCustomAttributesValues maps the per-story custom attribute values
// returned by Taiga's GET /userstories/custom-attributes-values/{storyID}.
// AttributesValues keys are custom attribute IDs (as strings), values are the
// stored values for that story.
type UserStoryCustomAttributesValues struct {
	ID               int               `json:"id"`
	UserStoryID      int               `json:"user_story"`
	AttributesValues map[string]string `json:"attributes_values"`
	Version          int               `json:"version"`
}

type StatusExtraInfo struct {
	ID       int    `json:"id"`
	Name     string `json:"name"`
	Order    int    `json:"order"`
	Color    string `json:"color"`
	IsClosed bool   `json:"is_closed"`
}

// type UserStoryMember struct {
// 	ID        int    `json:"id"`
// 	Ref       int    `json:"ref"`
// 	ProjectID int    `json:"project"`
// 	Subject   string `json:"subject"`
// 	Status    int    `json:"status"`
// 	Swimlane  int    `json:"swimlane"`
// 	Point     int    `json:"point"`
// }

type UserStoryParams struct {
	ProjectID   string
	MilestoneID string
	IsArchived  string
	AssignedTo  string
}
