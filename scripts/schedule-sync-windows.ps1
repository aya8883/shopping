<#
.SYNOPSIS
  Register (or remove) a Windows Task Scheduler job that runs leaflet sync every 6 hours.

.EXAMPLE
  # Install — runs every 6 hours while you are logged in
  powershell -ExecutionPolicy Bypass -File .\scripts\schedule-sync-windows.ps1

.EXAMPLE
  # Also refresh product images on each run
  powershell -ExecutionPolicy Bypass -File .\scripts\schedule-sync-windows.ps1 -WithImages

.EXAMPLE
  # Remove the scheduled task
  powershell -ExecutionPolicy Bypass -File .\scripts\schedule-sync-windows.ps1 -Unregister
#>
param(
  [switch]$WithImages,
  [switch]$Unregister,
  [string]$TaskName = 'WainAwfar-SyncLeaflets'
)

$ErrorActionPreference = 'Stop'
$root = Resolve-Path (Join-Path $PSScriptRoot '..')
$logDir = Join-Path $root 'logs'
$logFile = Join-Path $logDir 'sync-leaflets.log'

if ($Unregister) {
  Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue
  Write-Host "Removed scheduled task: $TaskName"
  exit 0
}

New-Item -ItemType Directory -Force -Path $logDir | Out-Null

$node = (Get-Command node -ErrorAction Stop).Source
$script = Join-Path $root 'scripts\sync-all.mjs'
$extra = if ($WithImages) { ' --images' } else { '' }

# Wrap so stdout/stderr append to a log file
$actionArgs = "/c `"cd /d `"$root`" && `"$node`" `"$script`"$extra >> `"$logFile`" 2>&1`""
$action = New-ScheduledTaskAction -Execute 'cmd.exe' -Argument $actionArgs

# Start soon, then every 6 hours indefinitely
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(2) `
  -RepetitionInterval (New-TimeSpan -Hours 6) `
  -RepetitionDuration ([TimeSpan]::MaxValue)

$settings = New-ScheduledTaskSettingsSet `
  -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries `
  -StartWhenAvailable `
  -MultipleInstances IgnoreNew

$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited

Register-ScheduledTask `
  -TaskName $TaskName `
  -Action $action `
  -Trigger $trigger `
  -Settings $settings `
  -Principal $principal `
  -Force | Out-Null

Write-Host "Registered: $TaskName"
Write-Host "  Runs: every 6 hours (next in ~2 minutes)"
Write-Host "  Command: node scripts/sync-all.mjs$extra"
Write-Host "  Log: $logFile"
Write-Host ""
Write-Host "Manage in Task Scheduler, or:"
Write-Host "  Get-ScheduledTask -TaskName $TaskName"
Write-Host "  Start-ScheduledTask -TaskName $TaskName"
Write-Host "  powershell -File .\scripts\schedule-sync-windows.ps1 -Unregister"
