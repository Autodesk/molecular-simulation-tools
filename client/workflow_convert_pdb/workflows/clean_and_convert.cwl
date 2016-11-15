cwlVersion: cwl:draft-3
class: Workflow
inputs:
  - id: mdtfile
    type: File

outputs:
  - id: pdbfile
    type: File
    source: "#convert/pdbfile"

steps:
  - id: clean
    run: ../nodes/guess_histidine_states.cwl
    inputs:
      - id: mdtfile
        source: "#mdtfile"
    outputs:
      - id: mol


  - id: convert
    run: ../nodes/to_pdb.cwl
    inputs:
      - id: mdtfile
        source: "#clean/mol"
    outputs:
      - id: pdbfile
