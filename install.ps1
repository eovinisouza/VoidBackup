$ErrorActionPreference = "Stop"

$repo   = "eovinisouza/VoidBackup"
$branch = "main"

$steamPluginsRoot = "${env:ProgramFiles(x86)}\Steam\plugins"
$pluginPath       = "$steamPluginsRoot\VoidBackup"

$tempPath = "$env:TEMP\VoidBackupInstall"
$zipPath  = "$tempPath\VoidBackup.zip"

Write-Host "Instalando VoidBackup..."

# Garante a pasta plugins
if (!(Test-Path $steamPluginsRoot)) {
    New-Item -ItemType Directory -Path $steamPluginsRoot | Out-Null
}

# Remove instalação anterior
if (Test-Path $pluginPath) {
    Write-Host "Removendo instalação anterior..."
    Remove-Item $pluginPath -Recurse -Force
}

# Prepara pasta temporária
if (Test-Path $tempPath) {
    Remove-Item $tempPath -Recurse -Force
}

New-Item -ItemType Directory -Path $tempPath | Out-Null

Write-Host "Baixando repositório..."
Invoke-WebRequest `
    -Uri "https://github.com/$repo/archive/refs/heads/$branch.zip" `
    -OutFile $zipPath

Write-Host "Extraindo arquivos..."
Expand-Archive -Path $zipPath -DestinationPath $tempPath -Force

# Caminho REAL do plugin dentro do zip
$extractedPluginPath = Join-Path `
    (Get-ChildItem $tempPath | Where-Object { $_.PSIsContainer } | Select-Object -First 1).FullName `
    "VoidBackup"

if (!(Test-Path $extractedPluginPath)) {
    throw "Estrutura do repositório inesperada. Pasta VoidBackup não encontrada."
}

Write-Host "Copiando arquivos para a Steam..."
Copy-Item $extractedPluginPath $pluginPath -Recurse -Force

Write-Host "Limpando arquivos temporários..."

# Remove ZIP explicitamente
if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force -ErrorAction SilentlyContinue
}

# Pequena pausa para garantir liberação do arquivo
Start-Sleep -Milliseconds 300

# Remove pasta temporária inteira
if (Test-Path $tempPath) {
    Remove-Item $tempPath -Recurse -Force
}

exit
  Write-Host "GG"
