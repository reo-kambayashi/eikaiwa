# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

This is an AI-powered English conversation practice app for Japanese learners. The architecture follows a clean separation between frontend React components, custom hooks for business logic, and a FastAPI backend with dual-mode functionality.

### Application Modes
The app operates in two distinct modes:
- **Chat Mode**: Real-time AI conversation practice with voice interaction
- **Instant Translation Mode**: Structured translation practice with 147+ problems across multiple difficulty levels

### Frontend Architecture Pattern
- **App.js**: Main coordinator that orchestrates all features and manages mode switching
- **Custom Hooks**: Business logic separated from UI with specialized hooks for each concern
- **Components**: Pure UI components organized by feature and responsibility
- **Utils**: Centralized API communication with caching, retry logic, and comprehensive error handling

#### Key Custom Hooks
- **`useChat`**: Message handling, AI communication, conversation history management
- **`useSettings`**: Settings persistence with localStorage integration
- **`useVoiceInput`**: Web Speech API integration with timeout and error handling
- **`useVoiceOutput`**: TTS functionality with Gemini 2.5 Flash Preview TTS + browser fallback
- **`useProblemManager`**: Translation problem generation and management
- **`useAnswerChecker`**: AI-powered translation validation and feedback
- **`useKeyboardShortcuts`**: Accessibility and keyboard navigation (Enter, Space, Shift+Enter)

#### Component Organization
```
components/
├── ChatBox/           # Message display with typing indicators and auto-scroll
├── InputArea/         # Text/voice input with visual feedback
├── SettingsPanel/     # Voice configuration and app settings
├── GeminiChat/        # Separate AI chat interface for advanced interactions
├── InstantTranslation/ # Complete translation practice interface
├── Header/            # Mode navigation and branding
└── VoiceControls/     # Recording button with visual state feedback
```

### Backend Architecture
- **Single File Design**: All FastAPI endpoints consolidated in `main.py` (1,044 lines) for beginner accessibility
- **Advanced Prompt System**: Separate `prompts.py` (591 lines) with sophisticated AI prompt templating
- **AI Integration**: Google Gemini 2.5 Flash with context management and graceful degradation
- **TTS Service**: Gemini 2.5 Flash Preview TTS with browser fallback and multiple voice options
- **Error Handling**: Multi-layer error handling with service availability checks and fallback responses

#### Core API Endpoints
- `GET /` - Health check and service status
- `GET /api/status` - Detailed service configuration status (Gemini, TTS, credentials)
- `GET /api/welcome` - AI-generated personalized welcome messages
- `POST /api/respond` - Main conversation endpoint with context management
- `POST /api/tts` - Text-to-speech using Gemini 2.5 Flash Preview TTS with multiple voice options (Kore, Puck, Charon, Zephyr, Aoede, Nova)
- `GET /api/instant-translation/problem` - Dynamic problem generation with filtering
- `POST /api/instant-translation/check` - AI-powered answer validation with detailed feedback

### Key Data Flow Patterns
1. **Chat Flow**: User input → `InputArea` → `useChat` hook → API utility → FastAPI backend → Gemini AI → Response → `useVoiceOutput` → TTS playback
2. **Translation Flow**: Problem request → `useProblemManager` → Backend → Static DB or AI generation → Frontend display → Answer submission → AI validation → Feedback
3. **Settings Flow**: Component → `useSettings` hook → localStorage persistence → State synchronization
4. **Voice Flow**: Web Speech API → `useVoiceInput` → State management → Message processing → TTS output

## Code Conventions

### Python (Backend)
- Format with `black --line-length 79` (strictly enforced via pyproject.toml)
- Single-file design pattern in `main.py` with comprehensive section organization
- Extensive bilingual comments for beginner-friendly code
- Environment variables via `.env` file with graceful fallback handling
- Pydantic models for all request/response validation
- Service availability checks before external API calls

