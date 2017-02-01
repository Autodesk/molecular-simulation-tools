const CCCC = require('cloud-compute-cannon-client');
const ccc = CCCC.connect(process.env["CCC"]);

/* Delete all current jobs in debug mode */
if (process.env["CCC"] == 'ccc:9000') {
  ccc.deletePending();
}


const workflowUtils = {

  /**
   * Run a conversion of a pdb file.
   * {
   *   pdbData: <pdb file as a string>
   * }
   * @param  {[type]} params [description]
   * @return {[type]}        [description]
   */
  executeCCCJob(jobJson) {
    /* If this is a local dev docker-compose setup, mount the local ccc server to the workflow container */
    jobJson['mountApiServer'] = process.env["CCC"] == "ccc:9000";

    if (!jobJson.createOptions) {
      jobJson.createOptions = {};
    }
    if (!jobJson.createOptions.Env) {
      jobJson.createOptions.Env = [];
    }

    jobJson.appendStdOut = true;
    jobJson.appendStdErr = true;

    jobJson.createOptions.Env.push(`CCC=${process.env["CCC"]}`);

    return ccc.submitJobJson(jobJson);
  },

  executeWorkflow0Step0(inputs) {
    const jobJson = {
      wait: true,
      image: 'avirshup/mst:workflows-0.0.alpha4',
      inputs: inputs,
      createOptions: {
        Cmd: ['vde',
          '--preprocess', '/inputs/input.pdb',
          '--outputdir', '/outputs/'
        ]
      }
    };
    log.debug({execute:'executeWorkflow0Step0', job:JSON.stringify(jobJson).substr(0, 100)});
    return workflowUtils.executeCCCJob(jobJson)
      .then(jobResult => {
        var outputs = {};
        for (var i = 0; i < jobResult.outputs.length; i++) {
          outputs[jobResult.outputs[i]] = jobResult.outputsBaseUrl + jobResult.outputs[i];
        }
        return {
          success: jobResult.exitCode == 0,
          outputs: outputs,
          jobResult: jobResult
        }
      });
  },

  /**
   * Run a conversion of a pdb file.
   * Inputs: [
   *   {
   *     name: "workflow_state.dill",
   *     type: "inline",
   *     value: "workflow_state.dill stringified"
   *   }
   * ]
   * @param  {[type]} inputs An array of CCC inputs
   * @return {[type]}        [description]
   */
  executeWorkflow0Step1(inputs) {
    log.warn({inputs:inputs})

    const jobJson = {
      wait: false,
      image: 'avirshup/mst:workflows-0.0.alpha4',
      inputs: inputs,
      createOptions: {
        WorkingDir: '/outputs',
        Cmd: ['vde',
          '--restart', '/inputs/workflow_state.dill',
          '--outputdir', '/outputs/']
      }
    };
    return workflowUtils.executeCCCJob(jobJson)
      .then(jobResult => {
        log.warn({f:"executeWorkflow0Step1", jobResult});
        //Return the jobId as the runId
        return jobResult.jobId;
      });
  },

  /**
   * The first step in workflow1, where a pdb
   * needs to be processed before a ligand
   * can be selected
   * @param  {String} pdbData
   * @return {Promise<{success:true, prepJson:<URL>, prepPdb:<URL>}>}
   */
  executeWorkflow1Step0(inputs) {
    log.warn(JSON.stringify(inputs).substr(0, 100));

    const jobJson = {
      wait: true,
      image: 'avirshup/mst:workflows-0.0.alpha4',
      inputs: inputs,
      createOptions: {
        Cmd: ['minimize',
          '--preprocess', '/inputs/input.pdb',
          '--outputdir', '/outputs/']
      }
    };

    log.info({execute:'executeWorkflow1Step0', job:JSON.stringify(jobJson).substr(0, 100)});
    return workflowUtils.executeCCCJob(jobJson)
      .then(jobResult => {
        log.info({jobResult:jobResult});
        var outputs = {};
        for (var i = 0; i < jobResult.outputs.length; i++) {
          outputs[jobResult.outputs[i]] = jobResult.outputsBaseUrl + jobResult.outputs[i];
        }
        return {
          success: jobResult.exitCode == 0,
          outputs: outputs,
          jobResult: jobResult
        }
      });
  },


  /**
   * The first step in workflow1, where a pdb
   * needs to be processed before a ligand
   * can be selected
   * @param  {String} pdbData
   * @return {Promise<{success:true, prepJson:<URL>, prepPdb:<URL>}>}
   */
  executeWorkflow1Step1(inputs) {
    log.info({f:'executeWorkflow1Step1', inputs});
    const jobJson = {
      wait: true,
      appendStdOut: true,
      appendStdErr: true,
      image: 'avirshup/mst:workflows-0.0.alpha4',
      inputs: inputs,
      mountApiServer: process.env["CCC"] == "ccc:9000",
      createOptions: {
        Cmd: ['minimize',
          '--restart', '/inputs/workflow_state.dill',
          '--setoutput', 'user_atom_selection=/inputs/selection.json',
          '--outputdir', '/outputs/'],
        Env: [
          `CCC=${process.env["CCC"]}`
        ]
      }
    };

    return ccc.submitJobJson(jobJson)
      return workflowUtils.executeCCCJob(jobJson)
      .then(jobResult => {
        //Return the jobId as the runId
        return jobResult.jobId;
      });
  },

  // processInput(workflowId, pdb) {
  //   return new Promise((resolve) => {
  //     // TODO hardcoding this for every workflow seems fragile, is there a
  //     // better abstraction for this?
  //     switch (workflowId) {
  //       case '1':
  //         // TODO this should be replaced by something that runs the real Python
  //         // pdb processing and returns real data instead of this hardcoded data
  //         return resolve({
  //           data: {
  //             ligands: {
  //               // Hardcoded data for 3aid
  //               ARQ: Array(42).fill().map((val, index) => 1846 + index),
  //             },
  //           },
  //           pdb,
  //         });

  //       // Handles workflows that don't require input processing (like VDE)
  //       default:
  //         return resolve({ pdb: '', data: {} });
  //     }
  //   });
  // },
};

module.exports = workflowUtils;
