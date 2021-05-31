#!/bin/bash -e
testPath="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
echo $testPath
for d in $testPath/* ; do
    if [ -d "$d" ]; then
        cd $d
        ./run.sh
    fi
done