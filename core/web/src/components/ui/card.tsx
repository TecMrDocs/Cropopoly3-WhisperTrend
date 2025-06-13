/**
* Componentes de interfaz de usuario para tarjetas (Card).
* 
* Este módulo proporciona componentes reutilizables para crear tarjetas
* con estructura consistente incluyendo header, título, descripción, contenido,
* acciones y footer. Utiliza Tailwind CSS para styling y soporte para
* variaciones de diseño mediante props de className personalizables.
* 
* Autor: Sebastian Antonio Almanza
*/

import * as React from "react"

import { cn } from "@/lib/utils"

/**
* Componente principal Card que actúa como contenedor base.
* 
* Proporciona la estructura fundamental para tarjetas con styling
* predeterminado y soporte para personalización mediante className.
* 
* @param className - Clases CSS adicionales para personalización
* @param props - Props adicionales del elemento div
* @return JSX.Element - Contenedor de tarjeta estilizado
*/
function Card({ className, ...props }: React.ComponentProps<"div">) {
 return (
   <div
     data-slot="card"
     className={cn(
       "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
       className
     )}
     {...props}
   />
 )
}

/**
* Componente CardHeader para la sección superior de la tarjeta.
* 
* Proporciona contenedor para título, descripción y acciones con
* layout grid responsivo y espaciado consistente.
* 
* @param className - Clases CSS adicionales para personalización
* @param props - Props adicionales del elemento div
* @return JSX.Element - Header de tarjeta con layout grid
*/
function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
 return (
   <div
     data-slot="card-header"
     className={cn(
       "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
       className
     )}
     {...props}
   />
 )
}

/**
* Componente CardTitle para títulos de tarjeta.
* 
* @param className - Clases CSS adicionales para personalización
* @param props - Props adicionales del elemento div
* @return JSX.Element - Título estilizado de la tarjeta
*/
function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
 return (
   <div
     data-slot="card-title"
     className={cn("leading-none font-semibold", className)}
     {...props}
   />
 )
}

/**
* Componente CardDescription para texto descriptivo.
* 
* @param className - Clases CSS adicionales para personalización
* @param props - Props adicionales del elemento div
* @return JSX.Element - Descripción estilizada con texto secundario
*/
function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
 return (
   <div
     data-slot="card-description"
     className={cn("text-muted-foreground text-sm", className)}
     {...props}
   />
 )
}

/**
* Componente CardAction para elementos de acción en el header.
* 
* Se posiciona automáticamente en la esquina superior derecha
* del header para botones, menús u otros elementos interactivos.
* 
* @param className - Clases CSS adicionales para personalización
* @param props - Props adicionales del elemento div
* @return JSX.Element - Contenedor de acciones posicionado
*/
function CardAction({ className, ...props }: React.ComponentProps<"div">) {
 return (
   <div
     data-slot="card-action"
     className={cn(
       "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
       className
     )}
     {...props}
   />
 )
}

/**
* Componente CardContent para el contenido principal de la tarjeta.
* 
* @param className - Clases CSS adicionales para personalización
* @param props - Props adicionales del elemento div
* @return JSX.Element - Área de contenido con padding horizontal
*/
function CardContent({ className, ...props }: React.ComponentProps<"div">) {
 return (
   <div
     data-slot="card-content"
     className={cn("px-6", className)}
     {...props}
   />
 )
}

/**
* Componente CardFooter para la sección inferior de la tarjeta.
* 
* Ideal para botones de acción, enlaces adicionales o información
* complementaria con layout flexible horizontal.
* 
* @param className - Clases CSS adicionales para personalización
* @param props - Props adicionales del elemento div
* @return JSX.Element - Footer con layout flex horizontal
*/
function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
 return (
   <div
     data-slot="card-footer"
     className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
     {...props}
   />
 )
}

export {
 Card,
 CardHeader,
 CardFooter,
 CardTitle,
 CardAction,
 CardDescription,
 CardContent,
}