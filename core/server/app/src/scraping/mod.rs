/**
 * Módulo de utilidades para web scraping y procesamiento de datos de redes sociales.
 * 
 * Este módulo proporciona herramientas comunes para el scraping de diferentes plataformas
 * sociales como Instagram, Reddit, Twitter, etc. Incluye utilidades para limpieza de texto,
 * parsing de números en formato humano y configuración global del scraper.
 * 
 * Autor: Carlos Alberto Zamudio Velázquez
 */

use crate::config::Config;
use lazy_static::lazy_static;
use regex::Regex;
use std::sync::Arc;
use zbrowser::{BlockResource, Scraper};

pub mod instagram;
pub mod notices;
pub mod reddit;
pub mod trends;
pub mod twitter;

/**
 * Definición de expresiones regulares globales y configuración del scraper.
 * 
 * Se utilizan lazy_static para inicializar una sola vez las expresiones regulares
 * y el scraper global, optimizando el rendimiento y evitando recompilaciones.
 * Las regex incluyen patrones para normalización de espacios en blanco y
 * parsing de números en formato humano con sufijos.
 */
lazy_static! {
    // Regex to match multiple whitespace characters and replace with single space
    static ref WHITESPACE_REGEX: Regex = Regex::new(r"\s+").unwrap();
    // Regex to match newlines and carriage returns
    static ref NEWLINE_REGEX: Regex = Regex::new(r"[\n\r]+").unwrap();
    // Regex to parse human-readable numbers (e.g., "1.5k", "2M", "1 millón")
    static ref HUMAN_NUMBER_REGEX: Regex =
        Regex::new(r"^([\d,.]+)\s*([kKmM]il|mill[oó]n|mills?|[kKMGTP])?$").unwrap();

    // Global scraper instance configured with browserless WebSocket and resource blocking
    pub static ref SCRAPER: Arc<Scraper> = Arc::new(Scraper::new::<&str>(
        None,
        //Config::get_browserless_ws(),
        Config::get_workers_scraper(),
        // Block unnecessary resources to improve scraping performance
        vec![
            BlockResource::Stylesheet,
            BlockResource::Image,
            BlockResource::Font,
            BlockResource::Media,
        ],
    ));
}

/**
 * Estructura de utilidades estáticas para procesamiento de texto y números.
 * 
 * Proporciona métodos helper para limpieza de texto y conversión de números
 * en formato humano a valores numéricos estándar.
 */
pub struct Utils;

impl Utils {
    /**
     * Limpia y normaliza texto removiendo espacios en blanco excesivos y saltos de línea.
     * 
     * @param text - El texto a limpiar y normalizar
     * @return String - Texto limpio con espacios normalizados
     */
    pub fn clean_text(text: &str) -> String {
        let text = NEWLINE_REGEX.replace_all(text, " ");
        let text = WHITESPACE_REGEX.replace_all(&text, " ");
        text.trim().to_string()
    }

    /**
     * Convierte números en formato humano con sufijos a valores numéricos u32.
     * 
     * Soporta diferentes formatos y sufijos como:
     * - "1.5k" -> 1500
     * - "2M" -> 2000000  
     * - "1 millón" -> 1000000
     * - Maneja separadores decimales tanto punto como coma
     * - Soporta sufijos en español e inglés (k, M, G, T, P, mil, millón)
     * 
     * @param text - El texto que contiene el número en formato humano
     * @return u32 - El valor numérico convertido, 0 si no se puede parsear
     */
    pub fn parse_human_number(text: &str) -> u32 {
        let text = Self::clean_text(text);

        if let Some(captures) = HUMAN_NUMBER_REGEX.captures(&text) {
            if let Some(number_str) = captures.get(1) {
                let number_str = number_str.as_str();
                // Determine multiplier based on suffix
                let multiplier =
                    captures
                        .get(2)
                        .map_or(1, |m| match m.as_str().to_lowercase().as_str() {
                            "k" => 1_000,
                            "m" => 1_000_000,
                            "g" => 1_000_000_000,
                            "t" => 1_000_000_000_000_i64,
                            "p" => 1_000_000_000_000_000_i64,
                            "mil" | "kmil" | "mmil" => 1_000,
                            "millón" | "millon" | "mill" | "mills" => 1_000_000,
                            _ => 1,
                        });

                // Try parsing as float with decimal point
                if let Ok(num) = number_str.parse::<f64>() {
                    return (num * multiplier as f64) as u32;
                }

                // Try parsing with comma as decimal separator
                let with_dot = number_str.replace(',', ".");
                if let Ok(num) = with_dot.parse::<f64>() {
                    return (num * multiplier as f64) as u32;
                }

                // Try parsing without comma (thousands separator)
                let without_comma = number_str.replace(',', "");
                if let Ok(num) = without_comma.parse::<f64>() {
                    return (num * multiplier as f64) as u32;
                }

                // Final attempt: remove all punctuation
                let clean_number = number_str.replace(',', "").replace('.', "");
                return (clean_number.parse::<f64>().unwrap_or_default() * multiplier as f64)
                    as u32;
            }
        }

        // Fallback parsing attempts for numbers without suffixes
        if let Ok(num) = text.parse::<f64>() {
            return num as u32;
        }

        if let Ok(num) = text.replace(',', ".").parse::<f64>() {
            return num as u32;
        }

        if let Ok(num) = text.replace(',', "").parse::<f64>() {
            return num as u32;
        }

        // Last resort: strip all punctuation and parse
        text.replace(',', "")
            .replace('.', "")
            .parse::<f64>()
            .unwrap_or_default() as u32
    }
}

/**
 * Módulo de pruebas unitarias para validar la funcionalidad de las utilidades.
 * 
 * Contiene tests para verificar el correcto funcionamiento del parsing
 * de números en formato humano con diferentes casos de uso.
 */
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_parse_human_number() {
        assert_eq!(Utils::parse_human_number("4"), 4);
        assert_eq!(Utils::parse_human_number("1,6 mil"), 1600);
        assert_eq!(Utils::parse_human_number("1 mil"), 1000);
    }
}