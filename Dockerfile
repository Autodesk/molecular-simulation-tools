FROM debian:jessie
MAINTAINER Dion Amago Whitehead

#######################################
# General tools needed by multiple sections below
#######################################
RUN apt-get update \
    && apt-get install -y \
      wget \
      curl && \
  apt-get -y clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

#######################################
# Haxe
#######################################

ENV DEBIAN_FRONTEND noninteractive
RUN rm /bin/sh && ln -s /bin/bash /bin/sh

# Neko environment variables
ENV NEKOVERSION=2.0.0 NEKOPATH=/opt/neko
ENV HAXEVERSION=3.3.0-rc.1 HAXEPATH=/opt/haxe HAXELIB_PATH=/opt/haxelib

# Dependencies
RUN apt-get update \
    && apt-get install -y \
      libgc-dev \
      git && \
    mkdir -p $NEKOPATH && \
    wget -O - http://nekovm.org/_media/neko-$NEKOVERSION-linux64.tar.gz \
    | tar xzf - --strip=1 -C $NEKOPATH && \
    mkdir -p $HAXEPATH && \
    wget -O - http://haxe.org/website-content/downloads/$HAXEVERSION/downloads/haxe-$HAXEVERSION-linux64.tar.gz \
      | tar xzf - --strip=1 -C $HAXEPATH && \
    mkdir -p $HAXELIB_PATH && echo $HAXELIB_PATH > /root/.haxelib && cp /root/.haxelib /etc/ && \
	apt-get -y autoremove && \
	apt-get -y clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

################################################################################

ENV LD_LIBRARY_PATH $NEKOPATH
ENV PATH $NEKOPATH:$PATH
ENV HAXE_STD_PATH $HAXEPATH/std/
ENV PATH $HAXEPATH:$PATH

# workaround for https://github.com/HaxeFoundation/haxe/issues/3912
ENV HAXE_STD_PATH $HAXE_STD_PATH:.:/

#######################################
# Node/npm
#######################################

# RUN apt-get update && \
#   apt-get install -y g++ g++-multilib libgc-dev git python build-essential && \
#   curl -sL https://deb.nodesource.com/setup_6.x | bash - && \
#   apt-get -y install nodejs && \
#   apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*


RUN apt-get update && \
    apt-get install -y g++ g++-multilib libgc-dev git python build-essential && \
    curl -sL https://deb.nodesource.com/setup_6.x | bash - && \
    apt-get -y install nodejs && \
    npm install -g forever nodemon grunt grunt-cli webpack
# RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*


# RUN 


# #######################################
# # Client build/install packages
# #######################################

ENV APP /app
RUN mkdir -p $APP
WORKDIR $APP

ADD client $APP/client
WORKDIR $APP/client
RUN touch $APP/client/.env
RUN npm install
RUN npm run build


#######################################
# Server build/install packages
#######################################

ADD ./server/lib/workflow-execution-server $APP/server
WORKDIR $APP/server
RUN haxelib newrepo
RUN haxelib install --always etc/haxe/base.hxml && haxelib install --always etc/haxe/base-nodejs.hxml
RUN haxe etc/haxe/build-all.hxml
RUN npm install


ENV PORT 4000
EXPOSE $PORT

CMD ["forever", "build/server/server-workflow.js"]