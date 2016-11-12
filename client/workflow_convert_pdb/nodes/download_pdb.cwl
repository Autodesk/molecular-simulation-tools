cwlVersion: cwl:draft-3
class: CommandLineTool
label: Download a file from PDB
baseCommand: [mdtscripts.py, from_pdb]
hints:
  - class: DockerRequirement
    dockerImageId: mdtscripts
inputs:
  - id: pdbcode
    type: string
    inputBinding:
      position: 1

outputs:
  - id: mdtfile
    type: File
    outputBinding:
      glob: out.pkl
