# Typrogram

## About

Free typing game for programmers. You can import any GitHub repository and practice typing through real code.

## URL

[https://typrogram.com](https://typrogram.com)

## Features

- **Import GitHub Repositories**: Import any public GitHub repository and use its source code as typing practice material
- **Real Code Practice**: Practice typing with actual code from open-source projects
- **Language Filtering**: Filter code by programming language extension (js, rb, html, etc.)
- **Typing Statistics**: Track your typing speed (WPM), accuracy, and progress over time

## Demo

Step 1: Import GitHub Repository

https://github.com/user-attachments/assets/f7b695ee-a0f5-4d76-97ef-f0b138278c19

Step 2: Start Typing Practice

https://github.com/user-attachments/assets/febb259b-5038-4707-b99a-945b0091bb2e

## Tech Stack

### Backend

- Ruby 3.4.2
- Ruby on Rails 8.1.1
- PostgreSQL
- RSpec Rails 8.0.2 (testing)
- RuboCop 1.81.7 (linting)

### Frontend

- Next.js 15.2.4
- React 19.0.0
- TypeScript 5.x
- Auth.js 5.0.0-beta.27
- Tailwind CSS v4
- shadcn/ui (component library)
- Jest 29.7.0 (testing)
- ESLint 9 (linting)
- Prettier 3.5.3 (code formatting)

### Infrastructure

- Fly.io (backend hosting)
- Vercel (frontend hosting)

### CI/CD

- GitHub Actions

## Requirements

### Backend

- Ruby 3.4.2
- PostgreSQL

### Frontend

- Node.js 18.18+

## Setup

### Installation

```bash
bin/setup
```

### Configuration

#### Backend

Create a `backend/.env` file and set the following environment variables:

```bash
# CORS configuration
FRONTEND_URL=http://localhost:3000

# GitHub API
GITHUB_ACCESS_TOKEN=your_github_personal_access_token
```

**How to get a GitHub Personal Access Token:**

1. Log in to GitHub
2. Go to Settings > Developer settings > Personal access tokens > Tokens (classic)
3. Click "Generate new token (classic)"
4. Select the `public_repo` scope
5. Generate the token and set it in the `.env` file

#### Frontend

Create a `frontend/.env` file and set the following environment variables:

```bash
# Backend URL
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000

# NextAuth configuration
AUTH_URL=http://localhost:3000/api/auth
AUTH_SECRET=your_auth_secret_here
AUTH_GITHUB_ID=your_github_oauth_app_client_id
AUTH_GITHUB_SECRET=your_github_oauth_app_client_secret
```

**How to create a GitHub OAuth App:**

1. Log in to GitHub
2. Go to Settings > Developer settings > OAuth Apps
3. Click "New OAuth App"
4. Set Application name, Homepage URL, and Authorization callback URL
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:8000/api/auth/callback/github`
5. Get the Client ID and Client Secret and set them in `.env`

**Generate AUTH_SECRET:**

```bash
npx auth secret
```

### Running the Application

To start both servers at once:

```bash
bin/server
```

To start them individually:

```bash
# Backend server (port 8000)
cd backend
bin/rails server

# Frontend server (in a separate terminal, port 3000)
cd frontend
npm run dev
```

Access `http://localhost:3000` in your browser.

### Testing

#### Backend

```bash
cd backend
bundle exec rspec
```

#### Frontend

```bash
cd frontend
npm run test

# Run tests with coverage
npm run test:coverage
```

## License

"Typrogram" is under [MIT license](LICENSE).
