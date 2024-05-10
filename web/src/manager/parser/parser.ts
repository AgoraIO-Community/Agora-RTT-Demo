import { ParserEvents, ITextItem } from "./types"
import { AGEventEmitter } from "../events"
import protoRoot from "@/protobuf/SttMessage_es6.js"

export class Parser extends AGEventEmitter<ParserEvents> {
  constructor() {
    super()
  }

  praseData(data: any) {
    // @ts-ignore
    const textstream = protoRoot.Agora.SpeechToText.lookup("Text").decode(data)
    if (!textstream) {
      return console.warn("Prase data failed.")
    }
    const { dataType, words, uid, culture, time, durationMs, textTs, trans } = textstream
    let textStr: string = ""
    let isFinal = false
    const textItem: ITextItem = {} as ITextItem
    textItem.uid = uid
    textItem.time = textTs
    switch (dataType) {
      case "transcribe":
        words.forEach((word: any) => {
          textStr += word.text
          if (word.isFinal) {
            isFinal = true
          }
        })
        textItem.dataType = "transcribe"
        textItem.language = culture
        textItem.text = textStr
        textItem.isFinal = isFinal
        console.log("[test] textstream transcribe textStr", textstream)
        this.emit("textAdd", textItem)
        break
      case "translate":
        if (!trans?.length) {
          return
        }
        trans.forEach((transItem: any) => {
          textStr = transItem.texts.join("")
          isFinal = !!transItem.isFinal
          textItem.dataType = "translate"
          textItem.language = transItem.lang
          textItem.isFinal = isFinal
          textItem.text = textStr
          console.log("[test] textstream translate textStr", textstream)
          this.emit("textAdd", textItem)
        })
        break
    }
  }
}

export const parser = new Parser()
