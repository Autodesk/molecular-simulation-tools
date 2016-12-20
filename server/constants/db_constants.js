const dbConstants = {
  REDIS_WORKFLOWS: 'workflows',
  REDIS_RUNS: 'runs',
  REDIS_WORKFLOW_EMAIL_SET: 'workflow_emails', // redis<SET>
  REDIS_WORKFLOW_ERRORS: 'workflow_errors', // redis<HASH>
};

module.exports = dbConstants;
