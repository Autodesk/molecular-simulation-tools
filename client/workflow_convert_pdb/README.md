This directory contains workflows that do some simple processing to a 
PDB file (for testing purposes).

### Build the Dockerfile

This workflow uses a custom docker image. Build it with

```
cd client/workflow_convert_pdb/mdtscripts
docker build . -t mdtscripts
```

### Run it by downloading a file from the PDB

You'll need a YAML input (call it `pdbcode.yml`) file of the form

```
pdbcode: 3AID
```

and can then run it with

```
$ cwltool workflows/download_and_clean.cwl pdbcode.yml
```

See example run script at `download_and_clean_3aid.sh` with the input
file `inputs/pdbcode_3aid.yml`.

### Run it with a passed PDB or mmCIF file

You'll need:

A PDB or mmCIF file (let's call it `3AID.pdb`);

a YAML input (call it `pdbfile.yml`) file of the form

```
infile:
  class: File
  path: /path/to/3AID.pdb
```

and can then run it with

```
$ cwltool workflows/read_and_clean.cwl pdbfile.yml
```

See example run script at `read_and_clean_pdbfile.sh` with input
files `inputs/pdbfile.yml` and `inputs/3AID.pdb`.