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
)

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
