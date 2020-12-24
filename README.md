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

If you open the `settings` (gear icon) tab you will see an option called *One click manifest creation*, if you enable that, the meta entries specified there will be used, skipping the manifest data and the finalizing page when creating a new manifest (so it will take less time to create it).

# Installation
### 1. UI (without CLI)
Download the installer binaries from the [Releases](https://github.com/LedAndris/FXmanifest-maker/releases) section, and install it. <br>
### 2. CLI ("without" UI)
You will need both npm and node installed.
1. Clone this repo
2. Run the `npm i -g` command in that folder
(You can still access the UI, if you run the `npm start` command in the folder)
### 3. CLI & UI
Easiest way is to do both steps, so you don't have to build electron manually.
# Incoming features
#### -Preserving data from existing manifests (imported files, dependencies etc) \[author, description, version, gametype is already done] <br>
