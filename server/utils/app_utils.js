const cccUtils = require('../utils/ccc_utils');
const log = require('../utils/log');

const WORKFLOW_IMAGE = 'avirshup/mst:workflows-0.0.1b6';

const appUtils = {
  /**
   * Performs a CCC job.
   * @param  {BasicBatchProcessRequest} jobJson https://github.com/dionjwa/cloud-compute-cannon/blob/master/src/haxe/ccc/compute/shared/Definitions.hx typedef BasicBatchProcessRequest
   * @return {JobResult} https://github.com/dionjwa/cloud-compute-cannon/blob/master/src/haxe/ccc/compute/shared/Definitions.hx typedef JobResult
   */
  executeCCCJob(jobJson) {
    // If this is a local dev docker-compose setup, mount the local ccc server
    // to the workflow container
    jobJson.mountApiServer = process.env.CCC === 'ccc:9000';

    if (!jobJson.createOptions) {
      jobJson.createOptions = {};
    }
    if (!jobJson.createOptions.Env) {
      jobJson.createOptions.Env = [];
    }

    jobJson.appendStdOut = true;
    jobJson.appendStdErr = true;

    jobJson.createOptions.Env.push(`CCC=${process.env.CCC}`);

    return cccUtils.promise()
      .then(ccc =>
        ccc.submitJobJson(jobJson)
      );
  },

  /**
   * https://docs.google.com/presentation/d/1qP-8fPpsgtJnZOlg96ySwPACZvGlxT1jIIgjBECoDAE/edit#slide=id.g1c36f8ea4a_0_0
   * @param  {Array<ComputeInputSource>} inputs https://github.com/dionjwa/cloud-compute-cannon/blob/master/src/haxe/ccc/compute/shared/Definitions.hx
   *         e.g. inputs: [
   *           {
   *             name: 'input.pdb',
   *             type: 'url',
   *             value: 'http://s3.location.input.pdb'
   *           },
   *           {
   *             name: 'other.file',
   *             type: 'inline',
   *             value: 'Actual file content string'
   *           }
   *         ]
   * @return {success:Bool, outputs:Object[filename] = <URL to file>, jobResult:JobResult
   */
  executeApp0Step0(inputs) {
    const jobJson = {
      wait: true,
      image: WORKFLOW_IMAGE,
      inputs,
      createOptions: {
        Cmd: ['vde',
          '--preprocess', `/inputs/${inputs[0].name}`,
          '--outputdir', '/outputs/',
        ],
      },
    };
    log.debug({ execute: 'executeApp0Step0', job: JSON.stringify(jobJson).substr(0, 100) });
    return appUtils.executeCCCJob(jobJson)
      .then((jobResult) => {
        log.debug(jobResult);
        const outputs = [];
        for (let i = 0; i < jobResult.outputs.length; i += 1) {
          outputs.push({
            name: jobResult.outputs[i],
            type: 'url',
            value: `${jobResult.outputsBaseUrl}${jobResult.outputs[i]}`,
          });
        }

        return {
          success: jobResult.exitCode === 0,
          outputs,
          jobResult,
        };
      });
  },

  /**
   * https://docs.google.com/presentation/d/1qP-8fPpsgtJnZOlg96ySwPACZvGlxT1jIIgjBECoDAE/edit#slide=id.g1c36f8ea4a_0_0
   * @param  {Array<ComputeInputSource>} inputs https://github.com/dionjwa/cloud-compute-cannon/blob/master/src/haxe/ccc/compute/shared/Definitions.hx
   *         e.g. inputs: [
   *           {
   *             name: 'input.pdb',
   *             type: 'url',
   *             value: 'http://s3.location.input.pdb'
   *           },
   *           {
   *             name: 'other.file',
   *             type: 'inline',
   *             value: 'Actual file content string'
   *           }
   *         ]
   * @return {success:Bool, outputs:Object[filename] = <URL to file>, jobResult:JobResult
   */
  executeApp0Step1(inputs) {
    const jobJson = {
      wait: false,
      image: WORKFLOW_IMAGE,
      inputs,
      createOptions: {
        WorkingDir: '/outputs',
        Cmd: ['vde',
          '--restart', '/inputs/workflow_state.dill',
          '--outputdir', '/outputs/'],
      },
    };
    return appUtils.executeCCCJob(jobJson)
      .then((jobResult) => {
        log.debug({ jobId: jobResult.jobId, f: 'executeApp0Step1' });
        // Return the jobId as the runId
        return jobResult.jobId;
      });
  },

  /**
   * https://docs.google.com/presentation/d/1qP-8fPpsgtJnZOlg96ySwPACZvGlxT1jIIgjBECoDAE/edit#slide=id.g1c36f8ea4a_0_0
   * @param  {Array<ComputeInputSource>} inputs https://github.com/dionjwa/cloud-compute-cannon/blob/master/src/haxe/ccc/compute/shared/Definitions.hx
   *         e.g. inputs: [
   *           {
   *             name: 'input.pdb',
   *             type: 'url',
   *             value: 'http://s3.location.input.pdb'
   *           },
   *           {
   *             name: 'other.file',
   *             type: 'inline',
   *             value: 'Actual file content string'
   *           }
   *         ]
   * @return {success:Bool, outputs:Object[filename] = <URL to file>, jobResult:JobResult
   */
  executeApp1Step0(inputs) {
    const jobJson = {
      wait: true,
      image: WORKFLOW_IMAGE,
      inputs,
      createOptions: {
        Cmd: ['minimize',
          '--preprocess', `/inputs/${inputs[0].name}`,
          '--outputdir', '/outputs/'],
      },
    };

    log.debug({ execute: 'executeApp1Step0', job: JSON.stringify(jobJson).substr(0, 100) });
    return appUtils.executeCCCJob(jobJson)
      .then((jobResult) => {
        log.debug(jobResult);
        const outputs = [];
        for (let i = 0; i < jobResult.outputs.length; i += 1) {
          outputs.push({
            name: jobResult.outputs[i],
            type: 'url',
            value: `${jobResult.outputsBaseUrl}${jobResult.outputs[i]}`,
          });
        }
        return {
          success: jobResult.exitCode === 0,
          outputs,
          jobResult,
        };
      });
  },


  /**
   * https://docs.google.com/presentation/d/1qP-8fPpsgtJnZOlg96ySwPACZvGlxT1jIIgjBECoDAE/edit#slide=id.g1c36f8ea4a_0_0
   * @param  {Array<ComputeInputSource>} inputs https://github.com/dionjwa/cloud-compute-cannon/blob/master/src/haxe/ccc/compute/shared/Definitions.hx
   *         e.g. inputs: [
   *           {
   *             name: 'input.pdb',
   *             type: 'url',
   *             value: 'http://s3.location.input.pdb'
   *           },
   *           {
   *             name: 'other.file',
   *             type: 'inline',
   *             value: 'Actual file content string'
   *           }
   *         ]
   * @return {success:Bool, outputs:Object[filename] = <URL to file>, jobResult:JobResult
   */
  executeApp1Step1(inputs) {
    log.debug({ f: 'executeApp1Step1', inputs });
    const jobJson = {
      wait: false,
      image: WORKFLOW_IMAGE,
      inputs,
      createOptions: {
        Cmd: ['minimize',
          '--restart', '/inputs/workflow_state.dill',
          '--setoutput', 'user_atom_selection=/inputs/selection.json',
          '--outputdir', '/outputs/'],
      },
    };
    return appUtils.executeCCCJob(jobJson)
      .then((jobResult) => {
        log.debug({ jobId: jobResult.jobId, f: 'executeApp1Step1' });
        // Return the jobId as the runId
        return jobResult.jobId;
      });
  },

  /**
   * Gets the total number of runs per app and returns the results in a
   * hash, given the runStrings in the db
   * @param runHash {Array of Strings}
   * @returns {Map}
   */
  getRunCountsByApps(runHash) {
    const runCounts = new Map();

    Object.values(runHash).forEach((runString) => {
      const run = JSON.parse(runString);

      if (!runCounts.has(run.appId)) {
        runCounts.set(run.appId, 0);
      }

      runCounts.set(run.appId, runCounts.get(run.appId) + 1);
    });

    return runCounts;
  },
};

module.exports = appUtils;
