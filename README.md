# testrepo — Document Q&A (Spring AI RAG with Role-Based Access)

A full-stack RAG (Retrieval-Augmented Generation) application:

- **Backend** (this directory): Spring Boot 3.5 + Spring AI, Spring Security (JWT, role-based), H2 + JPA
- **Frontend** (`frontend/`): Angular 19 standalone app

## How it works

1. An **ADMIN** user uploads PDF documents on the *Manage Documents* screen.
2. The backend extracts text (`spring-ai-pdf-document-reader`), splits it into chunks
   (`TokenTextSplitter`), embeds each chunk with a **local ONNX embedding model**
   (all-MiniLM-L6-v2 via `spring-ai-starter-model-transformers` — Anthropic has no
   embedding API, so no second key is needed), and indexes it in a file-persisted
   `SimpleVectorStore` (`./data/vector-store.json`).
3. Any authenticated user (USER or ADMIN) asks questions on the *Ask Questions* screen.
   The backend retrieves the top-5 similar chunks and sends them as context to
   **Anthropic Claude** (`claude-opus-4-8`), which answers strictly from the documents.

## Prerequisites

- JDK 21+ (project is configured for 25)
- Node.js 20+
- An Anthropic API key

## Run the backend

```bash
export ANTHROPIC_API_KEY=sk-ant-...
./gradlew bootRun
```

Runs on `http://localhost:8080`. On first document upload the embedding model
(~90 MB ONNX) is downloaded automatically — an internet connection is required once.

Seeded accounts (change before real use):

| Username | Password   | Role  |
|----------|------------|-------|
| `admin`  | `admin123` | ADMIN |
| `user`   | `user123`  | USER  |

New accounts created via *Register* get the USER role.

## Run the frontend

```bash
cd frontend
npm install
npm start
```

Opens on `http://localhost:4200`; API calls are proxied to the backend
(`proxy.conf.json`), so no CORS setup is needed in dev.

## API overview

| Method | Path                  | Access        | Purpose                              |
|--------|-----------------------|---------------|--------------------------------------|
| POST   | `/api/auth/login`     | public        | Login → `{token, username, role}`    |
| POST   | `/api/auth/register`  | public        | Create USER account                  |
| POST   | `/api/documents`      | ADMIN         | Upload + index a PDF (multipart)     |
| GET    | `/api/documents`      | ADMIN         | List indexed documents               |
| POST   | `/api/chat/ask`       | authenticated | Ask a question → `{answer, sources}` |

## Configuration

`src/main/resources/application.yml`:

- `spring.ai.anthropic.api-key` — from `ANTHROPIC_API_KEY`
- `spring.ai.anthropic.chat.options.model` — `claude-opus-4-8`
- `app.jwt.secret` — override via `JWT_SECRET` in production (≥ 32 bytes)
- `app.vector-store.path` — where the vector index is persisted

Runtime data (H2 database + vector store) lives under `./data/` and is git-ignored.
