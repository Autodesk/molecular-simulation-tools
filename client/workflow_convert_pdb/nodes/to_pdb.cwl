baseCommand: [mdtscripts.py, to_pdb]
class: CommandLineTool
cwlVersion: cwl:draft-3
hints:
- {class: DockerRequirement, dockerImageId: mdtscripts}
inputs:
- id: mdtfile
  inputBinding: {position: 1}
  type: File
label: Create PDB-format output file
outputs:
- id: out.pdb
  outputBinding: {glob: out.pdb}
  type: File
