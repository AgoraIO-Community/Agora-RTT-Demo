export interface ITextItem {
  dataType: "transcribe" | "translate"
  uid: string
  language: string
  time: number
  text: string
  isFinal: boolean
}

export interface ParserEvents {
  textAdd: (textItem: ITextItem) => void
}
