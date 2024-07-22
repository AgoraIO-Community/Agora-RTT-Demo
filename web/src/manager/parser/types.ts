export interface ITranslationItem {
  lang: string
  text: string
}

export interface ITextstream {
  dataType: "transcribe" | "translate"
  culture: string
  uid: string | number
  startTextTs: number
  textTs: number
  time: number
  durationMs: number
  words: any[]
  trans?: any[]
}

export interface ParserEvents {
  textstreamReceived: (textstream: ITextstream) => void
}
