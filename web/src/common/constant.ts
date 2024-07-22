const MODE = import.meta.env.MODE

interface ISttLanguage {
  label: string
  code: string
}

export let LANGUAGE_LIST: ISttLanguage[] = []

if (MODE == "test") {
  LANGUAGE_LIST = [
    { label: "Chinese (Cantonese, Traditional)", code: "zh-HK" },
    { label: "Chinese (Mandarin, Simplified)", code: "zh-CN" },
    { label: "Chinese (Taiwanese Putonghua) ", code: "zh-TW" },
    { label: "English (US)", code: "en-US" },
    { label: "Japanese (Japan)", code: "ja-JP" },
    { label: "Spanish (Spain)", code: "es-ES" },
    { label: "Turkish (Turkey)", code: "tr-TR" },
    { label: "French", code: "fr-FR" },
    { label: "German", code: "de-DE" },
    { label: "Italian", code: "it-IT" },
  ].sort((a, b) => {
    return a.label.localeCompare(b.label)
  })
} else {
  LANGUAGE_LIST = [
    { label: "Kannada", code: "kn-IN" },
    { label: "Gujarati", code: "gu-IN" },
    { label: "Telugu", code: "te-IN" },
    { label: "Tamil", code: "ta-IN" },
    { label: "Bengali(IN)", code: "bn-IN" },
    { label: "Hebrew", code: "he-IL	" },
    { label: "Dutch", code: "nl-NL" },
    { label: "Filipino", code: "fil-PH" },
    { label: "Thai", code: "th-TH" },
    { label: "Vietnamese", code: "vi-VN" },
    { label: "Turkish", code: "tr-TR" },
    { label: "Russian", code: "ru-RU" },
    { label: "Malay", code: "ms-MY" },
    { label: "Persian", code: "fa-IR" },
    { label: "Chinese(HK)", code: "zh-HK" },
    { label: "Indonesian", code: "id-ID" },
    { label: "Arabic(JO)", code: "ar-JO" },
    { label: "Arabic(EG)", code: "ar-EG" },
    { label: "Arabic(SA)", code: "ar-SA" },
    { label: "Arabic(UAE)", code: "ar-AE" },
    { label: "Chinese(TW)", code: "zh-TW" },
    { label: "English(US) 	", code: "en-US" },
    { label: "Hindi", code: "hi-IN" },
    { label: "Korean", code: "ko-KR" },
    { label: "Japanese", code: "ja-JP" },
    { label: "German", code: "de-DE" },
    { label: "Spanish", code: "es-ES" },
    { label: "French", code: "fr-FR" },
    { label: "Italian", code: "it-IT" },
    { label: "Chinese", code: "zh-CN" },
    { label: "Portuguese", code: "pt-PT" },
  ].sort((a, b) => {
    return a.label.localeCompare(b.label)
  })
}

export const LANGUAGE_OPTIONS = LANGUAGE_LIST.map((item) => {
  return {
    value: item.code,
    label: item.label,
  }
})
export const TOAST_DURATION = 5
export const EXPERIENCE_DURATION = 10 * 60 * 1000 // ms

export const AI_PROMPT_OPTIONS = [
  {
    label: "Meeting",
    value: `You are an AI assistant that helps people find information.Please read below meeting transcription and summarize agenda, conclusion and action items. Please aim to retain the most important points and avoid unnecessary details or tangential points. Action items must can associate with agenda and please provdie assignee for each action item. If there is no conculsion, please response "no conclusion". :`,
  },
  {
    label: "Language Learning",
    value: `You are an assistant of label learning teacher. You need analyze a conversation of a lesson and provide students label skill level, like TOEFL score and IELTS score. In this conversation, Mantho is teacher, Washington and Saverio are student. Please summary what students interesting on. And provide suggestion for teacher for the content of next lesson.
The output result has 3 part, the first is course summary, the second is the course evaluation for every student, the 3rd is the suggestion for the teacher :
--------------------------------------------
Course summary:   <list the course summary>
--------------------------------------------
Student Name:<student name>
ESL Level:   <level number>
Conversation:<Good, Satisfactory, or Need Improvement>
Listening:   <Good, Satisfactory, or Need Improvement>
Pronuceation:<Good, Satisfactory, or Need Improvement>
Grammar: <Good, Satisfactory, or Need Improvement>
Reading: <Good, Satisfactory, or Need Improvement>
Student suggestion:  <suggetsion list>
--------------------------------------------
Teacher:
<suggetsion list to improve the teaching>`,
  },
]

