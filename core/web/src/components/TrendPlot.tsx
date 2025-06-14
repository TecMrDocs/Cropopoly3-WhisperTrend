/**
 * Importaciones necesarias para la construcción de gráficos de línea.
 *
 * Este archivo importa componentes de la librería `recharts` para crear
 * visualizaciones responsivas de datos en forma de gráficos de línea.
 * También incluye elementos auxiliares como ejes, leyendas, tooltips, grillas
 * y líneas de referencia.
 *
 * Autor: Sebastián Antonio Almanza
 * Contribuyentes: —
 */

import React from 'react';

import { 
  LineChart,       // Componente principal para gráficos de línea
  Line,            // Define una línea dentro del gráfico
  XAxis,           // Representa el eje horizontal (X)
  YAxis,           // Representa el eje vertical (Y)
  Tooltip,         // Muestra información al pasar el cursor sobre el gráfico
  Legend,          // Muestra la leyenda de las líneas en el gráfico
  ResponsiveContainer, // Hace que el gráfico se adapte al contenedor
  CartesianGrid,   // Muestra una cuadrícula de fondo
  ReferenceLine    // Permite añadir líneas de referencia horizontales o verticales
} from 'recharts';
