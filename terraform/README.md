# Terraform — infrastructure Azure

Provisionne le cluster Swarm sur Azure : resource group, VNet, NSG, IPs publiques, NICs et 3 VMs Ubuntu 24.04. Génère aussi l'inventaire Ansible (`../ansible/inventory.ini`).

## Variables principales (`variables.tf`)

| Variable | Défaut | Description |
| --- | --- | --- |
| `location` | `swedencentral` | Région Azure |
| `vm_size` | `Standard_B2s_v2` | Taille des VMs (2 vCPU / 4 Go) |
| `node_count` | `3` | Nombre de nœuds Swarm |
| `ssh_allowed_cidr` | `*` | CIDR autorisé en SSH — restreindre en prod |

## Bootstrap (une seule fois)

Créer le storage account Azure pour le state Terraform avant le premier `init` :

```bash
bash terraform/bootstrap.sh
# Paramètres optionnels : bash bootstrap.sh <resource-group> <storage-account> <location>
```

## Premier déploiement

```bash
az login
cd terraform
terraform init          # configure le backend Azure Blob
terraform apply         # crée l'infra + génère ansible/inventory.ini
```

## Mises à jour d'infra

```bash
terraform plan          # voir ce qui va changer
terraform apply
```

## State

Le state est stocké dans Azure Blob Storage (`comutitre-tfstate` / container `tfstate`).
Chaque `terraform apply` régénère `../ansible/inventory.ini` depuis les IPs actuelles.

Pour un nouveau dev :
```bash
az login
terraform init     # récupère le state distant
terraform apply    # régénère l'inventaire local (aucun changement Azure si infra déjà là)
```

## Teardown

```bash
terraform destroy
```
