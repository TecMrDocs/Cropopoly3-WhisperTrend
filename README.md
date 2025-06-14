# WhisperTrend
**WhisperTrend** is an intelligent system developed as part of the NDS initiative. Its goal is to correlate fluctuations in the stock market with sentiment derived from online news outlets and social media platforms such as X, Instagram, and Reddit.

The system leverages **web scraping**, **natural language processing (NLP)**, and **machine learning (ML)** techniques to identify relevant patterns, uncover insights, and help anticipate market movements based on real-time media activity. These insights are designed to support financial analysts, researchers, and developers working on automated investment strategies.

Through the integration of multiple data sources and the analysis of public sentiment, WhisperTrend provides a modern approach to understanding the influence of digital narratives on financial trends.

## Team members 

| Nombre completo                             | Matrícula     |
|--------------------------------------------|---------------|
| Arturo Barrios Mendoza                     | A01168331     |
| Lucio Arturo Reyes Castillo                | A01378985     |
| Santiago Villazón Ponce de León            | A01746396     |
| Mariana Balderrábano Aguilar               | A01749581     |
| Andrés Cabrera Alvarado                    | A01798681     |
| Renato García Morán                        | A01799387     |
| Iván Alexander Ramos Ramírez               | A01750817     |
| Julio Cesar Vivas Medina                   | A01749879     |
| Carlos Alberto Zamudio Velázquez           | A01799283     |
| Sebastián Antonio Almanza                  | A01749694     |

## Development

### Prerequisites
**Please verify you have the following to run the repository**
- [Docker](https://docs.docker.com/engine/install/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Git](https://git-scm.com/downloads)
- [VSCode](https://code.visualstudio.com/download)

**If you are in Windows follow the following additional steps**

1. [Install WSL](https://learn.microsoft.com/es-es/windows/wsl/install/)
2. [Install Docker Compose for Windows](https://www.ionos.com/digitalguide/server/configuration/install-docker-compose-on-windows/) You have to run a terminal with administrator permissions

### Getting Started

**1. Install the following extensions in VSCode:**

- [DevContainers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

**2. Clone the repository**

```bash
git clone https://github.com/TecMrDocs/Cropopoly3-WhisperTrend
```

**3. Change to the project directory**

```bash
# Open the project directory in VSCode or use the terminal
code WhisperTrend
```

**4. Open the project in a container**

- Press `F1` and select `Dev Containers: Reopen in Container`
![Reopen Container](readmeimg/Reopen.png)


**5. Install the project dependencies**

- Open a terminal and run the following commands:

```bash
cd core/web
bun install
```
![Bun Install](readmeimg/Buninstall.png)

**6. Start the project**

```bash
cd core/server/app
cargo run
```
![Cargo run](readmeimg/Cargorun.png)

```bash
cd core/web
npm run dev
```
![Run dev](readmeimg/Rundev.png)

# Backend

- Create a `.env` file inside the app folder and add the following environment variables:

![Run dev](readmeimg/Backenv.png)
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

BROWSERLESS_WS=ws://browserless-chrome:3000

RESEND_API_KEY=re_V8dSqt3d_HXzVRp1wBrGCvtzP7vyuqRex
EMAIL_FROM="WhisperTrend <noreply@whispertrend.lat>"

INSTAGRAM_USERNAME=jonh@example.com
INSTAGRAM_PASSWORD=awdrqwer12

TWITTER_USERNAME=jonh@example.com
TWITTER_PASSWORD=awdrqwer12

RESEND_API_KEY=re_V8dSqt3d_HXzVRp1wBrGCvtzP7vyuqRex
EMAIL_FROM="WhisperTrend <noreply@whispertrend.lat>"
```

# Frontend
- Create a `.env` file inside the web folder and add the following environment variables:
![env front](readmeimg/Frontenv.png)

```bash
#core/web/.env
VITE_APP_SERVER_PROTOCOL = "http"
VITE_APP_SERVER_PORT = "8080"
VITE_APP_SERVER_HOST = "localhost"
VITE_APP_API_ROUTE = "api/v1/"
```
