param([string]$MysqlBin = 'C:\xampp\mysql\bin')
$ErrorActionPreference = 'Stop'
$repoPath = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$install = Join-Path $MysqlBin 'mysql_install_db.exe'
$daemon = Join-Path $MysqlBin 'mysqld.exe'
if (!(Test-Path -LiteralPath $install) -or !(Test-Path -LiteralPath $daemon)) { throw 'Indicá -MysqlBin con una instalación existente de MariaDB para Windows.' }
$dataPath = Join-Path $repoPath ('data\sql-test-' + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $dataPath -Force | Out-Null
$dbPath = Join-Path $dataPath 'db'
$listener = [Net.Sockets.TcpListener]::new([Net.IPAddress]::Loopback, 0)
$listener.Start(); $port = $listener.LocalEndpoint.Port; $listener.Stop()
$testPassword = [guid]::NewGuid().ToString('N')
$previousUrl = $env:MYSQL_TEST_URL
$process = $null
Push-Location $repoPath
try {
  npm run build
  if ($LASTEXITCODE -ne 0) { throw 'Falló la compilación TypeScript' }
  & $install "--datadir=$dbPath" "--password=$testPassword" "--port=$port" --silent *> (Join-Path $dataPath 'init.log')
  if ($LASTEXITCODE -ne 0) { throw "Falló la inicialización; revisá $dataPath\init.log" }
  $mysqlBase = [IO.Path]::GetFullPath((Join-Path $MysqlBin '..'))
  $process = Start-Process -FilePath $daemon -ArgumentList @('--no-defaults', "--basedir=`"$mysqlBase`"", "--datadir=`"$dbPath`"", "--port=$port", '--bind-address=127.0.0.1', '--skip-networking=0', '--console') -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $dataPath 'server.log') -RedirectStandardError (Join-Path $dataPath 'server-error.log')
  $env:MYSQL_TEST_URL = "mysql://root:${testPassword}@127.0.0.1:${port}/curso_node_test"
  node scripts/mysql-ready.js
  if ($LASTEXITCODE -ne 0) { throw "La instancia SQL no inició; revisá $dataPath" }
  node --test test/typescript.test.js
  if ($LASTEXITCODE -ne 0) { throw 'Falló la prueba SQL' }
} finally {
  if ($process -and !$process.HasExited) { Stop-Process -Id $process.Id; $process.WaitForExit() }
  $env:MYSQL_TEST_URL = $previousUrl
  Pop-Location
  # Solo se elimina el directorio único creado por este script, dentro del repositorio.
  $resolvedData = [IO.Path]::GetFullPath($dataPath)
  $allowedPrefix = [IO.Path]::GetFullPath((Join-Path $repoPath 'data\sql-test-'))
  if ($resolvedData.StartsWith($allowedPrefix, [StringComparison]::OrdinalIgnoreCase)) { Remove-Item -LiteralPath $resolvedData -Recurse -Force }
}
