baseCommand: [mdtscripts.py, combine_molecules]
class: CommandLineTool
cwlVersion: cwl:draft-3
hints:
- {class: DockerRequirement, dockerImageId: mdtscripts}
inputs:
- id: mdtfile1
  inputBinding: {position: 1}
  type: File
- id: mdtfile2
  inputBinding: {position: 2}
  type: File
label: Assign histidine states
outputs:
- id: out.pkl
  outputBinding: {glob: out.pkl}
  type: File
