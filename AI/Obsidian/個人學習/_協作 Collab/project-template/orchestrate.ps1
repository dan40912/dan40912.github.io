# orchestrate.ps1  (ASCII-only) -- put in a project root.
# Drive Codex to implement from docs/spec.md, or integrate from docs/review.md.
#
# Usage:
#   .\orchestrate.ps1            # implement MVP from docs/spec.md
#   .\orchestrate.ps1 -Integrate # apply docs/review.md, re-test
#   .\orchestrate.ps1 -Bypass    # add if a non-interactive shell hangs on the sandbox

param([switch]$Integrate, [switch]$Bypass)

$ErrorActionPreference = "Stop"
$proj  = Split-Path -Parent $MyInvocation.MyCommand.Path
$codex = "C:\Users\dan40\AppData\Local\OpenAI\Codex\bin\codex.exe"
if (-not (Test-Path $codex)) {
  $c = Get-Command codex -ErrorAction SilentlyContinue
  if ($c) { $codex = $c.Source } else { throw "codex.exe not found." }
}

if ($Integrate) {
  $prompt = "Read docs/review.md. Decide which suggestions to adopt and edit the code directly. Re-test. In docs/report.md, list adopted vs not-adopted items with reasons."
} else {
  $prompt = "Read AGENTS.md (project root) and docs/spec.md. Build the MVP: centralize config/data, make the UI operable, start the local dev server and report its URL, self-check core logic and edge cases. Write what you did into docs/report.md."
}

$a = @("exec", "--cd", $proj, "-c", 'service_tier="fast"')
# Projects are usually git repos; add --skip-git-repo-check if not.
if ($Bypass) { $a += "--dangerously-bypass-approvals-and-sandbox" }
else         { $a += @("--sandbox", "workspace-write") }
$a += $prompt   # prompt is ASCII, safe to pass as an argument

& $codex @a
Write-Host "Next: in Claude Code say: review codex's changes into docs/review.md" -ForegroundColor Yellow
