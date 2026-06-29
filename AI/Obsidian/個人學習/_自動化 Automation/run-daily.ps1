# run-daily.ps1  (ASCII-only) -- daily AI news curation via headless Claude Code.
# Called by Windows Task Scheduler. Reads daily-prompt.md (UTF-8) and pipes it to claude via stdin.

$ErrorActionPreference = "Stop"
$vault  = "D:\obsidian\個人學習\個人學習"
$prompt = Join-Path $vault "_自動化 Automation\daily-prompt.md"
$logDir = Join-Path $vault "_自動化 Automation\logs"

Set-Location $vault
if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir | Out-Null }
$log = Join-Path $logDir ("daily-" + (Get-Date -Format "yyyy-MM-dd") + ".log")

# Pipe the (Chinese) prompt as UTF-8 stdin so it is not mangled by the system codepage.
$prev = [Console]::InputEncoding
[Console]::InputEncoding = New-Object System.Text.UTF8Encoding $false
try {
  Get-Content -Raw -Encoding UTF8 -LiteralPath $prompt |
    claude -p --allowedTools "WebSearch" "WebFetch" "Read" "Write" "Edit" "Glob" "Grep" --permission-mode acceptEdits *> $log
}
finally { [Console]::InputEncoding = $prev }

Write-Output "Done. Log: $log"
