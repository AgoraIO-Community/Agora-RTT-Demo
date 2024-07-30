package io.agora.sttdemo;

import android.util.Log;

import androidx.annotation.NonNull;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.lang.ref.WeakReference;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Arrays;

import io.agora.rtc.speech2text.AgoraSpeech2TextProtobuffer;
import io.agora.sttdemo.utils.Base64Util;
import io.agora.sttdemo.utils.HttpHeaderInterceptor;
import io.agora.sttdemo.utils.LogUtil;
import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;
import okhttp3.ResponseBody;
import okhttp3.logging.HttpLoggingInterceptor;

public class STTManager {
    private static final String TAG = "RestfulManager";
    private static final MediaType JSON = MediaType.parse("application/json; charset=utf-8");
    private static final SimpleDateFormat simpleDateFormat = new SimpleDateFormat("HH:mm:ss", Locale.US);

    private volatile static STTManager Instance;
    private OkHttpClient mOkHttpClient;
    private String baseUrl;
    private final Map<String, TokenInfo> channelTokenInfoMap = new HashMap<>();
    private final Map<String, TaskInfo> channelTaskInfoMap = new HashMap<>();
    private final Map<String, Map<String, OnTextUpdateListener>> textUpdateListenerMap = new HashMap<>();
    private final Map<String, List<String>> finalWordsMap = new HashMap<>();
    private final Map<String, Integer> lastTextSeqNumMap = new HashMap<>();
    private WeakReference<RequestCallback<ErrorInfo>> errorHandler;
    private String cloudStorageJson;

    List<String> transcriptionLanguages;
    Map<String, List<String>> translations;

    private STTManager() {
        LogUtil.openTagFileWriter("STTManager");
    }

    public static STTManager getInstance() {
        if (Instance == null) {
            synchronized (STTManager.class) {
                if (Instance == null) {
                    Instance = new STTManager();
                }
            }
        }
        return Instance;
    }

    public void init(String address, String appId, final String appKey, String appSecret, WeakReference<RequestCallback<ErrorInfo>> errorHandler) {
        this.errorHandler = errorHandler;
        baseUrl = String.format(Locale.US, "%s/v1/projects/%s/rtsc/speech-to-text", address, appId);
        Log.i("STT", "init OkHttpClient");
        if (mOkHttpClient == null) {
            String plainCredentials = appKey + ":" + appSecret;
            String basicAuth = "Basic { TODO: Basic token }";
            mOkHttpClient = new OkHttpClient.Builder()
                    .addInterceptor(new HttpLoggingInterceptor(new HttpLoggingInterceptor.Logger() {
                        @Override
                        public void log(@NonNull String s) {
                            Log.d(TAG, "network request >> " + s);
                            LogUtil.d("STTManager", "network request >> " + s);
                        }
                    }).setLevel(HttpLoggingInterceptor.Level.BODY))
                    .addInterceptor(new HttpHeaderInterceptor(basicAuth))
                    .build();
        }
    }

    public void release(){
        channelTokenInfoMap.clear();
        channelTaskInfoMap.clear();
        textUpdateListenerMap.clear();
        finalWordsMap.clear();
        lastTextSeqNumMap.clear();
    }

    public void setCloudStorage(String cloudStorageKey, String cloudStorageSecret, String vendor, String region, String[] keys)
    {
        String prefix = "";
        for(int i=0;i< keys.length;i++)
        {
            prefix += keys[i];
            if(i<keys.length-1) prefix+=",";
        }
        cloudStorageJson = ",\"cloudStorage\": [\n" +
                "         {\n" +
                "           \"format\": \"HLS\",\n" +
                "           \"storageConfig\":{\n" +
                "             \"accessKey\": \""+cloudStorageKey+"\",\n" +
                "             \"secretKey\": \""+cloudStorageSecret+"\",\n" +
                "             \"bucket\": \"\",\n" +
                "             \"vendor\": "+vendor+",\n" +
                "             \"region\": "+region+",\n" +
                "             \"fileNamePrefix\": [" + prefix + "]\n" +
                "          }\n" +
                "        }\n" +
                "       ]";
    }

