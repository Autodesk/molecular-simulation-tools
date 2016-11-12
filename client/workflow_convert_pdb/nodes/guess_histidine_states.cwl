label: Guess any ambiguous histidine states
baseCommand: [mdtscripts.py, guess_histidine_states]

inputs:
  - id: mdt_in
    type: File
    inputBinding:
      position: 1

outputs:
  - id: mdtfile
    type: File
    outputBinding:
      glob: out.pkl

cwlVersion: cwl:draft-3
class: CommandLineTool
hints:
  - class: DockerRequirement
    dockerImageId: mdtscripts
