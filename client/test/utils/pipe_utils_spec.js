import { expect } from 'chai';
import { List as IList, Map as IMap } from 'immutable';
import PipeDataRecord from '../../public/js/records/pipe_data_record';
import PipeRecord from '../../public/js/records/pipe_record';
import pipeUtils from '../../public/js/utils/pipe_utils';

describe('pipeUtils', () => {
  beforeEach(() => {
  });

  describe('getAnimationPdbs', () => {
    let outputPipeDatas;

    beforeEach(() => {
      outputPipeDatas = new IList([
        new PipeDataRecord({
          fetchedValue: ['minstep.0.pdb', 'minstep.1.pdb'],
          pipeName: 'minstep_frames.json',
          type: 'url',
          value: 'http://example.com/minstep_frames.json',
        }),
        new PipeDataRecord({
          fetchedValue: 'imapdbstring',
          pipeName: 'minstep.0.pdb',
          type: 'url',
          value: 'http://example.com/minstep.0.pdb',
        }),
        new PipeDataRecord({
          fetchedValue: 'imapdbstringtoo',
          pipeName: 'minstep.1.pdb',
          type: 'url',
          value: 'http://example.com/minstep.1.pdb',
        }),
      ]);
    });

    describe('when minstep_frames doesnt exist', () => {
      beforeEach(() => {
        outputPipeDatas = outputPipeDatas.delete(0);
      });

      it('returns the first pdb', () => {
        const pdbs = pipeUtils.getAnimationPdbs(outputPipeDatas);
        expect(pdbs.size).to.equal(1);
        expect(pdbs.get(0)).to.equal(outputPipeDatas.get(0).fetchedValue);
      });

      describe('when no pdbs exist', () => {
        beforeEach(() => {
          outputPipeDatas = new IList([
            new PipeDataRecord({
              fetchedValue: 'whatami',
              pipeName: 'somethingweird.exe',
              type: 'crazy',
              value: 'http://example.com',
            }),
          ]);
        });

        it('returns an empty list', () => {
          const pdbs = pipeUtils.getAnimationPdbs(outputPipeDatas);
          expect(pdbs.size).to.equal(0);
        });
      });

      describe('when a pdb file exists but not its fetchedValue', () => {
        beforeEach(() => {
          outputPipeDatas = new IList([
            new PipeDataRecord({
              fetchedValue: '',
              type: 'url',
              value: 'http://example.com/minstep.0.pdb',
            }),
          ]);
        });

        it('returns an empty list', () => {
          const pdbs = pipeUtils.getAnimationPdbs(outputPipeDatas);
          expect(pdbs.size).to.equal(0);
        });
      });
    });

    describe('when given an empty list of outputPipeDatas', () => {
      beforeEach(() => {
        outputPipeDatas = new IList();
      });

      it('returns an empty list', () => {
        const pdbs = pipeUtils.getAnimationPdbs(outputPipeDatas);
        expect(pdbs.size).to.equal(0);
      });
    });

    describe('when minstep_frames fetchedValue doesnt exist', () => {
      beforeEach(() => {
        outputPipeDatas = outputPipeDatas.set(0, outputPipeDatas.get(0).set('fetchedValue', null));
      });

      it('returns an empty list', () => {
        const pdbs = pipeUtils.getAnimationPdbs(outputPipeDatas);
        expect(pdbs.size).to.equal(0);
      });
    });

    describe('when mismatched data between pdbs and minstep_frames', () => {
      beforeEach(() => {
        outputPipeDatas = outputPipeDatas.delete(1);
      });

      it('throws an error', () => {
        expect(pipeUtils.getAnimationPdbs.bind(null, outputPipeDatas)).to.throw();
      });
    });

    describe('when data for each frame', () => {
      it('returns pdb data for each frame', () => {
        const pdbs = pipeUtils.getAnimationPdbs(outputPipeDatas);
        expect(pdbs.size).to.equal(2);
        expect(pdbs.get(0)).to.equal(outputPipeDatas.get(1).fetchedValue);
        expect(pdbs.get(1)).to.equal(outputPipeDatas.get(2).fetchedValue);
      });
    });
  });

  describe('getOutputPipeDatasError', () => {
    let inputPipeDatas;
    beforeEach(() => {
      inputPipeDatas = new IList();
    });

    describe('when no prep.json', () => {
      it('throws an error', () => {
        expect(pipeUtils.getOutputPipeDatasError.bind(null, inputPipeDatas)).to.throw();
      });
    });

    describe('when prep.json with no fetchedValue', () => {
      beforeEach(() => {
        inputPipeDatas = inputPipeDatas.push(new PipeDataRecord({
          pipeName: 'prep.json',
          type: 'url',
          value: 'http://localhost:9000/r17IbGbKg/outputs/prep.json',
        }));
      });

      it('throws an error', () => {
        expect(pipeUtils.getOutputPipeDatasError.bind(null, inputPipeDatas)).to.throw();
      });
    });

    describe('when prep.json with success false', () => {
      beforeEach(() => {
        inputPipeDatas = inputPipeDatas.push(new PipeDataRecord({
          pipeName: 'prep.json',
          type: 'url',
          value: 'http://localhost:9000/r17IbGbKg/outputs/prep.json',
          fetchedValue: {
            success: false,
          },
        }));
      });

      it('returns error string', () => {
        expect(!!pipeUtils.getOutputPipeDatasError(inputPipeDatas)).to.equal(true);
      });
    });

    describe('when prep.json with success true', () => {
      beforeEach(() => {
        inputPipeDatas = inputPipeDatas.push(new PipeDataRecord({
          pipeName: 'prep.json',
          type: 'url',
          value: 'http://localhost:9000/r17IbGbKg/outputs/prep.json',
          fetchedValue: {
            success: true,
          },
        }));
      });

      it('returns empty string', () => {
        expect(pipeUtils.getOutputPipeDatasError(inputPipeDatas)).to.equal('');
      });
    });
  });

  describe('getSelectedLigand', () => {
    let ios;
    beforeEach(() => {
      ios = new IList();
    });

    describe('when no selection.json io given', () => {
      it('returns empty string', () => {
        expect(pipeUtils.getSelectedLigand(ios)).to.equal('');
      });
    });

    describe('when selection.json has no value property', () => {
      beforeEach(() => {
        ios = ios.push(new PipeDataRecord({ pipeName: 'selection.json' }));
      });

      it('returns empty string', () => {
        expect(pipeUtils.getSelectedLigand(ios)).to.equal('');
      });
    });

    describe('when selection.json value contains invalid json', () => {
      beforeEach(() => {
        ios = ios.push(new PipeDataRecord({ pipeName: 'selection.json', value: 'asdf' }));
      });

      it('returns empty string', () => {
        expect(pipeUtils.getSelectedLigand(ios)).to.equal('');
      });
    });

    describe('when selection.json value contains a ligandname', () => {
      const ligandName = 'MPD513';
      beforeEach(() => {
        ios = ios.push(new PipeDataRecord({
          pipeName: 'selection.json',
          value: `{"ligandname":"${ligandName}"}`,
        }));
      });

      it('returns empty the ligandname', () => {
        expect(pipeUtils.getSelectedLigand(ios)).to.equal(ligandName);
      });
    });
  });

  describe('createSelectionPipeData', () => {
    let selectedLigand;
    let selectedLigandPipeData;
    beforeEach(() => {
      selectedLigand = 'ARQ401';
      selectedLigandPipeData= new PipeDataRecord({
        pipeName: 'prep.json',
        fetchedValue: {
          ligands: {
            ARQ401: [1, 2, 3],
          },
        },
      });
    });

    describe('when invalid selectedLigand given', () => {
      it('throws an error', () => {
        expect(
          pipeUtils.createSelectionPipeData.bind(null, selectedLigandPipeData, null),
        ).to.throw();
      });
    });

    describe('when invalid selectedLigandPipeData given', () => {
      it('throws an error', () => {
        expect(
          pipeUtils.createSelectionPipeData.bind(null, null, selectedLigand),
        ).to.throw();
        expect(
          pipeUtils.createSelectionPipeData.bind(
            null,
            {
              fethedValue: { ligands: { ARQ401: null } },
            },
            selectedLigandPipeData,
          ),
        ).to.throw();
      });
    });

    describe('when inputPipeDatas are valid', () => {
      it('returns an io record', () => {
        expect(
          pipeUtils.createSelectionPipeData(selectedLigandPipeData, selectedLigand),
        ).to.be.an.instanceof(PipeDataRecord);
      });
    });
  });

  describe('selectLigand', () => {
    let ligand;
    let inputPipeDatas;
    beforeEach(() => {
      ligand = 'ARQ401';
      inputPipeDatas = new IList([
        new PipeDataRecord({
          pipeName: 'prep.json',
          value: 'http://example.com/prep.json',
          type: 'url',
          fetchedValue: {
            ligands: {
              ARQ401: [1, 2, 3],
            },
            mv_ligand_strings: {
              ARQ401: ['1.A.A-401'],
            },
          },
        }),
      ]);
    });

    describe('when no selection.json input is given', () => {
      it('creates one with the given ligand selected', () => {
        const updatedInputPipeDatas = pipeUtils.selectLigand(inputPipeDatas, ligand);
        expect(updatedInputPipeDatas.size).to.equal(2);

        const selectionInput = updatedInputPipeDatas.find(input =>
          input.pipeName === 'selection.json',
        );
        expect(selectionInput.fetchedValue.ligandname).to.equal(ligand);
      });
    });

    describe('when selection.json already exists', () => {
      beforeEach(() => {
        const fetchedValue = { ligandname: 'BBQ401', atom_ids: [1] };
        inputPipeDatas = inputPipeDatas.push(new PipeDataRecord({
          pipeName: 'selection.json',
          type: 'inline',
          fetchedValue,
          value: JSON.stringify(fetchedValue),
        }));
      });

      it('updates selection.json to select the new ligand', () => {
        const updatedInputPipeDatas = pipeUtils.selectLigand(inputPipeDatas, ligand);
        expect(updatedInputPipeDatas.size).to.equal(2);

        const selectionInput = updatedInputPipeDatas.find(inputPipeData =>
          inputPipeData.pipeName === 'selection.json',
        );
        expect(selectionInput.toJS().fetchedValue.ligandname).to.equal(ligand);
      });
    });
  });

  describe('get', () => {
    const sourceWidgetId = 'widgetid';
    const pipe = new PipeRecord({ name: 'imapipe', sourceWidgetId });
    let pipeDatasByWidget;

    beforeEach(() => {
      pipeDatasByWidget = new IMap();
    });

    describe('when the widgetId doesnt exist in pipeDatasByWidget', () => {
      it('returns undefined', () => {
        const pipeData = pipeUtils.get(pipeDatasByWidget, pipe);
        expect(pipeData).to.equal(undefined);
      });
    });

    describe('when the widgetId exists in pipeDatasByWidget but not the pipe', () => {
      beforeEach(() => {
        pipeDatasByWidget = new IMap({
          [sourceWidgetId]: new IList(),
        });
      });

      it('returns undefined', () => {
        const pipeData = pipeUtils.get(pipeDatasByWidget, pipe);
        expect(pipeData).to.equal(undefined);
      });
    });

    describe('when the widgetId exists in pipeDatasByWidget and so does the pipe', () => {
      let pipeData;

      beforeEach(() => {
        pipeData = new PipeDataRecord({ pipeName: pipe.name });

        pipeDatasByWidget = new IMap({
          [sourceWidgetId]: new IList([pipeData]),
        });
      });

      it('returns the pipeData', () => {
        const foundPipeData = pipeUtils.get(pipeDatasByWidget, pipe);
        expect(foundPipeData).to.equal(pipeData);
      });
    });
  });

  describe('flatten', () => {
    const widgetIdOne = 'imawidgetid1';
    const widgetIdTwo = 'imawidgetid2';
    let pipeDatasByWidget;

    describe('when given multiple pipeDatas nested under different widgetIds', () => {
      let pipeDataOne;
      let pipeDataTwo;
      let pipeDataThree;

      beforeEach(() => {
        pipeDataOne = new PipeDataRecord({
          pipeName: 'imapipe',
          widgetId: widgetIdOne,
        });
        pipeDataTwo = new PipeDataRecord({
          pipeName: 'imapipetoo',
          widgetId: widgetIdOne,
        });
        pipeDataThree = new PipeDataRecord({
          pipeName: 'imapipealways',
          widgetId: widgetIdTwo,
        });
        pipeDatasByWidget = new IMap({
          [widgetIdOne]: new IList([pipeDataOne, pipeDataTwo]),
          [widgetIdTwo]: new IList([pipeDataThree]),
        });
      });

      it('returns a flat array containing all pipeDatas', () => {
        const pipeDatas = pipeUtils.flatten(pipeDatasByWidget);
        expect(pipeDatas.get(0)).to.equal(pipeDataOne);
        expect(pipeDatas.get(1)).to.equal(pipeDataTwo);
        expect(pipeDatas.get(2)).to.equal(pipeDataThree);
      });
    });
  });

  describe('unflatten', () => {
    const widgetIdOne = 'imawidgetid1';
    const widgetIdTwo = 'imawidgetid2';
    let pipeDatas;

    describe('when given multiple pipeDatas with different widgetIds', () => {
      let pipeDataOne;
      let pipeDataTwo;
      let pipeDataThree;

      beforeEach(() => {
        pipeDataOne = new PipeDataRecord({
          pipeName: 'imapipe',
          widgetId: widgetIdOne,
        });
        pipeDataTwo = new PipeDataRecord({
          pipeName: 'imapipetoo',
          widgetId: widgetIdOne,
        });
        pipeDataThree = new PipeDataRecord({
          pipeName: 'imapipealways',
          widgetId: widgetIdTwo,
        });
        pipeDatas = new IList([pipeDataOne, pipeDataTwo, pipeDataThree]);
      });

      it('returns a map with pipes nested under corresponding widgetIds', () => {
        const pipeDatasByWidget = pipeUtils.unflatten(pipeDatas);
        expect(pipeDatasByWidget.get(widgetIdOne) instanceof IList).to.be.true;
        expect(pipeDatasByWidget.get(widgetIdTwo) instanceof IList).to.be.true;
        expect(pipeDatasByWidget.get(widgetIdOne).get(0)).to.equal(pipeDataOne);
        expect(pipeDatasByWidget.get(widgetIdOne).get(1)).to.equal(pipeDataTwo);
        expect(pipeDatasByWidget.get(widgetIdTwo).get(0)).to.equal(pipeDataThree);
      });
    });
  });

  describe('set', () => {
    const widgetIdOne = 'imawidgetid1';
    const widgetIdTwo = 'imawidgetid2';
    let pipeDatasByWidget;

    describe('when given stuff', () => {
      let pipeDataOne;
      let pipeDataTwo;
      let pipeDataThree;
      let newPipeData;

      beforeEach(() => {
        pipeDataOne = new PipeDataRecord({
          pipeName: 'imapipe',
          widgetId: widgetIdOne,
        });
        pipeDataTwo = new PipeDataRecord({
          pipeName: 'imapipetoo',
          widgetId: widgetIdOne,
        });
        pipeDataThree = new PipeDataRecord({
          pipeName: 'imapipealways',
          widgetId: widgetIdTwo,
        });
        newPipeData = new PipeDataRecord({
          pipeName: 'imanewpipe',
          widgetId: widgetIdTwo,
        });
        pipeDatasByWidget = new IMap({
          [widgetIdOne]: new IList([pipeDataOne, pipeDataTwo]),
          [widgetIdTwo]: new IList([pipeDataThree]),
        });
      });

      it('returns a new pipeDatasByWidget with the given pipeData under its widgetId', () => {
        const newPipeDatasByWidget = pipeUtils.set(pipeDatasByWidget, newPipeData);
        expect(newPipeDatasByWidget.get(widgetIdTwo).get(1)).to.equal(newPipeData);
      });
    });
  });
});
