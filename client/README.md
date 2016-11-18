# Workflow
MDT workflow UI

## Setup

    npm install

## Build

    npm run build

The resulting static files will be output to the `/dist` folder.

### Develop

    npm run dev

### Environment Variables
Enviroment variables can be set in a .env file in the root of the project.

#### NODE_ENV
Set this to "production" on production, "offline" when running with no backend, and anything else (including blank) if developing with a backend server.

#### API_URL
The url to the backend API if relevant.  Defaults to the same host that the frontend assets are served from.
