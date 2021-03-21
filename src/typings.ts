export type EntryType = "SV" | "CL" | "SH" | "UIP" | "FILE"

export type DataFile = string
export interface EntryFiles {
  SV: string[],
  CL: string[],
  SH: string[],
  UIP: string[],
  FILE: string[],
  DATA_FILES: DataFile[]
}