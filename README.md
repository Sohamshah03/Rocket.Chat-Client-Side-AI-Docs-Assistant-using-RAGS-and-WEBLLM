# Rocket.Chat Client-Side AI Docs Assistant

This project is a client-side AI documentation assistant for Rocket.Chat, leveraging Retrieval-Augmented Generation (RAG) and WebLLM for efficient and intelligent document querying. The assistant enables users to interact with Rocket.Chat documentation using AI-powered natural language understanding.

## Features

- Uses **Retrieval-Augmented Generation (RAG)** to fetch relevant documentation snippets.
- Powered by **WebLLM** for efficient, client-side AI inference.
- Runs completely in the browser without requiring a backend AI model.
- Integrates with **ChromaDB** as the vector database for efficient document retrieval.

## Prerequisites

Before running the project, ensure you have the following installed:

- **Node.js** (>= 16.x)
- **npm** (>= 8.x)
- **ChromaDB** (for vector storage)
- **Git** (to clone the repository)

## Setup and Running the Project

Follow these steps to set up and run the Rocket.Chat AI Docs Assistant:

### Step 1: Clone the Repository

Use Git to clone the project:

```bash
git clone https://github.com/Sohamshah03/Rocket.Chat-Client-Side-AI-Docs-Assistant-using-RAGS-and-WEBLLM

cd Rocket.Chat-Client-Side-AI-Docs-Assistant-using-RAGS-and-WEBLLM
```

### Step 2: Run ChromaDB Server

You need to start the ChromaDB server with an absolute path to the vector database(**absolute path to the folder vectordb**).

#### Bash Command:

```bash
chroma run --path /home/your-username/path-to-db
```

#### PowerShell Command:

```powershell
chroma run --path C://your-username//path-to-db
```

### Step 3: Configure Environment Variables

Set the required environment variables for CORS to allow all origins.

#### PowerShell Command:

```powershell
$env:CHROMA_SERVER_CORS_ALLOW_ORIGINS = '["*"]'
```

#### Bash Command:

```bash
export CHROMA_SERVER_CORS_ALLOW_ORIGINS='["*"]'
```

### Step 4: Install Dependencies

Navigate to the project directory and install dependencies:

```bash
npm install
```

### Step 5: Start the Development Server

Run the following command to start the application:

```bash
npm run dev
```

### Step 6: Access the Application

Once the server is running, open your browser and visit:

```
http://localhost:5173
```

## Notes

- Ensure that ChromaDB is running before starting the client.
- If you face any CORS issues, double-check your environment variable settings.
- WebLLM runs in the browser, so there is no need for a backend model.

## Contributing

Feel free to contribute to the project by submitting issues or pull requests.

## License

This project is licensed under the MIT License.
