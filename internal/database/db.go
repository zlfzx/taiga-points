package database

import (
	"database/sql"
	"strings"

	_ "github.com/mattn/go-sqlite3"
)

func Init() (*sql.DB, error) {
	// Initialize the database connection here
	db, err := sql.Open("sqlite3", "./data/app.db")
	if err != nil {
		return nil, err
	}

	err = db.Ping()
	if err != nil {
		return nil, err
	}

	// Perform database migrations
	if err := migrateDB(db); err != nil {
		return nil, err
	}

	return db, nil
}

func migrateDB(db *sql.DB) error {
	_, err := db.Exec(`
		CREATE TABLE IF NOT EXISTS "project_settings" (
			"id" INTEGER NOT NULL UNIQUE,
			"name" VARCHAR,
			"slug" VARCHAR,
			"max_points" REAL DEFAULT 0,
			"role_points" TEXT,
			"status_points" TEXT,
			PRIMARY KEY("id")
		);
	`)
	if err != nil {
		return err
	}

	// add column
	_, err = db.Exec(`
		ALTER TABLE "project_settings" ADD COLUMN "member_story_custom_field_filter" TEXT
	`)
	if err != nil && !strings.Contains(err.Error(), "duplicate column name") {
		return err
	}

	return nil
}
