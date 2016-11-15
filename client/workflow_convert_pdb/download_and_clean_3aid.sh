#!/bin/bash

cwl-runner --cache ./cache \
   workflows/download_and_clean.cwl inputs/pdbcode_3aid.yml
