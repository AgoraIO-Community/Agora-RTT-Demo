import { ITextstream, ParserEvents, ITranslationItem } from "./types"
import { AGEventEmitter } from "../events"
import protoRoot from "@/protobuf/SttMessage_es6.js"

export class Parser extends AGEventEmitter<ParserEvents> {
  constructor() {
    super()
  }

  praseData(data: any) {
    // @ts-ignore
    const textstream = protoRoot.Agora.SpeechToText.lookup("Text").decode(data) as ITextstream
    if (!textstream) {
      return console.warn("Prase data failed.")
    }
    console.log("[test] textstream praseData", textstream)
    this.emit("textstreamReceived", textstream)
  }
}

export const parser = new Parser()
