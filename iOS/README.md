# Agora Real-Time Transcription (RTT) Demo

## Quick Start

### Step 00: Enable the Real-Time Transcription (RTT) feature

Enable RESTful API and Real-Time Transcription (RTT) in console at first.

### Step 01: Install required frame work by cocoapods

```Shell
$ pod install
```

### Step 02: Modify AppConfig.swift

把以下参数改成您的项目的内容。

```Swift
// default agora setting strings
private let DefaultAgoraAppId: String           = <#Agora App Id#> 				// Agora App Id
private let DefaultAgoraBasicAuthKey: String    = <#Agora Basic Auth Key#> 		// Agora Basic Auth Key (for RESFful API, if need)
private let DefaultAgoraBasicAuthSecret: String = <#Agora Basic Auth Secret#> 	// Agora Basic Auth Secret (for RESFful API, if need)

// default STT config
private let ProductSTTBaseUrl: String   = <#Product API Base URL#>				// https://api.agora.io
private let DefaultSTTAppId: String     = <#Same as Agora App Id#>				// Same as Agora App Id
```

### Step 04: Change the Signing in target

### Step 03: Run the project

---

## Source Code

### How to start RTT task from App

You can read the code start from  
***ChatRoomViewController.swift***, line 264 (on 2024.07.02)

```Swift
@IBAction private func onSTTButtonClicked(_ sender: UIButton) {
    ...
}
```

### How to receive the transcription data

You can read the code start from  
***AgoraManager.swift***, line 296 (on 2024.07.02)

```Swift
func rtcEngine(_ engine: AgoraRtcEngineKit, 
			   receiveStreamMessageFromUid uid: UInt, 
			   streamId: Int, 
			   data: Data) {
    STTManager.shared.parseDataToText(data: data) { [weak self] success, subtitle in
        guard success, let st = subtitle, let mgr = self else {
            return
        }
        mgr.delegate?.agoraManager?(mgr, receiveSubtitle: st)
    }
    return
}
```

EOF
