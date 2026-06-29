# codex-lib.ps1  (ASCII-only on purpose: avoids PS 5.1 Big5 misparse)
# Shared helpers: locate codex.exe and invoke `codex exec` safely.

function Get-CodexPath {
    # Prefer the known full path; the WindowsApps codex.exe on PATH can return "access denied".
    $known = "C:\Users\dan40\AppData\Local\OpenAI\Codex\bin\codex.exe"
    if (Test-Path $known) { return $known }
    $c = Get-Command codex -ErrorAction SilentlyContinue
    if ($c) { return $c.Source }
    throw "codex.exe not found. Install Codex CLI or update this path."
}

function Invoke-Codex {
    param(
        [Parameter(Mandatory=$true)][string]$PromptFile,   # path to a UTF-8 prompt .md
        [Parameter(Mandatory=$true)][string]$WorkDir,
        [ValidateSet("read-only","workspace-write","danger-full-access")]
        [string]$Sandbox = "workspace-write",
        [switch]$Bypass,                                    # skip elevated sandbox/UAC (non-interactive)
        [string]$LogFile
    )
    $codex = Get-CodexPath
    # -c service_tier="fast": override config.toml (exec only accepts fast/flex).
    # --skip-git-repo-check: vault is not a git repo.
    $a = @("exec", "--skip-git-repo-check", "-c", 'service_tier="fast"', "--cd", $WorkDir)
    if ($Bypass) { $a += "--dangerously-bypass-approvals-and-sandbox" }
    else         { $a += @("--sandbox", $Sandbox) }
    $a += "-"   # read prompt from stdin (avoids native-arg encoding issues)

    $prev = [Console]::InputEncoding
    [Console]::InputEncoding = New-Object System.Text.UTF8Encoding $false
    try {
        if ($LogFile) {
            Get-Content -Raw -Encoding UTF8 -LiteralPath $PromptFile | & $codex @a *> $LogFile
        } else {
            Get-Content -Raw -Encoding UTF8 -LiteralPath $PromptFile | & $codex @a
        }
    }
    finally { [Console]::InputEncoding = $prev }
}
