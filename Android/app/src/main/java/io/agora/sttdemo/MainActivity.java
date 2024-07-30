package io.agora.sttdemo;

import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.os.CountDownTimer;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.MenuItem;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.ActionBar;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.DividerItemDecoration;
import androidx.recyclerview.widget.LinearLayoutManager;

import com.google.android.material.snackbar.Snackbar;
import com.google.gson.Gson;

import java.lang.ref.WeakReference;
import java.util.Locale;
import java.util.Random;

import io.agora.rtc.speech2text.AgoraSpeech2TextProtobuffer;
import io.agora.sttdemo.databinding.ActivityMainBinding;
import io.agora.sttdemo.databinding.ListItemLayoutMainBinding;
import io.agora.sttdemo.utils.Base64Util;
import io.agora.sttdemo.utils.BindingSingleAdapter;
import io.agora.sttdemo.utils.BindingViewHolder;
import io.agora.sttdemo.utils.LogUtil;

public class MainActivity extends AppCompatActivity {
    private static final String RTC_UID_STT_AUDIO = "1000";
    private static final String RTC_UID_STT_STREAM = "2000";
    private static final String EXTRA_ROLE_TYPE = "RoleType";
    private static final String EXTRA_ROOM_NAME = "RoomName";
    private static final String EXTRA_STT_SERVER_ADDRESS = "SttServerAddress";
    private static final String EXTRA_AGORA_APP_ID = "AgoraAppId";
    private static final String EXTRA_AGORA_TOKEN = "AgoraToken";
    private static final String EXTRA_PULL_TOKEN = "PullToken";
    private static final String EXTRA_PUSH_TOKEN = "PushToken";
    private static final String EXTRA_TEST_MODE = "TestMode";
    private static final String EXTRA_AUDIO_HW_AEC = "AudioHwAec";
    private static final String EXTRA_AUDIO_SW_AEC = "AudioSwAec";
    private static final String EXTRA_AUDIO_AGC = "AudioAgc";
    private static final String EXTRA_AUDIO_ANC = "AudioAnc";
    private static final String EXTRA_STT_LANGUAGES = "SttLanguages";

    public static final String ROLE_TYPE_BROADCAST = "Broadcast";
    public static final String ROLE_TYPE_AUDIENCE = "Audience";

    private RtcManager rtcManager;
    private String localUid;

    private String roomName;
    private String roleType;
    private String sttServerAddress;
    private String agoraAppId;
    private String pullToken;
    private String pushToken;
    private String[] sttLanguages;
    private String languages = "";
    private ActivityMainBinding mBinding;
    private BindingSingleAdapter<String, ListItemLayoutMainBinding> mListAdapter;

    public static String logName = "";
    public static String finalLogName = "";
    public static String originLogName = "";

    private final Gson mGson = new Gson();

    private boolean isTest = true;
    private final int STTTestDuration = 10 * 60 * 1000; // 10 min
    private CountDownTimer mTestTimer;

    private final STTManager.RequestCallback<STTManager.ErrorInfo> errorInfoRequestCallback = data -> runOnUiThread(() -> Toast.makeText(MainActivity.this, data.msg, Toast.LENGTH_LONG).show());

