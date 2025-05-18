# keysPROtting
A system developed for NDS that correlates stock market fluctuations with online news and social media sentiment using web scraping, NLP, and machine learning to detect patterns and insights.

## Development

### Prerequisites

- [Docker](https://docs.docker.com/engine/install/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Git](https://git-scm.com/downloads)
- [VSCode](https://code.visualstudio.com/download)

## If you are in Windows follow the following additional steps

1. [Install WSL](https://learn.microsoft.com/es-es/windows/wsl/install/)
2. [Install Docker Compose for Windows](https://www.ionos.com/digitalguide/server/configuration/install-docker-compose-on-windows/) You have to run a terminal with administrator permissions

### Getting Started

1. Install the following extensions in VSCode:

- [DevContainers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

2. Clone the repository

```bash
git clone https://github.com/TecMrDocs/Cropopoly3-WhisperTrend
```

3. Change to the project directory

```bash
# Open the project directory in VSCode or use the terminal
code keysPROtting
```

4. Open the project in a container

- Press `F1` and select `Dev Containers: Reopen in Container`

5. Install the project dependencies

- Open a terminal and run the following commands:

```bash
cd core/web
bun install
```

6. Start the project

```bash
cd core/server/app
cargo run
```

```bash
cd core/web
npm run dev
```

# Backend

- Create a `.env` file inside the app folder and add the following environment variables:

```bash
# core/server/app/.env
MODE=dev
RUST_LOG=debug
HOST=0.0.0.0
PORT=8080

SECRET_KEY=secret

DATABASE_URL=postgres://admin:awdrqwer12@database-server:5432/ksp
POSTGRES_USER=admin
POSTGRES_PASSWORD=awdrqwer12
POSTGRES_DB=ksp

GROQ_API_KEY=gsk_...
```