    public void acquireToken(String channel, RequestCallback<TokenInfo> complete) {
        if (mOkHttpClient == null) return;
        TokenInfo tokenInfo = channelTokenInfoMap.get(channel);
        if (tokenInfo != null && System.currentTimeMillis() / 1000 < tokenInfo.expireTimeTs) {
            if (complete != null) {
                complete.onResult(tokenInfo);
            }
            return;
        }
        String url = baseUrl + "/builderTokens";

        String bodyString = "{";
        bodyString += "\"instanceId\":\"" + channel + "\"";
        bodyString += "}";

        Log.i("STT", "acquireToken : "+ bodyString);

        mOkHttpClient.newCall(new Request.Builder()
                .url(url)
                .post(RequestBody.create(JSON, bodyString))
                .build())
                .enqueue(new Callback() {
                    @Override
                    public void onFailure(@NonNull Call call, @NonNull IOException e) {
                        notifyErrorHandler(new ErrorInfo("acquireToken", "-1", "acquireToken onFailure >> " + e.getMessage()));
                    }

                    @Override
                    public void onResponse(@NonNull Call call, @NonNull Response response) throws IOException {
                        ResponseBody body = response.body();
                        if (response.isSuccessful() && body != null) {
                            String respBody = body.string();
                            Log.i("STT", "acquireToken response: "+ respBody);
                            try {
                                JSONObject jsonObject = new JSONObject(respBody);
                                TokenInfo ti = new TokenInfo();
                                ti.tokenName = jsonObject.getString("tokenName");
                                ti.expireTimeTs = jsonObject.getLong("createTs") + 5 * 60;
                                channelTokenInfoMap.put(channel, ti);
                                Log.i("STT", "acquireToken: "+ ti.tokenName);
                                if (complete != null) {
                                    complete.onResult(ti);
                                }
                            } catch (JSONException e) {
                                notifyErrorHandler(new ErrorInfo("acquireToken", "-3", "acquireToken onResponse parse json failed >> " + e.getMessage()));
                            }

                        } else {
                            notifyErrorHandler(new ErrorInfo("acquireToken", "-2", "acquireToken onResponse failed >> code=" + response.code() + ",body=" + body));
                        }
                    }
                });
    }

    public void startTask(String channel, String[] sttLanguages,
                          String audioUid, String audioToken,
                          String streamUid, String streamToken,
                          String enableCloudStorage,
                          String localUid,
                          RequestCallback<TaskInfo> complete,
                          RequestCallback<ErrorInfo> error) {
        if (mOkHttpClient == null) return;
        this.transcriptionLanguages = Arrays.asList(sttLanguages);
        acquireToken(channel, data -> {
            //String channelType = "COMMUNICATION_TYPE";
            String channelType = "LIVE_TYPE";
            String url = baseUrl + "/tasks?builderToken=" + data.tokenName;
            String bodyString = "{";
            bodyString += "";
            bodyString += "\"languages\": ";
            JSONArray langArr = new JSONArray(Arrays.asList(sttLanguages));
            bodyString += langArr;
//            for (String lang : sttLanguages) {
//                bodyString += "\"" + lang + "\",";
//            }
            bodyString += ","; //sttConfig.transcriptions,
            bodyString += "\"maxIdleTime\": 60,";
            // rtc config
            bodyString += "\"rtcConfig\": {";
            bodyString += "\"channelName\":\"" + channel + "\","; //channel
            bodyString += "\"subBotUid\":\"" + audioUid + "\",";  //"1000",
            bodyString += "\"pubBotUid\":\"" + streamUid + "\","; //"2000"
            bodyString += "\"subscribeAudioUids\": [\"" + localUid + "\"]";
            bodyString += "}";
            // translate
            bodyString += ", \"translateConfig\": {";
            bodyString += "\"languages\": [";
            bodyString += "{\"source\": \"zh-CN\",";
            bodyString += "\"target\": [\"en-US\"]";
            bodyString += "}";
            bodyString += "]";
            bodyString += "}";
            bodyString += "}";
            Log.d(TAG, bodyString);

            mOkHttpClient.newCall(new Request.Builder()
                    .url(url)
                    .post(RequestBody.create(JSON, bodyString))
                    .build())
                    .enqueue(new Callback() {
                        @Override
                        public void onFailure(@NonNull Call call, @NonNull IOException e) {
                            ErrorInfo errorinfo = new ErrorInfo("startTask", "-1", "startTask onFailure >> " + e.getMessage());
                            if (error != null) {
                                error.onResult(errorinfo);
                            }
                            notifyErrorHandler(errorinfo);
                        }

                        @Override
                        public void onResponse(@NonNull Call call, @NonNull Response response) throws IOException {
                            ResponseBody body = response.body();
                            if (response.isSuccessful() && body != null) {
                                String respBody = body.string();
                                try {
                                    JSONObject jsonObject = new JSONObject(respBody);
                                    TaskInfo ti = new TaskInfo();
                                    ti.taskId = jsonObject.getString("taskId");
                                    ti.status = jsonObject.getString("status");
                                    ti.token = data.tokenName;
                                    channelTaskInfoMap.put(channel, ti);
                                    if (complete != null) {
                                        complete.onResult(ti);
                                    }
                                } catch (JSONException e) {
                                    ErrorInfo errorinfo = new ErrorInfo("startTask", "-3", "startTask onResponse parse json failed >> " + e.getMessage());
                                    if (error != null) {
                                        error.onResult(errorinfo);
                                    }
                                    notifyErrorHandler(errorinfo);
                                }

                            } else {
                                ErrorInfo errorinfo = new ErrorInfo("startTask", "-2", "startTask onResponse failed >> code=" + response.code() + ",body=" + body);
                                if (error != null) {
                                    error.onResult(errorinfo);
                                }
                                notifyErrorHandler(errorinfo);
                            }
                        }
                    });
        });
    }

