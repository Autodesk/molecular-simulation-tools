#!/bin/bash

cwl-runner --cache ./cache \
   workflows/read_and_clean.cwl inputs/pdbfile.yml

