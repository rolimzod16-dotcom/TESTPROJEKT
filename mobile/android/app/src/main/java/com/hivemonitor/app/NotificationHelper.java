package com.hivemonitor.app;

import android.app.AlarmManager;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;

import androidx.core.app.ActivityCompat;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import androidx.core.content.ContextCompat;

public final class NotificationHelper {
    public static final String CHANNEL_ID = "hive_reports_native";
    public static final int PERMISSION_REQUEST_CODE = 41001;
    public static final int HOURLY_ALARM_REQUEST_CODE = 41002;
    public static final int TEST_NOTIFICATION_ID = 41003;

    private NotificationHelper() {}

    public static void requestPermission(MainActivity activity) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) {
            return;
        }

        if (
            ContextCompat.checkSelfPermission(
                activity,
                android.Manifest.permission.POST_NOTIFICATIONS
            ) != PackageManager.PERMISSION_GRANTED
        ) {
            ActivityCompat.requestPermissions(
                activity,
                new String[] { android.Manifest.permission.POST_NOTIFICATIONS },
                PERMISSION_REQUEST_CODE
            );
        }
    }

    public static void ensureChannel(Context context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            return;
        }

        NotificationChannel channel = new NotificationChannel(
            CHANNEL_ID,
            "Отчёты улья",
            NotificationManager.IMPORTANCE_HIGH
        );
        channel.setDescription("HiveMonitor — уведомления каждый час");
        channel.enableVibration(true);

        NotificationManager manager = context.getSystemService(NotificationManager.class);
        if (manager != null) {
            manager.createNotificationChannel(channel);
        }
    }

    public static void scheduleHourlyAlarms(Context context) {
        ensureChannel(context);

        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarmManager == null) {
            return;
        }

        Intent intent = new Intent(context, AlarmReceiver.class);
        PendingIntent pendingIntent = PendingIntent.getBroadcast(
            context,
            HOURLY_ALARM_REQUEST_CODE,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        long firstTrigger = System.currentTimeMillis() + AlarmManager.INTERVAL_HOUR;

        alarmManager.setInexactRepeating(
            AlarmManager.RTC_WAKEUP,
            firstTrigger,
            AlarmManager.INTERVAL_HOUR,
            pendingIntent
        );
    }

    public static void showReportNotification(Context context, String title, String body) {
        ensureChannel(context);

        if (!canPostNotifications(context)) {
            return;
        }

        Intent launchIntent = new Intent(context, MainActivity.class);
        launchIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent contentIntent = PendingIntent.getActivity(
            context,
            0,
            launchIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_stat_hive)
            .setContentTitle(title)
            .setContentText(body)
            .setStyle(new NotificationCompat.BigTextStyle().bigText(body))
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .setContentIntent(contentIntent)
            .setColor(0xFFF59E0B);

        NotificationManagerCompat.from(context).notify(
            (int) (System.currentTimeMillis() % 100000),
            builder.build()
        );
    }

    public static void showTestNotification(Context context) {
        showReportNotification(
            context,
            "🐝 HiveMonitor",
            "Уведомления работают! Каждый час будет приходить напоминание об отчёте улья."
        );
    }

    public static boolean canPostNotifications(Context context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) {
            return NotificationManagerCompat.from(context).areNotificationsEnabled();
        }

        return (
            ContextCompat.checkSelfPermission(
                context,
                android.Manifest.permission.POST_NOTIFICATIONS
            ) == PackageManager.PERMISSION_GRANTED
        );
    }
}