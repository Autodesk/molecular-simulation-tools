#!/usr/bin/env python
import sys

import moldesign as mdt


def from_pdb():
    mol = mdt.from_pdb(sys.argv[2])
    mol.write('out.pkl')


def isolate_ligand_from_chain():
    mol = mdt.read(sys.argv[2])
    newmol = mdt.Molecule(mol.chains[sys.argv[2]].get_ligand())
    newmol.write('out.pkl')


def to_pdb():
    mdt.read(sys.argv[2]).write('out.pdb')


def isolate_protein():
    mol = mdt.read(sys.argv[2])
    newmol = mdt.Molecule([atom for atom in mol.atoms if atom.residue.type == 'protein'])
    newmol.write('out.pkl')


def guess_histidine_states():
    mol = mdt.read(sys.argv[2])
    mdt.guess_histidine_states(mol)
    mol.write('out.pkl')


def assign_amber16_forcefield():
    mol = mdt.read(sys.argv[2])
    newmol = mdt.assign_forcefield(mol)
    newmol.write('out.pkl')


def combine_molecules():
    m1 = mdt.read(sys.argv[2])
    m2 = mdt.read(sys.argv[3])
    newmol = mdt.Molecule(m1.atoms + m2.atoms)
    newmol.write('out.pkl')


if __name__ == '__main__':
    funcname = sys.argv[1]
    locals()[funcname]()

