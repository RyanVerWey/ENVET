param([Parameter(Mandatory=$true)][string]$DonationPath,[Parameter(Mandatory=$true)][string]$LiabilityPath)
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
$taskExpected=Get-Content -LiteralPath (Join-Path $PSScriptRoot '../src/lib/forms/source-templates.json') -Raw -Encoding UTF8 | ConvertFrom-Json
foreach($taskSource in @(@{kind='donation';path=$DonationPath},@{kind='liability';path=$LiabilityPath})) {
 $taskDefinition=$taskExpected.($taskSource.kind)
 $taskHasher=[Security.Cryptography.SHA256]::Create()
 $taskStream=[IO.File]::OpenRead($taskSource.path)
 try {$taskHash=([BitConverter]::ToString($taskHasher.ComputeHash($taskStream))).Replace('-','').ToLowerInvariant()}finally{$taskStream.Dispose();$taskHasher.Dispose()}
 if($taskHash -ne $taskDefinition.sourceSha256){throw 'Source file hash mismatch'}
 $taskZip=[IO.Compression.ZipFile]::OpenRead($taskSource.path)
 try {
  foreach($taskPart in @(@{part='word/document.xml';paragraphs=$taskDefinition.paragraphs})+$taskDefinition.extraParts) {
   $taskEntry=$taskZip.GetEntry($taskPart.part);if(!$taskEntry){throw 'Source XML part missing'}
   $taskReader=[IO.StreamReader]::new($taskEntry.Open());[xml]$taskXml=$taskReader.ReadToEnd();$taskReader.Dispose()
   $taskNs=[Xml.XmlNamespaceManager]::new($taskXml.NameTable);$taskNs.AddNamespace('w','http://schemas.openxmlformats.org/wordprocessingml/2006/main')
   $taskActual=@($taskXml.SelectNodes('//w:p',$taskNs)|ForEach-Object {
    $taskLine=($_.SelectNodes('.//w:t | .//w:tab | .//w:br | .//w:cr',$taskNs)|ForEach-Object {if($_.LocalName -eq 't'){$_.InnerText}elseif($_.LocalName -eq 'tab'){[string][char]9}else{[string][char]10}})-join ''
    if($taskLine.Trim().Length -gt 0){$taskLine}
   })
   if(($taskActual|ConvertTo-Json -Compress) -cne (@($taskPart.paragraphs)|ConvertTo-Json -Compress)){throw "Source text mismatch: $($taskSource.kind) / $($taskPart.part)"}
  }
 }finally{$taskZip.Dispose()}
 Write-Output "PASS $($taskSource.kind): original file hash, body and all text parts match; original unchanged. Visual layout is not verified."
}
