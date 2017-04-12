#!/bin/bash -e

# Create user
dropuser -U postgres -w --if-exists mstdbuser
createuser -U postgres -w --no-password -E -i -l -r mstdbuser

# Create database
# this happens automatically when the .sql file is copied into /docker-entrypoint-initdb.d/
#psql -a -v ON_ERROR_STOP=1 -d postgres -f $MYPATH/configure_database.sql
