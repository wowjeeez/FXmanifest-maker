# FXmanifest-maker
CLI tool to create manifest files for CFX.re projects, such as FiveM

# Installation
(This package requires NPM)
1. Run anywhere `npm i -g fxmanifestmaker` 

# Usage
Run the `fxmanifest` command in your terminal. <br>
If you want to include a file in the manifest include this in the file:
TYPE:[ENTRY TYPE]
### Types:
-SV: Server <br>
-SH: Shared <br>
-CL: Client <br>
-UIP: UI page <br>
-FILE: Standard File <br>

## Based on naming:
If you enable the option to use file based entry determination, the following terms will apply: <br>
If the file name includes `SV` (uppercased) it will be a server file, and so on. <br>
If the file name is index.html it will be UI page. <br>

# Data files:
If you put an invalid name after TYPE: (not SV, CL, SH, FILE, UIP). It will be considered a data file, the type of the data file is determined by the string you put after `TYPE:` <br>
For example: 
`<!--TYPE:OVERLAY_INFO_FILE-->` (this is from an XML file) <br>
This will appear in your manifest: <br>
`data_file 'OVERLAY_INFO_FILE' 'FILEPATH'`
# THE FORMATTING OF THE FILE IS VERY BAD NOW, WILL BE FIXED LATER


