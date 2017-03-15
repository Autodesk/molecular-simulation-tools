import { expect } from 'chai';
import { List as IList } from 'immutable';
import IoRecord from '../../public/js/records/io_record';
import ioUtils from '../../public/js/utils/io_utils';

describe('ioUtils', () => {
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
          input.name === 'selection.json',
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
          input.name === 'selection.json',
        );
        expect(selectionInput.toJS().fetchedValue.ligandname).to.equal(ligand);
      });
    });
  });
});
