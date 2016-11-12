baseCommand: [mdtscripts.py, isolate_protein]
class: CommandLineTool
cwlVersion: cwl:draft-3
hints:
- {class: DockerRequirement, dockerImageId: mdtscripts}
inputs:
- id: mdtfile
  inputBinding: {position: 1}
  type: File
label: strip nonprotein residues
outputs:
- id: out.pkl
  outputBinding: {glob: out.pkl}
  type: File