    public static Intent newIntent(Context context,
                                   String roomName,
                                   String roleType,
                                   String sttServerAddress,
                                   String agoraAppId,
                                   String pullToken,
                                   String pushToken,
                                   String[] languages,
                                   boolean isTestMode,
                                   boolean isHwAEC,
                                   boolean isSwAEC,
                                   boolean isAGC,
                                   boolean isANC) {
        Intent intent = new Intent(context, MainActivity.class);
        intent.putExtra(EXTRA_ROOM_NAME, roomName);
        intent.putExtra(EXTRA_ROLE_TYPE, roleType);
        intent.putExtra(EXTRA_STT_SERVER_ADDRESS, sttServerAddress);
        intent.putExtra(EXTRA_AGORA_APP_ID, agoraAppId);
        intent.putExtra(EXTRA_PULL_TOKEN, pullToken);
        intent.putExtra(EXTRA_PUSH_TOKEN, pushToken);
        intent.putExtra(EXTRA_STT_LANGUAGES, languages);
        intent.putExtra(EXTRA_TEST_MODE, isTestMode);
        intent.putExtra(EXTRA_AUDIO_HW_AEC, isHwAEC);
        intent.putExtra(EXTRA_AUDIO_SW_AEC, isSwAEC);
        intent.putExtra(EXTRA_AUDIO_AGC, isAGC);
        intent.putExtra(EXTRA_AUDIO_ANC, isANC);
        return intent;
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        mBinding = ActivityMainBinding.inflate(LayoutInflater.from(this));
        setContentView(mBinding.getRoot());


        roomName = getIntent().getStringExtra(EXTRA_ROOM_NAME);
        roleType = getIntent().getStringExtra(EXTRA_ROLE_TYPE);
        sttServerAddress = getIntent().getStringExtra(EXTRA_STT_SERVER_ADDRESS);
        agoraAppId = getIntent().getStringExtra(EXTRA_AGORA_APP_ID);
        pullToken = getIntent().getStringExtra(EXTRA_PULL_TOKEN);
        pushToken = getIntent().getStringExtra(EXTRA_PUSH_TOKEN);
        sttLanguages = getIntent().getStringArrayExtra(EXTRA_STT_LANGUAGES);
        isTest = getIntent().getBooleanExtra(EXTRA_TEST_MODE, true);

        logName = "speech_to_text_" + roomName;
        finalLogName = "speech_to_text_final_" + roomName;
        originLogName = "speech_to_text_origin_" + roomName;
        LogUtil.setRootFilePath(getExternalCacheDir().getAbsolutePath());
        LogUtil.openTagFileWriter(logName);
        LogUtil.openTagFileWriter(finalLogName);
        LogUtil.openTagFileWriter(originLogName);

//        for (String sttLanguage : sttLanguages) {
//            if (sttLanguage.length() > 0) languages = languages + sttLanguage + ",";
//        }
//
//        if( languages.length() > 0 )
//            languages = languages.substring(0, languages.length()-1);
//        else
//            languages = "en-US";
//        Log.i("STT", "languages: "+ languages);
        initView();
        initManager();
    }


    @Override
    public boolean onOptionsItemSelected(@NonNull MenuItem item) {
        if (item.getItemId() == android.R.id.home) {
            finish();
            return true;
        }
        return super.onOptionsItemSelected(item);
    }

    private void initView() {
        // Title
        ActionBar actionBar = getSupportActionBar();
        if (actionBar != null) {
            actionBar.setTitle(roomName);
            actionBar.setDisplayHomeAsUpEnabled(true);
        }

        // RecyclerView
        mBinding.recyclerview.setLayoutManager(new LinearLayoutManager(this, LinearLayoutManager.VERTICAL, false));
        mBinding.recyclerview.addItemDecoration(new DividerItemDecoration(this, DividerItemDecoration.VERTICAL));
        mListAdapter = new BindingSingleAdapter<String, ListItemLayoutMainBinding>() {

            @Override
            public void onBindViewHolder(@NonNull BindingViewHolder<ListItemLayoutMainBinding> holder, int position) {
                String userId = getItem(position);
                holder.mBinding.tvTitle.setText("user: " + (userId.equals(localUid) ? userId + "(self," + roleType + ")" : userId));
                STTManager.getInstance().setTextUpdateListener(roomName, userId, (text, content) -> runOnUiThread(() -> {
                    LogUtil.d(logName, "%s : %s", userId, content);
                    holder.mBinding.tvContent.setText(content);
                    // make translation text
                    holder.mBinding.tvFinal.setText((text.getTransList().toString()));
                }));
            }
        };
        mBinding.recyclerview.setAdapter(mListAdapter);

        // STT Switch
        mBinding.fabStt.setOnClickListener(v -> {
            if ("Off".equalsIgnoreCase(mBinding.fabStt.getText().toString())) {
                startSTT();
            } else if ("Loading".equalsIgnoreCase(mBinding.fabStt.getText().toString())) {

            }
            else  {
                stopSTT();
            }
        });
    }

    private void stopSTT() {
        if (mTestTimer != null) {
            mTestTimer.cancel();
            mTestTimer = null;
        }
        mBinding.fabStt.setText("Loading");
        STTManager.getInstance().stopTask(roomName,
                data -> runOnUiThread(() -> mBinding.fabStt.setText("Off")),
                error -> runOnUiThread(() -> mBinding.fabStt.setText("On")));
    }

