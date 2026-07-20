# ZAYDEN D1 — item 12: files the newest video into the film library with a name
# that's findable in 2030. Right-click > Run with PowerShell.
$films = Join-Path $PSScriptRoot "01-FILM\game-film"
if (!(Test-Path $films)) { New-Item -ItemType Directory -Path $films | Out-Null }
$src = @("$env:USERPROFILE\Downloads","$env:USERPROFILE\Videos","$env:USERPROFILE\OneDrive\Desktop") |
  Where-Object { Test-Path $_ } |
  ForEach-Object { Get-ChildItem $_ -File -Include *.mp4,*.mov,*.mkv -ErrorAction SilentlyContinue } |
  Sort-Object LastWriteTime -Descending | Select-Object -First 1
if (!$src) { Write-Host "No video found in Downloads/Videos/Desktop."; Read-Host "Enter to close"; exit }
Write-Host "Newest video: $($src.Name)  ($([math]::Round($src.Length/1MB)) MB, $($src.LastWriteTime.ToString('MMM d')))"
$date = Read-Host "Game date (YYYY-MM-DD, Enter = today)"
if (!$date) { $date = Get-Date -Format "yyyy-MM-dd" }
$opp = Read-Host "Opponent (e.g. foothill)"
if (!$opp) { $opp = "unknown" }
$kind = Read-Host "Type: g=game, h=highlight, t=training (Enter = g)"
$folder = switch ($kind) { "h" { "..\highlights" } "t" { "..\training-clips" } default { "." } }
$destDir = Resolve-Path (Join-Path $films $folder)
$dest = Join-Path $destDir ("$date-$($opp.ToLower() -replace '[^a-z0-9]','')" + $src.Extension)
Move-Item $src.FullName $dest
Write-Host "Filed: $dest"
Write-Host "Now tag the key plays in the app (PUSH > Film Room) while it's fresh."
Read-Host "Enter to close"
