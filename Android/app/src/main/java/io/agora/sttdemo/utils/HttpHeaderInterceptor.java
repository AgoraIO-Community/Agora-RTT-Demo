package io.agora.sttdemo.utils;

import androidx.annotation.NonNull;

import java.io.IOException;

import okhttp3.Interceptor;
import okhttp3.Request;
import okhttp3.Response;

public class HttpHeaderInterceptor implements Interceptor {
    private String authorizationHeader;

    public HttpHeaderInterceptor(String authorizationHeader) {
        this.authorizationHeader = authorizationHeader;
    }

    @NonNull
    @Override
    public Response intercept(@NonNull Chain chain) throws IOException {
        Request.Builder builder = chain.request().newBuilder();
        builder.header("Authorization", authorizationHeader);
        return chain.proceed(builder.build());
    }
}