    private void startSTT() {
        mBinding.fabStt.setText("Loading");
        Log.i("STT", "start STT");

        if(getString(R.string.enable_cloud_storage).equals("true"))
        {
            String[] prefix = {""};
            STTManager.getInstance().setCloudStorage(
                    getString(R.string.cloud_storage_access_key),
                    getString(R.string.cloud_storage_secret_key),
                    getString(R.string.cloud_storage_vendor),
                    getString(R.string.cloud_storage_region),
                   prefix
            );
        }

        STTManager.getInstance().startTask(roomName, sttLanguages,
                RTC_UID_STT_AUDIO, pullToken,
                RTC_UID_STT_STREAM, pushToken, getString(R.string.enable_cloud_storage), localUid,
                data -> runOnUiThread(() -> {
                    if (isTest) {
                        if (mTestTimer != null) {
                            mTestTimer.cancel();
                        }
                        mTestTimer = new CountDownTimer(STTTestDuration, 1000) {
                            @Override
                            public void onTick(long millisUntilFinished) {
                                mBinding.fabStt.setText(String.format(Locale.US, "On(%ds)", millisUntilFinished / 1000));
                            }

                            @Override
                            public void onFinish() {
                                Snackbar snackbar = Snackbar.make(MainActivity.this, mBinding.getRoot(), "The demo can only be used for 10 minutes.", Snackbar.LENGTH_INDEFINITE);
                                snackbar.setAction("UNDO", v -> snackbar.dismiss());
                                snackbar.show();
                                stopSTT();
                            }
                        };
                        mTestTimer.start();
                    } else {
                        mBinding.fabStt.setText("On");
                    }
                }),
                error -> runOnUiThread(() -> mBinding.fabStt.setText("Off")));
    }

    private void initManager() {
        String appKey = getString(R.string.agora_app_key);
        String appSecret = getString(R.string.agora_app_secret);
        STTManager.getInstance().init(sttServerAddress, agoraAppId, appKey, appSecret, new WeakReference<>(errorInfoRequestCallback));
        rtcManager = new RtcManager();
        rtcManager.init(this,
                agoraAppId,
                getIntent().getBooleanExtra(EXTRA_AUDIO_HW_AEC, true),
                getIntent().getBooleanExtra(EXTRA_AUDIO_SW_AEC, false),
                getIntent().getBooleanExtra(EXTRA_AUDIO_AGC, true),
                getIntent().getBooleanExtra(EXTRA_AUDIO_ANC, true),
                (code, message) -> runOnUiThread(() -> {
            Toast.makeText(MainActivity.this, message, Toast.LENGTH_LONG).show();
            finish();
        }));
        joinChannel();
    }

    private void joinChannel() {
        localUid = new Random().nextInt(10000) + 3000 + "";
        Log.i("STT", "join channel");
        rtcManager.joinChannel(roomName, localUid, getString(R.string.agora_token), roleType.equals(ROLE_TYPE_BROADCAST), new RtcManager.OnChannelListener() {

            @Override
            public void onJoinSuccess(int uid) {
                runOnUiThread(() -> mListAdapter.insertLast(uid + ""));
                Log.i("STT", "join channel success");
            }

            @Override
            public void onUserJoined(String channelId, int uid) {
                if (String.valueOf(uid).equalsIgnoreCase(RTC_UID_STT_AUDIO) || String.valueOf(uid).equalsIgnoreCase(RTC_UID_STT_STREAM)) {
                    runOnUiThread(() -> {
                        if (!mBinding.fabStt.getText().toString().contains("On")) {
                            mBinding.fabStt.setText("On");
                        }
                    });
                    return;
                }
                runOnUiThread(() -> mListAdapter.insertLast(uid + ""));
            }

            @Override
            public void onUserOffline(String channelId, int uid) {
                if (String.valueOf(uid).equalsIgnoreCase(RTC_UID_STT_AUDIO) || String.valueOf(uid).equalsIgnoreCase(RTC_UID_STT_STREAM)) {
                    runOnUiThread(() -> mBinding.fabStt.setText("Off"));
                    return;
                }
                runOnUiThread(() -> mListAdapter.remove(uid + ""));
            }

            @Override
            public void onStreamMessage(int uid, int streamId, byte[] data) {
                //String.valueOf(uid).equalsIgnoreCase(RTC_UID_STT_AUDIO) ||
                if (String.valueOf(uid).equalsIgnoreCase(RTC_UID_STT_STREAM)) {
                    AgoraSpeech2TextProtobuffer.Text text = STTManager.getInstance().parseTextByte(roomName, data);
                    LogUtil.d(originLogName, mGson.toJson(text));
                }
            }
        });
    }

    @Override
    protected void onDestroy() {
        if (mTestTimer != null) {
            mTestTimer.cancel();
            mTestTimer = null;
        }
        LogUtil.closeTagFileWriter(logName);
        LogUtil.closeTagFileWriter(finalLogName);
        LogUtil.closeTagFileWriter(originLogName);
        STTManager.getInstance().resetTask(roomName);
        rtcManager.release();
        super.onDestroy();
    }
}