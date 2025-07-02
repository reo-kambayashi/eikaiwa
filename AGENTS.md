# English Communication App for Japanese People

## Project Overview

This is an AI-powered English conversation practice application designed specifically for Japanese learners. The app provides a comprehensive learning environment with Google Gemini AI integration, voice recognition, and text-to-speech capabilities.

**Key Features:**
- AI conversation partner using Google Gemini 2.5 Flash
- Voice input via Web Speech API
- Voice output via Google Cloud TTS with browser fallback
- Grammar checking and feedback
- Beginner-friendly UI with extensive Japanese/English comments

## Implementation Requirements

### Code Quality Standards
- Write code and design directory structure in a way that is easy to understand, even for beginners
- Add comments frequently and place them appropriately throughout the code
- Maintain extensive Japanese and English comments throughout the codebase
- Follow the established architectural patterns (custom hooks, component composition)
- Update README.md and instructions.md as needed when making significant changes

### Code Formatting
- **Python**: Format with `black --line-length 79` (strictly enforced)
- **JavaScript**: Follow existing React patterns and PropTypes usage
- All new code must follow the established conventions in the codebase

## Technology Stack

### Frontend
- **Framework**: React.js with functional components
- **State Management**: Custom hooks pattern (`useChat`, `useSettings`, `useVoiceInput`, `useVoiceOutput`, `useKeyboardShortcuts`)
- **UI Architecture**: Component composition over inheritance
- **Type Safety**: PropTypes for runtime type checking
- **Package Manager**: npm

### Backend
- **Framework**: Python FastAPI (single-file design in `main.py`)
- **Package Manager**: uv (modern Python package manager)
- **Virtual Environment**: uv-managed virtual environments
- **AI Integration**: Google Gemini 2.5 Flash API
- **TTS Service**: Google Cloud Text-to-Speech with browser fallback

### APIs and Services
- **GEMINI_API**: Primary AI conversation service (required)
- **GOOGLE_APPLICATION_CREDENTIALS**: For high-quality TTS (optional)
- **Web Speech API**: Browser-based voice recognition

## Architecture Patterns

### Frontend Architecture
Follow the established patterns:

1. **Custom Hooks for Business Logic**:
   - `useChat.js`: Message handling & AI communication
   - `useSettings.js`: Settings with localStorage persistence
   - `useVoiceInput.js`: Web Speech API integration
   - `useVoiceOutput.js`: TTS functionality
   - `useKeyboardShortcuts.js`: Accessibility features

2. **Pure UI Components**:
   - `ChatBox/`: Message display with auto-scroll
   - `InputArea/`: Text/voice input handling
   - `SettingsPanel/`: Voice and speed controls
   - `VoiceControls/`: Recording button with visual feedback

3. **Utility Layer**:
   - `api.js`: HTTP client with retry logic, caching, and error handling
   - `constants.js`: Application configuration and defaults

### Backend Architecture
- **Single File Design**: All FastAPI endpoints in `main.py` for simplicity
- **Error Handling**: Comprehensive error responses with graceful degradation
- **API Structure**: RESTful endpoints with clear documentation
- **Environment Configuration**: Secure handling of API keys via `.env`

### Data Flow Pattern
```
User Input → InputArea → useChat hook → API utility → FastAPI backend
Backend → Gemini AI → Response → Frontend → useVoiceOutput → TTS playback
Settings managed via useSettings hook with localStorage persistence
```

## Development Guidelines

### Getting Started
1. **Read Documentation**: Review CLAUDE.md completely before starting work
2. **Understand Architecture**: Study the custom hooks and component patterns
3. **Propose Plans**: Create initial design and work plan based on requirements
4. **Test Early**: Use both manual and automated testing approaches

### Code Conventions

#### Python Backend
- Format with `black --line-length 79` (strictly enforced via pyproject.toml)
- Single-file design pattern in `main.py` with comprehensive section organization
- Extensive bilingual comments for beginner-friendly code
- Environment variables via `.env` file with graceful fallback handling
- Pydantic models for all request/response validation
- Service availability checks before external API calls

#### JavaScript Frontend
- Extensive Japanese and English comments throughout codebase
- Custom hooks pattern for all business logic abstraction
- Component composition over inheritance with clear separation of concerns
- PropTypes for runtime type safety without TypeScript complexity
- Centralized constants organization in `utils/constants/` directory
- Immutable state patterns for predictable updates

