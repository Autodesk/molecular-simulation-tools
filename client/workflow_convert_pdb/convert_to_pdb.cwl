label: Convert pickle-formatted molecule to PDB
baseCommand: [mdtscripts.py, to_pdb]

inputs:
  - id: mdt_in
    type: File
    inputBinding:
      position: 1

outputs:
  - id: pdbfile
    type: File
    outputBinding:
      glob: out.pdb

cwlVersion: cwl:draft-3
class: CommandLineTool
hints:
  - class: DockerRequirement
    dockerImageId: mdtscripts
