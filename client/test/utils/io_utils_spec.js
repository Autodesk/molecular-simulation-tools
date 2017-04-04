import { expect } from 'chai';
import { List as IList } from 'immutable';
import IoResultRecord from '../../public/js/records/io_result_record';
import ioUtils from '../../public/js/utils/io_utils';

describe('ioUtils', () => {
  beforeEach(() => {
  });

  describe('getAnimationPdbs', () => {
    let outputResults;

    beforeEach(() => {
      outputResults = new IList([
        new IoResultRecord({
          fetchedValue: ['minstep.0.pdb', 'minstep.1.pdb'],
          ioId: 'minstep_frames.json',
          type: 'url',
          value: 'http://example.com/minstep_frames.json',
        }),
        new IoResultRecord({
          fetchedValue: 'imapdbstring',
          ioId: 'minstep.0.pdb',
          type: 'url',
          value: 'http://example.com/minstep.0.pdb',
        }),
        new IoResultRecord({
          fetchedValue: 'imapdbstringtoo',
          ioId: 'minstep.1.pdb',
          type: 'url',
          value: 'http://example.com/minstep.1.pdb',
        }),
      ]);
    });

    describe('when minstep_frames doesnt exist', () => {
      beforeEach(() => {
        outputResults = outputResults.delete(0);
      });

      it('returns the first pdb', () => {
        const pdbs = ioUtils.getAnimationPdbs(outputResults);
        expect(pdbs.size).to.equal(1);
        expect(pdbs.get(0)).to.equal(outputResults.get(0).fetchedValue);
      });

      describe('when no pdbs exist', () => {
        beforeEach(() => {
          outputResults = new IList([
            new IoResultRecord({
              fetchedValue: 'whatami',
              ioId: 'somethingweird.exe',
              type: 'crazy',
              value: 'http://example.com',
            }),
          ]);
        });

        it('returns an empty list', () => {
          const pdbs = ioUtils.getAnimationPdbs(outputResults);
          expect(pdbs.size).to.equal(0);
        });
      });

      describe('when a pdb file exists but not its fetchedValue', () => {
        beforeEach(() => {
          outputResults = new IList([
            new IoResultRecord({
              fetchedValue: '',
              type: 'url',
              value: 'http://example.com/minstep.0.pdb',
            }),
          ]);
        });

        it('returns an empty list', () => {
          const pdbs = ioUtils.getAnimationPdbs(outputResults);
          expect(pdbs.size).to.equal(0);
        });
      });
    });

    describe('when given an empty list of outputResults', () => {
      beforeEach(() => {
        outputResults = new IList();
      });

      it('returns an empty list', () => {
        const pdbs = ioUtils.getAnimationPdbs(outputResults);
        expect(pdbs.size).to.equal(0);
      });
    });

    describe('when minstep_frames fetchedValue doesnt exist', () => {
      beforeEach(() => {
        outputResults = outputResults.set(0, outputResults.get(0).set('fetchedValue', null));
      });

      it('returns an empty list', () => {
        const pdbs = ioUtils.getAnimationPdbs(outputResults);
        expect(pdbs.size).to.equal(0);
      });
    });

    describe('when mismatched data between pdbs and minstep_frames', () => {
      beforeEach(() => {
        outputResults = outputResults.delete(1);
      });

      it('throws an error', () => {
        expect(ioUtils.getAnimationPdbs.bind(null, outputResults)).to.throw();
      });
    });

    describe('when data for each frame', () => {
      it('returns pdb data for each frame', () => {
        const pdbs = ioUtils.getAnimationPdbs(outputResults);
        expect(pdbs.size).to.equal(2);
        expect(pdbs.get(0)).to.equal(outputResults.get(1).fetchedValue);
        expect(pdbs.get(1)).to.equal(outputResults.get(2).fetchedValue);
      });
    });
  });

  describe('getOutputResultsError', () => {
    let inputResults;
    beforeEach(() => {
      inputResults = new IList();
    });

    describe('when no prep.json', () => {
      it('throws an error', () => {
        expect(ioUtils.getOutputResultsError.bind(null, inputResults)).to.throw();
      });
    });

    describe('when prep.json with no fetchedValue', () => {
      beforeEach(() => {
        inputResults = inputResults.push(new IoResultRecord({
          ioId: 'prep.json',
          type: 'url',
          value: 'http://localhost:9000/r17IbGbKg/outputs/prep.json',
        }));
      });

      it('throws an error', () => {
        expect(ioUtils.getOutputResultsError.bind(null, inputResults)).to.throw();
      });
    });

    describe('when prep.json with success false', () => {
      beforeEach(() => {
        inputResults = inputResults.push(new IoResultRecord({
          ioId: 'prep.json',
          type: 'url',
          value: 'http://localhost:9000/r17IbGbKg/outputs/prep.json',
          fetchedValue: {
            success: false,
          },
        }));
      });

      it('returns error string', () => {
        expect(!!ioUtils.getOutputResultsError(inputResults)).to.equal(true);
      });
    });

    describe('when prep.json with success true', () => {
      beforeEach(() => {
        inputResults = inputResults.push(new IoResultRecord({
          ioId: 'prep.json',
          type: 'url',
          value: 'http://localhost:9000/r17IbGbKg/outputs/prep.json',
          fetchedValue: {
            success: true,
          },
        }));
      });

      it('returns empty string', () => {
        expect(ioUtils.getOutputResultsError(inputResults)).to.equal('');
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
        expect(ioUtils.getSelectedLigand(ios)).to.equal('');
      });
    });

    describe('when selection.json has no value property', () => {
      beforeEach(() => {
        ios = ios.push(new IoResultRecord({ ioId: 'selection.json' }));
      });

      it('returns empty string', () => {
        expect(ioUtils.getSelectedLigand(ios)).to.equal('');
      });
    });

    describe('when selection.json value contains invalid json', () => {
      beforeEach(() => {
        ios = ios.push(new IoResultRecord({ ioId: 'selection.json', value: 'asdf' }));
      });

      it('returns empty string', () => {
        expect(ioUtils.getSelectedLigand(ios)).to.equal('');
      });
    });

    describe('when selection.json value contains a ligandname', () => {
      const ligandName = 'MPD513';
      beforeEach(() => {
        ios = ios.push(new IoResultRecord({
          ioId: 'selection.json',
          value: `{"ligandname":"${ligandName}"}`,
        }));
      });

      it('returns empty the ligandname', () => {
        expect(ioUtils.getSelectedLigand(ios)).to.equal(ligandName);
      });
    });
  });

  describe('createSelectionIoResult', () => {
    let selectedLigand;
    let selectedLigandIoResult;
    beforeEach(() => {
      selectedLigand = 'ARQ401';
      selectedLigandIoResult= new IoResultRecord({
        ioId: 'prep.json',
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
          ioUtils.createSelectionIoResult.bind(null, selectedLigandIoResult, null),
        ).to.throw();
      });
    });

    describe('when invalid selectedLigandIoResult given', () => {
      it('throws an error', () => {
        expect(
          ioUtils.createSelectionIoResult.bind(null, null, selectedLigand),
        ).to.throw();
        expect(
          ioUtils.createSelectionIoResult.bind(
            null,
            {
              fethedValue: { ligands: { ARQ401: null } },
            },
            selectedLigandIoResult,
          ),
        ).to.throw();
      });
    });

    describe('when inputResults are valid', () => {
      it('returns an io record', () => {
        expect(
          ioUtils.createSelectionIoResult(selectedLigandIoResult, selectedLigand),
        ).to.be.an.instanceof(IoResultRecord);
      });
    });
  });

  describe('selectLigand', () => {
    let ligand;
    let inputResults;
    beforeEach(() => {
      ligand = 'ARQ401';
      inputResults = new IList([
        new IoResultRecord({
          ioId: 'prep.json',
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
        const updatedInputResults = ioUtils.selectLigand(inputResults, ligand);
        expect(updatedInputResults.size).to.equal(2);

        const selectionInput = updatedInputResults.find(input =>
          input.ioId === 'selection.json',
        );
        expect(selectionInput.fetchedValue.ligandname).to.equal(ligand);
      });
    });

    describe('when selection.json already exists', () => {
      beforeEach(() => {
        const fetchedValue = { ligandname: 'BBQ401', atom_ids: [1] };
        inputResults = inputResults.push(new IoResultRecord({
          ioId: 'selection.json',
          type: 'inline',
          fetchedValue,
          value: JSON.stringify(fetchedValue),
        }));
      });

      it('updates selection.json to select the new ligand', () => {
        const updatedInputResults = ioUtils.selectLigand(inputResults, ligand);
        expect(updatedInputResults.size).to.equal(2);

        const selectionInput = updatedInputResults.find(inputResult =>
          inputResult.ioId === 'selection.json',
        );
        expect(selectionInput.toJS().fetchedValue.ligandname).to.equal(ligand);
      });
    });
  });
});
