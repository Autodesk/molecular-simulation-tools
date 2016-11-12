baseCommand: [mdtscripts.py, guess_histidine_states]
class: CommandLineTool
cwlVersion: cwl:draft-3
hints:
- {class: DockerRequirement, dockerImageId: mdtscripts}
inputs:
- id: mdtfile
  inputBinding: {position: 1}
  type: File
label: Assign histidine states
outputs:
- id: mol
  outputBinding: {glob: out.pkl}
  type: File
