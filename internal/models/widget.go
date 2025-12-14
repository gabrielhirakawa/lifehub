package models

import (
	"encoding/json"
	"time"
)

// WidgetType represents the type of the widget (TODO, NOTE, etc.)
type WidgetType string

const (
	WidgetTypeTodo        WidgetType = "TODO"
	WidgetTypeNote        WidgetType = "NOTE"
	WidgetTypeWellness    WidgetType = "WELLNESS"
	WidgetTypeAIAssistant WidgetType = "AI_ASSISTANT"
	WidgetTypeKanban      WidgetType = "KANBAN"
	WidgetTypeReminder    WidgetType = "REMINDER"
	WidgetTypeGym         WidgetType = "GYM"
	WidgetTypeLinks       WidgetType = "LINKS"
	WidgetTypePomodoro    WidgetType = "POMODORO"
	WidgetTypeDiet        WidgetType = "DIET"
	WidgetTypeWiki        WidgetType = "WIKI"
)

// WikiPage represents a single page in the Wiki widget
type WikiPage struct {
	ID       string `json:"id"`
	Title    string `json:"title"`
	Content  string `json:"content"`
	IsPublic bool   `json:"isPublic"`
	PublicID string `json:"publicId,omitempty"`
	Author   string `json:"author,omitempty"`
	Date     string `json:"date,omitempty"`
}

// WikiData represents the data structure for the Wiki widget
type WikiData struct {
	Pages        []WikiPage `json:"pages"`
	ActivePageID string     `json:"activePageId,omitempty"`
}

// WidgetContentWrapper is a helper to unmarshal the raw content
type WidgetContentWrapper struct {
	Wiki *WikiData `json:"wiki,omitempty"`
}

// Widget represents a dashboard widget.
// It mirrors the frontend WidgetData interface.
type Widget struct {
	ID        string          `json:"id" db:"id"`
	Type      WidgetType      `json:"type" db:"type"`
	Title     string          `json:"title" db:"title"`
	Cols      int             `json:"cols" db:"cols"`
	Position  int             `json:"position" db:"position"`
	IsActive  bool            `json:"isActive" db:"is_active"`
	Content   json.RawMessage `json:"content" db:"content"` // Stored as JSON string in DB
	CreatedAt time.Time       `json:"created_at" db:"created_at"`
	UpdatedAt time.Time       `json:"updated_at" db:"updated_at"`
}
