terraform {
  required_providers {
    oci = {
      source  = "hashicorp/oci"
      version = "= 5.40.0"
    }
  }
}

provider "oci" {
  config_file_profile = "DEFAULT"
  user_ocid           = var.user_ocid
  fingerprint         = var.fingerprint
  private_key_path    = var.private_key_path
  tenancy_ocid        = var.tenancy_ocid
  region              = var.region
}

resource "oci_core_vcn" "whispertrend_vcn" {
  compartment_id = var.compartment_id
  cidr_block     = "10.0.0.0/16"
  display_name   = "whispertrend_vcn"

  freeform_tags = {
    "project-name" = "whispertrend"
  }
}

resource "oci_core_security_list" "public_sn_sl" {
  compartment_id = var.compartment_id
  vcn_id         = oci_core_vcn.whispertrend_vcn.id
  display_name   = "security list for the public subnet"

  ingress_security_rules {
    protocol    = 6
    source_type = "CIDR_BLOCK"
    source      = "0.0.0.0/0"
    description = "access to container instance port 443 from anywhere"

    tcp_options {
      min = 443
      max = 443
    }
  }

  ingress_security_rules {
    protocol    = 6
    source_type = "CIDR_BLOCK"
    source      = "0.0.0.0/0"
    description = "access to container instance port 80 from anywhere"

    tcp_options {
      min = 80
      max = 80
    }
  }

  egress_security_rules {
    protocol         = 6
    destination_type = "CIDR_BLOCK"
    destination      = "0.0.0.0/0"
    description      = "access to container registries via HTTP"

    tcp_options {
      min = 80
      max = 80
    }
  }

  egress_security_rules {
    protocol         = 6
    destination_type = "CIDR_BLOCK"
    destination      = "0.0.0.0/0"
    description      = "access to container registries via HTTPS"

    tcp_options {
      min = 443
      max = 443
    }
  }

  freeform_tags = {
    "project-name" = "whispertrend"
  }
}

resource "oci_core_subnet" "whispertrend_subnet" {
  compartment_id = var.compartment_id
  vcn_id         = oci_core_vcn.whispertrend_vcn.id
  cidr_block     = "10.0.0.0/24"
  display_name   = "whispertrend_subnet"
  route_table_id = oci_core_route_table.igw_rt.id

  security_list_ids = [
    oci_core_security_list.public_sn_sl.id
  ]

  freeform_tags = {
    "project-name" = "whispertrend"
  }
}

resource "oci_core_internet_gateway" "internet_gateway" {
  compartment_id = var.compartment_id
  vcn_id         = oci_core_vcn.whispertrend_vcn.id
  display_name   = "internet_gateway"
  enabled        = true
}

resource "oci_core_route_table" "igw_rt" {
  compartment_id = var.compartment_id
  vcn_id         = oci_core_vcn.whispertrend_vcn.id
  display_name   = "Internet gateway route table"

  route_rules {
    network_entity_id = oci_core_internet_gateway.internet_gateway.id
    destination       = "0.0.0.0/0"
  }

  freeform_tags = {
    "project-name" = "whispertrend"
  }
}

data "oci_identity_availability_domains" "local_ads" {
  compartment_id = var.compartment_id
}

data "oci_core_images" "free_image" {
  compartment_id           = var.compartment_id
  operating_system         = "Oracle Linux"
  operating_system_version = "8"
  shape                    = "VM.Standard.A1.Flex"
}

resource "oci_core_instance" "app" {
  availability_domain = data.oci_identity_availability_domains.local_ads.availability_domains[0].name
  compartment_id      = var.compartment_id
  display_name        = "app-vm"
  shape               = "VM.Standard.A1.Flex"

  create_vnic_details {
    subnet_id = oci_core_subnet.whispertrend_subnet.id
  }

  shape_config {
    ocpus         = 4
    memory_in_gbs = 24
  }

  metadata = {
    user_data = base64encode(<<-EOF
      #!/bin/bash
      yum update -y
      yum install -y docker
      systemctl start docker
      docker run \
        --name app-server \
        -e DYNAMIC_DNS_PASSWORD=${var.dynamic_dns_password} \
        -e DOMAIN=${var.domain} \
        -e EMAIL=${var.email} \
        -p 443:443 \
        -p 80:80 \
        -d \
        ${var.image}
      EOF
    )
  }

  source_details {
    source_type             = "image"
    source_id               = data.oci_core_images.free_image.images[0].id
    boot_volume_size_in_gbs = 200
  }
}

data "oci_core_vnic_attachments" "app_vnic_attachments" {
  compartment_id = var.compartment_id
  instance_id    = oci_core_instance.app.id
}

data "oci_core_vnic" "app_vnic" {
  vnic_id = data.oci_core_vnic_attachments.app_vnic_attachments.vnic_attachments[0].vnic_id
}

output "app_public_ip" {
  value = data.oci_core_vnic.app_vnic.public_ip_address
}
