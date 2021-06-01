#!/bin/bash -e

# Simulate using the distributed package and verify clean import paths.
npm install --no-save ../../amagaki-amagaki-*.tgz typescript
npx tsc amagaki.ts
node amagaki.js