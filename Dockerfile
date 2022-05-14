FROM node:14.17.0 as builder
LABEL description="This is the build stage for parallel-trading-bot. Here we create the dist."

WORKDIR /trading-bot

COPY . /trading-bot

RUN yarn && yarn build

# ===== SECOND STAGE ======

FROM node:14.17.0
LABEL description="This is the 2nd stage: a very small image where we copy the parallel-trading-bot."

RUN env

COPY --from=builder /trading-bot/dist /usr/local/lib/dist
COPY --from=builder /trading-bot/node_modules /usr/local/lib/node_modules

RUN sed -i '1i\#!/usr/bin/env node' /usr/local/lib/dist/src/index.js \
    && chmod +x /usr/local/lib/dist/src/index.js \
    && ln -s /usr/local/lib/dist/src/index.js /usr/local/bin/trading-bot

ENTRYPOINT ["/usr/local/bin/trading-bot"]