#### File Organization Rules
- **Never create new files** unless absolutely necessary for achieving your goal
- **Always prefer editing existing files** to creating new ones
- Follow the established directory structure and naming conventions
- Maintain clear separation between hooks, components, and utilities

### Testing Strategy
- **Backend**: pytest in `/backend/tests/` focusing on API endpoint structure and service availability
- **Frontend**: React Testing Library with coverage reporting for component and hook testing
- **Integration**: Manual testing of voice features across browsers (Chrome, Firefox, Safari)
- **API Testing**: Service availability testing with graceful degradation validation
- **Always run tests for any code changes made** - test relevant functionality after each modification
- **Continuously improve tests** - enhance test coverage and quality when working on code changes

### Environment Setup
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

## Development Workflow

### Docker-First Approach (Recommended)
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

### Additional Development Commands
```bash
make test-backend            # Run backend tests only
make test-frontend           # Run frontend tests only
make format-check            # Check if Python code needs formatting
make manual-backend          # Start backend manually (without Docker)
make manual-frontend         # Start frontend manually (without Docker)
make check-ports             # Check if required ports are available
make kill-ports              # Kill processes on required ports
```

### Manual Development
**Backend Development:**
```bash
cd backend
uv sync                      # Install/sync dependencies
uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000
uv run pytest tests/ -v      # Run tests with verbose output
uv run black --line-length 79 *.py  # Format all Python files
```

**Frontend Development:**
```bash
cd frontend
npm install                  # Install dependencies
npm start                    # Development server (http://localhost:3000)
npm build                    # Production build
npm test                     # Run tests in interactive mode
npm test -- --coverage --watchAll=false  # Run tests with coverage (CI mode)
```

## Contribution Guidelines

### Code Submission
- Format Python code with `black` (line length 79)
- Keep commit messages short and in the imperative mood
- Test all changes thoroughly before submission
- Update documentation when making significant changes
- **Update CLAUDE.md, GEMINI.md, and AGENTS.md appropriately** when making architectural or workflow changes

### Pull Request Process
- Summaries should highlight key changes and mention tests run
- Include both functional and integration testing results
- Document any new environment variables or setup requirements
- Ensure all voice features work in supported browsers

### Port Management and Troubleshooting
- If port 8000 is not available, close existing processes and restart
- Check port availability: `lsof -i :8000` or `make check-ports`
- Kill processes on required ports: `make kill-ports`
- Use `make clean` to ensure clean Docker environment

### Common Development Workflow
1. `make clean` - Clean Docker environment
2. `make setup` - Install dependencies  
3. `make dev` - Start development mode
4. `make test` - Run all tests
5. `make format` - Format code before commit
6. Make changes and test manually
7. `make test` - Verify tests still pass
8. Commit changes

## Key Implementation Notes

### Voice Features
- **Input**: Web Speech API requires HTTPS or localhost
- **Output**: Google Cloud TTS with graceful fallback to browser TTS
- **Error Handling**: Multiple fallback mechanisms for reliability
- **Browser Compatibility**: Test across Chrome, Firefox, Safari

### Performance Considerations
- **API Caching**: Implement TTL-based caching for API responses
- **Retry Logic**: Handle network failures gracefully
- **Lazy Loading**: Load components and resources on demand
- **Error Boundaries**: Prevent cascading failures in UI

### Accessibility Features
- **Keyboard Shortcuts**: Enter (send), Space (voice input), Shift+Enter (newline)
- **ARIA Attributes**: Proper labeling for screen readers
- **Visual Feedback**: Clear states for voice input and processing
- **Error Messages**: User-friendly error handling and recovery

### Beginner-Friendly Design
- **Extensive Comments**: Both Japanese and English throughout codebase
- **Clear Architecture**: Well-documented separation of concerns
- **Simple Patterns**: Consistent use of hooks and component composition
- **Error Messages**: Helpful debugging information for common issues

## Important Reminders

- **Security**: Never commit API keys or sensitive credentials
- **Documentation**: Update both technical docs and user instructions
- **Testing**: Verify voice features across different browsers and devices
- **Backwards Compatibility**: Maintain existing API contracts when possible
- **User Experience**: Prioritize smooth conversation flow and error recovery