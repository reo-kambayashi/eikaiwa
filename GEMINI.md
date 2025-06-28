# GEMINI.md
This file provides guidance to Google Gemini when working with code in this repository.

## Development Commands

### Docker Compose (Recommended)
```bash
make dev           # Start development mode with hot reload
make up            # Start production mode
make down          # Stop application
make logs          # View application logs
make build         # Rebuild Docker images
make clean         # Remove all containers, images, and volumes
make status        # Show container status
make help          # Show all available commands
make setup         # Initial project setup (install dependencies)
make test          # Run all tests (backend + frontend)
make format        # Format Python code with black (79 char limit)
```

### Manual Development
**Backend:**
```bash
cd backend
uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000
uv run pytest tests/ -v      # Run tests with verbose output
uv run black --line-length 79 *.py  # Format all Python files (required: 79 char limit)
uv sync                      # Install/sync dependencies
```

**Frontend:**
```bash
cd frontend
npm start                    # Development server (http://localhost:3000)
npm build                    # Production build
npm test                     # Run tests in interactive mode
npm test -- --coverage --watchAll=false  # Run tests with coverage (CI mode)
```

### Individual Testing Commands
```bash
make test-backend            # Run backend tests only
make test-frontend           # Run frontend tests only
make format-check            # Check if Python code needs formatting
make manual-backend          # Start backend manually (without Docker)
make manual-frontend         # Start frontend manually (without Docker)
make check-ports             # Check if required ports are available
make kill-ports              # Kill processes on required ports
```

## Architecture Overview

This is an AI-powered English conversation practice app for Japanese learners. The architecture follows a clean separation between frontend React components, custom hooks for business logic, and a FastAPI backend.

### Frontend Architecture Pattern
- **App.js**: Main coordinator that orchestrates all features
- **Custom Hooks**: Business logic separated from UI (`useChat`, `useSettings`, `useVoiceInput`, `useVoiceOutput`, `useKeyboardShortcuts`)
- **Components**: Pure UI components (`SettingsPanel`, `ChatBox`, `InputArea`, `VoiceControls`)
- **Utils**: API communication with caching, retry logic, and error handling

### Backend Architecture
- **Single File Design**: All FastAPI endpoints in `main.py` for simplicity
- **AI Integration**: Google Gemini 2.5 Flash for conversation generation
- **TTS Service**: Google Cloud Text-to-Speech with browser fallback
- **Error Handling**: Comprehensive error responses with graceful degradation

### Key Data Flow
1. User input → `InputArea` → `useChat` hook → API utility → FastAPI backend
2. Backend → Gemini AI → Response → Frontend → `useVoiceOutput` → TTS playback
3. Settings managed via `useSettings` hook with localStorage persistence

## Code Conventions

### Python (Backend)
- Format with `black --line-length 79` (strictly enforced)
- All functionality in single `main.py` file
- Extensive comments for beginner-friendly code
- Environment variables via `.env` file

### JavaScript (Frontend)
- Extensive Japanese and English comments throughout
- Custom hooks pattern for state management
- Component composition over inheritance
- PropTypes for type safety

### File Organization
```
frontend/src/
├── App.js                 # Main application coordinator
├── components/            # Pure UI components
│   ├── ChatBox/          # Message display
│   ├── InputArea/        # Text/voice input
│   ├── SettingsPanel/    # Voice/speed controls
│   └── VoiceControls/    # Recording button
├── hooks/                # Business logic hooks
│   ├── useChat.js        # Message handling & AI communication
│   ├── useSettings.js    # Settings with localStorage
│   ├── useVoiceInput.js  # Web Speech API integration
│   ├── useVoiceOutput.js # TTS functionality
│   └── useKeyboardShortcuts.js # Accessibility
└── utils/                # API communication & utilities
    ├── api.js            # HTTP client with retry/cache
    └── constants.js      # App configuration
```

## Environment Configuration

Required environment variables in `.env`:
```env
GEMINI_API_KEY=your_gemini_api_key                    # Required for AI
GOOGLE_APPLICATION_CREDENTIALS=path/to/tts-creds.json # Optional for TTS
REACT_APP_API_URL=http://localhost:8000               # Frontend API URL
```

## API Endpoints

- `GET /` - Health check
- `GET /api/status` - Service configuration status
- `GET /api/welcome` - Initial AI greeting
- `POST /api/respond` - Main conversation endpoint (expects `{message: string}`)
- `POST /api/tts` - Text-to-speech conversion (expects `{text: string}`)

## Testing Strategy

- **Backend**: pytest in `/backend/tests/` - focuses on API endpoints
- **Frontend**: React Testing Library setup
- **Integration**: Manual testing of voice features (browser-dependent)

## Key Implementation Notes

1. **Voice Features**: Web Speech API for input, Google Cloud TTS + browser fallback for output
2. **Error Resilience**: Multiple fallback mechanisms for AI and TTS services
3. **Beginner-Friendly**: Extensive comments in both Japanese and English
4. **Performance**: API caching, retry logic, and lazy loading patterns
5. **Accessibility**: Keyboard shortcuts and voice controls

## Development Guidelines

- Read AGENTS.md file completely before starting work
- Propose initial design and work plan based on AGENTS.md requirements
- Keep code beginner-friendly with frequent, appropriate comments
- Update README.md and instructions.md as needed
- All new Python code must be formatted with black (79 character limit)
- Commit messages should be short and in imperative mood
- **Never create new files** unless absolutely necessary for achieving your goal
- **Always prefer editing existing files** to creating new ones
- Use `make format` or `uv run black --line-length 79 *.py` before committing Python code
- Run `make test` to ensure all tests pass before committing changes

## Port Management and Troubleshooting

If you encounter port conflicts:
```bash
make check-ports             # Check port availability
make kill-ports              # Kill processes on ports 3000 and 8000
lsof -i :8000               # Check what's using port 8000
lsof -i :3000               # Check what's using port 3000
```

Common development workflow:
1. `make clean` - Clean Docker environment
2. `make setup` - Install dependencies
3. `make dev` - Start development mode
4. `make test` - Run all tests
5. `make format` - Format code before commit