#!/bin/sh
# Exécuté par certbot après une émission/renouvellement réussi.
# Traefik (file provider, watch=true) recharge sa config et relit les certificats
# référencés quand un fichier du répertoire dynamique change : on touche tls.yml
# pour déclencher ce rechargement à chaud (pas de redémarrage de service requis).
set -eu

DYNAMIC=/etc/traefik/dynamic/tls.yml

if [ -f "$DYNAMIC" ]; then
  touch "$DYNAMIC"
  echo "[deploy-hook] touched ${DYNAMIC} -> Traefik will reload the certificate"
else
  echo "[deploy-hook] WARN: ${DYNAMIC} not found, Traefik reload not triggered"
fi
