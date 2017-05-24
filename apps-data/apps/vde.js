const widgetsConstants = require('molecular-design-applications-shared').widgetsConstants;

module.exports = {
  title: 'Calculate electronic vertical detachment energy',
  selectLigands: false,
  bgColor: '#292E60',
  bgIndex: 3,
  color: '#2FE695',
  comingSoon: false,
  creatorImage: '/img/logo2.png',
  description: 'Calculate the electron binding energy of an' +
      ' anionic doublet species using DFT',
  widgets: [
    {
      id: widgetsConstants.LOAD,
      type: widgetsConstants.LOAD,
      title: 'Load Molecule',
      config: {
        image: 'avirshup/mst:workflows-0.0.1b6',
        command: ['vde', '--preprocess', '/inputs/input.pdb', '--outputdir', '/outputs/'],
      },
      outputs: [
        { id: 'prep.pdb' },
        { id: 'prep.json' },
        { id: 'workflow_state.dill' },
      ],
    },
    {
      id: widgetsConstants.RUN,
      type: widgetsConstants.RUN,
      title: 'Run',
      config: {
        image: 'avirshup/mst:workflows-0.0.1b6',
        command: ['vde', '--restart', '/inputs/workflow_state.dill', '--outputdir', '/outputs/'],
      },
      inputs: [
        { id: 'prep.pdb', source: widgetsConstants.LOAD },
        { id: 'prep.json', source: widgetsConstants.LOAD },
        { id: 'workflow_state.dill', source: widgetsConstants.LOAD },
      ],
      outputs: [
        { id: 'final_structure.pdb' },
        { id: 'results.json' },
        { id: 'minstep.0.pdb' },
        { id: 'minstep.1.pdb' },
        { id: 'minsteps.tar.gz' },
        { id: 'minstep_frames.json' },
      ],
    },
    {
      id: widgetsConstants.RESULTS,
      type: widgetsConstants.RESULTS,
      title: 'Results',
      inputs: [
        { id: 'final_structure.pdb', source: widgetsConstants.RUN },
        { id: 'results.json', source: widgetsConstants.RUN },
        { id: 'minstep.0.pdb', source: widgetsConstants.RUN },
        { id: 'minstep.1.pdb', source: widgetsConstants.RUN },
        { id: 'minstep_frames.json', source: widgetsConstants.RUN },
      ],
    },
  ],
};
