# Current status

## Summary

The master branch is the dev branch, and is currently broken. We were in-progress to moving apps to be defined and created via JSON, and for the server to update app sessions. Since this project is paused, these issues cannot be addressed until the project is resumed.

### Broken, or does not work

The prod MST uses the public demo CCC, which is a single server not in an autoscaling group. We cannot switch to the new CCC stack until a bug is fixed in the interaction with pyccc and CCC (pyccc fails parsing the results of a CCC job).

Dev/QA/Prod will fail until the RDS database entry is defined in the docker-compose file. Local developement works fine.


## Client

## Server

 - The server APIs for creating/updating sessions is ready.
 - The API for 'quick' jobs is ready.
 - The API for single CCC jobs is ready (although see above).
 - There is no CWL API yet.