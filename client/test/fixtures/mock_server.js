const cors = require('cors');
const express = require('express');
const logger = require('morgan');
const path = require('path');

const app = express();
const PORT = 4001;
const VERSION_PREFIX = '/v1';

app.use(logger('dev'));
app.use(cors());
app.use(express.static(path.join(__dirname, 'structures')));

app.get(`${VERSION_PREFIX}/run/:runId`, (req, res) => {
  res.send({
    email: 'justin.mccandless@autodesk.com',
    id: 'BJyfXE3Sg',
    inputPdbUrl: `http://localhost:${PORT}/simple.pdb`,
    status: 'RUNNING',
    workflow: { id: 101, title: 'VDE' },
    workflowId: '101',
  });
});

app.post(`${VERSION_PREFIX}/run/cancel`, (req, res) => {
  res.end();
});

app.put(`${VERSION_PREFIX}/structure/upload`, (req, res) => {
  res.send({
    path: '/simple.pdb',
  });
});


/**
 * TODO are we keeping these end points?
app.get(`${VERSION_PREFIX}/workflow/stdout/:runId`, (req, res) => {
});
app.get(`${VERSION_PREFIX}/workflow/stderr/:runId`, (req, res) => {
});
app.get(`${VERSION_PREFIX}/workflow/exitcode/:runId`, (req, res) => {
});
app.get(`${VERSION_PREFIX}/workflow/:runId`, (req, res) => {
});
app.get(`${VERSION_PREFIX}/workflow/state/:runId`, (req, res) => {
});
*/

app.get(`${VERSION_PREFIX}/workflow/:workflowId`, (req, res) => {
  res.send({
    id: 0,
    title: 'VDE',
  });
});

app.post(`${VERSION_PREFIX}/workflow/run`, (req, res) => {
  res.send({ runId: 'BJyfXE3Sg' });
});

// error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send(err);
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
