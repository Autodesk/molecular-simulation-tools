import { expect } from 'chai';
import { List as IList } from 'immutable';
import IoRecord from '../../public/js/records/io_record';
import ioUtils from '../../public/js/utils/io_utils';

describe('ioUtils', () => {
  beforeEach(() => {
  });

  describe('getAnimationPdbs', () => {
    let outputs;

    beforeEach(() => {
      outputs = new IList([
        new IoRecord({
          fetchedValue: ['minstep.0.pdb', 'minstep.1.pdb'],
          name: 'minstep_frames.json',
          type: 'url',
          value: 'http://example.com/minstep_frames.json',
        }),
        new IoRecord({
          fetchedValue: 'imapdbstring',
          name: 'minstep.0.pdb',
          type: 'url',
          value: 'http://example.com/minstep.0.pdb',
        }),
        new IoRecord({
          fetchedValue: 'imapdbstringtoo',
          name: 'minstep.1.pdb',
          type: 'url',
          value: 'http://example.com/minstep.1.pdb',
        }),
      ]);
    });

    describe('when minstep_frames doesnt exist', () => {
      beforeEach(() => {
        outputs = outputs.delete(0);
      });

      it('returns the first pdb', () => {
        const pdbs = ioUtils.getAnimationPdbs(outputs);
        expect(pdbs.size).to.equal(1);
        expect(pdbs.get(0)).to.equal(outputs.get(0).fetchedValue);
      });

      describe('when no pdbs exist', () => {
        beforeEach(() => {
          outputs = new IList([
            new IoRecord({
              fetchedValue: 'whatami',
              name: 'somethingweird.exe',
              type: 'crazy',
              value: 'http://example.com',
            }),
          ]);
        });

        it('throws an error', () => {
          expect(ioUtils.getAnimationPdbs.bind(null, outputs)).to.throw();
        });
      });

      describe('when a pdb file exists but not its fetchedValue', () => {
        beforeEach(() => {
          outputs = new IList([
            new IoRecord({
              fetchedValue: '',
              type: 'url',
              value: 'http://example.com/minstep.0.pdb',
            }),
          ]);
        });

        it('returns an empty list', () => {
          const pdbs = ioUtils.getAnimationPdbs(outputs);
          expect(pdbs.size).to.equal(0);
        });
      });
    });

    describe('when given an empty list of outputs', () => {
      beforeEach(() => {
        outputs = new IList();
      });

      it('returns an empty list', () => {
        const pdbs = ioUtils.getAnimationPdbs(outputs);
        expect(pdbs.size).to.equal(0);
      });
    });

    describe('when minstep_frames fetchedValue doesnt exist', () => {
      beforeEach(() => {
        outputs = outputs.set(0, outputs.get(0).set('fetchedValue', null));
      });

      it('returns an empty list', () => {
        const pdbs = ioUtils.getAnimationPdbs(outputs);
        expect(pdbs.size).to.equal(0);
      });
    });

    describe('when mismatched data between pdbs and minstep_frames', () => {
      beforeEach(() => {
        outputs = outputs.delete(1);
      });

      it('throws an error', () => {
        expect(ioUtils.getAnimationPdbs.bind(null, outputs)).to.throw();
      });
    });

    describe('when data for each frame', () => {
      it('returns pdb data for each frame', () => {
        const pdbs = ioUtils.getAnimationPdbs(outputs);
        expect(pdbs.size).to.equal(2);
        expect(pdbs.get(0)).to.equal(outputs.get(1).fetchedValue);
        expect(pdbs.get(1)).to.equal(outputs.get(2).fetchedValue);
      });
    });
  });

  describe('getInputError', () => {
    let inputs;
    beforeEach(() => {
      inputs = new IList();
    });

    describe('when no prep.json', () => {
      it('throws an error', () => {
        expect(ioUtils.getInputError.bind(null, inputs)).to.throw();
      });
    });

    describe('when prep.json with no fetchedValue', () => {
      beforeEach(() => {
        inputs = inputs.push(new IoRecord({
          name: 'prep.json',
          type: 'url',
          value: 'http://localhost:9000/r17IbGbKg/outputs/prep.json',
        }));
      });

      it('throws an error', () => {
        expect(ioUtils.getInputError.bind(null, inputs)).to.throw();
      });
    });

    describe('when prep.json with success false', () => {
      beforeEach(() => {
        inputs = inputs.push(new IoRecord({
          name: 'prep.json',
          type: 'url',
          value: 'http://localhost:9000/r17IbGbKg/outputs/prep.json',
          fetchedValue: {
            success: false,
          },
        }));
      });

      it('returns error string', () => {
        expect(!!ioUtils.getInputError(inputs)).to.equal(true);
      });
    });

    describe('when prep.json with success true', () => {
      beforeEach(() => {
        inputs = inputs.push(new IoRecord({
          name: 'prep.json',
          type: 'url',
          value: 'http://localhost:9000/r17IbGbKg/outputs/prep.json',
          fetchedValue: {
            success: true,
          },
        }));
      });

      it('returns empty string', () => {
        expect(ioUtils.getInputError(inputs)).to.equal('');
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
        ios = ios.push(new IoRecord({ name: 'selection.json' }));
      });

      it('returns empty string', () => {
        expect(ioUtils.getSelectedLigand(ios)).to.equal('');
      });
    });

    describe('when selection.json value contains invalid json', () => {
      beforeEach(() => {
        ios = ios.push(new IoRecord({ name: 'selection.json', value: 'asdf' }));
      });

      it('returns empty string', () => {
        expect(ioUtils.getSelectedLigand(ios)).to.equal('');
      });
    });

    describe('when selection.json value contains a ligandname', () => {
      const ligandName = 'MPD513';
      beforeEach(() => {
        ios = ios.push(new IoRecord({
          name: 'selection.json',
          value: `{"ligandname":"${ligandName}"}`,
        }));
      });

      it('returns empty the ligandname', () => {
        expect(ioUtils.getSelectedLigand(ios)).to.equal(ligandName);
      });
    });
  });

  describe('createSelectionInput', () => {
    let selectedLigand;
    let selectedLigandInput;
    beforeEach(() => {
      selectedLigand = 'ARQ401';
      selectedLigandInput = new IoRecord({
        name: 'prep.json',
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
          ioUtils.createSelectionInput.bind(null, selectedLigandInput, null),
        ).to.throw();
      });
    });

    describe('when invalid selectedLigandInput given', () => {
      it('throws an error', () => {
        expect(
          ioUtils.createSelectionInput.bind(null, null, selectedLigand),
        ).to.throw();
        expect(
          ioUtils.createSelectionInput.bind(
            null,
            {
              fethedValue: { ligands: { ARQ401: null } },
            },
            selectedLigandInput,
          ),
        ).to.throw();
      });
    });

    describe('when inputs are valid', () => {
      it('returns an io record', () => {
        expect(
          ioUtils.createSelectionInput(selectedLigandInput, selectedLigand),
        ).to.be.an.instanceof(IoRecord);
      });
    });
  });

  describe('selectLigand', () => {
    let ligand;
    let inputs;
    beforeEach(() => {
      ligand = 'ARQ401';
      inputs = new IList([
        new IoRecord({
          name: 'prep.json',
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
        const updatedInputs = ioUtils.selectLigand(inputs, ligand);
        expect(updatedInputs.size).to.equal(2);

        const selectionInput = updatedInputs.find(input =>
          input.ioId === 'selection.json',
        );
        expect(selectionInput.fetchedValue.ligandname).to.equal(ligand);
      });
    });

    describe('when selection.json already exists', () => {
      beforeEach(() => {
        const fetchedValue = { ligandname: 'BBQ401', atom_ids: [1] };
        inputs = inputs.push(new IoRecord({
          name: 'selection.json',
          type: 'inline',
          fetchedValue,
          value: JSON.stringify(fetchedValue),
        }));
      });

      it('updates selection.json to select the new ligand', () => {
        const updatedInputs = ioUtils.selectLigand(inputs, ligand);
        expect(updatedInputs.size).to.equal(2);

        const selectionInput = updatedInputs.find(input =>
          input.ioId === 'selection.json',
        );
        expect(selectionInput.toJS().fetchedValue.ligandname).to.equal(ligand);
      });
    });
  });
});
