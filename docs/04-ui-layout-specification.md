# FounderOS — UI Layout Specification

Version: 1.0

---

# Overview

This document defines the layout and interaction model for every screen in FounderOS.

It focuses on:

- layout
- hierarchy
- widget placement
- user interactions
- responsive behavior

It does NOT define:

- colors
- typography
- spacing
- implementation

Those are covered in the Design System.

---

# Dashboard

## Purpose

The dashboard is the command center.

It should answer:

"What should I do today?"

---

## Layout

┌─────────────────────────────────────────────┐

Top Navigation

├──────────────┬──────────────────────────────┤

Sidebar │ AI Daily Brief

│ Today's Focus

│

│ Projects │ Calendar

│

│ Finance │ Goals

│

│ GitHub │ Habits

│

│ Notes │ Activity

└──────────────┴──────────────────────────────┘

---

## Widgets

### AI Brief

Large widget

Contains

- Greeting
- Priorities
- Suggestions
- Blockers

---

### Today's Focus

Medium

Contains

- Due Today
- Overdue
- High Priority

---

### Projects

Medium

Contains

- Active Projects
- Progress
- Delayed

---

### Calendar

Medium

Contains

- Today's meetings
- Upcoming events

---

### Finance

Medium

Contains

- Income
- Balance
- Goal Progress

---

### Goals

Medium

Contains

- Active goals
- Progress

---

### GitHub

Small

Contains

- Recent commits
- Pull requests

---

### Habits

Small

Contains

- Today's streaks

---

### Notes

Small

Contains

- Recent notes

---

# Interactions

Every widget supports:

Compact

↓

Expanded

↓

Full Page

---

Hover

Subtle elevation

Click

Expand

Double Click

Open Module

---

# Empty Dashboard

Display

Illustration

↓

Welcome Message

↓

Connect Integrations

↓

Create First Project

---

# Loading

Skeleton widgets

No spinner

---

# Responsive

Desktop

12-column grid

Tablet

6-column grid

Mobile

Single column

Collapsible sidebar

Bottom navigation (future)

---

# Projects Screen

Purpose

Manage all projects.

Layout

Header

↓

Project Overview

↓

Milestones

↓

Tasks

↓

Timeline

↓

Files

---

# Tasks Screen

Layout

Header

↓

Filters

↓

Kanban

↓

Task Drawer

---

# Calendar

Layout

Header

↓

Calendar View

↓

Upcoming Events

↓

Meeting Details

---

# Finance

Layout

Income Summary

↓

Monthly Chart

↓

Income Sources

↓

Annual Progress

---

# Goals

Layout

Goals Overview

↓

Goal Cards

↓

Timeline

↓

Completed Goals

---

# GitHub

Repositories

↓

Recent Commits

↓

Pull Requests

↓

Activity

---

# Notes

Search

↓

Folders

↓

Editor

↓

Preview

---

# AI

Chat

↓

Suggestions

↓

Context

↓

Recent Actions

---

# Settings

Profile

↓

Appearance

↓

Integrations

↓

Keyboard

↓

AI Preferences

---

# Shared Components

Every page contains

Header

Search

Quick Actions

Command Palette

Breadcrumb
