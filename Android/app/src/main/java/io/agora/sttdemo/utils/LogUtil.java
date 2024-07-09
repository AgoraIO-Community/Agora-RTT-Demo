package io.agora.sttdemo.utils;

import android.os.Environment;
import android.text.TextUtils;
import android.util.Log;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;

public class LogUtil {
    private static final Executor executor = Executors.newSingleThreadExecutor();
    private static final Map<String, FileOutputStream> writerMap = new HashMap<>();
    private static final Map<String, String> tagFileMap = new HashMap<>();
    private static final SimpleDateFormat printDataFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss.SSS");
    private static final SimpleDateFormat fileDataFormat = new SimpleDateFormat("yyyyMMddHHmm");
    private static String RootFilePath = Environment.getExternalStorageDirectory().getAbsolutePath();

    public static void setRootFilePath(String path){
        RootFilePath = path;
    }

    public static void d(String name, String format, Object... args) {
        String message = String.format(Locale.US, format, args);
        Log.d(name, message);
        printToFile(name, printDataFormat.format(new Date()) + " [D] " + message);
    }

    public static void openTagFileWriter(String name) {
        String fileName = name + "_"+ fileDataFormat.format(new Date()) + ".log";
        executor.execute(() -> {
            FileOutputStream fileWriter = writerMap.get(name);
            if(fileWriter == null){
                synchronized (writerMap){
                    fileWriter = writerMap.get(name);
                    if(fileWriter == null){
                        try {
                            File dir = new File(RootFilePath);
                            if(!dir.exists()){
                                dir.mkdirs();
                            }
                            File file = new File(dir, fileName);
                            if(!file.exists()){
                                file.createNewFile();
                            }
                            fileWriter = new FileOutputStream(file, true);
                            writerMap.put(fileName, fileWriter);
                            tagFileMap.put(name, fileName);
                        } catch (IOException e) {
                            e.printStackTrace();
                        }
                    }
                }
            }
        });
    }

    public static void closeTagFileWriter(String name) {
        executor.execute(() -> {
            FileOutputStream fileWriter = writerMap.get(name);
            if(fileWriter != null){
                synchronized (writerMap){
                    fileWriter = writerMap.get(name);
                    if(fileWriter != null){
                        try {
                            fileWriter.close();
                        } catch (IOException e) {
                            e.printStackTrace();
                        } finally {
                            writerMap.remove(name);
                            tagFileMap.remove(name);
                        }
                    }
                }
            }
        });
    }

    private static void printToFile(String tag, String message) {
        String fileName = tagFileMap.get(tag);
        if(TextUtils.isEmpty(fileName)){
            return;
        }
        executor.execute(() -> {
            FileOutputStream fileWriter = writerMap.get(fileName);
            if (fileWriter != null) {
                try {
                    fileWriter.write((message + "\n").getBytes());
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        });
    }
}
