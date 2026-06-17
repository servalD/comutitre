#!/bin/sh
# certbot — émission + renouvellement du certificat Let's Encrypt pour l'IP publique.
#
# Let's Encrypt émet des certificats pour adresses IP via le profil "shortlived"
# (validité 6 jours, cf. https://letsencrypt.org/2026/03/11/shorter-certs-certbot).
# Méthode standalone : certbot écoute sur le port 8080 (interne) pendant le challenge.
# Traefik route /.well-known/acme-challenge/ (port 80 public) vers ce port.
# Nécessite certbot >= 5.4.
set -eu

: "${PUBLIC_IP:?PUBLIC_IP is required}"

CERT_NAME=comutitre
LIVE_DIR="/etc/letsencrypt/live/${CERT_NAME}"

issue() {
  certbot certonly \
    --standalone --http-01-port 8080 \
    --cert-name "$CERT_NAME" \
    --ip-address "$PUBLIC_IP" \
    --preferred-profile shortlived \
    --non-interactive --agree-tos --register-unsafely-without-email \
    --deploy-hook /deploy-hook.sh
}

# Émission initiale si le certificat n'existe pas encore.
if [ ! -f "${LIVE_DIR}/fullchain.pem" ]; then
  echo "[certbot] no cert for ${PUBLIC_IP}, requesting one (shortlived profile)..."
  until issue; do
    echo "[certbot] issuance failed, retrying in 60s (is Traefik:80 reachable?)..."
    sleep 60
  done
fi

# Boucle de renouvellement. Certs de 6 jours => renouvelés à ~2 jours restants ;
# on tente deux fois par jour. Le deploy-hook recharge Traefik à chaud.
echo "[certbot] entering renewal loop"
while true; do
  certbot renew --standalone --http-01-port 8080 --deploy-hook /deploy-hook.sh || \
    echo "[certbot] renew attempt failed, will retry"
  sleep 43200
done
