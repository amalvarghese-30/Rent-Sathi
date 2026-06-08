#!/usr/bin/env python3
"""RentSaathi comprehensive integration test - tests ALL APIs end-to-end."""
import requests, sys, json, time
from datetime import datetime

BASE = "http://localhost:8000/api/v1"
PASS, FAIL, WARN = 0, 0, 0
results = []
tokens = {"admin": None, "broker": None, "renter": None}
resources = {}  # Track created resource IDs

def test(method, endpoint, desc, expected=200, body=None, token=None, auth_fail=False):
    global PASS, FAIL, WARN
    url = f"{BASE}{endpoint}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"

    try:
        if method == "GET":
            r = requests.get(url, headers=headers, timeout=10)
        elif method == "POST":
            r = requests.post(url, headers=headers, json=body, timeout=10)
        elif method == "PATCH":
            r = requests.patch(url, headers=headers, json=body, timeout=10)
        elif method == "DELETE":
            r = requests.delete(url, headers=headers, json=body, timeout=10)

        status = "PASS" if r.status_code == expected else "FAIL"
        if status == "PASS":
            PASS += 1
        else:
            FAIL += 1
        detail = r.json() if r.text else ""
        print(f"  [{status}] {desc} -> HTTP {r.status_code}" + (f" | {str(detail)[:80]}" if status == "FAIL" else ""))
        if status == "FAIL":
            results.append(f"FAIL: {desc} - expected {expected}, got {r.status_code}: {detail}")
        return r.json() if r.text else {}
    except Exception as e:
        FAIL += 1
        print(f"  [FAIL] {desc} -> ERROR: {e}")
        results.append(f"FAIL: {desc} - {e}")
        return {}

print("=" * 60)
print("RENTSAATHI FULL API QA TEST")
print("=" * 60)

# ──────────────────────────────────────────────────
print(f"\n{'='*60}\nPHASE 1: Backend Health\n{'='*60}")
test("GET", "/auth/csrf", "CSRF token endpoint", 200)

# ──────────────────────────────────────────────────
print(f"\n{'='*60}\nPHASE 2: Auth - Register\n{'='*60}")

# Register admin
r = test("POST", "/auth/register", "Register admin", 201, {
    "email": "admin@test.com", "password": "Admin@123456",
    "full_name": "Test Admin", "phone": "9999999991", "role": "admin"
})

# Register broker
r = test("POST", "/auth/register", "Register broker", 201, {
    "email": "broker@test.com", "password": "Broker@123456",
    "full_name": "Test Broker", "phone": "9999999992", "role": "broker"
})

# Register renter
r = test("POST", "/auth/register", "Register renter", 201, {
    "email": "user@test.com", "password": "User@123456",
    "full_name": "Test Renter", "phone": "9999999993", "role": "renter"
})

# Duplicate register
test("POST", "/auth/register", "Duplicate registration rejected", 409, {
    "email": "user@test.com", "password": "User@123456",
    "full_name": "Test", "phone": "999", "role": "renter"
})

# Weak password
test("POST", "/auth/register", "Weak password accepted (dev mode)", 201, {
    "email": "weakpw@test.com", "password": "123",
    "full_name": "Weak", "phone": "999", "role": "renter"
})

# ──────────────────────────────────────────────────
print(f"\n{'='*60}\nPHASE 3: Auth - Login\n{'='*60}")

r = requests.post(f"{BASE}/auth/login", json={"email": "admin@test.com", "password": "Admin@123456"}, timeout=10)
print(f"  Admin login HTTP {r.status_code}")
if r.status_code == 200:
    tokens["admin"] = r.json().get("access_token", "")
    print(f"  Admin token: {tokens['admin'][:30]}...")

r = requests.post(f"{BASE}/auth/login", json={"email": "broker@test.com", "password": "Broker@123456"}, timeout=10)
print(f"  Broker login HTTP {r.status_code}")
if r.status_code == 200:
    tokens["broker"] = r.json().get("access_token", "")

r = requests.post(f"{BASE}/auth/login", json={"email": "user@test.com", "password": "User@123456"}, timeout=10)
print(f"  Renter login HTTP {r.status_code}")
if r.status_code == 200:
    tokens["renter"] = r.json().get("access_token", "")

# Invalid login
test("POST", "/auth/login", "Invalid credentials rejected", 401, {"email": "user@test.com", "password": "wrongpassword"})

# ──────────────────────────────────────────────────
print(f"\n{'='*60}\nPHASE 4: Auth - Token & Sessions\n{'='*60}")

test("GET", "/auth/me", "Admin /auth/me", 200, token=tokens["admin"])
test("GET", "/auth/me", "Broker /auth/me", 200, token=tokens["broker"])
test("GET", "/auth/me", "Renter /auth/me", 200, token=tokens["renter"])
test("GET", "/auth/me", "No token -> 401", 401)
test("GET", "/auth/me", "Invalid token -> 401", 401, token="bad_token_here")
test("GET", "/auth/sessions", "List admin sessions", 200, token=tokens["admin"])

# Forgot password
test("POST", "/auth/forgot-password", "Forgot password request", 200, {"email": "user@test.com"})

# ──────────────────────────────────────────────────
print(f"\n{'='*60}\nPHASE 5: Renter - Requirements\n{'='*60}")

req = {
    "area": "Koramangala", "city": "Bengaluru", "property_type": "2 BHK",
    "budget_min": 20000, "budget_max": 35000, "tenant_type": "Family",
    "amenities": ["Wifi", "Parking", "Gym"]
}
r = test("POST", "/requirements", "Create requirement", 201, req, token=tokens["renter"])
if r and "id" in r:
    resources["req_id"] = r["id"]
    print(f"    Requirement ID: {r['id']}")

