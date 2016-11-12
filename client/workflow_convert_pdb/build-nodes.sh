#!/bin/bash
# This script both:
#   1) builds the docker image for the scripts to run in, and
#   2) automatically updates the node definitions in nodes/ based on the 
#      definitions in the mdtscripts/mdscripts.py file


docker build . -t mdtscripts
python mdtscripts/mdtscripts.py --writenodes
