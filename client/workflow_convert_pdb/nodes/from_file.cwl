baseCommand: [mdtscripts.py, from_file]
class: CommandLineTool
cwlVersion: cwl:draft-3
hints:
- {class: DockerRequirement, dockerImageId: mdtscripts}
inputs:
- id: infile
  inputBinding: {position: 1}
  type: File
label: Read a molecule from a file (format determined by extension)
outputs:
- id: mol
  outputBinding: {glob: out.pkl}
  type: File
