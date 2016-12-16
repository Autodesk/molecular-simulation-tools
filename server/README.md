# Workflow Web Server
This workflow serves the API for the web app frontend and also communicates with the workflow execution server.

## Running
    npm run start

## Environment Variables

### PORT
Sets the port that the server will run on.

## Linting
    eslint

## API
Routes are behind a version prefix, which is currently "/v1".

### GET /workflow/:workflowId
Returns the indicated workflow.
