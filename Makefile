# rift-root deploy targets
#
# Each target cd's to the canonical source root for that worker before
# invoking wrangler, preventing the cwd-drift bug where the wrong bundle
# gets uploaded under a worker name (e.g. site/ bundle deployed as demo worker).
#
# Usage:
#   make deploy-site    — deploy riftroot-edge  (riftroot.com)
#   make deploy-demo    — deploy riftroot-demo  (demo.riftroot.com)
#   make deploy-all     — deploy both, site first
#   make smoke          — curl-check both live endpoints post-deploy
#   make verify         — assert each worker's wrangler.toml name matches intent

SITE_DIR  := $(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))/site
DEMO_DIR  := $(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))
SITE_NAME := rift-root-site
DEMO_NAME := rift-bifrost-demo

.PHONY: deploy-site deploy-demo deploy-all smoke verify

deploy-site:
	@echo "==> deploy-site: source=$(SITE_DIR), worker=$(SITE_NAME)"
	@grep -q 'name = "$(SITE_NAME)"' "$(SITE_DIR)/wrangler.toml" || \
	  { echo "ERROR: wrangler.toml name mismatch in $(SITE_DIR)"; exit 1; }
	cd "$(SITE_DIR)" && bash deploy.sh

deploy-demo:
	@echo "==> deploy-demo: source=$(DEMO_DIR), worker=$(DEMO_NAME)"
	@grep -q 'name = "$(DEMO_NAME)"' "$(DEMO_DIR)/wrangler.toml" || \
	  { echo "ERROR: wrangler.toml name mismatch in $(DEMO_DIR)"; exit 1; }
	cd "$(DEMO_DIR)" && bash scripts/deploy.sh

deploy-all: deploy-site deploy-demo smoke

smoke:
	@echo "==> smoke: checking live endpoints"
	@curl -sf -o /dev/null -w "riftroot.com: %{http_code}\n" https://riftroot.com || \
	  { echo "SMOKE FAIL: riftroot.com"; exit 1; }
	@curl -sf -o /dev/null -w "demo.riftroot.com: %{http_code}\n" https://demo.riftroot.com || \
	  { echo "SMOKE FAIL: demo.riftroot.com"; exit 1; }
	@echo "smoke: ok"

verify:
	@echo "==> verify: wrangler.toml name assertions"
	@grep -q 'name = "$(SITE_NAME)"' "$(SITE_DIR)/wrangler.toml" && \
	  echo "site ok: $(SITE_NAME)" || echo "MISMATCH: site"
	@grep -q 'name = "$(DEMO_NAME)"' "$(DEMO_DIR)/wrangler.toml" && \
	  echo "demo ok: $(DEMO_NAME)" || echo "MISMATCH: demo"
