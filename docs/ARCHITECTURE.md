# Architecture Overview

## Tech Stack
- **Frontend:** React.js, Vite, Tailwind CSS, Monaco Editor (for code editing), Lucide React (for icons)
- **Backend:** Node.js, Express.js (assuming based on standard architecture)
- **Code Execution Engine:** (E.g., Docker-based execution, Piston API, or custom sandboxed environment)

## High-Level Architecture
1. **Client (Frontend):** 
   - Handles UI/UX, Monaco Editor rendering, and File Explorer state.
   - Communicates with the backend via REST API calls.
2. **Server (Backend):**
   - Receives code execution requests.
   - Sanitizes and prepares code for execution.
3. **Execution Sandbox:**
   - Compiles and runs the code in an isolated environment.
   - Returns standard output (stdout) and standard error (stderr) back to the server.

## Data Flow
- User types code -> Saves in React State / LocalStorage -> Clicks "RUN" -> POST request to `/api/execute` -> Backend runs code -> Returns output -> Frontend displays in Console.
