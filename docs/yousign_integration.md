# Intégration YouSign — Guide opérationnel

*Dernière mise à jour : 2026-06-17*

---

## Prérequis

1. Compte YouSign sandbox : https://sandbox.yousign.app
2. Clé API sandbox (Settings → API Keys)
3. Secret webhook (Settings → Webhooks)
4. ngrok en dev (inclus dans `docker compose up`) pour exposer le back en HTTPS

---

## Variables d'environnement (`.env.dev`)

```env
YOUSIGN_API_KEY=your_sandbox_api_key
YOUSIGN_BASE_URL=https://api-sandbox.yousign.app/v3
YOUSIGN_WEBHOOK_SECRET=your_webhook_secret
YOUSIGN_DELIVERY_MODE=none
NGROK_AUTHTOKEN=your_ngrok_authtoken
```

`YOUSIGN_DELIVERY_MODE=none` : YouSign ne délivre pas d'email ; l'application gère la redirection directe vers le `signature_link` retourné par l'API.

---

## Configuration du webhook (sandbox YouSign)

1. Lancer la stack dev (ngrok démarre avec) :
   ```bash
   docker compose -f docker/docker-compose.dev.yml up
   ```
   URL publique du tunnel : http://localhost:4040

2. Dans l'interface YouSign sandbox → Settings → Webhooks, créer un webhook :
   - URL : `https://<votre-tunnel>.ngrok.io/webhooks/yousign`
   - Events : `signature_request.done`, `signature_request.declined`, `identity_document_verification.done`, `identity_document_verification.failed`, `proof_of_address_verification.done`, `proof_of_address_verification.failed`
   - Sandbox : `true`
   - Copier le `secret` dans `YOUSIGN_WEBHOOK_SECRET`

---

## Démarrage

```bash
docker compose -f docker/docker-compose.dev.yml up
```

Sans Docker :

```bash
cd back && pnpm migration:run && pnpm start:dev
cd ../front && pnpm dev
ngrok http 3000
```

---

## Flux d'intégration

### A. Validation de justificatif (Document Verification)

| Étape | API YouSign | Endpoint back |
|---|---|---|
| Upload pièce d'identité | `POST /verifications/identity_documents` | `POST /justificatifs` |
| Résultat asynchrone | Webhook `identity_document_verification.done` | `POST /webhooks/yousign` |
| Décision agent | — | `PATCH /justificatifs/:id/validate` |

Types déclenchant une vérification YouSign automatique :
- `piece_identite` → Identity Document Verification
- `justificatif_domicile` → Proof of Address Verification

Les autres types (photo, scolarité, bourse, CAF…) restent en validation manuelle agent.

### B. Signature CGVU (eSignature)

| Étape | API YouSign | Endpoint back |
|---|---|---|
| Créer signature request + PDF + signer | `POST /signature_requests` → documents → signers → activate | `POST /contracts/:id/signature` |
| Redirection utilisateur | `signature_link` | Front → redirect |
| Confirmation signature | Webhook `signature_request.done` | `POST /webhooks/yousign` |
| Enregistrement traçabilité | — | `cgvu_acceptances` table |

---

## Scénario de démonstration (Démo 1 §25.2)

1. Se connecter avec `parent.demo@comutitres.fr` / `Demo1234!` (après `pnpm seed:demo`)
2. Naviguer vers `/contrat/<id>` (affiché lors du seed)
3. Cliquer "Gérer les justificatifs" → déposer une CNI (JPEG/PDF)
4. Le statut passe à "En cours de vérification" + appel YouSign Verify
5. Le webhook met à jour le statut ("Pré-qualifié" ou "À revoir")
6. Connexion admin → `/admin/dossiers` → Valider le justificatif
7. Le contrat passe à "Prêt à signer"
8. Retour `/contrat/<id>` → "Signer les CGVU avec YouSign"
9. Redirection YouSign sandbox → Signer
10. Retour `/signature/callback?contractId=<id>&status=success`
11. Webhook `signature_request.done` → `cgvu_acceptance` enregistré → contrat `actif`

---

## Tables créées par les migrations

| Table | Rôle |
|---|---|
| `justificatifs` | Documents déposés, statuts, IDs YouSign Verify |
| `contracts` | Contrats de souscription, ID signature request YouSign |
| `cgvu_acceptances` | Traçabilité §14.3 : version CGVU, signataire, rôle, horodatage |

---

## Notes de sécurité

- La vérification HMAC du webhook (`x-yousign-signature-256`) est activée dès que `YOUSIGN_WEBHOOK_SECRET` est renseigné.
- En dev sans secret, la vérification est skippée (log warning).
- Les fichiers uploadés sont stockés localement dans `back/uploads/` (gitignore), non chiffrés — prévoir S3 + chiffrement en production.
- La rétention des justificatifs sensibles doit respecter les règles RGPD (minimisation, durée limitée).
