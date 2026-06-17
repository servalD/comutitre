variable "prefix" {
  description = "Préfixe des ressources Azure."
  type        = string
  default     = "comutitre"
}

variable "location" {
  description = "Région Azure."
  type        = string
  default     = "swedencentral"
}

variable "node_count" {
  description = "Nombre de nœuds Swarm (tous managers + workers)."
  type        = number
  default     = 3
}

variable "vm_size" {
  description = "Taille des VMs. B2s = 2 vCPU / 4 Go. Basculer sur Standard_B1ms si quota étudiant trop serré."
  type        = string
  default     = "Standard_B2s_v2"
}

variable "admin_username" {
  description = "Utilisateur admin SSH des VMs."
  type        = string
  default     = "azureuser"
}

variable "ssh_public_key_path" {
  description = "Chemin vers la clé publique SSH injectée dans les VMs."
  type        = string
  default     = "~/.ssh/id_rsa.pub"
}

variable "ssh_private_key_path" {
  description = "Chemin vers la clé privée SSH utilisée par Ansible (écrit dans l'inventaire)."
  type        = string
  default     = "~/.ssh/id_rsa"
}

variable "ssh_allowed_cidr" {
  description = "CIDR autorisé en SSH (22). Restreindre à votre IP en production. '*' = ouvert."
  type        = string
  default     = "*"
}
