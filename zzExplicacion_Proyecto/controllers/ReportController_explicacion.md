# Análisis Línea por Línea: Controlador `ReportController.php`

Este es el archivo más pequeño pero encierra un concepto de Ingeniería de Software avanzadísimo: **El Patrón de Diseño Factory (Fábrica)**.

```php
7: class ReportController extends Controller
8: {
9:     public function exportar(Request $request, string $tipo)
10:     {
11:         try {
12:             $service = \App\Factories\ReportFactory::make($tipo);
13:             $path = $service->generarPdf($request);
```
- **Líneas 9-13:** **Patrón Factory.** Imagina que la universidad necesita 15 tipos de reportes en PDF diferentes (alumnos, docentes, materias, planes). En lugar de escribir un controlador gigante con 15 `if/else`, se utiliza una "Fábrica". 
  - La línea 12 recibe el string de la URL (`$tipo`, ej: `"docentes"`). 
  - La fábrica lee ese texto y devuelve *la clase encargada de generar ese reporte específico*. 
  - Esto significa que el controlador de reportes **NUNCA** tendrá que cambiar, sin importar si mañana la universidad agrega 50 reportes nuevos. Solo se crea el reporte nuevo en la carpeta factories y el controlador lo usará dinámicamente (`$service->generarPdf`). **Principio Open/Closed (Abierto a la extensión, Cerrado a la modificación).**

```php
15:             return response()->download($path, "reporte_{$tipo}.pdf")
16:                             ->deleteFileAfterSend(true);
```
- **Líneas 15-16:** **Limpieza Automática.** 
  - La línea 15 toma el PDF que se acaba de crear en el servidor y fuerza al navegador del usuario a descargarlo (`download`).
  - La línea 16 llama a `deleteFileAfterSend(true)`. JasperReports suele guardar los PDFs generados temporalmente en el disco del servidor. Si tienes mil docentes descargando reportes, el disco duro del servidor se llenará en una semana. Con esta línea, Laravel envía el PDF a internet y, en el mismo instante en que la descarga termina, **borra el archivo físico del disco del servidor**. Impecable gestión de memoria.
