# FounderOS — Product Requirements Document (PRD)

**Version:** 1.0
**Status:** Draft
**Related Documents:**

* 01-product-vision.md

---

# 1. Product Overview

FounderOS is an AI-powered operating system that provides founders with a centralized workspace to manage projects, tasks, meetings, finances, goals, notes, and AI-driven insights.

The application is modular, extensible, and optimized for information-dense dashboards.

---

# 2. Product Modules

The MVP consists of ten primary modules.

| Module    | Priority | MVP |
| --------- | -------- | --- |
| Dashboard | ⭐⭐⭐⭐⭐    | ✅   |
| Projects  | ⭐⭐⭐⭐⭐    | ✅   |
| Tasks     | ⭐⭐⭐⭐⭐    | ✅   |
| Calendar  | ⭐⭐⭐⭐⭐    | ✅   |
| Finance   | ⭐⭐⭐⭐     | ✅   |
| Goals     | ⭐⭐⭐⭐     | ✅   |
| Notes     | ⭐⭐⭐⭐     | ✅   |
| GitHub    | ⭐⭐⭐      | ✅   |
| Habits    | ⭐⭐⭐      | ✅   |
| AI        | ⭐⭐⭐⭐⭐    | ✅   |

---

# 3. Dashboard

## Purpose

The dashboard is the primary entry point into FounderOS.

It provides a consolidated view of all important information across every module.

---

## Widgets

### AI Daily Brief

Displays:

* Personalized greeting
* Priority recommendations
* Blockers
* Suggested schedule
* Important reminders

---

### Today's Focus

Displays

* High-priority tasks
* Due today
* Overdue items

---

### Calendar

Displays

* Meetings
* Focus blocks
* Deadlines

---

### Projects

Displays

* Active projects
* Progress bars
* Health indicators
* Delayed milestones

---

### Finance

Displays

* Current salary
* Side income
* Monthly income
* Current balance
* Income goal

---

### Goals

Displays

* Goal progress
* Completion percentage
* Deadlines

---

### GitHub

Displays

* Recent commits
* Open PRs
* Repository activity

---

### Habits

Displays

* Current streaks
* Today's completion

---

### Notes

Displays

* Recent notes
* Meeting summaries

---

# 4. Projects Module

Each project contains:

* Overview
* Milestones
* Tasks
* Notes
* Files
* Timeline

---

## Project Properties

* Name
* Description
* Color
* Status
* Progress
* Start Date
* Target Date
* Owner
* Tags

---

## Project Status

* Planning
* Active
* On Hold
* Completed
* Archived

---

# 5. Tasks Module

Every task belongs to a project.

---

## Task Properties

* Title
* Description
* Status
* Priority
* Due Date
* Estimated Time
* Labels
* Assignee
* Created Date
* Updated Date

---

## Status

* Backlog
* Todo
* In Progress
* Review
* Done

---

## Priority

* Critical
* High
* Medium
* Low

---

# 6. Calendar Module

Supports:

* Google Calendar Sync
* Manual Events
* Deadlines
* Meetings
* Focus Time

Views:

* Day
* Week
* Month
* Agenda

---

# 7. Finance Module

FounderOS is **not accounting software**.

It focuses only on high-level financial visibility.

---

## Dashboard Metrics

* Current Salary
* Side Income
* Monthly Income
* Annual Income
* Current Bank Balance
* Income Goal
* Savings Progress

---

## Charts

* Monthly Income
* Annual Growth
* Income by Source

---

## Income Sources

Examples:

* Salary
* Freelancing
* SaaS Revenue
* Investments
* Other

---

# 8. Goals Module

Goals can belong to:

* Personal
* Business
* Health
* Financial
* Learning

---

Each goal contains:

* Title
* Target
* Current Progress
* Deadline
* Category

---

# 9. Notes Module

Supports:

* Markdown
* Rich Text
* Tags
* Project Association
* Search

Types

* Quick Note
* Meeting Note
* Technical Note
* Idea
* Decision Log

---

# 10. GitHub Module

MVP Features

* Connected repositories
* Recent commits
* Pull Requests
* Commit history

Future

* GitHub Issues
* Releases
* Actions
* Deployments

---

# 11. Habits Module

Simple tracking only.

Examples:

* Gym
* Running
* Reading
* Meditation
* Smoking

Metrics:

* Streak
* Weekly completion
* Monthly completion

---

# 12. AI Module

The AI should behave as a Chief of Staff.

Example actions:

* Prepare my day
* Summarize today's work
* Weekly review
* Suggest priorities
* Identify blockers
* Project health summary
* Generate sprint
* Meeting summary

---

# 13. Search

Global search across:

* Projects
* Tasks
* Notes
* Goals
* Meetings

---

# 14. Command Palette

Keyboard-first experience.

Examples:

Create Task

Create Project

Open Notes

Navigate Anywhere

Search

---

# 15. Notifications

MVP

* In-app notifications

Future

* Email
* Push
* Slack

---

# 16. Settings

* Profile
* Appearance
* Connected Accounts
* Integrations
* AI Preferences
* Keyboard Shortcuts

---

# 17. Authentication

Supported Providers

* Google
* GitHub

No password authentication in MVP.

---

# 18. Integrations (MVP)

* Google Calendar
* GitHub

Future:

* Google Drive
* Gmail
* Slack
* Figma
* Discord
* Trello
* Notion Import

---

# 19. Acceptance Criteria

A successful MVP allows a user to:

✅ Sign in

✅ Create projects

✅ Create tasks

✅ Manage milestones

✅ Track goals

✅ View finances

✅ Sync calendar

✅ Connect GitHub

✅ Read AI Daily Brief

✅ Navigate quickly using keyboard

---

# 20. Out of Scope

The MVP will not include:

* Team permissions
* Chat
* CRM
* Billing
* Time tracking
* Workflow automation
* AI agents
* Mobile application
* Public APIs

These will be considered after validating the core product.