export const AI_USER_CONTENT_OPTIONS = [
  {
    type: "Meeting",
    label: "Meeting: 90% Accuracy",
    value: `Jason: So what do you think you add to this Next? What are the features you add next to weight room 
Jason: if you were on board or you were an investor? I don't know if you are an investor.
Jason: What are you telling Benny? Hey. Dummy. You missed this, this, and this? 
Sunny: Well, look, I I I think the the opportunity here is when Zoom took off, you know, you know, during the pandemic and at the start, it was really low friction.
Sunny: What's happened is as it's, you know, kinda gone enterprise, it it has lost some of that low friction stuff. 
Sunny: And now there was reasons for it.
Sunny: People were showing up in random zooms and all that. 
Sunny: So I'd say Go back to low friction, Minnie. Keep the cost super low. 
Sunny: I really like this idea of shortening the meetings, and so take take you're you're already kinda doing that.
Sunny: And so and then integrating with the other tools. 
Sunny: I think that's the the the biggest biggest, you know, feature here is integrating into other you know, workflows that we have.
Jason: It can connect the API to if this then matters Zapier and you've got 
Vinny: Yeah. We did Zapier very soon as well. 
Jason: Tons of tons of interaction.
Vinny: By the way, it's free. So, like, we're not even charging for it right now. 
Vinny: It's free because, you know, we want the models to learn and train 
Vinny: so the more conversations we have, the better we're getting at at at doing this. So it's, you know 
Jason: The good news for building services like this, I remember there was a Sequoia company, that made video conferencing as a service.
Jason: And I think all like AWS and Google, they all provide some sort of Video relay as a service now. 
Vinny: Yeah. Yep. Yep. Yep.
Jason: Which one do you which ones have you tried or which one do you use? 
Jason: Any thoughts on the back end here and how effective that is for you. 
Vinny: I haven't been using those. Yeah. 
Jason: So did you you didn't have to write the video back end, though. Right? 
Vinny: No. No. No. No. we we use Agora. So I think we we use Agora on back end. 
Vinny: but we, you know, we, like, There there are a number of companies doing it, 
Vinny: and the Gore has been doing it for quite a while. And they're a public company and we've been working with, 
Vinny: you know, we we kind of used them, I guess, when Clubhouse is blowing up, and they were using Goran. We said, 
Vinny: okay. Well, we should try as well because they got some crazy amount of scale.
Vinny: And by the way, clubhouse went the same VC route as well. 
Vinny: They went to the VC's first. both the community and then it just blew up. And we we we started using Agora, 
Vinny: and the product has improved dramatically over the past 2 years.
Vinny: I mean, We, you know Of course. Product. 
Jason: Yeah. Of course. 
Vinny: Yeah. Yeah. 
Vinny: And the the the founder came from Webex, and the other founder, co founders, 
Vinny: like with, I think is a co founder of Zoom as well.
Vinny: So, you know, these guys understand their business and we're very, like, we're we're very happy to you know, use their platform.
Vinny: And it's going well. I mean, like, through the quality we so when we're running this stream at 6:40 by 360, we can jack it up to whatever. Right? 
Vinny: So Yep. It's pretty, it's pretty easy for us to go up. And because while it's free right now, this is live in production, by the way. 
Vinny: So it's just free.
Vinny: So we're running low risk because why should we pay you know, the high risk, you know, 
Vinny: we're not charging people. 
Vinny: We're still in product development phase. 
Vinny: But as the product improves and we get I think we're gonna we can go up to 4 k.
Vinny: So, you know, and so we that could be a an upgrade package. Right? 
Vinny: So you pay for Wakeroom. The AI is built in. You want 4 k. You pay a little bit more. 
Vinny: You want, integrations into certain, you know, into Salesforce as a a fee for that.
Vinny: So there's You could 
Jason: also have a, a third tab here, which is transcript. 
Jason: And you can annotate the transcript. So you could have another one, just the, you know, 
Jason: running transcript And you could annotate it.Highlights. At the end of the meeting, 
Vinny: at the end of the meeting, you're gonna get a a a meeting minutes of the entire meeting. 
Vinny: So it it get emailed to you and then you can forward it around or you can send the people in the company.
Vinny: So we do it when you're ready. 
Jason: Even here, when you have an insight or a catch up or an action item, tells you the time stamp of it. And so that is super helpful. 
Jason: If you wanted to jump to the time stamp, you could. Yeah. And 
Vinny: it's a range. Ends it's a range. Like, the last one you came through 10:36 to 10:38.
Vinny: So for the past 2 minutes, we'll be speaking about Agora's experience at Clubhouse and found this background. 
Vinny: Like, so it tells you the time, like, the it's not a single time stamp. It's the range of when the conversations happen.
Vinny: Yeah. It's great.`,
  },
  {
    type: "Meeting",
    label: "Meeting: Agora 95% Accuracy",
    value: `Jason: So what do you think you add to this next, What are the features you add next, The weight room.   
Jason: If you were on the board or you were an investor, I don't know if you are an investor, 
Jason: what are you telling Vinny Hey, dummy, you missed this, this and this .   
Sunny: Well, look, I think the opportunity here is when Zoom took off, you know, you know, during the pandemic and at the start , it was really low friction.   
Sunny: What's happened is as it's, you know, kind of gone enterprise, it has lost some of that low friction stuff.   
Sunny: And now there is reasons for it.   
Sunny: People were showing up in random zooms and all that.   
Sunny: So I'd say go back to low friction, Vinny, keep the cost super low.   
Sunny: I really like this idea of shortening the meetings , and so you're already kind of doing that.   
Sunny: And so, and then integrating with other tools.   
Sunny: I think that's the, the biggest, biggest, you know, feature here is integrating into other, you know, workflow API,   
Jason: connect the API to if this then that and Zapier and you've got   
Vinny: yeah, we do use Zapier very soon as well.   
Jason: Tons of tons of integration   
Vinny: by the way, it's free. So like we're not even charging for it right now.   
Vinny: It's free because we want the models to learn and train.   
Vinny: And so the more conversations we have, the better we're getting at doing this. So and you know,   
Jason: the good news for building services like this, I remember there was a Sequoia company, um, that made video conferencing as a service .   
Jason: And I think all like AWS and Google, they all provide some sort of video relay as a service now.   
Vinny: Yeah. Yep, yep, yep.   
Jason: Which one do you, which ones have you tried or which one do you use.   
Jason: Any thoughts on the back end here and how effective that is.   
Vinny: I haven't, I haven't used any of those. Yeah.   
Jason: So did you . You didn't have to write the video back end though, right.   
Vinny: No, no, no, no. We use Agora, so yeah, we use Agora on the back end.   
Vinny: Um, but we, you know , we like, there are a number of companies doing it 
Vinny: and Agora has been doing it for quite a while and they're public company and we've been working, 
Vinny: you know, we kind of use them I guess, when clubhouse is blowing up and they were using Agora and we said, 
Vinny: okay, well we should try it as well because they got some crazy amount of scale.   
Vinny: And by the way, clubhouse went the same route as well .   
Vinny: They went to the VCs first, both the community, and then it just blew up and we started using Agora.   
Vinny: And the product has improved dramatically over the past two years.   
Vinny: I mean, you know , Chorus product.   
Jason: Yeah. Adding features.   
Vinny: Yeah, yeah.   
Vinny: And the founder came from WebEx and the other founder co-founders.   
Vinny: Like I think it was a co-founder of Zoom as well.   
Vinny: So, um, you know, these guys understand their business and we're very, we're very happy to, you know, use their platform 
Vinny: and it's going well. I mean the quality we so we're running this stream at 640 by 360 we can jack it up to whatever. Right.   
Vinny: So, um, it's pretty, it's pretty easy for us to go up because while it's free right now, this is live in production, by the way.   
Vinny: So it's just free.   
Vinny: So we're running low res because why should we pay, you know, the high res.   
Vinny: We're not charging people.   
Vinny: We're still in product development phase.   
Vinny: But as the product improves and I think we're going to we can go up to 4K.   
Vinny: So, you know, so that could be an upgrade package, right.   
Vinny: So you pay for Weightroom The AI is built in, you want 4K, you pay a little bit more , 
Vinny: you want integrations into certain, you know, into Salesforce, There's a fee for that.   
Vinny: So there's ways you could   
Jason: also have a, um, a third tab here, which is transcript.   
Jason: And you can annotate the transcript so you can have another one, just the, you know, 
Jason: running transcript and you can annotate it highlights at the end of the meeting .   
Vinny: At the end of the meeting, you're going to get a meeting minutes of the entire meeting.   
Vinny: So you get emailed to you and then you can forward it around or you can send it to people in the company.   
Vinny: So we do that already.   
Jason: Even here , when you have an insight or a catch up or an action item, it tells you the timestamp of it. And so that is super helpful.   
Jason: If you want it to jump to the timestamp, you could and   
Vinny: that's a range and it's at range like the last one you just came through at 1036 to 1038.   
Vinny: So for the past two minutes we've been speaking about Agora's experience at clubhouse and founders background 
Vinny: like so you know, it tells you the time like it's not a single timestamp, it's the range of when the conversation is happening.   
Jason：Yeah, that's great.`,
  },
  {
    type: "Language Learning",
    label: "Language Learning: 90% Accuracy",
    value: `Mantho: Hello? 
Washington: Hello, Egyptian.
Mantho: Just give me a second to admit this person.
Mantho: Wait. My camera is not on. Hello? 
Washington: Hello? 
Mantho: How are you? 
Washington: I'm pretty well.
Mantho: Oh, you type. Hey, Sarvario. We can hear you. You want me to hear me.
Saverio: Hi, everyone. You can hear me.
Washington: Yes. I agree to you.
Mantho: So it's Washington? 
Washington: Yes. My name is Larson.
Mantho: Okay. Mikaela Manto, whichever 1 you're comfortable with.I'm not sure how to say your name. Is it Saverio? Yeah, 
Saverio: it's pretty correct. Okay.
Mantho: Thank you. Okay? Where are you from? 
Saverio: Italy, the north of Italy.
Mantho: Is it an Italian name? 
Saverio: Yeah. Yeah. It's an Italian name. Yeah.
Mantho: And question, what about you guys? 
Saverio: I can't hear you. Your volume is too low too low.
Washington: It's it's it's it's seems like your microphone get lost this sound, and And, yeah.
Once they can.
Washington: Problem with your microphone, I don't know. 2 2.
Mantho: Okay, Just give me 1 second.
Saverio: Okay.
Mantho: What about now? Is it better? 
Saverio: Yeah.
Washington: It's better. It's better.
Mantho: Okay. Alright. Thank you. I'm sorry about that. 
Mantho: What was I even saying? So, yes, I'm Mikaela from South Africa, and I live in the capital city of South Africa. Called Pretoria.
Mantho: So I don't know if you know this, but South Africa has 3 capital cities, so I live in 1 of them. And it's nice to meet you guys.
Mantho: How What do you, what do you guys do, and why the group lessons? 
Washington: I'm sorry. Can can you repeat?

Mantho: You couldn't hear me.
Washington: It's too loud or to to to 
Mantho: I'm gonna try with the earphones.
Saverio:Okay.
Washington: Yes. It's okay now.
Mantho: It's okay. You're saying it's okay? 
Saverio: Yeah. Yeah.
Washington: Yes.
Mantho: Okay. Alright. Alright. Hopefully, it will stay like this.
Mantho: 1 was I saying, oh, I was just asking you why what do you do and why are you why did you choose to do the group lessons? 
Mantho: Also, by the way, before you answer me, let me know if I'm speaking too fast or too slow.
Okay.
Washington: Can I first 
Mantho: Yes? 
Washington: that's My name is Oshna. I'm from Brazil.  I I work as a software developer here, and I study English to improve. And and have to have better opportunities.
Mantho: Alright. Alright. And what about Gisavirio? 
Saverio: Yeah, I'm still English for a long time, I'm trying to improve my speaking skills. I work as ERP consultant, the software.
Mantho: As a as a what? 
Saverio: ERP, enterprises who's planning is software. For company.
Mantho: Okay. Alright.
Saverio: And I'm with why maybe the certification at the end of the year, so I'm taking some class on briefly online lesson, 1 to 1 and I want to add up something more like classes.
Saverio: And your speed is okay for me? 
Mantho: Okay. All right. That's good. That's good to hear.
Mantho: And you said for a long time, how long is for a long time? How long have you been? 
Saverio: Okay. Yeah. I studied at university also. I studied in 1 to 1. School also. So many years maybe.
Mhmm.
Mantho: Okay, all right. And what about you, Washington? How long have you been studying English? 
Washington: I have been studying English for 2 years roughly.
Mhmm.
Mantho: Okay. And how has that been? How is the genio studying English been for you?
Washington: Sorry, Gigi.
Mantho: How has the journey of studying English been? Has it been fine? Has it been difficult? 
Washington: In the back in the back end is is is so difficult, but but now I I am making little corrections Mhmm.
Hello?
Washington: My my words like to pronounce the they correct things of the real world thing.
Washington: So it's for forget or get a preposition and this little troubles.
Mantho: Okay. All right. And this 2 years, has it been on online lesson or has it been somewhere else?

Washington: Has it has on open English, a website, open English, After that, only in online lesson and YouTube.
Mhmm.
Mantho: Not YouTube as well.
Washington: You too. Yes.
Mantho: So how on YouTube? Are you watching English videos or videos that are in English?
Washington: I watch English videos because 
I We use 
Mantho: that I'm in English.
Washington: Yes. Because it is I am more easy to understand. And I used to was to be was not I used to watch movies and series English with a subtitle in English too.
Mantho: And why did you stop? 
Washington: Oh, I'm sorry? 
Mantho: Why did you stop? Because it sounds like you stopped. Are you still watching the English series? 
Washington: I still watch series and movies.
Mantho: Okay. Okay. Alright. Alright. 
Mantho: Alright. And what about your scenario? What do you do outside of the English lessons to to improve your English? 
Saverio: I'm doing a lot of things. I studied grammar by my side. I'm reviewing the grammar and go through some, yeah, some case, 
Saverio: some exercise, you have a lot of work. And also as as Washington, I watch movie every day. hmm. Mhmm. And also listening in podcast 
Saverio: and was so watching news like BDC, NBS, so a lot of things. Yeah.
Mantho: Okay. Alright. That is that is definitely a good way of learning the label and improving the label.
Mantho: I want to try out something. So since you guys are both on the journey of learning English, How about you exchange ideas?
Mantho: How about you talk about tell each other what has worked for you, what has been difficult for you in your English journey, 
Mantho: and what what tips and ideas do you have for any image.

Saverio: What's the first? 
Washington: Can I repeat, please? 
Mantho: Okay. So I'm sayin, am I am I speaking to Pans? 
Washington: For me, little 
-- Mhmm.
Washington: only for me.
Mantho: Okay. Alright. So I'm saying that since the both of you, you and Sabarito are on the journey of learning English, 
Mantho: how about you exchange ideas on what works, what has helped you learn English and what has been difficult for you
Mantho: and if you are able to deal with it, deal with the difficult of learning English, what is difficult in English, what works, and what are some tips and ideas for learning English.
Washington: Okay. So when I when III have a book in English, it's easy to understand. Mhmm. For for me, it's a difficult to understand 
Washington: sometimes what what I am talking to other people English. I frequently I forget some words that's necessary in the conversation.
Washington: And this is when I it's specific, it's is more difficult for me when I speak. Because I don't know if if maybe I I have to to to help many words in my vocabulary -- Mhmm. -- to turn this way more -- 
Mantho: No wrong.
-- busy.
Mantho: To improve yourself? 
Washington: To improve? Yes.
Mhmm.
Mantho: And so, William, do you have any tips for him? Do you have any tips on how he can improve? Or any book you can suggest, Devin, the drum book that you 
Saverio: have any You have to remember book, yes. Standard 1 is a family to our organization. And for I'm gonna say I'm gonna say page 
Saverio: on the same page of Washington because I think the grammar is not so difficult and what I find most useful is also watching news 
Saverio: but also read this small book is cambridge with the level of the level for your, it's a small story and it's very symbol for adding some vocabulary.
Saverio: And I think also the most difficult to 1 is Maybe you understand and you know 5000 word on the vocabulary, but when you have to speak 
Saverio: to choose the right 1, to pick the right 1 in the right moment and in the time is most difficult things 
Saverio: because maybe we're a little anxious maybe and so the most difficult 1 is speaking 
Saverio: speaking with the wild world and to try to express what you really think.
Mantho: That is true. Did you understand Washington? 
Washington: Yes. Yes. Can you type the title of this book for me in the chat? 
Saverio: Oh, okay.
Washington: Okay. I will.
Saverio: Yeah. It's it's not it's this 1, but it's 
Saverio: Yeah. It's a series of book you can find on Amazon. It's As more story, you can find on Amazon 
and you can write Cambridge story and you can buy not this 1 but the level you need 
Saverio: And this is more because it's 90 page, but it's clear, it's very simple, it's very clear.
And also you can read the guardian maybe but it's too difficult or financial time.
Mantho: The guardian, you mean the newspaper.
Saverio: Yeah. Yeah. The Guardian newspaper or financial time, yeah, but it's more complicated.
Saverio: I think this small book you can find on Amazon is or maybe something guys, I don't know, is, yeah, is useful.
Mantho: Mhmm. Washington, do you do you read news? News, articles.
Washington: Sometimes I used to learn learn and read information about my career. That is IT -- Mhmm. -- and watch many videos in YouTube. But news is is 
Mantho: Not so much.
Washington: Not so much. Yes.
Mantho: This is actually interesting. Sararia, you're also in tech? 
Saverio: Yeah. I'm but I'm not a developer software developer. I'm consultant. Yes.
Mantho: Oh, you're at a Consult.
Saverio: Yeah. I'm the person that is responsible to maintain the relationship with with customer and make analysis training and so, yeah, yeah, 
Saverio: we are the same sector maybe. Yeah, but I don't read technical thing for work in English.
Mantho: Okay. And how long how long the both of you, how long have you been in tech? So where you are? Did you start in consulting and just that in tech? 
Saverio: I study business business you have a master degree in business administration.
Saverio: I'm only 2 years, 3 years that I'm in consulting. Not so much.
Mantho: Before we go on, what did you say you are in which department? The IT department? 
Mantho: Which consulting department? Which consulting department are you?
Saverio: I am in a smaller firm that we don't have department By my side.
Mantho: Alright. Alright. And what about you, Washington? How long have you been in the tech industry? 
Washington: I have been and working. As a a sort of develop before 13 30 years.
Mantho: 13 1 3.
Washington: Before my last job. I work as a service desk. You know -- 
Mantho: Okay.
Mantho: Yes. Yes. I think I know, you know, we can't you ask for questions, ask questions, and you answer the phones and all of that.
Washington: Yes. I have the work age in this area for 6 years. After that, I I start to program in coding.
Mantho: So did you go to a coding school or a tech tech school? Are you self taught? 
Washington: U u university.
Mantho: Oh, you went to university? 
Washington: Yes. I have a degree in computer science? 
Mantho: Okay. Alright.`,
  },
  {
    type: "Language Learning",
    label: "Language Learning: Agora 95% Accuracy",
    value: `Mantho: Hello.
Washington: Hello, Jackson .
Mantho: Just give me a second. Let me just find.
Mantho: My camera is not on. Hello.
Washington: Hello.
Mantho: How are you.
Washington: I'm pretty well .
Mantho: Your type. Hey, Salvario. We can hear you. You are muted.
Saverio: Hi, everyone. You can hear me .
Washington: Yes, I can hear you.
Mantho: So it's Washington.
Washington: Yes. My name is Washington.
Mantho:  Okay. Michela Amanto. Whichever one you are comfortable with. Um. I'm not sure how to say your name . Is it Saverio.
Saverio: Yeah, it's pretty correct. OKay. 
Mantho: Okay. Thank you. Okay. Where are you from.
Saverio: Uh, Italy. The north of Italy.
Mantho: Is there an Italian name .
Saverio: Yeah. Yeah, it's an Italian name. Yeah.
Mantho: What about you.
Saverio: I can't hear you. Uh , your volume is too low. Too low.
Washington: It's. It's since, like, your microphone .Get lost.The sound and and, uh, problem with your microphone .I don't know.
Mantho: Okay, just give me one second.
Saverio: Okay .
Mantho: What about now , Is it better.
Saverio: Yeah, 
Washington: better. Better.
Mantho: Okay. Thank you. Sorry about that. Uh,
Mantho: what was I even saying. So, yes, I'm Michela from South Africa, and I live in the capital city of South Africa called Pretoria.
Mantho: So I don't know if you know this, but South Africa has three capital cities. So I live in one of them. And . And it's nice to meet you guys.
Mantho: Um, how what do you what do you guys do and why The group lessons 
Washington: are unsolved. Can you repeat.
Mantho: You couldn't hear me .
Washington: It's too loud. Or too, too, too .
Yeah .
Mantho: I'm gonna try with the earphones.
Saverio: Okay.
Washington: Yes. It's okay now.
Mantho: It's okay. You saying it's okay .
Saverio: Yeah. Yeah.
Washington: Yes.
Mantho: Okay. All right. All right. Hopefully it will stay like this.
Mantho: Um, what was I saying. Oh, I was just asking you why. What do you do And why are you. Why did you choose to do the group lessons 
Mantho: Also, by the way, before you answer me , let me know if I'm speaking too fast or too slow.
Washington: Uh, can I first.
Washington: That's my name is also from Brazil. I, I work as a software developer here. And I study English to improve and, and, uh, have to have a better opportunity .
Mantho: Um. All right. All right. And what about you, Saverio.
Saverio: Uh, yeah, I'm studying English. Uh, for a long time. I'm trying to improve my speaking skills. Uh, I work as an ERP consultant . The software.
Mantho: And as a what.
Saverio: ERP Enterprise Resource planning is a software for company.
Mantho: Okay. All right.
Saverio: And I will try maybe the certification at the end of the year. &So I'm taking some classes on briefly online lesson 1 to 1 and I want to adopt something more like group classes.
Saverio: Okay. And you are. Speed is okay for me.
Mantho: Okay. All right. That's good. That's good to hear.
Mantho: Um, and you said for a long time .How long is for a long time. How long have you been 
Saverio: all right. I studied in university also, I study in a 1 to 1 school. Also so many years. Maybe .
Mantho: Okay. All right. And what about you, Washington. How long have you been, um, studying English.
Washington: Uh , I have been studying English for two years. Roughly.
Mantho: Okay . And how has that been, How is the journey of studying English been for you.
Sorry.
Mantho: How has the journey of studying English been. Has it been fine. Has it been difficult.
Washington: Uh, in the. In the beginning. Is, uh . Is so difficult. But. But now I. I, uh. I am, uh , making a little corrections 
Washington: in my, uh, my words like, uh , to pronounce the, the correct things of the words.
Washington: And so and forget , forget preposition and this little troubles.
Mantho: Okay. All right. And this two years, has it been on online lesson. Or has it been somewhere else.
Washington: Uh, has it has, um , on open English, a website, open English. And after that, uh, only in online lesson. And YouTube.
Mantho: YouTube as well.
Washington: YouTube, Yes.
Mantho: So how on YouTube are you watching English videos or videos that are in English.
Washington: I watch English videos because 
Mantho: that are in English .
Washington: Yes, because it is more easy to understand. And I was to was to be was I used to watch movies and series in English with subtitles in English, too.
Mantho: Uh, and why did you stop.
Washington: Oh, I'm sorry.
Mantho: Why did you stop. Because it sounds like you stopped. Are you still watching the English series I.
Washington: I still watch series and movies.
Mantho: Okay. Okay. All right. All right.
Washington: Don't stop. 
Mantho: All right. And what about you, Saverio. What do you do outside of the English lessons to.To improve your English .
Saverio: Uh, I'm doing a lot of things. I study in grammar by myself. I'm reviewing the grammar and go through some, uh. Yeah, some .
Saverio: Some exercise. I have a lot of book.And also as a as watch. I watch movie every day and also listening podcast 
Saverio: and also watching news like BBC. And so a lot of things. Yeah.
Mantho: Okay. All right. All right. That is that is definitely a good way of learning the label and improving the label .
Mantho: Um, I want to try out something. So since you guys are both on the journey of learning English, how about you exchange ideas.
Mantho: How about you, Um, talk about. Tell each other what has worked for you. What has been difficult for you in your English journey 
Mantho: And what what tips and ideas do you have for learning English .
Saverio: Okay. What's the first , 
Washington: Uh, can you repeat, please.
Mantho: Okay, so I'm saying, am I. Am I speaking too fast .
Washington: Zero for me.
Mantho: Okay. All right, So, um, I'm saying that since . Since the both of you, um, you and Saverio are on the journey of learning English.
Mantho: Um, how about you exchange ideas on what works, What has helped you learn English and , um, what has been difficult for you.
Mantho: And if you are able to deal with it, deal with with the difficulty of learning English, what is difficult in English, what works, and what are some tips and ideas for learning English .
Washington: Okay. Uh, so, uh, when I, uh, when I have a book in English is easy to understand, is for me, is difficult to understand.
Washington: Something times what what I am talking to other people in English. I frequently I forget some words that's necessary in the conversation 
Washington: and is when I speak is is uh, more difficult for me when I speak because I don't know if, if maybe I have to, to, to, to have many words in my vocabulary to, to turn this way 
Mantho: around , to improve yourself.
Washington: Yes.
Mantho: Yes. And, Soraya, do you have any tips for him. Do you have any tips on how he can improve or any book you can suggest, even the grammar book that you are learning.
Saverio: Uh, grammar book. Yeah. So standard one is a famous one also.And uh, uh, for I to say yeah, I'm going to say page 
Saverio: on the same page of Washington because, uh, I think that the grammar is not so difficult. And what I find most useful is also watching news.
Saverio: Also read this small book is Cambridge with the level of the level for, for your, uh, is a small story and it's very simple for um, adding some vocabulary.
Saverio: And I think also the most difficult one is, uh, maybe you, you understand and, you know, 5000 words on the vocabulary, but when you have to speak, uh, 
Saverio: the to choose the right one to pick the right one in the right moment and in the time is the most difficult things 
Saverio: because maybe you are a little anxious. Maybe so the most difficult one is speaking, 
Saverio: speaking with the right word and to try to express what what you want. You really think 
Mantho: that is true. That is true. Did you understand Washington .
Washington: Yes. Uh, can you, uh, uh, type the title of this book for me in the chat.
Saverio: Uh, okay.
Washington: Okay, I will.
Saverio: Yeah, it's. It's, uh.
Saverio: It's this one, but it's a slider.
Saverio: Yeah, it's a series of book you can find on Amazon is a small story you can find on Amazon, 
Saverio: and you can write Cambridge . Uh, story. And you can buy not this one, but the level you need.
Saverio: And this is small because is 90 page and, but it's clear, it's very, it's very simple. It's very clear.
Saverio: And also you can read the Guardian maybe , but it's too difficult. Or financial 
Mantho: guardian. You mean the newspaper.
Saverio: Yeah, yeah. The Guardian newspaper or Financial Times. Yeah, but it's more complicated.
Saverio: I think this small book you can find in, uh, on Amazon is, uh. Or maybe something else.I don't , I don't know. Uh, is. Yeah. Is useful.
Mantho: Um, Washington Do you, do you read the news news articles.
Washington: Sometimes I used to be, uh, learn, uh , learn, read, uh, information about my career. 
Washington: That. Is it an and watching many videos in YouTube, but, uh, news, um , it's 
Mantho: not so much.
Washington: Not so much. Yes.
Mantho: Uh, this is actually interesting.So you're also in tech.
Saverio: Yeah , I'm. But I'm on the developer. Software developer. I'm a consultant, Yes.
Mantho: Oh, you are.
So.
Saverio: Yeah, I'm the person that is responsible to maintain the relationship with the client, with customer and make analysis training.And so, yeah , yeah, 
Saverio: we are the same sector. Maybe. Uh, yeah, but don't read technical thing for, for work in English .
Mantho: Okay. And how long, How long the both of you, how long have you been in tech. Um, Savaria, did you start in consulting and or did you start in tech.
Saverio: I study business. Business. I have a master's degree in business administration.
Saverio: Uh, I'm only two years. Three years that I'm in consulting. Not so much .
Mantho: Oh, before we go on. What. What did you say you are In which department. The IT department.
Mantho: Which consulting department. Which consulting department.
Saverio: Yeah. I am in a small firm that we don't have department. Department by myself.
Mantho: All right, all right. And what about you, Washington. How long have you been in the tech industry 
Washington: And I have been, uh , working as a software developer for, uh , I think, uh, 13, 13 years.
Mantho: 13 one three, 
Washington: uh, before my last job. I work as a service desk, you know.
Mantho: Okay .
Mantho: Yes, yes, I think I know. You know, we can't see you ask for questions, ask questions, and you answer the phones and all of that.
Washington: Yes . I have been working in this area for six years, and I started to, uh, programming. Coding.
Mantho: So did you go to a coding school or a tech tech school or are you self-taught, 
Washington: Uh, you in university 
Mantho: or you went to university.
Washington: Yes , I have a degree in computer science.
Mantho: Okay. All right. All right.`,
  },
]

export const AI_PROMPT_PLACEHOLDER =
  "You are an assistant of label learning teacher. You need analyze a conversation of a lesson and provide students label skill level, like TOEFL score and IELTS score. In this conversation, Mantho is teacher, Washington and Saverio are student. Please summary what students interesting on. And provide suggestion for teacher for the content of next lesson."

export const AI_RESULT_PLACEHOLDER =
  "Agenda: 1. Discuss the features to add to the product. 2. Explore the importance of low friction and shortening meetings. 3. Consider integrating with other tools and workflows. 4. Discuss the use of video relay services and the effectiveness of the backend. 5. Talk about the possibility of adding transcript and annotation features. 6. "

export const CAPTION_SCROLL_PX_LIST = [
  {
    distance: 0,
    value: 2,
  },
  {
    distance: 50,
    value: 4,
  },
  {
    distance: 100,
    value: 6,
  },
  {
    distance: 150,
    value: 10,
  },
]

export const GITHUB_URL = "https://github.com/AgoraIO-Community/Agora-RTT-Demo/tree/main/web"
