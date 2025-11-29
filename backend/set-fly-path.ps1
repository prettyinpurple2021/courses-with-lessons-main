# Add Fly CLI to PATH for current PowerShell session
$env:PATH += ";C:\Users\prett\.fly\bin"
Write-Host "Fly CLI added to PATH for this session" -ForegroundColor Green
Write-Host "To make it permanent, add this to your PowerShell profile:" -ForegroundColor Yellow
Write-Host '$env:PATH += ";C:\Users\prett\.fly\bin"' -ForegroundColor Cyan