    public void resetTask(String channel) {
        textUpdateListenerMap.remove(channel);
        finalWordsMap.remove(channel);
        lastTextSeqNumMap.remove(channel);
        stopTask(channel, null, null);
    }

    public void stopTask(String channel, RequestCallback<String> complete, RequestCallback<ErrorInfo> error) {
        TaskInfo taskInfo = channelTaskInfoMap.get(channel);
        if (taskInfo == null) {
            return;
        }
        String taskId = taskInfo.taskId;
        String url = baseUrl + "/tasks/" + taskId + "?builderToken=" + taskInfo.token;

        mOkHttpClient.newCall(new Request.Builder()
                .url(url)
                .delete()
                .addHeader("Content-Type", "Application/json")
                .build())
                .enqueue(new Callback() {
                    @Override
                    public void onFailure(@NonNull Call call, @NonNull IOException e) {
                        ErrorInfo errorInfo = new ErrorInfo("stopTask", "-1", e.getMessage());
                        if (error != null) {
                            error.onResult(errorInfo);
                        }
                        notifyErrorHandler(errorInfo);
                    }

                    @Override
                    public void onResponse(@NonNull Call call, @NonNull Response response) throws IOException {
                        ResponseBody body = response.body();
                        if (response.isSuccessful()) {
                            channelTaskInfoMap.remove(channel);
                            if (complete != null) {
                                complete.onResult(channel);
                            }
                        } else {
                            ErrorInfo errorInfo = new ErrorInfo("stopTask", "-2", "stopTask onResponse failed >> code=" + response.code() + ",body=" + body);
                            if (error != null) {
                                error.onResult(errorInfo);
                            }
                            notifyErrorHandler(errorInfo);
                        }
                    }
                });
    }

    public void getTaskInfo(String channel, RequestCallback<TaskInfo> complete) {
        if (mOkHttpClient == null) return;
        TaskInfo taskInfo = channelTaskInfoMap.get(channel);
        if (taskInfo == null) return;
        String taskId = taskInfo.taskId;
        acquireToken(channel, data -> {
            String url = baseUrl + "/tasks/" + taskId + "?builderToken=" + data.tokenName;
            mOkHttpClient.newCall(new Request.Builder()
                    .url(url)
                    .addHeader("Content-Type", "Application/json")
                    .get()
                    .build())
                    .enqueue(new Callback() {
                        @Override
                        public void onFailure(@NonNull Call call, @NonNull IOException e) {
                            notifyErrorHandler(new ErrorInfo("getTaskInfo", "-1", "getTaskInfo onFailure >> " + e.getMessage()));
                        }

                        @Override
                        public void onResponse(@NonNull Call call, @NonNull Response response) throws IOException {
                            ResponseBody body = response.body();
                            if (response.isSuccessful() && body != null) {
                                String respBody = body.string();
                                try {
                                    JSONObject jsonObject = new JSONObject(respBody);
                                    TaskInfo ti = new TaskInfo();
                                    ti.taskId = jsonObject.getString("taskId");
                                    ti.status = jsonObject.getString("status");
                                    channelTaskInfoMap.put(channel, ti);
                                    if (complete != null) {
                                        complete.onResult(ti);
                                    }
                                } catch (JSONException e) {
                                    Log.e(TAG, "getTaskInfo onResponse parse json failed >> ", e);
                                    notifyErrorHandler(new ErrorInfo("getTaskInfo", "-3", "getTaskInfo onResponse parse json failed >> " + e.getMessage()));
                                }

                            } else {
                                notifyErrorHandler(new ErrorInfo("getTaskInfo", "-2", "getTaskInfo onResponse failed >> code=" + response.code() + ",body=" + body));
                            }
                        }
                    });
        });
    }

    public boolean isTaskStarted(String uid) {
        TaskInfo taskInfo = channelTaskInfoMap.get(uid);
        if (taskInfo == null) return false;
        return "STARTED".equals(taskInfo.status);
    }

