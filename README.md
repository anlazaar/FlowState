# FlowState

FlowState is a modern, gamified deep-work and focus tracking Next.js web application. It combines traditional focus sessions (Pomodoro technique) with a comprehensive gamification system to encourage long-term digital discipline.

## Features

- **Gamified Focus Timer**: Start custom or preset focus sessions. Accurate client/server synchronized countdown.
- **Anti-Distraction Mechanics**: Tab visibility detection and warnings prevent you from wandering off during a session.
- **Leveling & XP System**: Earn XP for every successful minute of focus. Level up and build your focus score.
- **Streaks & Heatmap**: Activity history is visualized through a GitHub-style heatmap. Maintain daily streaks.
- **Rich User Profiles**: 
  - Update your custom @username and upload an avatar.
  - Social Links map to connect your GitHub, LinkedIn, or personal website.
  - Highly customizable themes (Violet, Blue, Green, Orange) dynamically tint your dashboard and public profile.
- **Sound & Keyboard Shortcuts**: Web Audio API integration for unobtrusive chimes. Hit `Enter` to start, `Escape` to quit.
- **Dark-Theme UI**: Sleek, glassmorphic design utilizing TailwindCSS, Framer Motion, and shadcn/ui.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: TailwindCSS v4 with global CSS variable theming
- **UI Components**: shadcn/ui + Radix Primitives + framer-motion + lucide-react
- **Database**: Prisma ORM with SQLite (dev)
- **State Management**: Zustand
- **Authentication**: Custom JWT-based stateless auth mechanism

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Setup Environment**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="your_super_secret_key"
   ```

3. **Initialize Database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```
   Navigate to [http://localhost:3000](http://localhost:3000)

## Design

FlowState employs a deeply integrated dark mode aesthetic centered around glassmorphism panels, vivid primary color glows, and highly responsive micro-animations. Defaulting to a Violet neon-theme, users can unlock Blue, Green, or Orange themes that propagate natively across the DOM.

## License

MIT License
