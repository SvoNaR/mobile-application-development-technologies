# Установка Flutter SDK в профиль пользователя (без прав администратора).
# Ожидаемый размер архива ~1,75 ГБ. После успеха закройте и снова откройте cmd/PowerShell
# или выполните:  $env:Path = "$env:USERPROFILE\develop\flutter\bin;" + $env:Path

$ErrorActionPreference = 'Stop'
$base = Join-Path $env:USERPROFILE 'develop'
$zip = Join-Path $base 'flutter_windows_stable.zip'
$url = 'https://storage.googleapis.com/flutter_infra_release/releases/stable/windows/flutter_windows_3.41.6-stable.zip'
$expected = 1836867447

New-Item -ItemType Directory -Force -Path $base | Out-Null

if (-not (Test-Path (Join-Path $base 'flutter\bin\flutter.bat'))) {
  $len = if (Test-Path $zip) { (Get-Item $zip).Length } else { 0 }
  if ($len -gt 0 -and $len -lt $expected) {
    Write-Host "Удаляю неполный архив ($len из $expected байт): $zip"
    Remove-Item $zip -Force
    $len = 0
  }
  if ($len -lt $expected) {
    Write-Host "Скачивание Flutter (~1,7 ГБ)..."
    Invoke-WebRequest -Uri $url -OutFile $zip -UseBasicParsing
  }
  Write-Host 'Распаковка (может занять несколько минут)...'
  Expand-Archive -Path $zip -DestinationPath $base -Force
  Remove-Item $zip -Force -ErrorAction SilentlyContinue
} else {
  Write-Host 'Flutter уже есть:' (Join-Path $base 'flutter')
}

$flutterBin = (Resolve-Path (Join-Path $base 'flutter\bin')).Path
$userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
if ($userPath -notlike "*${flutterBin}*") {
  [Environment]::SetEnvironmentVariable('Path', $userPath.TrimEnd(';') + ';' + $flutterBin, 'User')
  Write-Host "Добавлено в PATH пользователя: $flutterBin"
} else {
  Write-Host 'PATH пользователя уже содержит flutter\bin'
}

$env:Path = $flutterBin + ';' + $env:Path
& (Join-Path $flutterBin 'flutter.bat') doctor

Write-Host ''
Write-Host 'Откройте НОВОЕ окно терминала, чтобы команда flutter работала везде, или в этом сеансе PATH уже обновлён выше.'
