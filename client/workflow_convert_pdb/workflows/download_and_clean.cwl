cwlVersion: cwl:draft-3
class: Workflow
inputs:
  - id: pdbcode
    type: string

hints:
  - class: SubworkflowFeatureRequirement

outputs:
  - id: pdbfile
    type: File
    source: "#finalize/pdbfile"

steps:
  - id: download
    run: ../nodes/from_pdb.cwl
    inputs:
      - id: pdbcode
        source: "#pdbcode"
    outputs:
       - id: mol


  - id: finalize
    run: clean_and_convert.cwl
    inputs:
      - id: mdtfile
        source: "#download/mol"
    outputs:
      - id: pdbfile
