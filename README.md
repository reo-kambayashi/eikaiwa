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

Copy `.env.example` to `.env` in the project root and fill in your own values.
These variables enable external APIs:

```
GEMINI_API=your_api_key
GOOGLE_APPLICATION_CREDENTIALS=~/.config/gcloud/tts-service-account.json
REACT_APP_API_URL=http://localhost:8000
```

## Google cloud tts
Download json file from https://console.cloud.google.com/
```bash
mv ~/Downloads/your-downloaded-key.json ~/.config/gcloud/tts-service-account.json #(option) mv json file
gcloud auth application-default login
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
