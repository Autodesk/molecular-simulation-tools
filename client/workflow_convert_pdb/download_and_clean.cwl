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
    run: download_pdb.cwl
    inputs:
      - id: pdbcode
        source: "#pdbcode"
    outputs:
       - id: mdtfile


  - id: clean
    run: guess_histidine_states.cwl
    inputs:
      - id: mdt_in
        source: "#download/mdtfile"
    outputs:
      - id: mdtfile


  - id: convert
    run: convert_to_pdb.cwl
    inputs:
      - id: mdt_in
        source: "#clean/mdtfile"
    outputs:
      - id: pdbfile
