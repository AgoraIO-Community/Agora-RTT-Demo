package io.agora.sttdemo;

import android.content.Context;
import android.text.TextUtils;
import android.util.Log;

import java.util.Arrays;

import io.agora.rtc2.ChannelMediaOptions;
import io.agora.rtc2.Constants;
import io.agora.rtc2.IRtcEngineEventHandler;
import io.agora.rtc2.RtcEngine;


public class RtcManager {
    private static final String TAG = "RtcManager";
    private volatile boolean isInitialized = false;
    private RtcEngine engine;
    private OnChannelListener publishChannelListener;
    private String publishChannelId;

    public void init(Context context,
                     String appId,
                     boolean isHwAEC,
                     boolean isSwAEC,
                     boolean isAGC,
                     boolean isANC,
                     OnInitializeListener listener) {
        if (isInitialized) {
            return;
        }
        try {
            // 0. create engine
            engine = RtcEngine.create(context.getApplicationContext(), appId, new IRtcEngineEventHandler() {
                @Override
                public void onWarning(int warn) {
                    super.onWarning(warn);
                    Log.w(TAG, String.format("onWarning code %d message %s", warn, RtcEngine.getErrorDescription(warn)));
                }

                @Override
                public void onError(int err) {
                    super.onError(err);
                    Log.e(TAG, String.format("onError code %d", err));
                    if (listener != null) {
                        String msg = "";
                        if (err == 1027) {
                            // 没有录音权限
                            msg = "No audio record permission";
                        } else if (err == ErrorCode.ERR_INVALID_TOKEN) {
                            msg = "invalid token";
                        }
                        listener.onError(err, msg);
                    }
                }

                @Override
                public void onJoinChannelSuccess(String channel, int uid, int elapsed) {
                    super.onJoinChannelSuccess(channel, uid, elapsed);
                    if (publishChannelId.equals(channel)) {
                        if (publishChannelListener != null) {
                            publishChannelListener.onJoinSuccess(uid);
                        }
                    }
                }

                @Override
                public void onUserJoined(int uid, int elapsed) {
                    super.onUserJoined(uid, elapsed);
                    if (publishChannelListener != null) {
                        publishChannelListener.onUserJoined(publishChannelId, uid);
                    }
                }

                @Override
                public void onUserOffline(int uid, int reason) {
                    super.onUserOffline(uid, reason);
                    if (publishChannelListener != null) {
                        publishChannelListener.onUserOffline(publishChannelId, uid);
                    }
                }

                @Override
                public void onRtcStats(RtcStats stats) {
                    super.onRtcStats(stats);
                }

                @Override
                public void onLastmileProbeResult(LastmileProbeResult result) {
                    super.onLastmileProbeResult(result);

                }

                @Override
                public void onRemoteVideoStats(RemoteVideoStats stats) {
                    super.onRemoteVideoStats(stats);
                }

                @Override
                public void onStreamMessage(int uid, int streamId, byte[] data) {
                    super.onStreamMessage(uid, streamId, data);
                    Log.d(TAG, "onStreamMessage uid=" + uid + ",streamId=" + streamId + ",data=" + Arrays.toString(data));
                    if (publishChannelListener != null) {
                        publishChannelListener.onStreamMessage(uid, streamId, data);
                    }
                }

                @Override
                public void onStreamMessageError(int uid, int streamId, int error, int missed, int cached) {
                    super.onStreamMessageError(uid, streamId, error, missed, cached);
                    Log.e(TAG, "onStreamMessageError uid=" + uid + ",streamId=" + streamId + ",error=" + error + ",missed=" + missed + ",cached=" + cached);
                }

            });
            engine.disableVideo();
            engine.enableAudio();
            engine.setDefaultAudioRoutetoSpeakerphone(true);

            engine.setParameters("{\"rtc.audio.force_use_media_volume\":" + isHwAEC + "}"); // hardware AEC
            engine.setParameters("{\"rtc.audio.aec.enable\":" + isSwAEC + "}"); //sw AEC
            engine.setParameters("{\"rtc.audio.agc.enable\":" + isAGC + "}");   // agc
            engine.setParameters("{\"rtc.audio.ans.enable\":" + isANC + "}");   // ans
            // for XiaoTianCai Test
            engine.setParameters("{\"che.audio.custom_payload_type\":9}");      // audio encode G722

            isInitialized = true;
        } catch (Exception e) {
            if (listener != null) {
                listener.onError(-1, "RtcEngine create exception : " + e.toString());
            }
        }
    }

    public void joinChannel(String channelId, String uid, String token, boolean publish, OnChannelListener listener) {
        if (engine == null) {
            return;
        }
        int _uid = 0;
        if (!TextUtils.isEmpty(uid)) {
            try {
                _uid = Integer.parseInt(uid);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        ChannelMediaOptions options = new ChannelMediaOptions();
        //options. = publish;
        //options.publishLocalVideo = false;
        engine.setClientRole(publish ? Constants.CLIENT_ROLE_BROADCASTER : Constants.CLIENT_ROLE_AUDIENCE);

        publishChannelId = channelId;
        publishChannelListener = new OnChannelListener() {

            @Override
            public void onJoinSuccess(int uid) {
                if (listener != null) {
                    listener.onJoinSuccess(uid);
                }
            }

            @Override
            public void onUserJoined(String channelId, int uid) {
                if (listener != null) {
                    listener.onUserJoined(channelId, uid);
                }
            }

            @Override
            public void onUserOffline(String channelId, int uid) {
                if (listener != null) {
                    listener.onUserOffline(channelId, uid);
                }
            }

            @Override
            public void onStreamMessage(int uid, int streamId, byte[] data) {
                if (listener != null) {
                    listener.onStreamMessage(uid, streamId, data);
                }
            }
        };
        int ret = engine.joinChannel(token, channelId, _uid, options);
        Log.i(TAG, String.format("joinChannel channel %s ret %d", channelId, ret));
    }


    public void release() {
        publishChannelListener = null;
        if (engine != null) {
            RtcEngine.destroy();
            engine = null;
        }
        isInitialized = false;
    }

    public interface OnInitializeListener {
        void onError(int code, String message);
    }

    public interface OnChannelListener {

        void onJoinSuccess(int uid);

        void onUserJoined(String channelId, int uid);

        void onUserOffline(String channelId, int uid);

        void onStreamMessage(int uid, int streamId, byte[] data);
    }

}
