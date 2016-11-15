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
"production" signifies a production environment and tries to use a real API.  Anything else signifies development and uses a mocked api.

#### API_URL
The url to the backend API, used only in production.
