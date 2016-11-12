baseCommand: [mdtscripts.py, isolate_ligand_from_chain]
class: CommandLineTool
cwlVersion: cwl:draft-3
hints:
- {class: DockerRequirement, dockerImageId: mdtscripts}
inputs:
- id: chainid
  inputBinding: {position: 1}
  type: string
- id: mdtfile
  inputBinding: {position: 2}
  type: File
label: Return ligand from specified chain
outputs:
- id: out.pkl
  outputBinding: {glob: out.pkl}
  type: File
