output "public_ips" {
  description = "IPs publiques des nœuds Swarm."
  value       = azurerm_public_ip.node[*].ip_address
}

output "private_ips" {
  description = "IPs privées (advertise-addr Swarm)."
  value       = azurerm_network_interface.node[*].private_ip_address
}

output "ingress_ip" {
  description = "IP publique du nœud d'ingress (porte le certificat TLS)."
  value       = azurerm_public_ip.node[0].ip_address
}
