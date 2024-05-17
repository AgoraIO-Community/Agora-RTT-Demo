import { ParserEvents, ITextItem, ITranslationItem } from "./types"
import { AGEventEmitter } from "../events"
import protoRoot from "@/protobuf/SttMessage_es6.js"
import { useSelector, useDispatch } from "react-redux"
import store, { RootState } from "@/store"

const subtitles: ITextItem[] = []
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
    const textItem: ITextItem = {} as ITextItem
    textItem.uid = uid
    textItem.time = textTs
    textItem.textTs = time
    this.emit("textstreamReceived", textstream)
    switch (dataType) {
      case "transcribe": {
        // console.log("[test] textstream transcribe textStr", textstream)
        let textStr: string = ""
        let isFinal = false
        words.forEach((word: any) => {
          textStr += word.text
          if (word.isFinal) {
            isFinal = true
          }
        })
        const st = subtitles.findLast((el) => {
          const flag = el.uid == textstream.uid && !el.isFinal
          return flag
        })
        if (undefined == st) {
          const subtitle: ITextItem = {} as ITextItem
          // subtitle.isTranslate = false
          subtitle.dataType = "transcribe"
          subtitle.uid = textstream.uid
          subtitle.language = textstream.culture
          subtitle.text = textStr
          subtitle.isFinal = isFinal
          subtitle.time = textstream.time + textstream.durationMs
          subtitle.startTextTs = textstream.textTs
          subtitle.textTs = textstream.textTs
          subtitles.push(subtitle)
          // console.log("[test] transcribe received[new]:", subtitle)
          this.emit("textAdd", subtitle)
        } else {
          st.text = textStr
          st.isFinal = isFinal
          st.time = textstream.time + textstream.durationMs
          st.textTs = textstream.textTs
          // subtitles.push(st)
          // console.log("[test] transcribe received[update]:", st)
          this.emit("textAdd", st)
        }
        // textItem.dataType = "transcribe"
        // textItem.language = culture
        // textItem.text = textStr
        // textItem.isFinal = isFinal
        break
      }
      case "translate": {
        // console.log("[test] subtitles: ", subtitles)
        // console.log("[test] textstream translate textStr", textstream)
        const st = subtitles.findLast((el) => {
          const flag =
            el.uid == textstream.uid &&
            (textstream.textTs >= el.startTextTs || textstream.textTs <= el.textTs)
          return flag
        })
        if (undefined == st) {
          // console.log("[test] Can not find subtitle")
          // callback(false, undefined)
          return
        }
        // console.log("[test] select subtitle: ", st)

        textstream.trans.forEach((transItem: { lang: string; texts: any[]; isFinal: boolean }) => {
          // console.log("[test] transItem", transItem)
          if (undefined == st.translations) {
            // console.log("[test] init translations")
            st.translations = []
          }
          const t = st.translations.findLast((el: ITranslationItem) => {
            return el.lang == transItem.lang
          })
          if (undefined == t) {
            // console.log("[test] init aaa: ", st.translations)
            st.translations.push({ lang: transItem.lang, text: transItem.texts.join("") })
          } else {
            // console.log("[test] update aaa: ", st.translations)
            t.text = transItem.texts.join("")
          }
          // st.time = textstream.time + textstream.durationMs
          // st.textTs = textstream.textTs
        })
        // console.log("[test]translation received:", st)
        this.emit("textAdd", st)

        // if (!trans?.length) {
        //   return
        // }
        // trans.forEach((transItem: any) => {
        //   textStr = transItem.texts.join("")
        //   isFinal = !!transItem.isFinal
        //   textItem.dataType = "translate"
        //   textItem.language = transItem.lang
        //   textItem.isFinal = isFinal
        //   textItem.text = textStr
        //   this.emit("textAdd", textItem)
        // })
        break
      }
    }
  }
}

export const parser = new Parser()
