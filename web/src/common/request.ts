import { IRequestLanguages } from "@/types"

const MODE = import.meta.env.MODE
const gatewayAddress =
  MODE == "test" ? "https://service-staging.agora.io/speech-to-text" : "https://api.agora.io"

// ---------------------------------------
const appId = import.meta.env.VITE_AGORA_APP_ID
const key = import.meta.env.VITE_AGORA_APP_KEY
const secret = import.meta.env.VITE_AGORA_APP_SECRET
const authorization = `Basic ` + btoa(`${key}:${secret}`)

// --------------- stt ----------------
export const apiSTTAcquireToken = async (options: { channel: string }): Promise<any> => {
  const { channel } = options
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
      Authorization: authorization,
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
  channel: string
  languages: IRequestLanguages[]
  token: string
}): Promise<{ taskId: string }> => {
  const { channel, languages, token } = options
  const url = `${gatewayAddress}/v1/projects/${appId}/rtsc/speech-to-text/tasks?builderToken=${token}`
  const body: any = {
    languages: languages.map((item) => item.source),
    maxIdleTime: 60,
    rtcConfig: {
      channelName: channel,
      subBotUid: "1000",
      pubBotUid: "2000",
    },
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
      Authorization: authorization,
    },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (res.status !== 200) {
    throw new Error(data?.message || "start transcription failed")
  }
  return data
}

export const apiSTTStopTranscription = async (options: { taskId: string; token: string }) => {
  const { taskId, token } = options
  const url = `${gatewayAddress}/v1/projects/${appId}/rtsc/speech-to-text/tasks/${taskId}?builderToken=${token}`
  await fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: authorization,
    },
  })
}

// --------------- gpt ----------------
export const apiAiAnalysis = async (options: { system: string; userContent: string }) => {
  const url = "https://stt-demo-offline.agora.io/agora-demo/gpt"
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(options),
  })
  return await res.json()
}
