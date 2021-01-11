{
  "lastUpdate": 1610395796315,
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
          "id": "173ce705398b72ac2047de85c8e2c4cbe103cb9a",
          "message": "Preserve the benchmark index static file.",
          "timestamp": "2021-01-11T13:06:05-07:00",
          "tree_id": "2b720f99387c1e0b9596a94df3f66404c15f6b1f",
          "url": "https://github.com/blinkkcode/amagaki/commit/173ce705398b72ac2047de85c8e2c4cbe103cb9a"
        },
        "date": 1610395796315,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "command.build",
            "value": 14468.019969000015,
            "range": "±0%",
            "unit": "ms",
            "extra": "1 samples"
          },
          {
            "name": "document.fields.localize",
            "value": 3.8182869998854585,
            "range": "±0%",
            "unit": "ms",
            "extra": "34 samples"
          },
          {
            "name": "file.exists",
            "value": 98.72130599929369,
            "range": "±0%",
            "unit": "ms",
            "extra": "5558 samples"
          },
          {
            "name": "file.read",
            "value": 830.5070249981945,
            "range": "±0%",
            "unit": "ms",
            "extra": "21905 samples"
          },
          {
            "name": "plugins.trigger.createRenderer",
            "value": 4.854420998657588,
            "range": "±0%",
            "unit": "ms",
            "extra": "5450 samples"
          },
          {
            "name": "plugins.trigger.createYamlTypes",
            "value": 0.0039000000106170774,
            "range": "±0%",
            "unit": "ms",
            "extra": "1 samples"
          },
          {
            "name": "yaml.load",
            "value": 7.137364000023808,
            "range": "±0%",
            "unit": "ms",
            "extra": "9 samples"
          },
          {
            "name": "yaml.schema",
            "value": 0.3496090000262484,
            "range": "±0%",
            "unit": "ms",
            "extra": "1 samples"
          }
        ]
      }
    ]
  }
}