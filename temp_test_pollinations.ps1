$body = @{
    messages = @(
        @{ role = "user"; content = "say hello in one word" }
    )
    model = "openai"
    temperature = 0.7
} | ConvertTo-Json -Compress

try {
    $response = Invoke-RestMethod -Uri "https://text.pollinations.ai/" -Method Post -Body $body -ContentType "application/json" -TimeoutSec 20
    Write-Host "Response: $response"
} catch {
    Write-Host "Error: $_"
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response body: $responseBody"
    }
}
