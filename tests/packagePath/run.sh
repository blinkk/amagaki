#!/bin/bash

# Simulate using the distributed package and verify clean import paths.
cd ../../
npm pack
cd tests/packagePath/
npm install --save ../../amagaki-amagaki-*.tgz typescript
npx tsc amagaki.ts
node amagaki.js