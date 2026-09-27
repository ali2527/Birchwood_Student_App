package com.birchwoodstudent;

import android.media.AudioAttributes;
import android.media.SoundPool;
import androidx.annotation.NonNull;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class SplashSystemUiModule extends ReactContextBaseJavaModule {
  private SoundPool soundPool;
  private int popId;
  private int selectId;
  private boolean soundsReady;

  public SplashSystemUiModule(ReactApplicationContext reactContext) {
    super(reactContext);
    try {
      AudioAttributes attrs =
          new AudioAttributes.Builder()
              .setUsage(AudioAttributes.USAGE_ASSISTANCE_SONIFICATION)
              .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
              .build();
      soundPool = new SoundPool.Builder().setMaxStreams(2).setAudioAttributes(attrs).build();
      popId = soundPool.load(reactContext, R.raw.reaction_pop, 1);
      selectId = soundPool.load(reactContext, R.raw.reaction_select, 1);
      soundsReady = true;
    } catch (Throwable ignored) {
      soundsReady = false;
    }
  }

  @NonNull
  @Override
  public String getName() {
    return "SplashSystemUi";
  }

  @ReactMethod
  public void hideNativeSplash() {
    MainActivity.hideNativeSplash();
  }

  @ReactMethod
  public void endSplashImmersive() {
    MainActivity.endSplashImmersive();
  }

  @ReactMethod
  public void playReactionSound(String kind) {
    if (!soundsReady || soundPool == null) {
      return;
    }
    try {
      int id = "select".equals(kind) ? selectId : popId;
      soundPool.play(id, 0.7f, 0.7f, 1, 0, 1f);
    } catch (Throwable ignored) {
    }
  }
}
