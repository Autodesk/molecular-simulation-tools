# Current status

## Summary

The master branch is the dev branch, and is currently broken. We were in-progress to moving apps to be defined and created via JSON, and for the server to update app sessions. Since this project is paused, these issues cannot be addressed until the project is resumed.

### Broken, or does not work

The prod MST uses the public demo CCC, which is a single server not in an autoscaling group. We cannot switch to the new CCC stack until a bug is fixed in the interaction with pyccc and CCC (pyccc fails parsing the results of a CCC job).

Dev/QA/Prod will fail until the RDS database entry is defined in the docker-compose file. Local developement works fine.


## Client

  - An [in-progress PR](https://github.com/Autodesk/molecular-simulation-tools/pull/280) is still open that hoped to get the frontend working with the session API, but is far from complete.
  - The "thank you page => results page" flow needs to be refactored to handle arbitrary numbers of run widgets inline.
  - At this point a production release might be able to be deployed.
  - Then, the actual app json format should probably be checked and cleaned up.
  - Widgets are not very generic yet, so it might be a priority to clean them up and make them make more understandable.

## Server

 - The server APIs for creating/updating sessions is ready.
 - The API for 'quick' jobs is ready.
 - The API for single CCC jobs is ready (although see above).
 - There is no CWL API yet.
 - Runs need to be removed from Redis (along with db vesion and anything else)
 
## Interactive Molecular Simulation

Currently finished deployment of the static page

**TODO: Create MST app for LAMMPS interactive molecular simulation**

Things to keep in mind:

1. `setUpNew` function inside `/interactive-sim/js/index.js` should be replaced. Get PDB ad LAMMPS data from a workflow that uses LAMMPS model from MDT (Aaron knows about it)
2. Ensure to properly define the `onmessage` callback functions inside `/interactive-sim/js/index.js` and `/interactive-sim/lammps/worker.js`, so the main thread and the web worker thread communicate properly 
3. If you wish to change the C++ code, it should done via [lammps-browser](https://git.autodesk.com/t-leeday/lammps-browser) repo. After you make a code change, recompile C++ by following the [compile instruction](https://git.autodesk.com/t-leeday/lammps-browser/blob/master/browser/README.md) and copy the output `emscripten.*` files into the `/interactive-sim/lammps/` directory.

 
**Important repositories**

[Dayeong's forked MST repo](https://github.com/dane1122/molecular-simulation-tools/tree/interactive-sim) contains the latest code for the **static webpage**

[lammps-browser](https://git.autodesk.com/t-leeday/lammps-browser) contains the latest code for the **emscripten files** for the static web page (emscripten files are exported to https://github.com/dane1122/molecular-simulation-tools/tree/interactive-sim/interactive-sim/lammps/ 

Other branches of the repositories

 - [generalize branch](https://github.com/dane1122/molecular-simulation-tools/tree/generalize) is branched off of interactive-sim. Web worker has less functions, since functions are more generalized. But slightly slower simulation
 - [generalize branch for lammps-browser](https://git.autodesk.com/t-leeday/lammps-browser/tree/generalize) contains the latest code for the **emscripten files** for the above _generalized_ branch. Also contains less functions.
