# Ansible — configuration Swarm & déploiement

Configure les 3 VMs Azure en cluster Docker Swarm et déploie la stack `comutitre`.

**Prérequis** : avoir ran `terraform apply` (génère `inventory.ini`) et avoir `ansible-galaxy` installé.

## Premier déploiement

```bash
cd ansible

# 1. Installer le rôle Docker
ansible-galaxy install -r requirements.yml -p roles

# 2. Mot de passe du vault (une fois par machine)
echo "votre-mot-de-passe" > .vault-password   # jamais commité

# 3. Déployer
ansible-playbook playbook.yml
```

## Vault — secrets chiffrés

Les secrets (`db_password`, `app_jwt_secret`, `franceconnect_client_secret`) sont dans `group_vars/all/vault.yml`, chiffré AES-256.

```bash
# Créer / éditer les secrets
ansible-vault edit group_vars/all/vault.yml

# Chiffrer un nouveau vault
ansible-vault encrypt group_vars/all/vault.yml
```

Le fichier `.vault-password` (non commité) est lu automatiquement via `ansible.cfg`.  
Pour la CI, le mot de passe est dans le secret GitHub `ANSIBLE_VAULT_PASSWORD`.

## Variables non-secrètes (`group_vars/all/vars.yml`)

| Variable | Description |
| --- | --- |
| `config_dir` | Répertoire de config sur les VMs (`/opt/comutitre`) |
| `back_image` | Image Docker du back (défaut `:latest`) |
| `front_image` | Image Docker du front (défaut `:latest`) |
| `ingress_ip` | IP publique du nœud d'ingress (écrite par Terraform dans l'inventaire) |

## Ce que fait le playbook

1. Installe Docker sur tous les nœuds (`geerlingguy.docker`)
2. Initialise le Swarm (nœud 1 = leader + ingress)
3. Joint les autres nœuds en manager
4. Labellise le nœud d'ingress (`ingress=true`)
5. Crée les Docker secrets (`comutitre_db_password`, `comutitre_app_jwt_secret`)
6. Copie la config Traefik et les scripts certbot
7. Déploie `stack.swarm.yml`

## Vérification

```bash
curl -v https://<ingress_ip>/api/health     # 200 + cert Let's Encrypt valide
```

## Onboarding nouveau dev

```bash
az login
cd terraform && terraform init && terraform apply   # récupère l'inventaire
cd ../ansible
echo "mot-de-passe-vault" > .vault-password
ansible-playbook playbook.yml
```
