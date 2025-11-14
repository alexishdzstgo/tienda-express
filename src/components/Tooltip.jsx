import React from "react";

/**
 * Tooltip componente ligero (CSS-only): envuelve un elemento y muestra un
 * pequeño tooltip encima al hacer hover. No depende de librerías externas.
 * Uso:
 * <Tooltip text="Mi tooltip"><MenuIcon /></Tooltip>
 */
export default function Tooltip({ children, text }) {
  return (
    <div className="relative inline-block tooltip-wrapper">
      {children}
      <span className="tooltip-text">{text}</span>
    </div>
  );
}
