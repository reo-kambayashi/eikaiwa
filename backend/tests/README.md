# Tests directory for the English Communication App backend

This directory contains tests for the backend API endpoints and functionality.

## Running Tests

### Using the development script (recommended):
```bash
cd backend
python dev.py test
```

### Using pytest directly:
```bash
cd backend
uv run pytest tests/
```

### Running specific tests:
```bash
cd backend
uv run pytest tests/test_main.py::TestBasicEndpoints::test_root_endpoint
```

## Test Structure

- `test_main.py` - Tests for the main API endpoints
- Future test files can be added here following the `test_*.py` naming pattern

## Writing New Tests

When adding new functionality, please add corresponding tests:

1. Create test files with the `test_` prefix
2. Use descriptive test method names starting with `test_`
3. Add docstrings explaining what each test does
4. Include both positive and negative test cases
5. Test error handling and edge cases

## Test Categories

- **Basic Endpoints**: Health check and status endpoints
- **Conversation Endpoints**: AI conversation functionality
- **TTS Endpoints**: Text-to-speech functionality
- **Integration Tests**: End-to-end functionality (future)

## Requirements

Tests require:
- `pytest` - Testing framework
- `pytest-asyncio` - For async endpoint testing
- `httpx` - HTTP client for testing (included with FastAPI TestClient)

These are included in the development dependencies in `pyproject.toml`.
