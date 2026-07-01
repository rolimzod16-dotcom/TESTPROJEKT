package com.hivemonitor.app;

import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        NotificationHelper.ensureChannel(this);
        NotificationHelper.requestPermission(this);
        NotificationHelper.scheduleHourlyAlarms(this);

        new Handler(Looper.getMainLooper()).postDelayed(() -> {
            if (NotificationHelper.canPostNotifications(this)) {
                NotificationHelper.showTestNotification(this);
            }
        }, 2500);
    }

    @Override
    public void onRequestPermissionsResult(
        int requestCode,
        String[] permissions,
        int[] grantResults
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);

        if (requestCode == NotificationHelper.PERMISSION_REQUEST_CODE) {
            NotificationHelper.scheduleHourlyAlarms(this);
            if (NotificationHelper.canPostNotifications(this)) {
                NotificationHelper.showTestNotification(this);
            }
        }
    }
}