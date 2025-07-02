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

## Translation Practice System

The app includes a comprehensive translation practice system with:
- **147 static problems** across categories (daily_life, work, travel, health, technology, education)
- **Multiple difficulty levels** (easy, medium, hard) and **Eiken levels** (5, 4, 3, pre-2, 2, pre-1, 1)
- **AI-generated problems** as fallback with dynamic difficulty adjustment
- **Intelligent answer checking** with partial credit and detailed feedback
- **Long text mode** for extended translation practice with paragraph-length content

## Testing Strategy

- **Backend**: pytest in `/backend/tests/` - focuses on API endpoints
- **Frontend**: React Testing Library setup
- **Integration**: Manual testing of voice features (browser-dependent)

## Key Implementation Notes

### Voice Features Architecture
- **Input**: Web Speech API with timeout management and error recovery
- **Output**: Dual TTS system - Google Cloud TTS (primary) with browser TTS fallback
- **Browser Compatibility**: Tested across Chrome, Firefox, Safari with feature detection
- **Visual Feedback**: Real-time wave animations and clear state indicators

### Performance and Reliability
- **API Caching**: Memory-based response caching with configurable TTL
- **Retry Logic**: Exponential backoff for network requests
- **Error Boundaries**: Comprehensive error handling preventing cascade failures
- **Lazy Loading**: Component and resource loading optimization
- **Service Degradation**: Graceful fallbacks when external services unavailable

### Accessibility and User Experience
- **Keyboard Shortcuts**: Enter (send), Space (voice input), Shift+Enter (newline), Tab (navigation)
- **ARIA Attributes**: Screen reader compatibility throughout interface
- **Visual States**: Clear feedback for voice input, processing, and error states
- **Bilingual Support**: Japanese UI with English learning content
- **Error Recovery**: User-friendly error messages with actionable guidance

### AI Integration Patterns
- **Context Management**: Conversation history limited to last 10 messages for token efficiency
- **Prompt Engineering**: Sophisticated prompt system in separate `prompts.py` with template classes
- **Response Validation**: JSON parsing with fallback handling for malformed responses
- **Service Monitoring**: Real-time service availability with status endpoint exposure

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

## Architecture Decision Records

### Single-File Backend Design
**Decision**: Consolidate all FastAPI functionality in single `main.py` file
**Rationale**: Prioritize beginner accessibility and easy navigation over traditional modular structure
**Trade-offs**: Large file size vs. simplified understanding for new developers

### Dual TTS System
**Decision**: Implement Google Cloud TTS as primary with browser TTS fallback
**Rationale**: Ensure voice output reliability across different deployment environments
**Implementation**: Service availability check before each TTS request with graceful degradation

### Custom Hooks Pattern
**Decision**: Abstract all business logic into custom hooks, keeping components purely presentational
**Rationale**: Maximize reusability, testability, and separation of concerns
**Implementation**: Each hook manages specific domain logic (chat, settings, voice, problems)

### Static + Dynamic Problem System
**Decision**: Maintain static problem database with AI generation fallback
**Rationale**: Ensure consistent quality while enabling dynamic content generation
**Implementation**: 147 curated problems with AI generation for Eiken-specific requests

## Important Development Reminders

- **Security**: Never commit API keys or sensitive credentials to repository
- **Performance**: Monitor token usage and implement conversation history limits
- **Error Handling**: Always provide fallback responses and graceful degradation
- **User Experience**: Prioritize smooth conversation flow and clear error recovery
- **Accessibility**: Maintain keyboard navigation and screen reader compatibility
- **Bilingual Support**: Preserve Japanese UI elements and English learning content separation

Common development workflow:
1. `make clean` - Clean Docker environment
2. `make setup` - Install dependencies
3. `make dev` - Start development mode
4. `make test` - Run all tests
5. `make format` - Format code before commit