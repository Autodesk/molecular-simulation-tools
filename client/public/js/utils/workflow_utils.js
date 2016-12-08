import isEmail from 'validator/lib/isEmail';

const workflowUtils = {
  isRunnable(workflow) {
    if (!workflow.pdbUrl) {
      return false;
    }
    if (!isEmail(workflow.email)) {
      return false;
    }

    return true;
  },
};

export default workflowUtils;
