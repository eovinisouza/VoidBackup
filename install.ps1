$ErrorActionPreference = "Stop"

# Configurações
$repo = "eovinisouza/VoidBackup"
$branch = "main"

$steamPluginsPath = "${env:ProgramFiles(x86)}\Steam\plugins\VoidBackup"

Write-Host "Instalador VoidBackup iniciado..."

# Cria diretório de plugin se não existir
if (!(Test-Path $steamPluginsPath)) {
    Write-Host "Criando diretório de plugins em $steamPluginsPath..."
    New-Item -ItemType Directory -Path $steamPluginsPath | Out-Null
}

# Diretório temporário
$tempPath = "$env:TEMP\VoidBackup"

if (Test-Path $tempPath) {
    Remove-Item $tempPath -Recurse -Force
}

New-Item -ItemType Directory -Path $tempPath | Out-Null

Write-Host "Baixando arquivos do GitHub..."

# Baixa a branch principal como ZIP
$url = "https://github.com/$repo/archive/refs/heads/$branch.zip"
Invoke-WebRequest -Uri $url -OutFile "$tempPath\VoidBackup.zip"

Write-Host "Extraindo arquivos..."

Expand-Archive "$tempPath\VoidBackup.zip" -DestinationPath $tempPath -Force

# Localiza a pasta extraída
$sourceFolder = Get-ChildItem $tempPath | Where-Object { $_.PSIsContainer } | Select-Object -First 1

Write-Host "Copiando arquivos para plugins da Steam..."

Copy-Item "$($sourceFolder.FullName)\VoidBackup\*" $steamPluginsPath -Recurse -Force

# Limpa temporários
Remove-Item $tempPath -Recurse -Force

Write-Host "Instalação concluída com sucesso!"
Write-Host "Reinicie o cliente Steam para aplicar o plugin."
