window.BENCHMARK_DATA = {
  "lastUpdate": 1608736895024,
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
          "id": "8afa2dd459ae576b614888f4ef6af815bc5ddf31",
          "message": "Testing alternative build method for benchmark.",
          "timestamp": "2020-12-23T08:17:39-07:00",
          "tree_id": "10eba5e6bbd86a1802f088ff246cee2f67ad53cc",
          "url": "https://github.com/blinkkcode/amagaki/commit/8afa2dd459ae576b614888f4ef6af815bc5ddf31"
        },
        "date": 1608736892895,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "command.build",
            "value": 19673.75609499996,
            "range": "±0%",
            "unit": "ms",
            "extra": "1 samples"
          },
          {
            "name": "document.fields.localize",
            "value": 3.9064339998876676,
            "range": "±0%",
            "unit": "ms",
            "extra": "34 samples"
          },
          {
            "name": "file.exists",
            "value": 124.29074900224805,
            "range": "±0%",
            "unit": "ms",
            "extra": "5557 samples"
          },
          {
            "name": "file.read",
            "value": 1032.327432001126,
            "range": "±0%",
            "unit": "ms",
            "extra": "21905 samples"
          },
          {
            "name": "yaml.load",
            "value": 7.596566999913193,
            "range": "±0%",
            "unit": "ms",
            "extra": "9 samples"
          },
          {
            "name": "yaml.schema",
            "value": 0.32030299998587,
            "range": "±0%",
            "unit": "ms",
            "extra": "1 samples"
          }
        ]
      }
    ]
  }
}