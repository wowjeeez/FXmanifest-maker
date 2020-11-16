# FXmanifest-maker
![Build/release](https://github.com/LedAndris/FXmanifest-maker/workflows/Build/release/badge.svg)
# 
To hook files, you need to include any of these in your files: (any filetype, with any prefix (like //, --, # etc))
`MANIF:CL` for client scripts
`MANIF:SV` for server scripts
`MANIF:SH` for shared scripts
`MANIF:FILE` for a standard file (`files`) entry
`MANIF:UIP` for the UI page
## Determining entry from file names (for example DLLs) is planned
If you open the `settings` (gear icon) tab you will see an option called *One click manifest creation* if you enable that, the meta entries specified below will be used, skipping the manifest data and the finalizing page when creating a new manifest (so it will take less time to create a manifest).
