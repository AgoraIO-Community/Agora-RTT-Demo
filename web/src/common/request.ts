import { IRequestLanguages } from "@/types"

const MODE = import.meta.env.MODE
const AGORA_SERVER_DEMO_URL = import.meta.env.VITE_AGORA_DEMO_SERVER_URL
const gatewayAddress = `${AGORA_SERVER_DEMO_URL}/v1/speech-to-text`
// const gatewayAddress = "https://api-test.agora.io/api/voice-ai-agent/v1/projects"

const BASE_URL = "https://service.agora.io/toolbox-global"

// ---------------------------------------
const appId = import.meta.env.VITE_AGORA_APP_ID
const appCertificate = import.meta.env.VITE_AGORA_APP_CERTIFICATE
const authUsername = import.meta.env.VITE_AGORA_AUTH_USERNAME
const authPassword = import.meta.env.VITE_AGORA_AUTH_PASSWORD
const SUB_BOT_UID = "1000"
const PUB_BOT_UID = "2000"
let sequenceId = new Date().getTime()
let updateTimer: number = 0
export async function apiGetAgoraToken(config: { uid: string | number; channel: string }) {
  // if (!appCertificate) {
  //   return null
  // }
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

// --------------- stt ----------------

export const apiSTTStartTranscription = async (options: {
  uid: string | number
  channel: string
  languages: IRequestLanguages[]
  extensionParams?: string
}): Promise<{ agent_id: string }> => {
  const { channel, uid, extensionParams } = options
  const languages = options.languages.map((item) => ({
    ...item,
    target: item.target.filter((lang) => lang !== item.source),
  }))
  const url = `${gatewayAddress}/projects/${appId}/join`
  let subBotToken = null
  let pubBotToken = null
  // if (appCertificate) {
  const agentBotData = await Promise.all([
    apiGetAgoraToken({
      uid: `${uid}${SUB_BOT_UID}`,
      channel,
    }),
    apiGetAgoraToken({
      uid: `${uid}${PUB_BOT_UID}`,
      channel,
    }),
  ])
  subBotToken = agentBotData[0]
  pubBotToken = agentBotData[1]
  // }
  const body: any = {
    authUsername,
    authPassword,
    appCert: appCertificate,
    name: `${channel}-${new Date().getTime()}-${uid}`,
    languages: languages.map((item) => item.source),
    maxIdleTime: 30,
    rtcConfig: {
      channelName: channel,
      subBotUid: `${uid}${SUB_BOT_UID}`,
      pubBotUid: `${uid}${PUB_BOT_UID}`,
      subscribeAudioUids: [`${uid}`],
    },
    uidLanguagesConfig: [
      {
        uid,
        languages: languages.map((item) => item.source),
      },
    ],
    extensionParams: {
      sessCtrlVadVolumeThr: "60",
      sessCtrlVadThr: "0.3",
      sessCtrlPrePaddingLenOfSessCtrlSOS: "500",
      sessCtrlPostPaddingLenOfSessCtrlEOS: "500",
      sessCtrlUnVoiceLenOfTriggerSessCtrlEOS: "1000",
    },
  }
  if (subBotToken && pubBotToken) {
    body.rtcConfig.subBotToken = subBotToken
    body.rtcConfig.pubBotToken = pubBotToken
  }
  if (languages.find((item) => item.target.length)) {
    body.translateConfig = {
      languages: languages.filter((item) => item.target.length),
    }
  }

  if (extensionParams && typeof extensionParams === "string") {
    try {
      body.extensionParams = { ...body.extensionParams, ...JSON.parse(extensionParams) }
    } catch (error) {
      body.extensionParams = null
    }
  }
  console.log("[test] join agent body", JSON.stringify(body))
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  console.log("[test] join agent response", JSON.stringify(data))

  if (res.status !== 200) {
    throw new Error(data?.detail || "start transcription failed")
  }
  return data
}

export const apiSTTStopTranscription = async (options: {
  taskId: string
  uid: number | string
  channel: string
}) => {
  const { taskId, uid, channel } = options
  const url = `${gatewayAddress}/projects/${appId}/agents/${taskId}/leave`
  if (updateTimer) {
    clearTimeout(updateTimer)
    updateTimer = 0
  }
  await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      authUsername,
      authPassword,
    }),
  })
}

export const apiSTTQueryTranscription = async (options: {
  taskId: string
  uid: number | string
  channel: string
}) => {
  const { taskId, uid, channel } = options
  const url = `${gatewayAddress}/projects/${appId}/agents/${taskId}`
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
  return await res.json()
}

export const apiSTTUpdateTranscription = async (options: {
  uid: string | number
  channel: string
  languages: IRequestLanguages[]
  taskId: string
  extensionParams?: string
}) => {
  if (updateTimer) {
    clearTimeout(updateTimer)
    updateTimer = 0
  }
  const { taskId, uid, extensionParams } = options
  const updateMaskList = []
  const languages = options.languages.map((item) => ({
    ...item,
    target: item.target.filter((lang) => lang !== item.source),
  }))

  const body: any = {
    languages: languages.map((item) => item.source),
    uidLanguagesConfig: [
      {
        uid,
        languages: languages.map((item) => item.source),
      },
    ],
  }
  updateMaskList.push("languages")
  updateMaskList.push("uidLanguagesConfig")
  if (languages.find((item) => item.target.length)) {
    body.translateConfig = {
      enable: true,
      languages: languages.filter((item) => item.target.length),
    }
    updateMaskList.push("translateConfig.languages")
    updateMaskList.push("translateConfig.enable")
  }

  if (extensionParams && typeof extensionParams === "string") {
    try {
      const params = JSON.parse(extensionParams)
      Object.keys(params).forEach((key) => {
        updateMaskList.push(`extensionParams.${key}`)
      })
      body.extensionParams = params
    } catch (error) {
      body.extensionParams = null
    }
  }

  const updateMask = updateMaskList.join(",")
  const url = `${gatewayAddress}/projects/${appId}/agents/${taskId}/update?sequenceId=${sequenceId++}&updateMask=${updateMask}`
  console.log("[test] update agent body", JSON.stringify(body))
  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })
  const responseData = await resp.json().catch((e) => ({
    parseError: true,
    message: "Failed to parse response as JSON",
  }))
  if (!resp.ok) {
    console.info("[API Error]", JSON.stringify(responseData))
    if (responseData.detail.includes("least 5 seconds")) {
      updateTimer = window.setTimeout(() => apiSTTUpdateTranscription(options), 5000)
      throw new Error("update the target language ...")
    }
  }

  return responseData
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
