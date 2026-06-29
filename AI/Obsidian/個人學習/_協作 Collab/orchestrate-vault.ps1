# orchestrate-vault.ps1  (ASCII-only on purpose: avoids PS 5.1 Big5 misparse of Chinese)
# Drive Codex to expand/maintain this Obsidian vault.
#
# Usage:
#   # Claude-driven (recommended): write _協作 Collab/task.md first, then:
#   .\orchestrate-vault.ps1 -Bypass
#
#   # Manual one-liner (interactive console handles Chinese args fine):
#   .\orchestrate-vault.ps1 -Task "把 Agent 代理 補上 2026 multi-agent 段落"
#
#   # Read-only audit:
#   .\orchestrate-vault.ps1 -Sandbox read-only -Task "列出孤島筆記與缺 frontmatter 的檔"
#
# Notes:
#   -Bypass uses --dangerously-bypass-approvals-and-sandbox so a non-interactive
#   shell (Claude) does not hang on the elevated Windows sandbox UAC prompt.

param(
  [Parameter(Position = 0)]
  [string]$Task,

  [ValidateSet("read-only", "workspace-write", "danger-full-access")]
  [string]$Sandbox = "workspace-write",

  [switch]$Bypass
)

$ErrorActionPreference = "Stop"

$VaultRoot       = Split-Path -Parent $PSScriptRoot        # inner vault root
$Codex           = "C:\Users\dan40\AppData\Local\OpenAI\Codex\bin\codex.exe"
$TaskFile        = Join-Path $PSScriptRoot "task.md"
$TaskTemplate    = Join-Path $PSScriptRoot "task-template.md"
$BuildPromptFile = Join-Path $PSScriptRoot "prompts\02-build.md"

if (-not (Test-Path -LiteralPath $Codex))           { throw "Codex CLI not found: $Codex" }
if (-not (Test-Path -LiteralPath $BuildPromptFile)) { throw "Build prompt not found: $BuildPromptFile" }

# If a task string was passed, render task.md from the UTF-8 template.
if ($Task) {
  if (-not (Test-Path -LiteralPath $TaskTemplate)) { throw "Task template not found: $TaskTemplate" }
  $tpl = Get-Content -Raw -Encoding UTF8 -LiteralPath $TaskTemplate
  $tpl = $tpl.Replace("{{TASK}}", $Task)
  Set-Content -LiteralPath $TaskFile -Value $tpl -Encoding UTF8   # PS 5.1 writes UTF-8 with BOM
}
if (-not (Test-Path -LiteralPath $TaskFile)) {
  throw "No task.md found. Pass -Task '...' or create _協作 Collab/task.md first."
}

# Build the codex args (ASCII only).
$codexArgs = @("exec", "--cd", $VaultRoot, "--skip-git-repo-check", "-c", 'service_tier="fast"')
if ($Bypass) { $codexArgs += "--dangerously-bypass-approvals-and-sandbox" }
else         { $codexArgs += @("--sandbox", $Sandbox) }
$codexArgs += "-"   # read the prompt from stdin (avoids native-arg encoding issues)

# Pipe the (Chinese) build prompt via stdin as UTF-8.
$prevEnc = [Console]::InputEncoding
[Console]::InputEncoding = New-Object System.Text.UTF8Encoding $false
try {
  Get-Content -Raw -Encoding UTF8 -LiteralPath $BuildPromptFile | & $Codex @codexArgs
}
finally {
  [Console]::InputEncoding = $prevEnc
}
exit $LASTEXITCODE
