baseCommand: [mdtscripts.py, assign_amber16_forcefield]
class: CommandLineTool
cwlVersion: cwl:draft-3
hints:
- {class: DockerRequirement, dockerImageId: mdtscripts}
inputs:
- id: mdtfile
  inputBinding: {position: 1}
  type: File
label: Assign amber14 forcefield
outputs:
- id: out.pkl
  outputBinding: {glob: out.pkl}
  type: File
