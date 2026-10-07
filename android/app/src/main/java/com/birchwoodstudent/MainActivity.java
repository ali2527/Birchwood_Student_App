package com.birchwoodstudent;

import android.app.Activity;
import android.app.Dialog;
import android.graphics.Color;
import android.graphics.drawable.ColorDrawable;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.view.WindowManager;
import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactActivityDelegate;
import java.lang.ref.WeakReference;

public class MainActivity extends ReactActivity {

  private static WeakReference<Activity> currentActivity;
  private static Dialog splashDialog;
  private static boolean splashImmersive = true;

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    currentActivity = new WeakReference<Activity>(this);
    splashImmersive = true;
    // Colors/flags only — DecorView does not exist until super.onCreate().
    applySplashBarColors(getWindow());
    super.onCreate(savedInstanceState);
    // Splash + insets need DecorView; must run after super.onCreate().
    showNativeSplash();
    prepareSplashWindow(getWindow());
    disableAutofillHighlight();
  }

  private void disableAutofillHighlight() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
      return;
    }
    View decor = getWindow().getDecorView();
    decor.setImportantForAutofill(View.IMPORTANT_FOR_AUTOFILL_NO_EXCLUDE_DESCENDANTS);
  }

  @Override
  public void onWindowFocusChanged(boolean hasFocus) {
    super.onWindowFocusChanged(hasFocus);
    if (hasFocus && splashImmersive) {
      prepareSplashWindow(getWindow());
      if (splashDialog != null && splashDialog.getWindow() != null) {
        prepareSplashWindow(splashDialog.getWindow());
      }
    }
  }

  static void showNativeSplash() {
    final Activity activity = currentActivity != null ? currentActivity.get() : null;
    if (activity == null || activity.isFinishing()) {
      return;
    }
    activity.runOnUiThread(
        new Runnable() {
          @Override
          public void run() {
            if (activity.isFinishing() || splashDialog != null) {
              return;
            }
            splashDialog = new Dialog(activity, R.style.SplashDialogTheme);
            splashDialog.setContentView(R.layout.launch_screen);
            splashDialog.setCancelable(false);
            Window dialogWindow = splashDialog.getWindow();
            if (dialogWindow != null) {
              applySplashBarColors(dialogWindow);
              if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                dialogWindow.addFlags(WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS);
                WindowManager.LayoutParams lp = dialogWindow.getAttributes();
                lp.layoutInDisplayCutoutMode =
                    WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
                dialogWindow.setAttributes(lp);
              }
            }
            splashDialog.show();
            if (dialogWindow != null) {
              prepareSplashWindow(dialogWindow);
            }
            prepareSplashWindow(activity.getWindow());
          }
        });
  }

  static void hideNativeSplash() {
    final Activity activity = currentActivity != null ? currentActivity.get() : null;
    if (activity == null) {
      return;
    }
    activity.runOnUiThread(
        new Runnable() {
          @Override
          public void run() {
            if (splashDialog != null) {
              if (!activity.isFinishing()) {
                splashDialog.dismiss();
              }
              splashDialog = null;
            }
            if (splashImmersive) {
              prepareSplashWindow(activity.getWindow());
            }
          }
        });
  }

  static void endSplashImmersive() {
    splashImmersive = false;
    final Activity activity = currentActivity != null ? currentActivity.get() : null;
    if (activity == null) {
      return;
    }
    activity.runOnUiThread(
        new Runnable() {
          @Override
          public void run() {
            showSystemBars(activity.getWindow());
          }
        });
  }

  private static void applySplashBarColors(Window window) {
    if (window == null) {
      return;
    }
    window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
    window.setStatusBarColor(Color.TRANSPARENT);
    window.setNavigationBarColor(Color.TRANSPARENT);
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      window.setNavigationBarContrastEnforced(false);
    }
  }

  private static void prepareSplashWindow(Window window) {
    applySplashBarColors(window);
    setStatusBarIconsWhite(window);
    hideNavigationBar(window);
  }

  private static void setStatusBarIconsWhite(Window window) {
    // getInsetsController() NPEs when DecorView is not installed yet.
    if (window == null || window.peekDecorView() == null) {
      return;
    }
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
      WindowInsetsController controller = window.getInsetsController();
      if (controller != null) {
        controller.setSystemBarsAppearance(0, WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS);
      }
      return;
    }
    View decor = window.getDecorView();
    decor.setSystemUiVisibility(
        decor.getSystemUiVisibility() & ~View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR);
  }

  private static void hideNavigationBar(Window window) {
    if (window == null || window.peekDecorView() == null) {
      return;
    }
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
      WindowInsetsController controller = window.getInsetsController();
      if (controller != null) {
        controller.hide(WindowInsets.Type.navigationBars());
        controller.setSystemBarsBehavior(
            WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
      }
    } else {
      View decor = window.getDecorView();
      decor.setSystemUiVisibility(
          View.SYSTEM_UI_FLAG_LAYOUT_STABLE
              | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
              | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
              | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY);
    }
  }

  private static void showSystemBars(Window window) {
    if (window == null || window.peekDecorView() == null) {
      return;
    }
    window.setNavigationBarColor(Color.WHITE);
    window.setBackgroundDrawable(new ColorDrawable(Color.WHITE));
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      window.setNavigationBarContrastEnforced(false);
    }
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
      WindowInsetsController controller = window.getInsetsController();
      if (controller != null) {
        controller.show(WindowInsets.Type.navigationBars());
        controller.setSystemBarsAppearance(
            WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS,
            WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS);
      }
      return;
    }
    View decor = window.getDecorView();
    decor.setSystemUiVisibility(View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR);
  }

  @Override
  protected String getMainComponentName() {
    return "BirchwoodStudent";
  }

  @Override
  protected ReactActivityDelegate createReactActivityDelegate() {
    return new DefaultReactActivityDelegate(
        this,
        getMainComponentName(),
        DefaultNewArchitectureEntryPoint.getFabricEnabled());
  }
}