    public void setTextUpdateListener(String channel, String uid, OnTextUpdateListener listener) {
        Map<String, OnTextUpdateListener> listenerMap = textUpdateListenerMap.get(channel);
        if (listenerMap == null) {
            listenerMap = new HashMap<>();
            textUpdateListenerMap.put(channel, listenerMap);
        }
        listenerMap.put(uid, listener);
    }

    public AgoraSpeech2TextProtobuffer.Text parseTextByte(String channel, byte[] data) {
        AgoraSpeech2TextProtobuffer.Text textStream;
        try {
            textStream = AgoraSpeech2TextProtobuffer.Text.parseFrom(data);
        } catch (Exception ex) {
            notifyErrorHandler(new ErrorInfo("parseTextByte", "-1", "parseTextByte parseFrom error >> " + ex.toString()));
            return null;
        }
        Integer lastTextSeqnum = lastTextSeqNumMap.get(channel);
        if(lastTextSeqnum == null){
            lastTextSeqnum = 0;
        }
        List<AgoraSpeech2TextProtobuffer.Word> words = textStream.getWordsList();
//        if (textStream.getSeqnum() == lastTextSeqnum) {
//            notifyErrorHandler(new ErrorInfo("parseTextByte", "-2", "parseTextByte parseFrom error >> Seqnum repeat"));
//            return textStream;
//        } else {
//            lastTextSeqnum = textStream.getSeqnum();
//        }
        lastTextSeqNumMap.put(channel, lastTextSeqnum);

        List<String> finalList = finalWordsMap.get(channel);
        if (finalList == null) {
            finalList = new ArrayList<>();
            finalWordsMap.put(channel, finalList);
        }
        List<String> nonFinalList = new ArrayList<>();
        for (AgoraSpeech2TextProtobuffer.Word word : words) {
            if (word.getIsFinal()) {
                finalList.add(word.getText() + "[f]");
                if (isSentenceBoundaryWord(word.getText())) {
                    String text = wordsToText(finalList);
                    text = simpleDateFormat.format(new Date()) + "+" + textStream.getUid() + "+" + text;
                    LogUtil.d(MainActivity.finalLogName, "parseTextByte >> " + text);
                    finalList.clear();
                }
            } else {
                nonFinalList.add(word.getText());
            }
        }
        StringBuilder stringBuilder = new StringBuilder();
        wordsToText(finalList, stringBuilder);
        wordsToText(nonFinalList, stringBuilder);

        String retContent = stringBuilder.toString();
        long uid = textStream.getUid();

        // make translation


        Map<String, OnTextUpdateListener> listenerMap = textUpdateListenerMap.get(channel);
        if (listenerMap != null) {
            OnTextUpdateListener listener = listenerMap.get(uid + "");
            if (listener != null) {
                listener.onTextUpdated(textStream, retContent);
            }
        }
        return textStream;
    }


    // Determines if a word returned from the service is punctuation.
    private static boolean isPunctuationWord(String word) {
        return word.equals(".") || word.equals("?") || word.equals(",");
    }

    // Determines if a word returned from the service is a sentence boundary.
    private static boolean isSentenceBoundaryWord(String word) {
        return word.equals(".") || word.equals("?");
    }

    // Builds text for a list of words (texts) as returned from the service.
    // It inserts spaces between words except before punctuation.
    private static String wordsToText(List<String> words) {
        final StringBuilder builder = new StringBuilder();
        for (String word : words) {
            if (builder.length() > 0 && !isPunctuationWord(word)) {
                builder.append(" ");
            }
            builder.append(word);
        }
        return builder.toString();
    }

    public static void wordsToText(List<String> words, StringBuilder builder) {
        for (String word : words) {
            if (builder.length() > 0 && !isPunctuationWord(word)) {
                builder.append(" ");
            }
            builder.append(word);
        }
    }

    private void notifyErrorHandler(ErrorInfo error) {
        Log.e(TAG, error.msg);
        if (errorHandler != null) {
            RequestCallback<ErrorInfo> handler = errorHandler.get();
            if (handler != null) {
                handler.onResult(error);
            }
        }
    }


    public interface RequestCallback<T> {
        void onResult(T data);
    }

    public interface OnTextUpdateListener {
        void onTextUpdated(AgoraSpeech2TextProtobuffer.Text text, String content);
    }

    public static class ErrorInfo {
        public String method;
        public String code;
        public String msg;

        public ErrorInfo(String method, String code, String msg) {
            this.method = method;
            this.code = code;
            this.msg = msg;
        }
    }

    public static class TokenInfo {
        public String tokenName;
        public long expireTimeTs;
    }

    public static class TaskInfo {
        public String taskId;
        public String status;
        public String token;
    }

}
