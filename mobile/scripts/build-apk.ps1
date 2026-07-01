$ErrorActionPreference = "Stop"

$mobileRoot = Split-Path -Parent $PSScriptRoot
$projectRoot = Split-Path -Parent $mobileRoot
$androidDir = Join-Path $mobileRoot "android"
$studioJava = "C:\Program Files\Android\Android Studio\jbr"
$portableJava = Join-Path $projectRoot ".tools\jdk-21"
$portableJava17 = Join-Path $projectRoot ".tools\jdk-17"
$sdkHome = "$env:LOCALAPPDATA\Android\Sdk"

if (Test-Path $studioJava) {
    $javaHome = $studioJava
} elseif (Test-Path $portableJava) {
    $javaHome = $portableJava
} elseif (Test-Path $portableJava17) {
    $javaHome = $portableJava17
} else {
    throw "Java not found. Install Android Studio or download JDK 21 to .tools/jdk-21."
}
if (-not (Test-Path $sdkHome)) {
    throw "Android SDK not found."
}

$env:JAVA_HOME = $javaHome
$env:ANDROID_HOME = $sdkHome
$env:PATH = "$javaHome\bin;$sdkHome\platform-tools;$env:PATH"

Push-Location $mobileRoot
try {
    Write-Host "Syncing Capacitor..."
    npx cap sync android

    Push-Location $androidDir
    try {
        Write-Host "Building debug APK..."
        .\gradlew.bat :app:assembleDebug
        $buildExit = $LASTEXITCODE

        $apk = Get-ChildItem -Path "app\build\outputs\apk\debug" -Filter "*.apk" |
            Sort-Object LastWriteTime -Descending |
            Select-Object -First 1

        if (-not $apk) {
            throw "APK not found after build (exit code $buildExit)."
        }

        if ($buildExit -ne 0) {
            Write-Host "Gradle reported warnings, but APK was created." -ForegroundColor Yellow
        }

        $outDir = Join-Path $mobileRoot "dist"
        New-Item -ItemType Directory -Force -Path $outDir | Out-Null
        $dest = Join-Path $outDir "hive-monitor.apk"
        Copy-Item $apk.FullName $dest -Force

        $publicDir = Join-Path $projectRoot "public\downloads"
        New-Item -ItemType Directory -Force -Path $publicDir | Out-Null
        $publicDest = Join-Path $publicDir "hive-monitor.apk"
        Copy-Item $apk.FullName $publicDest -Force

        $sizeMb = [math]::Round($apk.Length / 1MB, 1)
        Write-Host ""
        Write-Host "APK ready:" -ForegroundColor Green
        Write-Host $dest
        Write-Host "Copied to site:" -ForegroundColor Green
        Write-Host $publicDest
        Write-Host "Size: $sizeMb MB"
    }
    finally {
        Pop-Location
    }
}
finally {
    Pop-Location
}