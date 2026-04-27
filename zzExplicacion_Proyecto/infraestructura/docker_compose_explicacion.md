# Análisis Línea por Línea: Archivo `docker-compose.yml`

Docker Compose es el orquestador que permite que todo el equipo de desarrollo (o el servidor de producción) ejecute el proyecto exactamente bajo las mismas condiciones de software, evitando el clásico "en mi máquina sí funciona".

```yaml
1: services:
2:   app:
3:     build: .
4:     container_name: laravel_app
...
6:     volumes:
7:       - .:/var/www/html
```
- **Líneas 1-7:** **El Contenedor de PHP (Laravel).** Este servicio construye el backend. 
  - La directiva `volumes: - .:/var/www/html` es fundamental para el desarrollo. Significa: "Toma todos los archivos de esta carpeta de Windows (`.`) y ponlos a disposición dentro de la carpeta `/var/www/html` del contenedor Linux virtualizado". Cuando tú guardas un archivo PHP en VS Code, el contenedor ve el cambio instantáneamente.

```yaml
26:   db:
27:     image: postgres:16
28:     container_name: postgres_db
...
31:       POSTGRES_DB: laravel
32:       POSTGRES_USER: laravel
33:       POSTGRES_PASSWORD: secret
34:       TZ: America/Argentina/Buenos_Aires
```
- **Líneas 26-34:** **El Contenedor de Base de Datos.**
  - Descarga la imagen oficial de PostgreSQL 16. No importa si tienes Windows o Mac, Docker levantará un Linux con Postgres 16 idéntico.
  - Pasa variables de entorno (`POSTGRES_DB`) para que al iniciar, la base de datos se auto-cree con las credenciales que tu archivo `.env` de Laravel espera encontrar.
  - La zona horaria (`America/Argentina/Buenos_Aires`) sincroniza las fechas de creación y actualización para que no tengas problemas de desfasaje de 3 horas.

```yaml
44:   node:
45:     image: node:20
46:     container_name: vite_dev
...
49:     command: ["sh", "-c", "npm install && npm run dev"]
50:     ports:
51:       - "5173:5173"
```
- **Líneas 44-51:** **El Contenedor de Frontend (Vite/React).**
  - Laravel provee el backend, pero React necesita Node.js para ser compilado y servido. Este contenedor instala Node 20.
  - `command: ... npm run dev`: Apenas prende el contenedor, corre el servidor de desarrollo de Vite.
  - `ports: "5173:5173"`: Abre el puerto 5173 (el que usa Vite) para que tu navegador en Windows pueda comunicarse con el servidor React que está atrapado adentro de la máquina virtual de Docker. Eso es lo que permite el Hot Module Replacement (cuando guardas un `.jsx` y la pantalla se actualiza sola).
