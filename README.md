# Magus Insights

Magus Insights is a comprehensive dashboard designed to monitor agent performance, visualize client proposals, and provide an interactive chat interface ("Ask Magus") for system insights. This project is built locally and is part of the Magus Agent Olympics initiative.

## Getting Started

Follow these steps to set up and run the project locally.

### Prerequisites

- Node.js & npm (or bun/yarn/pnpm) installed on your machine.

### Installation

1.  **Clone the repository:**
    ```sh
    git clone <repository-url>
    cd magus-insights
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    # or
    bun install
    ```

3.  **Start the development server:**
    ```sh
    npm run dev
    # or
    bun dev
    ```

4.  **Open in Browser:**
    The application will typically start at `http://localhost:8080` (or the port shown in your terminal).

### Building for Production

To create a production build:
```sh
npm run build
```

## Project Structure

The project follows a standard React/Vite structure:

```
src/
├── components/         # Reusable UI components
│   ├── chat/           # Components for the "Ask Magus" chat interface
│   ├── dashboard/      # Widgets and visualizations for the main dashboard (Globe, Metrics, Tables)
│   └── ui/             # Shadcn UI primitive components
├── data/               # Static data and type definitions
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and library configurations
├── pages/              # Main page components (Routes)
│   ├── Index.tsx       # The main Dashboard view
│   ├── AskMagus.tsx    # The Chat interface view
│   └── NotFound.tsx    # 404 Error page
├── App.tsx             # Main application component with Routing setup
└── main.tsx            # Entry point
```

## Key Features

-   **Dashboard:** specialized view for monitoring key metrics, visualizing global data with an interactive 3D globe, and managing client proposals.
-   **Ask Magus:** An integrated chat interface to query system performance and agent details.
-   **Modern UI:** Built with Tailwind CSS and Shadcn UI for a responsive and accessible design.

## Technologies Used

-   [Vite](https://vitejs.dev/) - Frontend Tooling
-   [React](https://reactjs.org/) - UI Library
-   [TypeScript](https://www.typescriptlang.org/) - Static Type Checking
-   [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
-   [Shadcn UI](https://ui.shadcn.com/) - Reusable Component Library
-   [React Globe GL](https://github.com/vasturiano/react-globe.gl) - 3D Globe Visualization
