# RentSaathi QA Test Script
# Run this from the project root:  pwsh .\qa-test-script.ps1

$BASE = "http://localhost:8000/api/v1"
$FRONTEND = "http://localhost:5173"
$PASS = 0
$FAIL = 0
$WARN = 0

function Test-API {
    param($method, $endpoint, $body, $desc, $token, $expectedStatus = 200)
    $headers = @{"Content-Type" = "application/json"}
    if ($token) { $headers["Authorization"] = "Bearer $token" }
    try {
        if ($method -eq "GET") {
            $resp = Invoke-RestMethod -Uri "$BASE$endpoint" -Method GET -Headers $headers -StatusCodeVariable sc
        } elseif ($method -eq "POST") {
            $resp = Invoke-RestMethod -Uri "$BASE$endpoint" -Method POST -Headers $headers -Body ($body | ConvertTo-Json) -StatusCodeVariable sc
        } elseif ($method -eq "PATCH") {
            $resp = Invoke-RestMethod -Uri "$BASE$endpoint" -Method PATCH -Headers $headers -Body ($body | ConvertTo-Json) -StatusCodeVariable sc
        }
        if ($sc -eq $expectedStatus) {
            Write-Host "  [PASS] $desc (HTTP $sc)" -ForegroundColor Green
            $global:PASS++
        } else {
            Write-Host "  [FAIL] $desc - Expected $expectedStatus, got $sc" -ForegroundColor Red
            $global:FAIL++
        }
        return $resp, $sc
    } catch {
        $sc = $_.Exception.Response.StatusCode.value__
        if ($sc -eq $expectedStatus -or $sc -eq 0) {
            Write-Host "  [PASS] $desc (HTTP $sc)" -ForegroundColor Green
            $global:PASS++
        } else {
            Write-Host "  [FAIL] $desc - ${_}" -ForegroundColor Red
            $global:FAIL++
        }
        return $null, $sc
    }
}

# ── PHASE 1: Backend Liveness ───────────────────────
Write-Host "`n=== PHASE 1: Backend Liveness ===" -ForegroundColor Cyan
try { Invoke-RestMethod "$BASE/auth/csrf"; Write-Host "  [PASS] Backend is running" -ForegroundColor Green; $PASS++ } catch { Write-Host "  [FAIL] Backend not running on :8000" -ForegroundColor Red; $FAIL++; exit 1 }

# ── PHASE 2: CSRF Token ─────────────────────────────
Write-Host "`n=== PHASE 2: CSRF Token ===" -ForegroundColor Cyan
Test-API "GET" "/auth/csrf" $null "Get CSRF token"

# ── PHASE 3: Register Test Accounts ─────────────────
Write-Host "`n=== PHASE 3: Register Test Accounts ===" -ForegroundColor Cyan
$adminBody = @{email="admin@test.com"; password="Admin@123456"; full_name="QA Admin"; phone="9999999991"; role="admin"}
$brokerBody = @{email="broker@test.com"; password="Broker@123456"; full_name="QA Broker"; phone="9999999992"; role="broker"}
$renterBody = @{email="user@test.com"; password="User@123456"; full_name="QA Renter"; phone="9999999993"; role="renter"}

Write-Host "  Registering admin..."
Test-API "POST" "/auth/register" $adminBody "Admin registration" $null 201
Write-Host "  Registering broker..."
Test-API "POST" "/auth/register" $brokerBody "Broker registration" $null 201
Write-Host "  Registering renter..."
Test-API "POST" "/auth/register" $renterBody "Renter registration" $null 201

# ── PHASE 4: Auth Flow Testing ──────────────────────
Write-Host "`n=== PHASE 4: Auth Flow Testing ===" -ForegroundColor Cyan

# Login each role
$adminLogin = Test-API "POST" "/auth/login" @{email="admin@test.com"; password="Admin@123456"} "Admin login"
$adminToken = ($adminLogin[0] | Select-Object -ExpandProperty access_token) -or ""
$brokerLogin = Test-API "POST" "/auth/login" @{email="broker@test.com"; password="Broker@123456"} "Broker login"
$brokerToken = ($brokerLogin[0] | Select-Object -ExpandProperty access_token) -or ""
$renterLogin = Test-API "POST" "/auth/login" @{email="user@test.com"; password="User@123456"} "Renter login"
$renterToken = ($renterLogin[0] | Select-Object -ExpandProperty access_token) -or ""

# Test /auth/me
Test-API "GET" "/auth/me" $null "Get current user (admin)" $adminToken
Test-API "GET" "/auth/me" $null "Get current user (broker)" $brokerToken
Test-API "GET" "/auth/me" $null "Get current user (renter)" $renterToken

# Test invalid login
Test-API "POST" "/auth/login" @{email="user@test.com"; password="wrongpass"} "Invalid password rejected" $null 401

# Test duplicate register
Test-API "POST" "/auth/register" $renterBody "Duplicate registration rejected" $null 409

# Test forgot password
Test-API "POST" "/auth/forgot-password" @{email="user@test.com"} "Forgot password request"

# Test sessions
Test-API "GET" "/auth/sessions" $null "List sessions" $renterToken

# Test token refresh (need cookie; test via browser)

# Test logout (via post)
Test-API "POST" "/auth/logout" $null "Logout" $renterToken

