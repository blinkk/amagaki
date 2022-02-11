#!/bin/bash -e

# Simulate usage of ES modules. See https://github.com/blinkk/amagaki/issues/53.
cd ./website
npm install --no-save ../../../amagaki-amagaki-*.tgz typescript
npx tsc amagaki.ts
node amagaki.js
npx amagaki build