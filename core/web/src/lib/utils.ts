/**
* Utilidades para concatenación y merge de clases CSS con Tailwind.
* 
* Función helper que combina clsx y tailwind-merge para manejo
* inteligente de clases CSS con deduplicación y resolución de conflictos.
* 
* Autor: Carlos Alberto Zamudio Velázquez
*/

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
 return twMerge(clsx(inputs))
}