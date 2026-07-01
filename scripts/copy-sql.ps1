Set-Clipboard -Value (Get-Content "$PSScriptRoot\..\supabase\RUN_ONCE.sql" -Raw)
Write-Host "SQL скопирован в буфер обмена. Вставь в Supabase -> SQL Editor -> Run" -ForegroundColor Green