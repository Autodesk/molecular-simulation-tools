import React from 'react';
import { Map as IMap } from 'immutable';

function StatusLigandSelection(props) {
  let ligands;
  if (!props.ligands) {
    ligands = (
      <p>Please select an input with ligands in step 1.</p>
    );
  } else {
    const ligandNames = props.ligands.keySeq();

    if (ligandNames.size <= 0) {
      throw new Error('Invalid ligands');
    }
    if (ligandNames.size === 1) {
      ligands = (
        <p>
          We&#39;ll use the only ligand available, {ligandNames.get(0)}
        </p>
      );
    } else {
      ligands = (
        <div>
          <p>
            We found more than one ligand.  Please select one.
          </p>
          <ul>
            {
              ligandNames.map((ligandName, index) =>
                <li key={index}>{ligandName}</li>
              )
            }
          </ul>
        </div>
      );
    }
  }

  return (
    <div className="status-ligand-selection">
      {ligands}
    </div>
  );
}

StatusLigandSelection.propTypes = {
  ligands: React.PropTypes.instanceOf(IMap),
};

export default StatusLigandSelection;
