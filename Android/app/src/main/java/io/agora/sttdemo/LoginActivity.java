package io.agora.sttdemo;

import static io.agora.sttdemo.MainActivity.ROLE_TYPE_AUDIENCE;
import static io.agora.sttdemo.MainActivity.ROLE_TYPE_BROADCAST;

import android.Manifest;
import android.content.Intent;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.ArrayAdapter;
import android.widget.AutoCompleteTextView;
import android.widget.Toast;
import java.util.ArrayList;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;

import com.google.android.material.textfield.TextInputEditText;
import com.google.android.material.textfield.TextInputLayout;

import io.agora.sttdemo.databinding.ActivityLoginBinding;
import pub.devrel.easypermissions.AfterPermissionGranted;
import pub.devrel.easypermissions.EasyPermissions;

public class LoginActivity extends AppCompatActivity {
    private static final int RC_PERMISSIONS = 100;

    private ActivityLoginBinding mBinding;
    private String mRoomName;
    private String mSttServerAddress;
    private String mAgoraAppId;
    private String mPullToken;
    private String mPushToken;

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        mBinding = ActivityLoginBinding.inflate(LayoutInflater.from(this));
        setContentView(mBinding.getRoot());

        mBinding.swTestMode.setOnClickListener(v -> {
            int visible = mBinding.swTestMode.isChecked() ? View.VISIBLE : View.GONE;
            mBinding.tfSttAddress.setVisibility(visible);
            mBinding.tfAgoraAppId.setVisibility(visible);
            mBinding.tfPullToken.setVisibility(visible);
            mBinding.tfPushToken.setVisibility(visible);
            mBinding.llAudio.setVisibility(visible);
        });

        mBinding.btnJoin.setOnClickListener(v -> {
            mRoomName = mBinding.tfRoomName.getEditText().getText().toString();
            if (TextUtils.isEmpty(mRoomName)) {
                Toast.makeText(LoginActivity.this, "The room name is empty", Toast.LENGTH_LONG).show();
                return;
            }
            mSttServerAddress = mBinding.tfSttAddress.getEditText().getText().toString();
            if (TextUtils.isEmpty(mSttServerAddress) || !mSttServerAddress.startsWith("http")) {
                Toast.makeText(LoginActivity.this, "The stt server address is empty or error", Toast.LENGTH_LONG).show();
                return;
            }
            mAgoraAppId = mBinding.tfAgoraAppId.getEditText().getText().toString();
            if (TextUtils.isEmpty(mAgoraAppId)) {
                Toast.makeText(LoginActivity.this, "The agora app id is empty", Toast.LENGTH_LONG).show();
                return;
            }
            mPullToken = mBinding.tfPullToken.getEditText().getText().toString();
            mPushToken = mBinding.tfPushToken.getEditText().getText().toString();
            requestPermission();
        });

        mBinding.acLanguage1.setOnClickListener(v -> {
            showLanguageSelectDialog(mBinding.acLanguage1);
        });

        mBinding.acLanguage2.setOnClickListener(v -> {
            showLanguageSelectDialog(mBinding.acLanguage2);
        });

    }

    @AfterPermissionGranted(RC_PERMISSIONS)
    private void requestPermission() {
        String[] perms = {Manifest.permission.RECORD_AUDIO};
        if (EasyPermissions.hasPermissions(this, perms)) {
            showRoleSelectDialog();
        } else {
            EasyPermissions.requestPermissions(this, "The record permission is required",
                    RC_PERMISSIONS, perms);
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
    }

    private void showLanguageSelectDialog(AutoCompleteTextView layout) {
        String[] languages = {"", "en-US", "en-In", "ja-JP", "zh-CN", "hi-IN", "ko-KR", "de-DE",
        "es-ES","fr-FR","it-IT","pt-PT"};
        new AlertDialog.Builder(this)
                .setTitle("Select language")
                .setAdapter(
                        new ArrayAdapter<>(
                                this,
                                android.R.layout.simple_list_item_1,
                                android.R.id.text1,
                                languages),
                        (dialog, which) -> {
                            layout.setText(languages[which]);
                        })
                .show();
    }

    private String[] collectLanguages() {
        ArrayList<String> languages = new ArrayList<String>();
        languages.add(mBinding.acLanguage1.getText().toString());
        String lang2 = mBinding.acLanguage2.getText().toString();
        if (lang2.length() > 0) {
            languages.add(lang2);
        }
        String[] ret = {""};
        return languages.toArray(ret);
    }

    private void showRoleSelectDialog() {
        String[] roles = {ROLE_TYPE_BROADCAST, ROLE_TYPE_AUDIENCE};
        String[] langs = collectLanguages();
        new AlertDialog.Builder(this)
                .setTitle("Role Select")
                .setAdapter(
                        new ArrayAdapter<>(
                                this,
                                android.R.layout.simple_list_item_1,
                                android.R.id.text1,
                                roles),
                        (dialog, which) -> {
                            startActivity(MainActivity.newIntent(LoginActivity.this,
                                    mRoomName, roles[which], mSttServerAddress,
                                    mAgoraAppId, mPullToken, mPushToken,
                                    langs,
                                    mBinding.swTestMode.isChecked(),
                                    mBinding.swHwAec.isChecked(),
                                    mBinding.swSwAec.isChecked(),
                                    mBinding.swAgc.isChecked(),
                                    mBinding.swAnc.isChecked()));
                        })
                .show();
    }


    private void runAfterClick(View view, int count, long delay, Runnable run) {
        final Runnable delayRun = () -> view.setTag(null);
        view.setOnClickListener(v -> {
            Object _currCount = v.getTag();
            int currCount = 0;
            if (_currCount != null) {
                currCount = (int) _currCount;
            }
            currCount++;
            v.setTag(currCount);

            v.removeCallbacks(delayRun);
            if (currCount >= count) {
                v.setTag(null);
                if (run != null) {
                    run.run();
                }
                return;
            }
            v.postDelayed(delayRun, delay);
        });
    }
}
