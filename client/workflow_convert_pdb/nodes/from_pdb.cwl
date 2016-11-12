baseCommand: [mdtscripts.py, from_pdb]
class: CommandLineTool
cwlVersion: cwl:draft-3
hints:
- {class: DockerRequirement, dockerImageId: mdtscripts}
inputs:
- id: pdbcode
  inputBinding: {position: 1}
  type: string
label: Download molecule from the PDB
outputs:
- id: out.pkl
  outputBinding: {glob: out.pkl}
  type: File
