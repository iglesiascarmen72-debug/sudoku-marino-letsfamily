# Sudoku Marino LetsFamily â€” DiseÃ±o aprobado

## Objetivo

Crear un sudoku 4Ã—4 con imÃ¡genes para niÃ±os de 4 a 8 aÃ±os. La experiencia es mobile-first, muy guiada, sin cuentas, anuncios, cronÃ³metro, vidas ni puntuaciÃ³n negativa.

## Experiencia

- Inicio con la marca â€œSudoku Marinoâ€ y el logotipo oficial de LetsFamily.es.
- Primer movimiento acompaÃ±ado por una tortuga guÃ­a.
- ColocaciÃ³n mediante dos toques: casilla y criatura.
- Los errores no se colocan y generan una pista amable, hablada y visual.
- Final con celebraciÃ³n marina y las acciones â€œJugar otra vezâ€ e â€œInicioâ€.

## DiseÃ±o

La referencia visual es el concepto aprobado el 15 de julio de 2026: ocÃ©ano luminoso, superficies aqua, azul marino de alto contraste, coral y amarillo como acentos, ilustraciÃ³n 2D infantil premium y controles grandes. En escritorio, el tablero se sitÃºa a la izquierda y la guÃ­a a la derecha.

## Arquitectura

React, TypeScript y Vite. Motor del sudoku puro, estado de partida separado, audio con APIs del navegador, ocho puzles locales y persistencia mÃ­nima versionada en `localStorage`.