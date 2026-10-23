# Project Rules & Guidelines

## Code Style
- **React Components:** Use functional components and React Hooks.
- **Styling:** Use Tailwind CSS utility classes. Avoid inline styles unless absolutely necessary for dynamic values (like padding for file tree).
- **Naming Conventions:**
  - Components: PascalCase (e.g., `CompilerDashboard.jsx`)
  - Variables/Functions: camelCase (e.g., `handleSaveCode`)

## File Structure (Frontend)
- `/src/components`: UI Components
- `/src/assets`: Images, icons, and static assets
- `/src/utils`: Helper functions and hooks

## Best Practices
- **State Management:** Keep state as localized as possible. Avoid prop drilling by using Context API or state management libraries if the app grows.
- **Error Handling:** Always handle API errors gracefully and display user-friendly messages in the UI.
- **Security:** Never trust user input. Code execution must happen in a strictly sandboxed backend environment.
