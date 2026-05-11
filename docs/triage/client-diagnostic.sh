#!/bin/bash
#
# riftroot.com Client-Side Diagnostic Script
# Runs dig, nslookup, curl, ping, and traceroute to diagnose connectivity issues
#
# Usage: bash client-diagnostic.sh
# Exit: 0 on success (script executed; does not evaluate results)

set -e

DOMAIN_APEX="riftroot.com"
DOMAIN_WWW="www.riftroot.com"

echo "========================================"
echo "riftroot.com Connectivity Diagnostic"
echo "========================================"
echo "Time: $(date)"
echo "Hostname: $(hostname)"
echo "OS: $(uname -s)"
echo ""

# DNS Diagnostics
echo "--- DNS: dig riftroot.com ---"
dig +short "$DOMAIN_APEX" || echo "(no A records returned)"
echo ""

echo "--- DNS: dig www.riftroot.com ---"
dig +short "$DOMAIN_WWW" || echo "(no A records returned)"
echo ""

echo "--- DNS: nslookup riftroot.com 1.1.1.1 ---"
nslookup "$DOMAIN_APEX" 1.1.1.1 2>&1 || echo "(nslookup failed)"
echo ""

echo "--- DNS: nslookup www.riftroot.com 8.8.8.8 ---"
nslookup "$DOMAIN_WWW" 8.8.8.8 2>&1 || echo "(nslookup failed)"
echo ""

# HTTP Status
echo "--- HTTP Status: curl -sI https://riftroot.com ---"
curl -sI "https://${DOMAIN_APEX}" || echo "(curl failed)"
echo ""

echo "--- HTTP Status: curl -sI https://www.riftroot.com ---"
curl -sI "https://${DOMAIN_WWW}" || echo "(curl failed)"
echo ""

# Connectivity Tests
echo "--- Network: ping -c 3 riftroot.com ---"
ping -c 3 "$DOMAIN_APEX" 2>&1 || echo "(ping failed or domain unreachable)"
echo ""

echo "--- Network: traceroute -m 12 riftroot.com ---"
traceroute -m 12 "$DOMAIN_APEX" 2>&1 || echo "(traceroute failed)"
echo ""

echo "========================================"
echo "Diagnostic Complete"
echo "========================================"
echo ""
echo "INTERPRETATION:"
echo ""
echo "PASS scenarios:"
echo "  - dig shows Cloudflare IPs (172.67.* or 104.21.* or 2606:4700:*)"
echo "  - curl -I returns HTTP 200 or 301"
echo "  - ping and traceroute complete without timeout"
echo ""
echo "FAIL scenarios (check USER-CHECKLIST.md for fixes):"
echo "  - dig returns empty → DNS not resolving (ISP hijack, local cache stale)"
echo "  - www.riftroot.com dig is empty → try https://riftroot.com (apex only)"
echo "  - curl returns Connection refused / timed out → network/firewall issue"
echo "  - ping times out → Cloudflare edge unreachable from your location"
echo ""

exit 0
