# Etapa 1: PHP + Composer
FROM php:8.2-fpm

# 1. Instalamos dependencias del sistema (SIN JAVA por ahora)
RUN apt-get update && apt-get install -y \
    libfontconfig1 \
    fonts-dejavu \
    fontconfig \
    git curl zip unzip libpng-dev libjpeg-dev libfreetype6-dev libpq-dev wget \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo pdo_pgsql gd \
    && rm -rf /var/lib/apt/lists/*

# 2. INSTALACIÓN MANUAL DE JAVA 8 (Temurin)
# Descargamos el binario, lo descomprimimos y lo ponemos en el PATH
RUN wget https://github.com/adoptium/temurin8-binaries/releases/download/jdk8u402-b06/OpenJDK8U-jre_x64_linux_hotspot_8u402b06.tar.gz \
    && mkdir -p /opt/java \
    && tar -xzf OpenJDK8U-jre_x64_linux_hotspot_8u402b06.tar.gz -C /opt/java --strip-components=1 \
    && rm OpenJDK8U-jre_x64_linux_hotspot_8u402b06.tar.gz

# Configuramos las variables de entorno para que el sistema encuentre Java 8
ENV JAVA_HOME=/opt/java
ENV PATH="${JAVA_HOME}/bin:${PATH}"

# Instalar Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Configurar el directorio de trabajo
WORKDIR /var/www/html

# Copiar archivos
COPY . .

# Instalar dependencias de Laravel
RUN composer install --no-dev --optimize-autoloader

# Instalar dependencias de Node (React)
RUN npm install && npm run build

# Permisos críticos para Jasper
RUN chown -R www-data:www-data /var/www/html/storage \
    && chmod -R 775 /var/www/html/storage

RUN mkdir -p /var/cache/fontconfig /var/www/html/storage/app/reports/pdf \
    && chown -R www-data:www-data /var/www/html/storage \
    && chmod -R 777 /var/cache/fontconfig
    
CMD ["php-fpm"]