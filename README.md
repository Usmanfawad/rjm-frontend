# MIRA - Cultural Media Reimagined

MIRA is an AI-powered cultural intelligence platform that empowers authentic voices and transforms how brands connect with diverse communities through culturally-intelligent personas.

## Features

- **Persona Intelligence** — Access 300+ culturally-mapped personas across 13 advertising categories
- **Cultural Mapping** — 22 cultural phyla and 6 multicultural expression lineages for authentic targeting
- **Generational Insights** — 32 generational segments spanning Gen Z to Boomers with behavioral mapping
- **Local Strategy** — 125 DMA local culture segments for geographic and regional nuance
- **AI Generation** — Instant persona programs tailored to your brand brief and campaign objectives
- **Activation Plans** — Strategic recommendations with cultural touchpoints and media guidance
- **Voice Chat** — AI-powered chat assistant with voice recording and transcription
- **Dark/Light Theme** — Fully responsive UI with theme switching

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **Theming**: next-themes
- **Fonts**: Geist Sans & Geist Mono

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd rjm-frontend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth route group
│   ├── chat/              # Chat with MIRA assistant
│   ├── dashboard/         # User dashboard
│   ├── generator/         # Persona program generator
│   ├── login/             # Login page
│   ├── personas/          # Persona generations history
│   ├── profile/           # User profile
│   ├── register/          # Registration page
│   └── settings/          # User settings
├── components/
│   ├── auth/              # Authentication components
│   ├── chat/              # Chat interface components
│   ├── dashboard/         # Dashboard widgets
│   ├── generator/         # Persona generator components
│   ├── layout/            # Navbar, Footer
│   ├── marketing/         # Landing page components
│   └── ui/                # Reusable UI components
├── context/               # React Context providers
│   ├── AuthContext.tsx    # Authentication state
│   └── ThemeContext.tsx   # Theme management
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and API client
└── types/                 # TypeScript type definitions
```

## API Integration

The frontend connects to a backend API (default: `http://localhost:8000`) with the following endpoints:

- **Authentication**: Login, Register, Email confirmation
- **RJM/Persona**: Generate programs, Chat with MIRA, Audio transcription
- **Generations**: View and manage persona generation history

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:8000` |

## License

Private project - All rights reserved.
