#!/usr/bin/env python
import os
import sys
import collections

import yaml

tasklist = {}

TaskType = collections.namedtuple('TaskType',
                                  'name inputs outputs')


cwlheader = {'class': 'CommandLineTool',
             'cwlVersion': 'cwl:draft-3',
             'hints':
                 [{'class': 'DockerRequirement',
                   'dockerImageId': 'mdtscripts'}]}


def task(inputs, outputs, name=None,
         label='Python task definition'):
    fname = name

    def functor(f):
        name = fname if fname is not None else f.__name__

        taskyml = cwlheader.copy()
        taskyml['baseCommand'] = ['mdtscripts.py', f.__name__]
        taskyml['label'] = label
        taskyml['inputs'] = [
            {'id':fid, 'type':typ, 'inputBinding':{'position':i+1}}
            for i,(fid,typ) in enumerate(inputs.iteritems())]
        taskyml['outputs'] = [
                {'id': outfile, 'type': typ, 'outputBinding': {'glob': outfile}}
                for outfile, typ in outputs.iteritems()]

        tasklist[name] = taskyml
        return f
    return functor


@task(inputs={'pdbcode':'string'},
      outputs={'out.pkl':'File'},
      label='Download molecule from the PDB')
def from_pdb(pdbcode):
    import moldesign as mdt
    mol = mdt.from_pdb(pdbcode)
    mol.write('out.pkl')


@task(inputs={'mdtfile':'File', 'chainid':'string'},
      outputs={'out.pkl':'File'},
      label='Return ligand from specified chain')
def isolate_ligand_from_chain(mdtfile, chainid):
    import moldesign as mdt

    mol = mdt.read(mdtfile)
    newmol = mdt.Molecule(mol.chains[chainid].get_ligand())
    newmol.write('out.pkl')


@task(inputs={'mdtfile': 'File'},
      outputs={'out.pdb': 'File'},
      label='Create PDB-format output file')
def to_pdb(mdtfile):
    import moldesign as mdt

    mdt.read(mdtfile).write('out.pdb')


@task(inputs={'mdtfile': 'File'},
      outputs={'out.pkl': 'File'},
      label='strip nonprotein residues')
def isolate_protein(mdtfile):
    import moldesign as mdt

    mol = mdt.read(mdtfile)
    newmol = mdt.Molecule([atom for atom in mol.atoms if atom.residue.type == 'protein'])
    newmol.write('out.pkl')


@task(inputs={'mdtfile':'File'},
      outputs={'out.pkl': 'File'},
      label='Assign histidine states')
def guess_histidine_states(mdtfile):
    import moldesign as mdt

    mol = mdt.read(mdtfile)
    mdt.guess_histidine_states(mol)
    mol.write('out.pkl')


@task(inputs={'mdtfile':'File'},
      outputs={'out.pkl': 'File'},
      label='Assign amber14 forcefield')
def assign_amber16_forcefield(mdtfile):
    import moldesign as mdt

    mol = mdt.read(mdtfile)
    newmol = mdt.assign_forcefield(mol)
    newmol.write('out.pkl')


@task(inputs={'mdtfile1':'File', 'mdtfile2':'File'},
      outputs={'out.pkl': 'File'},
      label='Assign histidine states')
def combine_molecules(mdtfile1, mdtfile2):
    import moldesign as mdt

    m1 = mdt.read(mdtfile1)
    m2 = mdt.read(mdtfile2)
    newmol = mdt.Molecule(m1.atoms + m2.atoms)
    newmol.write('out.pkl')


if __name__ == '__main__':
    arg = sys.argv[1]

    if arg == '--writenodes':
        if not os.path.exists('nodes'):
            os.mkdir('nodes')

        for name in tasklist:
            with open('nodes/%s.cwl' % name, 'w') as outfile:
                yaml.dump(tasklist[name], outfile)

    else:
        funcname = sys.argv[1]
        locals()[funcname](*sys.argv[2:])