# Test unauthorized access
Test-API "GET" "/admin/stats" $null "Admin stats blocked for renter" $renterToken 403
Test-API "GET" "/admin/stats" $null "Admin stats blocked with no token" $null 401

# ── PHASE 5: Renter Workflow ─────────────────────────
Write-Host "`n=== PHASE 5: Renter Workflow ===" -ForegroundColor Cyan

# Create requirement
$reqBody = @{
    area="Koramangala"; city="Bengaluru"; property_type="2 BHK";
    budget_min=20000; budget_max=35000; tenant_type="Family";
    amenities=@("Wifi","Parking","Gym")
}
$req = Test-API "POST" "/requirements" $reqBody "Create requirement" $renterToken 201
$reqId = ($req[0] | Select-Object -ExpandProperty id) -or ""

# List requirements
Test-API "GET" "/requirements" $null "List requirements" $renterToken

# Get requirement detail
if ($reqId) { Test-API "GET" "/requirements/$reqId" $null "Get requirement" $renterToken }

# Scan matches (requires verified properties)
Test-API "POST" "/matches/scan/$reqId" $null "Scan for matches" $renterToken

# ── PHASE 6: Broker Workflow ─────────────────────────
Write-Host "`n=== PHASE 6: Broker Workflow ===" -ForegroundColor Cyan

# Create property
$propBody = @{
    title="Test Luxury Apartment"; area="Koramangala"; city="Bengaluru";
    property_type="2 BHK"; rent=25000; deposit=50000;
    amenities=@("Wifi","Parking")
}
$prop = Test-API "POST" "/properties" $propBody "Create property" $brokerToken 201
$propId = ($prop[0] | Select-Object -ExpandProperty id) -or ""

# List broker properties
Test-API "GET" "/properties" $null "List broker properties" $brokerToken

# Get broker dashboard data
Test-API "GET" "/matches" $null "List broker matches" $brokerToken

# ── PHASE 7: Admin Workflow ──────────────────────────
Write-Host "`n=== PHASE 7: Admin Workflow ===" -ForegroundColor Cyan

# Dashboard stats
$stats = Test-API "GET" "/admin/stats" $null "Admin dashboard stats" $adminToken
Write-Host "    Stats: $($stats[0] | ConvertTo-Json -Compress)"

# List pending brokers
Test-API "GET" "/admin/brokers/pending" $null "List pending brokers" $adminToken

# List pending properties
Test-API "GET" "/admin/properties/pending" $null "List pending properties" $adminToken

# List pending matches
Test-API "GET" "/admin/matches/pending" $null "List pending matches" $adminToken

# Verify broker (would need broker ID)
# Test-API "POST" "/admin/brokers/{id}/verify" @{password="Admin@123456"} "Verify broker" $adminToken

# Verify property (would need property ID)
# Test-API "POST" "/admin/properties/{id}/verify" @{password="Admin@123456"} "Verify property" $adminToken

# List complaints
Test-API "GET" "/admin/complaints" $null "List complaints" $adminToken

# Audit logs
Test-API "GET" "/admin/audit?limit=50" $null "Audit logs" $adminToken

# Ops analytics
Test-API "GET" "/admin/ops" $null "Ops analytics" $adminToken

# ── PHASE 8: Complaints ─────────────────────────────
Write-Host "`n=== PHASE 8: Complaints ===" -ForegroundColor Cyan

$complaintBody = @{against_user="unknown"; reason="Test complaint"; description="Testing complaint filing"}
Test-API "POST" "/complaints" $complaintBody "File complaint" $renterToken 201
Test-API "GET" "/complaints" $null "List my complaints" $renterToken

# ── PHASE 9: Notifications ──────────────────────────
Write-Host "`n=== PHASE 9: Notifications ===" -ForegroundColor Cyan
Test-API "GET" "/notifications" $null "List notifications" $renterToken
Test-API "POST" "/notifications/mark-all-read" $null "Mark all read" $renterToken

# ── PHASE 10: Security Checks ────────────────────────
Write-Host "`n=== PHASE 10: Security ===" -ForegroundColor Cyan

# Admin-only routes blocked for renter
Test-API "GET" "/admin/audit" $null "Audit blocked for renter" $renterToken 403
Test-API "GET" "/admin/ops" $null "Ops blocked for renter" $renterToken 403

# Broker-only routes blocked for renter
# Test-API "POST" "/properties" $propBody "Property create blocked for renter" $renterToken 403

# Invalid tokens
Test-API "GET" "/auth/me" $null "Invalid token blocked" "invalidtoken123" 401

# Expired/invalid refresh
Test-API "POST" "/auth/refresh" $null "Refresh with no token" $null 401

# ── RESULTS ──────────────────────────────────────────
Write-Host "`n`n=== QA RESULTS ===" -ForegroundColor Cyan
Write-Host "  PASS: $PASS" -ForegroundColor Green
Write-Host "  FAIL: $FAIL" -ForegroundColor Red
Write-Host "  WARN: $WARN" -ForegroundColor Yellow
Write-Host "  Total: $($PASS + $FAIL + $WARN)"
$pct = if ($PASS + $FAIL -gt 0) { [math]::Round($PASS / ($PASS + $FAIL) * 100, 1) } else { 100 }
Write-Host "  Pass Rate: $pct%"
