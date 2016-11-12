# build this with `docker build . --tag mdtscripts`
FROM autodesk/moldesign:moldesign_complete-0.7.3
ENV PATH=/scripts:$PATH
ADD . /scripts
RUN chmod +x /scripts/*
