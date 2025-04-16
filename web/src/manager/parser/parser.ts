import { ITextstream, ParserEvents, ITranslationItem } from "./types"
import { AGEventEmitter } from "../events"
import protoRoot from "@/protobuf/SttMessage.js"

export class Parser extends AGEventEmitter<ParserEvents> {
  constructor() {
    super()
    // @ts-ignore
    window.praseData = this.praseData.bind(this)
  }

  praseData(data: any) {
    // @ts-ignore
    const textstream = protoRoot.Agora.SpeechToText.lookup("Text").decode(data) as ITextstream
    if (!textstream) {
      return console.warn("Prase data failed.")
    }
    console.log("[test] textstream praseData source data", JSON.stringify(textstream))
    this.emit("streamtextstreamReceived", textstream)
  }
}

export const parser = new Parser()
