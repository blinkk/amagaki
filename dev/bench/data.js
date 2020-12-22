window.BENCHMARK_DATA = {
  "lastUpdate": 1608675776650,
  "repoUrl": "https://github.com/blinkkcode/amagaki",
  "entries": {
    "Amagaki profiling benchmark": [
      {
        "commit": {
          "author": {
            "email": "randy@blinkk.com",
            "name": "Randy Merrill",
            "username": "Zoramite"
          },
          "committer": {
            "email": "randy@blinkk.com",
            "name": "Randy Merrill",
            "username": "Zoramite"
          },
          "distinct": true,
          "id": "f0f639f4ac8e25b8e5c3b0a8f13177cdaed51892",
          "message": "Separating out the main and PR benchmarks.",
          "timestamp": "2020-12-22T15:09:26-07:00",
          "tree_id": "0e5946d78c6e13b9fe0747d619fba60433a9f1e5",
          "url": "https://github.com/blinkkcode/amagaki/commit/f0f639f4ac8e25b8e5c3b0a8f13177cdaed51892"
        },
        "date": 1608675009283,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "command.build",
            "value": 413.012201000005,
            "range": "±0%",
            "unit": "ms",
            "extra": "1 samples"
          },
          {
            "name": "document.fields.localize",
            "value": 7.955916999926558,
            "range": "±0%",
            "unit": "ms",
            "extra": "35 samples"
          },
          {
            "name": "file.exists",
            "value": 3.525307999982033,
            "range": "±0%",
            "unit": "ms",
            "extra": "132 samples"
          },
          {
            "name": "file.read",
            "value": 18.221035999973537,
            "range": "±0%",
            "unit": "ms",
            "extra": "273 samples"
          },
          {
            "name": "yaml.load",
            "value": 7.396316999976989,
            "range": "±0%",
            "unit": "ms",
            "extra": "9 samples"
          },
          {
            "name": "yaml.schema",
            "value": 0.31580000001122244,
            "range": "±0%",
            "unit": "ms",
            "extra": "1 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "randy@blinkk.com",
            "name": "Randy Merrill",
            "username": "Zoramite"
          },
          "committer": {
            "email": "randy@blinkk.com",
            "name": "Randy Merrill",
            "username": "Zoramite"
          },
          "distinct": true,
          "id": "2ccc187ca7ec2d6292498ea814041bc3719d48a6",
          "message": "Adjust the benchmark build path.",
          "timestamp": "2020-12-22T15:21:42-07:00",
          "tree_id": "f1a60faec8655e22f55d4d28dd548bb0536ce76a",
          "url": "https://github.com/blinkkcode/amagaki/commit/2ccc187ca7ec2d6292498ea814041bc3719d48a6"
        },
        "date": 1608675775800,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "command.build",
            "value": 17671.665855,
            "range": "±0%",
            "unit": "ms",
            "extra": "1 samples"
          },
          {
            "name": "document.fields.localize",
            "value": 4.506797999943956,
            "range": "±0%",
            "unit": "ms",
            "extra": "34 samples"
          },
          {
            "name": "file.exists",
            "value": 130.4861539996491,
            "range": "±0%",
            "unit": "ms",
            "extra": "5557 samples"
          },
          {
            "name": "file.read",
            "value": 1071.821513001807,
            "range": "±0%",
            "unit": "ms",
            "extra": "21905 samples"
          },
          {
            "name": "yaml.load",
            "value": 8.17594200001622,
            "range": "±0%",
            "unit": "ms",
            "extra": "9 samples"
          },
          {
            "name": "yaml.schema",
            "value": 0.35452300000179093,
            "range": "±0%",
            "unit": "ms",
            "extra": "1 samples"
          }
        ]
      }
    ]
  }
}