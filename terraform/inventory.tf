# Génère l'inventaire Ansible (INI) à partir des IPs des VMs.
# Le nœud 1 est le leader Swarm + ingress (son IP publique porte le certificat).

resource "local_file" "ansible_inventory" {
  filename = "${path.module}/../ansible/inventory.ini"
  content = templatefile("${path.module}/templates/inventory.tmpl", {
    nodes = [
      for i in range(var.node_count) : {
        name       = "node${i + 1}"
        public_ip  = azurerm_public_ip.node[i].ip_address
        private_ip = azurerm_network_interface.node[i].private_ip_address
        leader     = i == 0
      }
    ]
    admin_username       = var.admin_username
    ssh_private_key_path = var.ssh_private_key_path
    ingress_ip           = azurerm_public_ip.node[0].ip_address
  })
}
