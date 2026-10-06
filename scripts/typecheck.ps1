$out = npx tsc --noEmit 2>&1 | Out-String
$errors = ($out -split "`n" | Where-Object { $_ -match 'error TS' })
if ($errors.Count -gt 0) {
  Write-Output "FAILED ($($errors.Count) errors)"
  $errors | Select-Object -First 20
} else {
  Write-Output "TYPECHECK CLEAN"
}