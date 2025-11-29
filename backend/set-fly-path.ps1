# Add Fly CLI to PATH for current PowerShell session
# Fly CLI is typically installed to ~/.fly/bin (or %USERPROFILE%\.fly\bin on Windows)
$flyBinPath = Join-Path $env:USERPROFILE ".fly\bin"
if (Test-Path $flyBinPath) {
    $env:PATH += ";$flyBinPath"
    Write-Host "Fly CLI added to PATH for this session" -ForegroundColor Green
} else {
    Write-Host "Fly CLI not found at $flyBinPath" -ForegroundColor Yellow
    Write-Host "Install it with: iwr https://fly.io/install.ps1 -useb | iex" -ForegroundColor Yellow
}
Write-Host "To make it permanent, add this to your PowerShell profile:" -ForegroundColor Cyan
Write-Host "`$env:PATH += `";`$env:USERPROFILE\.fly\bin`"" -ForegroundColor Cyan

