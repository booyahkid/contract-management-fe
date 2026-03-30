# Contract Management Frontend

A modern contract management application built with [Next.js](https://nextjs.org), TypeScript, and React. This frontend provides a comprehensive interface for managing contracts, emails, documents, and AI-powered document extraction.

## Project Structure

- `src/app` - Next.js App Router pages and layouts
- `src/components` - Reusable React components (UI library, dashboard, RAG)
- `src/lib` - Utility functions and API integration
- `src/types` - TypeScript type definitions
- `src/hooks` - Custom React hooks
- `public` - Static assets

## Key Features

- Contract Management: Create, view, edit, and search contracts
- Dashboard: Analytics and contract insights with multiple chart types
- Email System: Compose and manage emails with templates
- Document Management: Upload, organize, and manage contract documents
- RAG (Retrieval-Augmented Generation): AI-powered document extraction and chat
- Authentication: Secure login and session management
- Dark Mode: Theme toggle support
- Responsive UI: Mobile-friendly design with sidebar navigation

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

The application includes automatic hot-reload. Edit files in `src/` to see changes automatically reflected.

## Build and Deployment

Build for production:

```bash
npm run build
npm start
```

This project is configured for deployment on Vercel. For other deployment options, refer to the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).

## Technology Stack

- Next.js 14+ with App Router
- TypeScript for type safety
- React 18+
- Tailwind CSS for styling
- ESLint for code quality
- PostCSS for CSS processing

## Development

Lint the codebase:

```bash
npm run lint
```

Refer to [Next.js Documentation](https://nextjs.org/docs) for more information on developing with Next.js.
