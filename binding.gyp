{
  "targets": [
    {
      "target_name": "worker",
      "sources": [ "src/worker.cpp" ]
    }
  ],
  "include_dirs" : [
    "<!(node -e \"require('nan')\")"
]
}