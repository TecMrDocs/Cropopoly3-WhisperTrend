variable "user_ocid" {
  description = "User OCID for Oracle Cloud Infrastructure"
  type        = string
}

variable "fingerprint" {
  description = "Public Key Fingerprint for Oracle Cloud Infrastructure"
  type        = string
}

variable "private_key_path" {
  description = "Path to the Private Key used for Oracle Cloud Infrastructure"
  type        = string
}

variable "tenancy_ocid" {
  description = "Tenancy OCID for Oracle Cloud Infrastructure"
  type        = string
}

variable "region" {
  description = "Region for Oracle Cloud Infrastructure"
  type        = string
}

variable "availability_domain" {
  description = "Availability Domain for Oracle Cloud Infrastructure"
  type        = string
}

variable "compartment_id" {
  description = "Compartment OCID for Oracle Cloud Infrastructure"
  type        = string
}

variable "dynamic_dns_password" {
  description = "Dynamic DNS Password"
  type        = string
}

variable "domain" {
  description = "Domain"
  type        = string
}

variable "email" {
  description = "Email"
  type        = string
}

variable "image" {
  description = "Image"
  type        = string
}
