cwlVersion: cwl:draft-3
class: Workflow
inputs:
  - id: infile
    type: File

hints:
  - class: SubworkflowFeatureRequirement

outputs:
  - id: pdbfile
    type: File
    source: "#finalize/pdbfile"

steps:
  - id: read_file
    run: ../nodes/from_file.cwl
    inputs:
      - id: infile
        source: "#infile"
    outputs:
       - id: mol


  - id: finalize
    run: clean_and_convert.cwl
    inputs:
      - id: mdtfile
        source: "#read_file/mol"
    outputs:
      - id: pdbfile
