#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000}"

FINAL_URL=$(curl -s -L -w '%{url_effective}' -o /dev/null "$BASE_URL/auth/franceconnect/login")
TOKEN=$(echo "$FINAL_URL" | sed -n 's/.*access_token=\([^&]*\).*/\1/p')

if [ -z "$TOKEN" ]; then
  echo "Erreur: impossible de récupérer le token. URL: $FINAL_URL" >&2
  exit 1
fi

AUTH="Authorization: Bearer $TOKEN"

MARIE=$(curl -s -X POST "$BASE_URL/mobility-identities" \
  -H "$AUTH" -H "Content-Type: application/json" \
  -d '{"firstName":"Marie","lastName":"Dupont","birthDate":"1990-03-15","currentProfile":"adulte"}')
MARIE_ID=$(echo "$MARIE" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")

curl -s -X POST "$BASE_URL/relationships" -H "$AUTH" -H "Content-Type: application/json" \
  -d "{\"mobilityIdentityId\":\"$MARIE_ID\",\"relationshipType\":\"owner\"}" > /dev/null

curl -s -X POST "$BASE_URL/mobility-identities/$MARIE_ID/contracts" -H "$AUTH" -H "Content-Type: application/json" \
  -d '{"productType":"imagine_r_etudiant","status":"expired","validFrom":"2008-09-01T00:00:00.000Z","validTo":"2012-08-31T23:59:59.000Z","currentTariff":250}' > /dev/null

curl -s -X POST "$BASE_URL/mobility-identities/$MARIE_ID/contracts" -H "$AUTH" -H "Content-Type: application/json" \
  -d '{"productType":"navigo_annuel","status":"active","validFrom":"2012-09-01T00:00:00.000Z","validTo":"2026-08-31T23:59:59.000Z","currentTariff":900}' > /dev/null

LUCAS=$(curl -s -X POST "$BASE_URL/mobility-identities" \
  -H "$AUTH" -H "Content-Type: application/json" \
  -d '{"firstName":"Lucas","lastName":"Dupont","birthDate":"2015-09-01","currentProfile":"scolaire"}')
LUCAS_ID=$(echo "$LUCAS" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")

curl -s -X POST "$BASE_URL/relationships" -H "$AUTH" -H "Content-Type: application/json" \
  -d "{\"mobilityIdentityId\":\"$LUCAS_ID\",\"relationshipType\":\"legal_guardian\"}" > /dev/null

curl -s -X POST "$BASE_URL/relationships" -H "$AUTH" -H "Content-Type: application/json" \
  -d "{\"mobilityIdentityId\":\"$LUCAS_ID\",\"relationshipType\":\"payer\"}" > /dev/null

curl -s -X POST "$BASE_URL/mobility-identities/$LUCAS_ID/contracts" -H "$AUTH" -H "Content-Type: application/json" \
  -d '{"productType":"imagine_r_scolaire","status":"active","validFrom":"2025-09-01T00:00:00.000Z","validTo":"2026-08-31T23:59:59.000Z","currentTariff":350}' > /dev/null

curl -s -X POST "$BASE_URL/mobility-identities/$LUCAS_ID/documents" -H "$AUTH" -H "Content-Type: application/json" \
  -d '{"type":"school_certificate"}' > /dev/null

curl -s -X POST "$BASE_URL/mobility-identities/$LUCAS_ID/supports" -H "$AUTH" -H "Content-Type: application/json" \
  -d '{"status":"active"}' > /dev/null

USER_ID=$(curl -s "$BASE_URL/auth/me" -H "$AUTH" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
IDENTITIES=$(curl -s "$BASE_URL/users/me/identities" -H "$AUTH" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))")

echo "USER_ID: $USER_ID"
echo "MARIE_ID: $MARIE_ID"
echo "LUCAS_ID: $LUCAS_ID"
echo "IDENTITIES: $IDENTITIES"
echo "---TOKEN---"
echo "$TOKEN"
