param(
    [Parameter(Mandatory = $true)]
    [string]$CronSecret
)

$url = "https://testprojekt-q4af.vercel.app/api/cron/reports"
$headers = @{ Authorization = "Bearer $CronSecret" }

Write-Host "Testing cron endpoint..."
try {
    $response = Invoke-RestMethod -Uri $url -Headers $headers -Method Get
    $response | ConvertTo-Json -Depth 5
    Write-Host "`nOK: cron работает" -ForegroundColor Green
} catch {
    Write-Host "FAIL: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host $_.ErrorDetails.Message
    }
    exit 1
}