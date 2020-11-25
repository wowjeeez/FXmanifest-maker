# FXmanifest-maker
![Build/release](https://github.com/LedAndris/FXmanifest-maker/workflows/Build/release/badge.svg) 
# 
To hook files, you need to include any of these in your files: (any filetype, with any prefix (like //, --, # etc)) <br>
`MANIF:CL` for client scripts <br>
`MANIF:SV` for server scripts <br>
`MANIF:SH` for shared scripts <br>
`MANIF:FILE` for a standard file (`files`) entry <br>
`MANIF:UIP` for the UI page <br>
Javascript example: <br>
`//MANIF:CL`: will be considered as a client script
## Determining entry type from filenames:
**This feature can be turned off in the settings or while making the manifest** <br>
If the filename includes: <br>
`client` OR `CL`: will be considered a client script <br>
`server`OR `SV`: will be considered a server script <br>
`shared` OR `SH`: will be considered a shared script <br>
**If the filename is `index.html` it will be considered as the UI page.** <br>

If you open the `settings` (gear icon) tab you will see an option called *One click manifest creation*, if you enable that, the meta entries specified below will be used, skipping the manifest data and the finalizing page when creating a new manifest (so it will take less time to create a manifest).
