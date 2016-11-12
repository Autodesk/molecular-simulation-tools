cwlVersion: cwl:draft-3
class: Workflow
inputs:
  - id: pdbcode
    type: string

outputs:
  - id: pdbfile
    type: File
    source: "#convert/pdbfile"

steps:
  - id: download
    run: ../nodes/from_pdb.cwl
    inputs:
      - id: pdbcode
        source: "#pdbcode"
    outputs:
       - id: mol


  - id: clean
    run: ../nodes/guess_histidine_states.cwl
    inputs:
      - id: mdtfile
        source: "#download/mol"
    outputs:
      - id: mol


  - id: convert
    run: ../nodes/to_pdb.cwl
    inputs:
      - id: mdtfile
        source: "#clean/mol"
    outputs:
      - id: pdbfile
