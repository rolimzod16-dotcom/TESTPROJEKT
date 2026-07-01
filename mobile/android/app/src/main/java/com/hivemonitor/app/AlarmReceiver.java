package com.hivemonitor.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

public class AlarmReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        NotificationHelper.showReportNotification(
            context,
            "🐝 HiveMonitor",
            "Новый отчёт улья — откройте приложение и проверьте дашборд."
        );
    }
}