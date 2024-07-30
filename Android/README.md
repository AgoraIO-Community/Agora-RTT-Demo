# Agora Real-Time Transcription (RTT) Demo

## Quick Start

### Step 00: Enable the Real-Time Transcription (RTT) feature

Enable RESTful API and Real-Time Transcription (RTT) in console at first.

### Step 01: Modify the config

Update the ***string_config.xml***, fill your agora app id.

```XML
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="agora_app_id" translatable="false">{your agora app id}</string>
    <string name="agora_token" translatable="false"></string>
    <string name="stt_gateway_address" translatable="false">https://api.agora.io</string>
    <string name="agora_app_key" translatable="false"></string>
    <string name="agora_app_secret" translatable="false"></string>

    <string name="enable_cloud_storage" translatable="false">false</string>
    <string name="cloud_storage_access_key" translatable="false"></string>
    <string name="cloud_storage_secret_key" translatable="false"></string>
    <string name="cloud_storage_region" translatable="false"></string>
    <string name="cloud_storage_vendor" translatable="false"></string>
</resources>
```

Update ***STTManager.java*** line 76
Fill you baisc token for Agora RESTful API

```Java
String basicAuth = "Basic { TODO: Basic token }";
```

### Step 03: Run the demo

---

## Source Code

### How to start RTT task from App

You can read the code start from  
***MainActivity.java***, line 206 (on 2024.07.02)

```Java
private void startSTT() {
	...
}
```

### How to receive the transcription data

You can read the code start from  
***RtcManager.java***, line 99 (on 2024.07.02)

```Java
@Override
public void onStreamMessage(int uid, int streamId, byte[] data) {
    super.onStreamMessage(uid, streamId, data);
    if (publishChannelListener != null) {
        publishChannelListener.onStreamMessage(uid, streamId, data);
    }
}
```

EOF
