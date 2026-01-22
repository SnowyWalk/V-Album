# migrate_auto.ps1
$env:DOTNET_CLI_UI_LANGUAGE = "en-US"
# chcp 65001 | Out-Null
# [Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$ErrorActionPreference = "Stop"

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$migrationName = "Auto_$timestamp"

$scriptDir = $PSScriptRoot  # <-- 변경된 핵심
$projectPath = Join-Path $scriptDir "..\Server.csproj"  # <-- 변경됨
$projectPath = (Resolve-Path $projectPath).Path         # <-- 변경됨 (절대경로로 고정)

if (-not (Test-Path $projectPath)) {
    Write-Host "❌ 프로젝트 파일을 찾을 수 없음: $projectPath" -ForegroundColor Red
    Write-Host "현재 작업 폴더: $(Get-Location)" -ForegroundColor Yellow
    exit 1
}

Write-Host "Migration Name: $migrationName" -ForegroundColor Yellow
Write-Host "Project: $projectPath" -ForegroundColor Cyan

# ✅ [추가] 먼저 빌드해서 '진짜 에러'를 콘솔에 출력
Write-Host "=== dotnet build ===" -ForegroundColor Cyan
dotnet build $projectPath -v minimal
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build 실패 (위 로그가 원인)" -ForegroundColor Red
    exit 1
}

# 1. Migration 추가
Write-Host "=== dotnet ef migrations add ===" -ForegroundColor Cyan
dotnet ef migrations add $migrationName `
    --project $projectPath `
    --startup-project $projectPath `
    -v
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Migration add 실패" -ForegroundColor Red
    exit 1
}

# 2. Database 업데이트
Write-Host "=== dotnet ef database update ===" -ForegroundColor Cyan
dotnet ef database update `
    --project $projectPath `
    --startup-project $projectPath `
    -v
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Database update 실패" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Auto Migration 완료" -ForegroundColor Green