test("GET", "/requirements", "List requirements", 200, token=tokens["renter"])

if resources.get("req_id"):
    test("GET", f"/requirements/{resources['req_id']}", "Get requirement detail", 200, token=tokens["renter"])
    # Update requirement
    test("PATCH", f"/requirements/{resources['req_id']}", "Update requirement", 200,
         {"budget_max": 40000, "tenant_type": "Bachelor"}, token=tokens["renter"])

# Renter cannot create properties
test("POST", "/properties", "Renter cannot create property", 403,
     {"title": "X", "area": "X", "city": "X", "rent": 10000, "property_type": "1 BHK"}, token=tokens["renter"])

# ──────────────────────────────────────────────────
print(f"\n{'='*60}\nPHASE 6: Broker - Properties\n{'='*60}")

prop = {
    "title": "Skyline Heights 2BHK", "area": "Koramangala", "city": "Bengaluru",
    "property_type": "2 BHK", "rent": 25000, "deposit": 50000,
    "amenities": ["Wifi", "Parking", "Gym"]
}
r = test("POST", "/properties", "Create property", 201, prop, token=tokens["broker"])
if r and "id" in r:
    resources["prop_id"] = r["id"]
    print(f"    Property ID: {r['id']}")

test("GET", "/properties", "List broker properties", 200, token=tokens["broker"])
test("GET", "/requirements", "Broker lists requirements", 200, token=tokens["broker"])

# ──────────────────────────────────────────────────
print(f"\n{'='*60}\nPHASE 7: Admin - Dashboard & Verification\n{'='*60}")

if tokens["admin"]:
    # Dashboard stats
    r = test("GET", "/admin/stats", "Admin dashboard stats", 200, token=tokens["admin"])
    if r:
        print(f"    Stats: {json.dumps(r, indent=2)}")

    # Pending brokers
    r = test("GET", "/admin/brokers/pending", "List pending brokers", 200, token=tokens["admin"])

    # Pending properties
    test("GET", "/admin/properties/pending", "List pending properties", 200, token=tokens["admin"])

    # Pending matches
    test("GET", "/admin/matches/pending", "List pending matches", 200, token=tokens["admin"])

    # Audit logs
    test("GET", "/admin/audit?limit=50", "Audit logs", 200, token=tokens["admin"])

    # Ops analytics
    test("GET", "/admin/ops", "Ops analytics", 200, token=tokens["admin"])

    # Complaints list (admin)
    test("GET", "/admin/complaints", "Admin list complaints", 200, token=tokens["admin"])

    # Property expiry check
    test("POST", "/admin/properties/check-expiry", "Property expiry check", 200, token=tokens["admin"])

# ──────────────────────────────────────────────────
print(f"\n{'='*60}\nPHASE 8: Notifications\n{'='*60}")

test("GET", "/notifications", "List renter notifications", 200, token=tokens["renter"])
test("POST", "/notifications/mark-all-read", "Mark all notifications read", 200, token=tokens["renter"])

# ──────────────────────────────────────────────────
print(f"\n{'='*60}\nPHASE 9: Complaints\n{'='*60}")

r = test("POST", "/complaints", "File complaint", 201,
    {"against_user": "broker@test.com", "reason": "Test", "description": "Testing complaint flow"},
    token=tokens["renter"])
if r and "id" in r:
    resources["complaint_id"] = r["id"]

test("GET", "/complaints", "List my complaints", 200, token=tokens["renter"])

# ──────────────────────────────────────────────────
print(f"\n{'='*60}\nPHASE 10: Security - Permission Checks\n{'='*60}")

# Admin routes blocked for non-admins
test("GET", "/admin/stats", "Admin stats blocked for renter", 403, token=tokens["renter"])
test("GET", "/admin/audit", "Audit blocked for broker", 403, token=tokens["broker"])
test("GET", "/admin/ops", "Ops blocked for renter", 403, token=tokens["renter"])
test("POST", "/admin/properties/check-expiry", "Expiry check blocked for renter", 403, token=tokens["renter"])
test("GET", "/admin/complaints", "Complaints list blocked for renter", 403, token=tokens["renter"])

# ──────────────────────────────────────────────────
print(f"\n{'='*60}\nPHASE 11: Match Engine\n{'='*60}")

# Scan matches for renter's requirement
if resources.get("req_id"):
    test("POST", f"/matches/scan/{resources['req_id']}", "Scan matches", 200, token=tokens["renter"])

# List matches
test("GET", "/matches", "List renter matches", 200, token=tokens["renter"])

# ──────────────────────────────────────────────────
print(f"\n{'='*60}\nPHASE 12: Logout\n{'='*60}")

test("POST", "/auth/logout", "Renter logout", 200, token=tokens["renter"])
test("GET", "/auth/me", "Logged out - /auth/me fails", 401, token=tokens["renter"])

# ──────────────────────────────────────────────────
print(f"\n{'='*60}\nFINAL RESULTS\n{'='*60}")
print(f"  PASS: {PASS}")
print(f"  FAIL: {FAIL}")
print(f"  WARN: {WARN}")
total = PASS + FAIL + WARN
pct = round(PASS / total * 100, 1) if total else 0
print(f"  Total: {total}")
print(f"  Pass Rate: {pct}%")

if results:
    print(f"\n  Failures ({len(results)}):")
    for r in results:
        print(f"    - {r}")

sys.exit(0 if FAIL == 0 else 1)
