# English Communication App

This project helps Japanese learners practice English.
It has a React frontend (in the `frontend` folder) and a simple FastAPI backend.

## Backend Setup

1. Install [uv](https://github.com/astral-sh/uv).
2. Create the environment and install dependencies:

   ```bash
   uv venv .venv
   uv pip install -r backend/requirements.txt
   ```

3. Start the server:

   ```bash
   uvicorn backend.main:app --reload
   ```

## Environment Variables

Set the following variables to enable external APIs:

```
GEMINI_API=your_api_key
GOOGLE_APPLICATION_CREDENTIALS=path/to/credentials.json
```

## Frontend Setup

Run the frontend inside the `frontend` directory:

```bash
cd frontend
npm install
npm start
npm test
```

The app will be available at <http://localhost:3000>.
