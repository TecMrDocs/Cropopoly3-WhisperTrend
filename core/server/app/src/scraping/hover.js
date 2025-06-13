/**
* Utilidad de Forzado de Hover Permanente
* 
* Implementa un sistema que mantiene artificialmente el estado hover en elementos
* del DOM mediante eventos sintéticos y observación de cambios dinámicos.
* 
* Autor: Carlos Alberto Zamudio Velázquez
*/

/**
* Fuerza el estado hover permanente en un contenedor y todos sus elementos hijos
* 
* Utiliza RequestAnimationFrame para mantener eventos hover activos continuamente
* y MutationObserver para detectar cambios dinámicos en el DOM del contenedor.
* 
* @param container Elemento DOM contenedor donde aplicar hover permanente
* @return Objeto con método stop() para cancelar el forzado de hover
*/

function forceHoverPermanent(container) {
 let children = Array.from(container.querySelectorAll('*'));

 /**
  * Configuración de eventos sintéticos para simular interacciones del usuario
  */
 const overEvent = new MouseEvent('mouseover', {
   view: window,
   bubbles: true,
   cancelable: true
 });
 const pointerOverEvent = new PointerEvent('pointerover', {
   bubbles: true,
   cancelable: true
 });
 const focusEvent = new FocusEvent('focus', {
   bubbles: true,
   cancelable: true
 });

 /**
  * Inyecta eventos de hover en todos los elementos hijos válidos
  * 
  * Verifica que los elementos sigan existiendo en el DOM antes de
  * disparar eventos para evitar errores con elementos eliminados.
  */
 function injectEvents() {
   children.forEach(child => {
     if (document.body.contains(child)) {
       child.dispatchEvent(overEvent);
       child.dispatchEvent(pointerOverEvent);
       try {
         child.dispatchEvent(focusEvent);
       } catch (e) {
       }
     }
   });
 }

 /**
  * Bucle continuo de RequestAnimationFrame para mantener hover activo
  */
 let rafId;
 function rafLoop() {
   injectEvents();
   rafId = requestAnimationFrame(rafLoop);
 }
 rafLoop();

 /**
  * Observador de mutaciones para detectar cambios dinámicos en el DOM
  * 
  * Actualiza la lista de elementos hijos cuando se añaden o eliminan
  * elementos del contenedor para mantener el hover en elementos nuevos.
  */
 const observer = new MutationObserver((_) => {
   children = Array.from(container.querySelectorAll('*'));
 });
 observer.observe(container, { childList: true, subtree: true });

 return {
   stop: () => {
     cancelAnimationFrame(rafId);
     observer.disconnect();
   }
 };
}