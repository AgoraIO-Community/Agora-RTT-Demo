export interface ITextItem {
  dataType: "transcribe" | "translate"
  uid: string
  language: string
  time: number
  text: string
  isFinal: boolean
  // hyh
  username: string
  startTextTs: number
  textTs: number
  translations: ITranslationItem[]
}

export interface ITranslationItem {
  lang: string
  text: string
}

export interface ParserEvents {
  textAdd: (textItem: ITextItem) => void
  textstreamReceived: (textstream: any) => void
}
