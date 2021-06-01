#!/bin/bash -e
cd ../
npm pack
cd -
testPath="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
echo $testPath
for d in $testPath/* ; do
    if [ -d "$d" ]; then
        cd $d
        ./run.sh
    fi
done