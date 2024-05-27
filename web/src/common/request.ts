import { IRequestLanguages } from "@/types"

const MODE = import.meta.env.MODE
const gatewayAddress =
  MODE == "test" ? "https://service-staging.agora.io/speech-to-text" : "https://api.agora.io"
const BASE_URL = "https://service.agora.io/toolbox"

// ---------------------------------------
const appId = import.meta.env.VITE_AGORA_APP_ID
const appCertificate = import.meta.env.VITE_AGORA_APP_CERTIFICATE
let agoraToken = ""
let genTokenTime = 0

export async function apiGetAgoraToken(config: { uid: string | number; channel: string }) {
  if (!appCertificate) {
    return null
  }
  const { uid, channel } = config
  const url = `${BASE_URL}/v2/token/generate`
  const data = {
    appId,
    appCertificate,
    channelName: channel,
    expire: 7200,
    src: "web",
    types: [1, 2],
    uid: uid + "",
  }
  let resp = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
  resp = (await resp.json()) || {}
  // @ts-ignore
  return resp?.data?.token || ""
}

const genAuthorization = async (config: { uid: string | number; channel: string }) => {
  if (agoraToken) {
    const curTime = new Date().getTime()
    if (curTime - genTokenTime < 1000 * 60 * 60) {
      return `agora token="${agoraToken}"`
    }
  }
  agoraToken = await apiGetAgoraToken(config)
  genTokenTime = new Date().getTime()
  return `agora token="${agoraToken}"`
}

// --------------- stt ----------------
export const apiSTTAcquireToken = async (options: {
  channel: string
  uid: string | number
}): Promise<any> => {
  const { channel, uid } = options
  const url = `${gatewayAddress}/v1/projects/${appId}/rtsc/speech-to-text/builderTokens`
  const data: any = {
    instanceId: channel,
  }
  if (MODE == "test") {
    data.testIp = "218.205.37.49"
    data.testPort = 4447
  }
  let res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: await genAuthorization(options),
    },
    body: JSON.stringify(data),
  })
  if (res.status == 200) {
    res = await res.json()
    return res
  } else {
    // status: 504
    // please enable the realtime transcription service for this appid
    console.error(res.status, res)
    throw new Error(res.toString())
  }
}

export const apiSTTStartTranscription = async (options: {
  uid: string | number
  channel: string
  languages: IRequestLanguages[]
  token: string
}): Promise<{ taskId: string }> => {
  const { channel, languages, token, uid } = options
  const url = `${gatewayAddress}/v1/projects/${appId}/rtsc/speech-to-text/tasks?builderToken=${token}`
  const subBotUid = "1000"
  const pubBotUid = "2000"
  let subBotToken = null
  let pubBotToken = null
  if (appCertificate) {
    const data = await Promise.all([
      apiGetAgoraToken({
        uid: subBotUid,
        channel,
      }),
      apiGetAgoraToken({
        uid: pubBotUid,
        channel,
      }),
    ])
    subBotToken = data[0]
    pubBotToken = data[1]
  }
  const body: any = {
    languages: languages.map((item) => item.source),
    maxIdleTime: 60,
    rtcConfig: {
      channelName: channel,
      subBotUid,
      pubBotUid,
    },
  }
  if (subBotToken && pubBotToken) {
    body.rtcConfig.subBotToken = subBotToken
    body.rtcConfig.pubBotToken = pubBotToken
  }

  if (languages.find((item) => item.target.length)) {
    body.translateConfig = {
      forceTranslateInterval: 2,
      languages: languages.filter((item) => item.target.length),
    }
  }
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: await genAuthorization({
        uid,
        channel,
      }),
    },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (res.status !== 200) {
    throw new Error(data?.message || "start transcription failed")
  }
  return data
}

export const apiSTTStopTranscription = async (options: {
  taskId: string
  token: string
  uid: number | string
  channel: string
}) => {
  const { taskId, token, uid, channel } = options
  const url = `${gatewayAddress}/v1/projects/${appId}/rtsc/speech-to-text/tasks/${taskId}?builderToken=${token}`
  await fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: await genAuthorization({
        uid,
        channel,
      }),
    },
  })
}

// --------------- gpt ----------------
export const apiAiAnalysis = async (options: { system: string; userContent: string }) => {
  const url = import.meta.env.VITE_AGORA_GPT_URL
  if (!url) {
    throw new Error("VITE_AGORA_GPT_URL is not defined in env")
  }
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(options),
  })
  return await res.json()
}
