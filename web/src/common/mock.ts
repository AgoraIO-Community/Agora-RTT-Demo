import { genRandomUserId } from "./utils"
import { IUserInfo, IChatItem, IUICaptionData } from "@/types"

const SENTENCES = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.",
  "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.",
  "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.",
  "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
  "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
]

const _genRandomBoolean = (): boolean => {
  return !!(Math.random() > 0.5)
}

export const genRandomParagraph = (num: number = 0): string => {
  let paragraph = ""
  for (let i = 0; i < num; i++) {
    const randomIndex = Math.floor(Math.random() * SENTENCES.length)
    paragraph += SENTENCES[randomIndex] + " "
  }

  return paragraph.trim()
}

export const genRandomUserList = (num: number = 0): IUserInfo[] => {
  const userList: IUserInfo[] = []
  for (let i = 0; i < num; i++) {
    userList.push({
      userId: genRandomUserId(),
      userName: `user-${i}`,
    })
  }

  return userList
}

export const MOCK_CHAT_LIST: IChatItem[] = Array.from({ length: 30 }, (_, i) => ({
  userName: "asdasd",
  content: `违反破解复赛劳务费和沙发和覅打发阿SVAVAV的飞书飞书时间的覅暗示法is哎烦as疯狂加暗示法内容${i}`,
  time: `16:04`,
}))

export const MOCK_CAPTION_LIST: IUICaptionData[] = Array.from({ length: 10 }).map((_, index) => ({
  content: genRandomParagraph(2),
  translate: genRandomParagraph(2),
  userName: `username ${index}`,
}))
