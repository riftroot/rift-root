# riftroot.com Unreachability — User Troubleshooting Checklist

If you see "This site can't be reached" or a similar error when trying to visit riftroot.com, follow this checklist in order. Each step is listed by likelihood (most common first).

## 1. Try the apex URL without `www` in incognito mode

**Symptom:** You typed `https://www.riftroot.com` and got an error.

**Action:**
- Open an **incognito / private** browser window.
- Type `https://riftroot.com` (no `www` prefix).
- Press Enter and wait 5 seconds.

**Expected result:** Page loads normally.

**Why:** `www.riftroot.com` does not currently have a DNS record. The apex domain (`riftroot.com`) is the only version available. Incognito mode clears any stale cache from previous visits.

---

## 2. Try the same URL on a cellular hotspot

**Symptom:** Page works on mobile data, but not on your home WiFi.

**Action:**
- Use your phone's hotspot or switch your device to cellular data.
- Try `https://riftroot.com` again.

**Expected result:** Page loads normally.

**Why:** If the site works on a different network, the issue is with your home ISP's DNS resolver, firewall, or local network cache — not a global outage.

---

## 3. Flush your local DNS cache

**On macOS:**
```bash
sudo killall -HUP mDNSResponder
```

**On Linux:**
```bash
sudo systemctl restart systemd-resolved
```

**On Windows:**
```cmd
ipconfig /flushdns
```

Then try `https://riftroot.com` again in a fresh browser window.

**Why:** Your operating system caches DNS answers. If your ISP or router returned a bad result (or nothing), the cache persists. Flushing forces a fresh lookup.

---

## 4. Try a different browser

**Action:**
- If you were using Chrome, try Safari or Firefox.
- Clear cookies and cached data for riftroot.com in the new browser.
- Try `https://riftroot.com`.

**Expected result:** Page loads normally.

**Why:** Browser cache, service workers, or JavaScript can sometimes get stuck. A fresh browser isolates that.

---

## 5. Use a different DNS resolver

**Action:**
- Use your operating system's settings to temporarily change your DNS server.

**Try Cloudflare's DNS (1.1.1.1):**
```bash
nslookup riftroot.com 1.1.1.1
```

**Try Google DNS (8.8.8.8):**
```bash
nslookup riftroot.com 8.8.8.8
```

Then try visiting `https://riftroot.com`.

**Why:** Your ISP's DNS resolver may be misconfigured, blocking, or slow. Cloudflare and Google run fast, reliable public DNS.

---

## 6. Run the diagnostic script

**Action:**
```bash
bash docs/triage/client-diagnostic.sh
```

This script will:
- Show DNS lookups for both `riftroot.com` and `www.riftroot.com`
- Attempt HTTP requests to both URLs
- Show ping and traceroute results
- Provide a summary of what passed/failed

**Expected result:** All dig/curl/ping tests complete; see "PASS" indicators in the output.

**If you see failures:** Share the output with the riftroot team. It will help narrow down whether the issue is DNS, network routing, or ISP-specific.

---

## 7. Contact support

If you've gone through all 6 steps and the site still doesn't load, please share:
- Your location (city/country or ISP name)
- The browser and OS you're using
- The full output from step 6 (the diagnostic script)

Send to: **adam@riftroot.com**

We will use this information to diagnose edge cases like regional CDN issues, ISP blocks, or browser-specific bugs.
