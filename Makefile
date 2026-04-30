# rift-root deploy targets
#
# Usage:
#   make deploy-site    — deploy riftroot-edge  (riftroot.com)
#   make smoke          — curl-check the live site post-deploy
#   make verify         — assert the worker's wrangler.toml name matches intent

SITE_DIR  := $(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))/site
SITE_NAME := riftroot-edge

.PHONY: deploy-site smoke verify

deploy-site:
	@echo "==> deploy-site: source=$(SITE_DIR), worker=$(SITE_NAME)"
	@grep -q 'name = "$(SITE_NAME)"' "$(SITE_DIR)/wrangler.toml" || \
	  { echo "ERROR: wrangler.toml name mismatch in $(SITE_DIR)"; exit 1; }
	cd "$(SITE_DIR)" && bash deploy.sh

smoke:
	@echo "==> smoke: checking live endpoint"
	@curl -sf -o /dev/null -w "riftroot.com: %{http_code}\n" https://riftroot.com || \
	  { echo "SMOKE FAIL: riftroot.com"; exit 1; }
	@echo "smoke: ok"

verify:
	@echo "==> verify: wrangler.toml name assertions"
	@grep -q 'name = "$(SITE_NAME)"' "$(SITE_DIR)/wrangler.toml" && \
	  echo "site ok: $(SITE_NAME)" || echo "MISMATCH: site"

# QA stage — deploys to riftroot-qa-edge (riftroot-qa.mock1ngbb.com)
# Prod files (site/, root wrangler.toml) are untouched by this target.
QA_DIR   := $(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))
QA_NAME  := riftroot-qa-edge
QA_TOML  := $(QA_DIR)/wrangler.qa.toml

.PHONY: deploy-qa smoke-qa

deploy-qa:
	@echo "==> deploy-qa: source=$(QA_DIR)/site-qa, worker=$(QA_NAME)"
	cd "$(QA_DIR)" && npx wrangler@latest deploy -c wrangler.qa.toml --name $(QA_NAME)

smoke-qa:
	@echo "==> smoke-qa: checking QA workers.dev endpoint"
	@curl -sf -o /dev/null -w "riftroot-qa-edge.workers.dev: %{http_code}\n" \
	  https://riftroot-qa-edge.a62c1c7880b50ac345fc7c2135f6ae84.workers.dev/ || \
	  { echo "SMOKE FAIL: QA workers.dev"; exit 1; }
	@echo "smoke-qa: ok"