### JavaScript (Frontend)
- Extensive Japanese and English comments throughout codebase
- Custom hooks pattern for all business logic abstraction
- Component composition over inheritance with clear separation of concerns
- PropTypes for runtime type safety without TypeScript complexity
- Centralized constants organization in `utils/constants/` directory
- Immutable state patterns for predictable updates

### File Organization
```
frontend/src/
├── App.js                 # Main application coordinator and mode manager
├── components/            # Pure UI components organized by feature
│   ├── ChatBox/          # Message display with auto-scroll and typing indicators
│   ├── InputArea/        # Text/voice input with keyboard shortcut support
│   ├── SettingsPanel/    # Voice/speed controls with persistence
│   ├── InstantTranslation/ # Complete translation practice interface
│   ├── GeminiChat/       # Advanced AI chat with separate context
│   ├── Header/           # Navigation and mode switching
│   └── VoiceControls/    # Recording button with visual feedback
├── hooks/                # Business logic hooks with clear responsibilities
│   ├── useChat.js        # Conversation management and AI communication
│   ├── useSettings.js    # Settings with localStorage persistence
│   ├── useVoiceInput.js  # Web Speech API integration
│   ├── useVoiceOutput.js # TTS with Google Cloud + browser fallback
│   ├── useProblemManager.js # Translation problem generation
│   ├── useAnswerChecker.js # AI-powered answer validation
│   └── useKeyboardShortcuts.js # Accessibility and navigation
└── utils/                # API communication and shared utilities
    ├── api.js            # HTTP client with retry, caching, and error handling
    ├── constants/        # Organized configuration constants
    │   ├── apiConstants.js    # API endpoints and timeout configuration
    │   ├── settingsConstants.js # Default settings and validation limits
    │   ├── speechConstants.js   # Voice recognition and TTS configuration
    │   └── uiConstants.js      # UI messages and animation timings
    ├── errorHandling.js  # Comprehensive error types and handling
    └── performance.js    # Performance monitoring and optimization
```

## Environment Configuration

Required environment variables in `.env`:
```env
GEMINI_API_KEY=your_gemini_api_key                    # Required for AI features
GOOGLE_APPLICATION_CREDENTIALS=path/to/tts-creds.json # Optional for high-quality TTS
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

- **Backend**: pytest in `/backend/tests/` focusing on API endpoint structure and service availability
- **Frontend**: React Testing Library with coverage reporting for component and hook testing  
- **Integration**: Manual testing of voice features across browsers (Chrome, Firefox, Safari)
- **API Testing**: Service availability testing with graceful degradation validation

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

### Pre-Development Checklist
- Read AGENTS.md file completely before starting work
- Propose initial design and work plan based on AGENTS.md requirements
- Understand the dual-mode architecture (Chat vs Translation)
- Review existing patterns in custom hooks and component organization

### Code Quality Standards
- Keep code beginner-friendly with frequent, appropriate bilingual comments
- Follow established architectural patterns (custom hooks, component composition)
- Update README.md and instructions.md when making significant changes
- All new Python code must be formatted with black (79 character limit)
- Use PropTypes for new React components
- Implement proper error boundaries and loading states

### File Management Rules
- **Never create new files** unless absolutely necessary for achieving your goal
- **Always prefer editing existing files** to creating new ones
- Follow the established directory structure and naming conventions
- Maintain clear separation between hooks, components, and utilities

### Testing and Quality Assurance
- Use `make format` or `uv run black --line-length 79 *.py` before committing Python code
- Run `make test` to ensure all tests pass before committing changes
- **Always run tests for any code changes made** - test relevant functionality after each modification
- **Continuously improve tests** - enhance test coverage and quality when working on code changes
- Test voice features across different browsers and devices
- Verify both Chat and Translation modes function correctly after changes
- Check service availability fallbacks work properly

### Commit and Documentation Standards
- Commit messages should be short and in imperative mood
- Include testing performed in pull request descriptions
- Document any new environment variables or setup requirements
- Ensure backwards compatibility for existing API contracts

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