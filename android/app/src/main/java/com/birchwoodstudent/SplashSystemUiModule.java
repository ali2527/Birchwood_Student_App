package com.birchwoodstudent;

import androidx.annotation.NonNull;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class SplashSystemUiModule extends ReactContextBaseJavaModule {
  public SplashSystemUiModule(ReactApplicationContext reactContext) {
    super(reactContext);
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
}
