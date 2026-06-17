# Infra Azure pour le cluster Docker Swarm Comutitre :
#   - 1 resource group, 1 VNet + subnet
#   - 1 NSG (SSH/HTTP/HTTPS depuis Internet ; trafic Swarm via intra-VNet par défaut)
#   - node_count VMs Ubuntu 24.04 (tous managers + workers), IP publique statique chacune
# Le trafic d'ingress passe par le nœud 0 (dont l'IP porte le certificat TLS).

resource "azurerm_resource_group" "main" {
  name     = "${var.prefix}-rg"
  location = var.location
}

resource "azurerm_virtual_network" "main" {
  name                = "${var.prefix}-vnet"
  address_space       = ["10.0.0.0/16"]
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
}

resource "azurerm_subnet" "main" {
  name                 = "${var.prefix}-subnet"
  resource_group_name  = azurerm_resource_group.main.name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = ["10.0.1.0/24"]
}

resource "azurerm_network_security_group" "main" {
  name                = "${var.prefix}-nsg"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name

  #trivy:ignore:AVD-AZU-0047
  #trivy:ignore:AVD-AZU-0050
  security_rule {
    name                       = "SSH"
    priority                   = 100
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "22"
    source_address_prefix      = var.ssh_allowed_cidr
    destination_address_prefix = "*"
  }

  security_rule {
    name                       = "HTTP"
    priority                   = 110
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "80"
    source_address_prefix      = "Internet"
    destination_address_prefix = "*"
  }

  security_rule {
    name                       = "HTTPS"
    priority                   = 120
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "443"
    source_address_prefix      = "Internet"
    destination_address_prefix = "*"
  }
  # Les ports Swarm (2377/tcp, 7946 tcp+udp, 4789/udp) sont couverts par la règle
  # implicite AllowVnetInBound (trafic intra-VNet autorisé par défaut).
}

resource "azurerm_subnet_network_security_group_association" "main" {
  subnet_id                 = azurerm_subnet.main.id
  network_security_group_id = azurerm_network_security_group.main.id
}

resource "azurerm_public_ip" "node" {
  count               = var.node_count
  name                = "${var.prefix}-pip-${count.index + 1}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  allocation_method   = "Static"
  sku                 = "Standard"
}

#trivy:ignore:AVD-AZU-0068
#trivy:ignore:AVD-AZU-0076
resource "azurerm_network_interface" "node" {
  count               = var.node_count
  name                = "${var.prefix}-nic-${count.index + 1}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name

  ip_configuration {
    name                          = "internal"
    subnet_id                     = azurerm_subnet.main.id
    private_ip_address_allocation = "Dynamic"
    public_ip_address_id          = azurerm_public_ip.node[count.index].id
  }
}

resource "azurerm_linux_virtual_machine" "node" {
  count               = var.node_count
  name                = "${var.prefix}-node-${count.index + 1}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  size                = var.vm_size
  admin_username      = var.admin_username

  network_interface_ids = [azurerm_network_interface.node[count.index].id]

  admin_ssh_key {
    username   = var.admin_username
    public_key = file(pathexpand(var.ssh_public_key_path))
  }

  admin_ssh_key {
    username   = var.admin_username
    public_key = "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIBEwxWKaaZ+0tb0Pp24ApIZPpA5VrFTDmQgdEbtOy5ll gaetan@gaetan-TUXEDO-InfinityBook-Pro-Gen8-MK1"
  }

  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Standard_LRS"
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "ubuntu-24_04-lts"
    sku       = "server"
    version   = "latest"
  }
}
