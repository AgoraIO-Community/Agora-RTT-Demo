import i18n from "i18next"
import Backend from "i18next-http-backend"
import LanguageDetector from "i18next-browser-languagedetector"
import { initReactI18next } from "react-i18next"
import { name } from "../../package.json"

const MODE = import.meta.env.MODE
let loadPath = ""
let addPath = ""

if (MODE === "production") {
  loadPath = `/${name}/locales/{{lng}}/{{ns}}.json`
  addPath = `/${name}/locales/add/{{lng}}/{{ns}}`
} else if (MODE == "test") {
  loadPath = `/${name}-test/locales/{{lng}}/{{ns}}.json`
  addPath = `/${name}-test/locales/add/{{lng}}/{{ns}}`
} else {
  loadPath = "/locales/{{lng}}/{{ns}}.json"
  addPath = "/locales/add/{{lng}}/{{ns}}"
}

i18n
  // load translation using http -> see /public/locales
  // learn more: https://github.com/i18next/i18next-http-backend
  .use(Backend)
  // detect user language
  // learn more: https://github.com/i18next/i18next-browser-languageDetector
  .use(LanguageDetector)
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // init i18next
  // for all options read: https://www.i18next.com/overview/configuration-options
  .init({
    load: "languageOnly",
    fallbackLng: "en",
    backend: {
      loadPath,
      addPath,
    },
    debug: true,
  })

export default i18n
