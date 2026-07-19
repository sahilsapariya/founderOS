# Founderos Development Guidelines

This file contains project-specific instructions for working with the Founderos codebase.

## Project Overview

Founderos is a modern, AI-powered platform built with a monorepo structure using Turborepo.

## Architecture

- **Frontend**: apps/web - Main web application
- **Packages**: Shared, reusable code organized by concern
- **Database**: Supabase for backend infrastructure

## Development Standards

### Code Organization
- Keep components and utilities in their respective packages
- Use TypeScript for all new code
- Follow the existing naming conventions

### Monorepo Setup
- Use Turborepo for task orchestration
- Dependencies between packages should be explicit in package.json
- Install dependencies at the root level: `npm install`

## Getting Started

1. Install dependencies: `npm install`
2. Start development: `npm run dev`
3. Build for production: `npm run build`
4. Run tests: `npm run test`

## Documentation

Detailed documentation is available in the `docs/` folder.
