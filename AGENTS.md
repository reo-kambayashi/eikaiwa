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
- Use single-file design pattern in `main.py`
- Add extensive comments for beginner-friendly code
- Handle errors gracefully with proper HTTP status codes
- Use environment variables for all configuration
- Follow async/await patterns for API endpoints

#### JavaScript Frontend
- Separate business logic into custom hooks
- Keep components pure and focused on UI
- Use extensive comments in both Japanese and English
- Follow component composition patterns
- Implement proper error boundaries and loading states

#### File Organization Rules
- **Never create new files** unless absolutely necessary
- **Always prefer editing existing files** to creating new ones
- Follow the established directory structure
- Maintain clear separation between hooks, components, and utilities

### Testing Strategy
- **Backend**: Use pytest for API endpoint testing (`/backend/tests/`)
- **Frontend**: React Testing Library for component testing
- **Integration**: Manual testing of voice features (browser-dependent)
- **API Testing**: Use curl or similar tools for endpoint verification

### Environment Setup
Required environment variables in `.env`:
```env
GEMINI_API_KEY=your_gemini_api_key                    # Required for AI
GOOGLE_APPLICATION_CREDENTIALS=path/to/tts-creds.json # Optional for TTS
REACT_APP_API_URL=http://localhost:8000               # Frontend API URL
```

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
```

### Manual Development
**Backend Development:**
```bash
cd backend
uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000
uv run pytest tests/          # Run tests
uv run black --line-length 79 main.py  # Format code
```

**Frontend Development:**
```bash
cd frontend
npm start          # Development server (http://localhost:3000)
npm build          # Production build
npm test           # Run tests
```

## Contribution Guidelines

### Code Submission
- Format Python code with `black` (line length 79)
- Keep commit messages short and in the imperative mood
- Test all changes thoroughly before submission
- Update documentation when making significant changes

### Pull Request Process
- Summaries should highlight key changes and mention tests run
- Include both functional and integration testing results
- Document any new environment variables or setup requirements
- Ensure all voice features work in supported browsers

### Port Management
- If port 8000 is not available, close existing processes and restart
- Check port availability: `lsof -i :8000`
- Use `make clean` to ensure clean Docker environment

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