import React from 'react';

require('../../css/status_about.scss');

function StatusAbout() {
  return (
    <div className="status-info status-about">
      <h3 className="aboutHeader">VERTICAL DETACHMENT ENERGY</h3>
      <p>
        This workflow calculates the energy to photoneutralize an anionic doublet small molecule.
        This is predicted by performing an energy minimization at in the doublet, -1 charged state
        at the UKS/B3LYP/6-31g** level,
        then subtracting the energy of the doublet-minimized-geometry at the RKS/B3LYP/6-31g**
        in the singlet neutral state.

      </p>
      <p>
        Quantum calculations are performed using the
        <a href="http://www.nwchem-sw.org/">NWChem quantum chemistry suite. </a>
        <a href="https://github.com/avirshup/chemworkflows/blob/master/chemworkflows/apps/vde.py">
            Click here to see this workflow definition.
        </a>
      </p>
      <h3 className="aboutHeader">PROTEIN/LIGAND REFINEMENT</h3>
      <p>
        This workflow requires a protein structure with a bound ligand. Amber14 parameters are
        assigned to the,
        protein, while GAFF2 parameters with Gasteiger partial charges are assigned to
        the ligand. The structure
        is then minimized for up to 4000 steps.
      </p>
      <p>
        Forcefield assignment is performed using AnteChamber and TLeap from the
        <a href="http://ambermd.org/"> AmberTools suite</a>, and the
        energy minimization is performed using
        <a href="http://openmm.org/"> OpenMM. </a>
        <a href="https://github.com/avirshup/chemworkflows/blob/master/chemworkflows/apps/vde.py">
            Click here to see this workflow definition.
        </a>
      </p>
    </div>
  );
}

export default StatusAbout;
