# Cast Aloud - Accessibility Tools for Farcaster

## Overview

Cast Aloud is a web application that provides accessibility tools for reading and replying to Farcaster casts. The application focuses on text-to-speech functionality and voice-to-text responses, making Farcaster more accessible to users with disabilities or those who prefer audio interactions.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: Shadcn/ui with Radix UI primitives and Tailwind CSS
- **Styling**: Tailwind CSS with custom Farcaster brand colors

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for API endpoints and server-side rendering
- **File Uploads**: Multer for handling audio file uploads
- **Audio Processing**: OpenAI Whisper API for speech-to-text transcription
- **Text Generation**: OpenAI GPT-4o for polishing replies and generating responses

### Database Architecture
- **ORM**: Drizzle ORM with PostgreSQL
- **Database**: PostgreSQL (configured via DATABASE_URL environment variable)
- **Schema**: Includes tables for users, casts, voice comments, and payments
- **Storage Strategy**: In-memory storage implementation for development with interface for future database integration

## Key Components

### Voice Processing System
- **Speech Synthesis**: Browser Web Speech API with fallback voice settings
- **Speech Recognition**: Browser MediaRecorder API for audio capture
- **Audio Transcription**: OpenAI Whisper API integration
- **Text Polishing**: GPT-4o integration for improving user replies

### Farcaster Frame Integration
- **Frame Protocol**: Implements Farcaster Frame specification for in-app interactions
- **Frame Actions**: Support for listen, reply, and app access actions
- **Meta Tags**: Proper Frame meta tag generation for social media integration

### User Management
- **Authentication**: Session-based authentication (infrastructure prepared)
- **Subscription Tiers**: Free and premium tiers with crypto payment support
- **Wallet Integration**: Ethereum wallet address support for payments

### Cast Management
- **Cast Display**: Rich cast rendering with author information and metrics
- **Voice Comments**: Audio recording, transcription, and AI-generated responses
- **Reply System**: Voice-to-text reply generation with AI polishing

## Data Flow

1. **Cast Loading**: Casts are fetched from the in-memory storage or future Farcaster API integration
2. **Audio Processing**: User records voice → MediaRecorder captures audio → OpenAI Whisper transcribes → GPT-4o polishes text
3. **Text-to-Speech**: Cast content → Browser Speech Synthesis API or OpenAI TTS → Audio playback
4. **Frame Interactions**: Frame buttons → Server-side frame handlers → Response generation

## External Dependencies

### APIs and Services
- **OpenAI API**: Whisper for transcription, GPT-4o for text generation, TTS for speech synthesis
- **Farcaster Protocol**: Future integration for cast fetching and posting
- **Web APIs**: Speech Synthesis, MediaRecorder, Web Audio APIs

### NPM Packages
- **UI Framework**: React, Vite, Wouter
- **Styling**: Tailwind CSS, Radix UI, class-variance-authority
- **Data**: TanStack Query, Drizzle ORM, Zod
- **Audio**: OpenAI SDK for audio processing
- **Utilities**: date-fns, clsx, nanoid

## Deployment Strategy

### Development Environment
- **Runtime**: Node.js 20 with PostgreSQL 16
- **Development Server**: Vite dev server with HMR
- **Database**: PostgreSQL with Drizzle migrations

### Production Environment
- **Build Process**: Vite builds client, esbuild bundles server
- **Deployment Target**: Replit autoscale deployment
- **Port Configuration**: Internal port 5000, external port 80
- **Environment Variables**: DATABASE_URL, OPENAI_API_KEY

### Build Configuration
- **Client Build**: Static assets built to `dist/public`
- **Server Build**: ESM bundle built to `dist/index.js`
- **Asset Handling**: Vite handles client assets, Express serves static files

## Changelog

- June 13, 2025. Initial setup
- June 13, 2025. Implemented real-time voice speed adjustments during playback with complete UI state preservation
- June 13, 2025. Added Farcaster protocol integration with .well-known/farcaster.json endpoint for frame discovery
- June 13, 2025. Configured branded PNG assets (1024x1024 icon, 200x200 splash) served at public URLs for Farcaster frame integration
- June 13, 2025. Added Farcaster Frame SDK embed detection with compact UI for cast embeds - auto-loads cast content and shows branded player interface
- June 13, 2025. Updated Farcaster account association with authentic FID 384715 credentials for domain verification and protocol compliance

## User Preferences

Preferred communication style: Simple, everyday language.