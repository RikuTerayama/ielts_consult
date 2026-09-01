param(
  [int]$Limit = 0,
  [switch]$Apply
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$repoRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot ".."))
$audioDir = [IO.Path]::GetFullPath((Join-Path $repoRoot "public\audio\posts"))
if (-not $audioDir.StartsWith($repoRoot, [StringComparison]::OrdinalIgnoreCase)) {
  throw "音声ディレクトリがリポジトリ外です: $audioDir"
}

$targets = @(Get-ChildItem -LiteralPath $audioDir -File | Where-Object {
  $_.Name -match '^n[a-f0-9]+\.m4a$'
} | Sort-Object Name)
if ($Limit -gt 0) {
  $targets = @($targets | Select-Object -First $Limit)
}
if ($targets.Count -eq 0) {
  throw "対象のGUID音声がありません"
}

Add-Type -AssemblyName System.Runtime.WindowsRuntime

function Await-Operation {
  param(
    [Parameter(Mandatory = $true)]$Operation,
    [Parameter(Mandatory = $true)][Type]$ResultType
  )
  $method = [System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object {
    $_.Name -eq "AsTask" -and
    $_.IsGenericMethodDefinition -and
    $_.GetGenericArguments().Count -eq 1 -and
    $_.GetParameters().Count -eq 1 -and
    $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1'
  } | Select-Object -First 1
  if (-not $method) { throw "IAsyncOperation用AsTaskが見つかりません" }
  $task = $method.MakeGenericMethod($ResultType).Invoke($null, @($Operation))
  $task.GetAwaiter().GetResult()
}

function Await-ActionWithProgress {
  param(
    [Parameter(Mandatory = $true)]$Action,
    [Parameter(Mandatory = $true)][Type]$ProgressType
  )
  $method = [System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object {
    $_.Name -eq "AsTask" -and
    $_.IsGenericMethodDefinition -and
    $_.GetGenericArguments().Count -eq 1 -and
    $_.GetParameters().Count -eq 1 -and
    $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncActionWithProgress`1'
  } | Select-Object -First 1
  if (-not $method) { throw "IAsyncActionWithProgress用AsTaskが見つかりません" }
  $task = $method.MakeGenericMethod($ProgressType).Invoke($null, @($Action))
  $null = $task.GetAwaiter().GetResult()
}

$storageFileType = [Windows.Storage.StorageFile, Windows.Storage, ContentType = WindowsRuntime]
$storageFolderType = [Windows.Storage.StorageFolder, Windows.Storage, ContentType = WindowsRuntime]
$collisionOptionType = [Windows.Storage.CreationCollisionOption, Windows.Storage, ContentType = WindowsRuntime]
$encodingProfileType = [Windows.Media.MediaProperties.MediaEncodingProfile, Windows.Media.MediaProperties, ContentType = WindowsRuntime]
$audioQualityType = [Windows.Media.MediaProperties.AudioEncodingQuality, Windows.Media.MediaProperties, ContentType = WindowsRuntime]
$transcoderType = [Windows.Media.Transcoding.MediaTranscoder, Windows.Media.Transcoding, ContentType = WindowsRuntime]
$prepareResultType = [Windows.Media.Transcoding.PrepareTranscodeResult, Windows.Media.Transcoding, ContentType = WindowsRuntime]

$tempDir = Join-Path $audioDir (".transcode-" + [Guid]::NewGuid().ToString("N"))
$resolvedTempDir = [IO.Path]::GetFullPath($tempDir)
if (-not $resolvedTempDir.StartsWith($audioDir, [StringComparison]::OrdinalIgnoreCase)) {
  throw "一時ディレクトリが音声ディレクトリ外です: $resolvedTempDir"
}
New-Item -ItemType Directory -Path $resolvedTempDir | Out-Null

$results = @()
try {
  $tempFolder = Await-Operation ($storageFolderType::GetFolderFromPathAsync($resolvedTempDir)) $storageFolderType
  foreach ($target in $targets) {
    $source = Await-Operation ($storageFileType::GetFileFromPathAsync($target.FullName)) $storageFileType
    $destination = Await-Operation (
      $tempFolder.CreateFileAsync($target.Name, $collisionOptionType::ReplaceExisting)
    ) $storageFileType

    $profile = $encodingProfileType::CreateM4a($audioQualityType::Low)
    $profile.Audio.Bitrate = 64000
    $profile.Audio.ChannelCount = 1
    $profile.Audio.SampleRate = 44100

    $transcoder = $transcoderType::new()
    $prepared = Await-Operation (
      $transcoder.PrepareFileTranscodeAsync($source, $destination, $profile)
    ) $prepareResultType
    if (-not $prepared.CanTranscode) {
      throw "$($target.Name): 変換できません ($($prepared.FailureReason))"
    }
    Await-ActionWithProgress ($prepared.TranscodeAsync()) ([Double])

    $outputPath = Join-Path $resolvedTempDir $target.Name
    $output = Get-Item -LiteralPath $outputPath
    if ($output.Length -lt 10000 -or $output.Length -ge $target.Length) {
      throw "$($target.Name): 変換後サイズが不正です ($($output.Length) bytes)"
    }
    $results += [PSCustomObject]@{
      Name = $target.Name
      SourcePath = $target.FullName
      OutputPath = $output.FullName
      SourceBytes = $target.Length
      OutputBytes = $output.Length
    }
  }

  if ($Apply) {
    foreach ($result in $results) {
      Move-Item -LiteralPath $result.OutputPath -Destination $result.SourcePath -Force
    }
  } else {
    foreach ($result in $results) {
      Remove-Item -LiteralPath $result.OutputPath
    }
  }
} finally {
  if ((Test-Path -LiteralPath $resolvedTempDir) -and
      @(Get-ChildItem -LiteralPath $resolvedTempDir -Force).Count -eq 0) {
    Remove-Item -LiteralPath $resolvedTempDir -Force
  }
}

$sourceBytes = ($results | Measure-Object -Property SourceBytes -Sum).Sum
$outputBytes = ($results | Measure-Object -Property OutputBytes -Sum).Sum
[PSCustomObject]@{
  Files = $results.Count
  Applied = [bool]$Apply
  SourceBytes = $sourceBytes
  OutputBytes = $outputBytes
  ReductionPercent = [Math]::Round((1 - ($outputBytes / $sourceBytes)) * 100, 1)
} | ConvertTo-Json
