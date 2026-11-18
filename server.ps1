$port = 8080
$listener = New-Object System.Net.HttpListener

function Try-Listen($p) {
    $l = New-Object System.Net.HttpListener
    $l.Prefixes.Add("http://localhost:$p/")
    try {
        $l.Start()
        return $l
    } catch {
        return $null
    }
}

$listener = Try-Listen 8080
if (-not $listener) {
    $port = 8085
    $listener = Try-Listen 8085
}
if (-not $listener) {
    $port = 3000
    $listener = Try-Listen 3000
}

if (-not $listener) {
    Write-Error "Could not bind to port 8080, 8085, or 3000."
    exit 1
}

Write-Host "ApexBank Server started at http://localhost:$port/"
$root = $PSScriptRoot
if (-not $root) { $root = (Get-Location).Path }

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $relPath = $request.Url.LocalPath.TrimStart('/')
        if ([string]::IsNullOrWhiteSpace($relPath) -or $relPath -eq '/') {
            $relPath = 'index.html'
        }
        $filePath = [System.IO.Path]::Combine($root, $relPath.Replace('/', [System.IO.Path]::DirectorySeparatorChar))

        if ([System.IO.File]::Exists($filePath)) {
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $mime = switch ($ext) {
                '.html' { 'text/html; charset=utf-8' }
                '.css'  { 'text/css; charset=utf-8' }
                '.js'   { 'application/javascript; charset=utf-8' }
                '.json' { 'application/json; charset=utf-8' }
                '.png'  { 'image/png' }
                '.jpg'  { 'image/jpeg' }
                '.svg'  { 'image/svg+xml' }
                '.ico'  { 'image/x-icon' }
                default { 'application/octet-stream' }
            }
            $response.ContentType = $mime
            $response.ContentLength64 = $bytes.Length
            $response.StatusCode = 200
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $err = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
            $response.ContentLength64 = $err.Length
            $response.OutputStream.Write($err, 0, $err.Length)
        }
        $response.OutputStream.Close()
    } catch {
        # Ignore individual request errors and keep serving
    }
}
