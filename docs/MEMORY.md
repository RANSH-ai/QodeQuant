# Project Memory

## Context
This file serves as a memory bank for the AI assistant and developers working on the project. It tracks major decisions, context, and current state.

## Recent Updates
- **File Explorer Refactor (Oct 2026):** Refactored the `CompilerDashboard.jsx` to feature a professional, nested file explorer UI. Added the ability to create folders, nest files, collapse/expand folders, and delete directories.
- **Homework Export (Oct 2026):** Added a feature for students to export their code files as a JSON string (`Export HW`), which can be submitted to teachers.

## Known Issues
- Currently, files are stored in `localStorage`, which is limited in size and device-specific. Need to move to database storage for persistent sessions.
