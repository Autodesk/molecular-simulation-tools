const widgetsConstants = require('molecular-design-applications-shared').widgetsConstants;

module.exports = {
  title: 'Refine a protein-ligand complex',
  selectLigands: true,
  bgIndex: 3,
  bgColor: '#292E60',
  color: '#2FE695',
  comingSoon: false,
  creatorImage: '/img/logo1.png',
  description: 'Automatically parameterize and refine a small molecule bound to a protein',
  widgets: [
    {
      id: widgetsConstants.LOAD,
      type: widgetsConstants.LOAD,
      title: 'Load Molecule',
      outputs: [
        { id: 'prep.pdb' },
        { id: 'prep.json' },
        { id: 'workflow_state.dill' },
      ],
    },
    {
      id: widgetsConstants.SELECTION,
      type: widgetsConstants.SELECTION,
      title: 'Ligand Selection',
      inputs: [
        { id: 'prep.pdb', source: widgetsConstants.LOAD },
        { id: 'prep.json', source: widgetsConstants.LOAD },
        { id: 'workflow_state.dill', source: widgetsConstants.LOAD },
      ],
      outputs: [
        { id: 'selection.json' },
      ],
    },
    {
      id: widgetsConstants.RUN,
      type: widgetsConstants.RUN,
      title: 'Run',
      inputs: [
        { id: 'prep.pdb', source: widgetsConstants.LOAD },
        { id: 'prep.json', source: widgetsConstants.LOAD },
        { id: 'workflow_state.dill', source: widgetsConstants.LOAD },
        { id: 'selection.json', source: widgetsConstants.SELECTION },
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
