#!/usr/bin/env python
import sys
import collections

import moldesign as mdt

tasklist = {}

TaskType = collections.namedtuple('TaskType',
                                  'name inputs outputs')


cwlheader = """cwlVersion: cwl:draft-3
class: CommandLineTool
hints:
  - class: DockerRequirement
    dockerImageId: mdtscripts

baseCommand: [mdtscripts.py, {name}]
    """

def task(inputs, outputs, name=None):
    def functor(f):
        global name
        if name is None: name = f.__name__
        tasklist[name] = TaskType(name,
                                  inputs,
                                  outputs)
        return f
    return functor


@task(inputs='pdbcode',
      outputs={'out.pkl':'pdbfile'},
      label='Download molecule from the PDB')
def from_pdb(pdbcode):
    mol = mdt.from_pdb(pdbcode)
    mol.write('out.pkl')


@task(inputs=['mdtmol', 'chain'],
      outputs={'out.pkl':'MDTMol'},
      label='Return ligand from specified chain')
def isolate_ligand_from_chain(mdtfile, chainid):
    mol = mdt.read(mdtfile)
    newmol = mdt.Molecule(mol.chains[chainid].get_ligand())
    newmol.write('out.pkl')


@task(inputs='mdtmol',
      outputs={'out.pdb': 'pdbfile'})
def to_pdb(mdtfile):
    mdt.read(mdtfile).write('out.pdb')


@task(inputs='mdtmol',
      outputs={'out.pkl': 'mdtmol'})
def isolate_protein(mdtfile):
    mol = mdt.read(mdtfile)
    newmol = mdt.Molecule([atom for atom in mol.atoms if atom.residue.type == 'protein'])
    newmol.write('out.pkl')


@task(inputs='mdtmol',
      outputs={'out.pkl': 'mdtmol'})
def guess_histidine_states(mdtfile):
    mol = mdt.read(mdtfile)
    mdt.guess_histidine_states(mol)
    mol.write('out.pkl')


@task(inputs='mdtmol',
      outputs={'out.pkl': 'mdtmol'})
def assign_amber16_forcefield(mdtfile):
    mol = mdt.read(mdtfile)
    newmol = mdt.assign_forcefield(mol)
    newmol.write('out.pkl')


@task(inputs=['mdtmol1', 'mdtmol2'],
      outputs={'out.pkl': 'mdtmol'})
def combine_molecules(mf1, mf2):
    m1 = mdt.read(mf1)
    m2 = mdt.read(mf2)
    newmol = mdt.Molecule(m1.atoms + m2.atoms)
    newmol.write('out.pkl')


if __name__ == '__main__':
    arg = sys.argv[1]

    if arg == '--writenodes':
        for name in tasklist:
            with open('nodes/%s.cwl' % name, 'w') as outfile:
                print >> outfile, cwlheader.format(name=name)


    funcname = sys.argv[1]
    locals()[funcname](*sys.argv[2:])

