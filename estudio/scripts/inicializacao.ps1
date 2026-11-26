# Liga ou desliga o início do Estúdio (interface + executor) junto com o seu login no Windows.
# Usa a pasta Inicializar do seu usuário (não precisa de administrador). Isto só INICIA os
# programas: retomar produções interrompidas sozinho é outra autorização, na interface.
#
#   powershell -ExecutionPolicy Bypass -File scripts\inicializacao.ps1 -Acao ativar
#   powershell -ExecutionPolicy Bypass -File scripts\inicializacao.ps1 -Acao desativar
#   powershell -ExecutionPolicy Bypass -File scripts\inicializacao.ps1 -Acao status
param([ValidateSet('ativar', 'desativar', 'status')][string]$Acao = 'status')

$ErrorActionPreference = 'Stop'
$pasta = [Environment]::GetFolderPath('Startup')
$atalho = Join-Path $pasta 'Estudio-Video.vbs'
$raiz = Split-Path -Parent $PSScriptRoot
$node = (Get-Command node -ErrorAction SilentlyContinue).Source

switch ($Acao) {
  'ativar' {
    if (-not $node) { Write-Output 'Node.js nao encontrado no PATH.'; exit 1 }
    $iniciar = Join-Path $raiz 'src\iniciar.mjs'
    # VBScript abre o Node sem janela; aspas duplas dobradas por causa do VBScript.
    $vbs = @"
' Criado por estudio\scripts\inicializacao.ps1 - apague este arquivo (ou use -Acao desativar) para nao iniciar mais.
CreateObject("WScript.Shell").Run """$node"" ""$iniciar""", 0, False
"@
    # UTF-16 (Unicode): o caminho do projeto tem acentos e o WSH lê esse formato sem perdas.
    Set-Content -Path $atalho -Value $vbs -Encoding Unicode
    Write-Output "Ativado: $atalho"
  }
  'desativar' {
    if (Test-Path $atalho) { Remove-Item $atalho -Confirm:$false; Write-Output 'Desativado.' } else { Write-Output 'Ja estava desativado.' }
  }
  'status' {
    if (Test-Path $atalho) { Write-Output "Ativo: $atalho" } else { Write-Output 'Inativo.' }
  }
}
