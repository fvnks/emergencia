
# Gestor de Brigada - Sistema de Gestión para Equipos de Emergencia

## 1. Introducción

El **Gestor de Brigada** es una aplicación web moderna diseñada para facilitar la administración integral de los recursos y operaciones de equipos de emergencia, como brigadas de bomberos, equipos de rescate, o unidades de respuesta a incidentes. Permite llevar un control detallado de vehículos, personal, equipamiento (como Equipos de Respiración Autónoma - ERA), inventario general, tareas de mantenimiento, checklists operativos, y más.

La aplicación está construida con un stack tecnológico actual, priorizando la experiencia de usuario, la eficiencia y la capacidad de integrar funcionalidades de inteligencia artificial para asistir en diversas tareas.

## 2. Características Principales

*   **Panel Principal (Dashboard):** Visualización rápida del estado operativo general, alertas y actividad reciente.
*   **Gestión de Vehículos:** Registro, edición, eliminación y visualización detallada de vehículos, incluyendo su estado, mantenimientos programados y documentación.
*   **Gestión de Equipos ERA:** Administración de equipos de respiración autónoma, asignación a personal y seguimiento de su estado e inspecciones.
*   **Gestión de Mantención:** Programación y seguimiento de tareas de mantenimiento para vehículos, equipos y otros activos.
*   **Gestión de Inventario:** Control de stock de ítems generales y Equipos de Protección Personal (EPP), asignación de EPP a personal, y gestión de bodegas.
*   **Gestión de Tareas:** Creación, asignación y seguimiento del estado de tareas operativas o administrativas.
*   **Gestión de Personal:** Administración de usuarios, roles y permisos. Visualización de EPP y tareas asignadas a cada miembro.
*   **Informes y Estadísticas:** Generación de informes visuales sobre la disponibilidad de recursos (vehículos, ERA).
*   **Checklists Operativos:** Creación y gestión de plantillas de checklists, y registro de su completitud para activos.
*   **Seguimiento GPS (Simulado):** Visualización en tiempo real (simulada) de la ubicación y estado de los vehículos en un mapa.
*   **Configuración del Sistema:**
    *   Cambio de contraseña para el usuario actual.
    *   Herramientas administrativas (simulación de respaldo de datos).
    *   Gestión de Roles y Permisos.
    *   Administración de Bodegas de almacenamiento.
    *   Personalización de la apariencia (logo y texto del encabezado).
*   **Autenticación:** Sistema de inicio de sesión seguro basado en roles.

## 3. Tecnologías Utilizadas

*   **Frontend:**
    *   **Next.js (App Router):** Framework React para desarrollo de aplicaciones web modernas, con renderizado del lado del servidor (SSR) y generación de sitios estáticos (SSG).
    *   **React:** Biblioteca JavaScript para construir interfaces de usuario.
    *   **TypeScript:** Superset de JavaScript que añade tipado estático.
    *   **ShadCN UI:** Colección de componentes de UI reutilizables y personalizables, construidos sobre Radix UI y Tailwind CSS.
    *   **Tailwind CSS:** Framework CSS "utility-first" para diseño rápido y responsivo.
    *   **Framer Motion:** Biblioteca para animaciones fluidas y declarativas.
    *   **Lucide React:** Biblioteca de iconos SVG ligeros y personalizables.
    *   **Recharts:** Biblioteca para la creación de gráficos.
    *   **React Hook Form & Zod:** Para la gestión y validación de formularios.
    *   **Context API:** Para la gestión del estado global (autenticación, datos de aplicación).
    *   **Leaflet:** Biblioteca para mapas interactivos (usada en el módulo de seguimiento).
*   **Backend (Simulado/Servicios):**
    *   Las funciones dentro de `src/services/` simulan la interacción con una API y una base de datos. Estas funciones utilizan `mysql2/promise` para conectarse a una base de datos MySQL.
    *   **Genkit (Firebase):** Utilizado para funcionalidades de IA. En este proyecto, se usa para:
        *   Simular un flujo de respaldo del sistema (`systemBackupFlow`).
        *   Simular actualizaciones de seguimiento de vehículos (`getVehicleUpdatesFlow`).
*   **Base de Datos:**
    *   **MySQL:** Sistema de gestión de bases de datos relacional. El esquema se define en `db_schema.sql` (debe ser creado por el usuario).
*   **Herramientas de Desarrollo:**
    *   **npm/yarn:** Gestor de paquetes.
    *   **ESLint & Prettier (implícito):** Para el formateo y la calidad del código.

## 4. Requisitos Previos

*   **Node.js:** Versión 18.x o superior (recomendado LTS).
*   **npm** (v8+) o **yarn** (v1.22+).
*   Un servidor de **MySQL** accesible (local o remoto).

## 5. Instalación y Puesta en Marcha

### 5.1. Configuración del Entorno

1.  **Clonar el Repositorio (si aplica):**
    ```bash
    # Si estuvieras clonando un repo externo:
    # git clone https://url.del.repositorio.git
    # cd gestor-de-brigada
    ```

2.  **Instalar Dependencias:**
    Desde la raíz del proyecto, ejecuta:
    ```bash
    npm install
    # o si usas yarn:
    # yarn install
    ```

3.  **Variables de Entorno:**
    Crea un archivo `.env.local` en la raíz del proyecto. Este archivo **NO** debe ser versionado (está en `.gitignore`).
    Copia el contenido de `.env.example` (si existe) o usa la siguiente plantilla, reemplazando los valores con tus credenciales de MySQL:

    ```env
    # Configuración de la Base de Datos MySQL
    DB_HOST=tu_host_mysql # ej: localhost o la IP/DNS de tu servidor MySQL
    DB_PORT=3306 # Puerto estándar de MySQL
    DB_USER=tu_usuario_mysql
    DB_PASSWORD=tu_contraseña_mysql
    DB_NAME=gestor_brigada_db # Nombre de la base de datos que usarás

    # (Opcional) Google API Key para Genkit si se usan modelos de Google AI
    # GOOGLE_API_KEY=TU_GOOGLE_API_KEY
    ```

### 5.2. Base de Datos

1.  **Crear la Base de Datos:**
    Asegúrate de que la base de datos especificada en `DB_NAME` (ej: `gestor_brigada_db`) exista en tu servidor MySQL. Si no existe, créala.
    ```sql
    CREATE DATABASE gestor_brigada_db;
    ```

2.  **Ejecutar el Esquema SQL:**
    El archivo `db_schema.sql` (no incluido en este listado de archivos, pero que debería existir en un proyecto completo) contiene las sentencias SQL para crear todas las tablas necesarias. Debes ejecutar este script en tu base de datos `gestor_brigada_db`. Puedes hacerlo usando una herramienta de gestión de MySQL como MySQL Workbench, DBeaver, o desde la línea de comandos:
    ```bash
    mysql -u tu_usuario_mysql -p gestor_brigada_db < ruta/al/archivo/db_schema.sql
    ```
    *(Asegúrate de que el archivo `db_schema.sql` esté completo y actualizado con todas las tablas y relaciones del proyecto.)*

3.  **Poblar Datos Iniciales (Seeding):**
    El proyecto incluye un script para crear un usuario administrador por defecto y otros datos iniciales necesarios. Ejecuta:
    ```bash
    npm run seed:db
    ```
    Esto debería crear un usuario administrador con las siguientes credenciales (puedes cambiarlas en `src/scripts/seed-database.ts` o directamente en la base de datos después):
    *   **Email:** `admin@example.com`
    *   **Contraseña:** `password123`

### 5.3. Iniciar la Aplicación

1.  **Servidor de Desarrollo Next.js:**
    Para iniciar la aplicación en modo desarrollo (generalmente en `http://localhost:9002` o el puerto que hayas configurado):
    ```bash
    npm run dev
    ```

2.  **Servidor de Desarrollo Genkit (Opcional, si se usan flujos de IA):**
    Si deseas probar o desarrollar los flujos de Genkit, necesitarás iniciar el servidor de desarrollo de Genkit en una terminal separada:
    ```bash
    npm run genkit:dev
    # o para que se reinicie con los cambios:
    # npm run genkit:watch
    ```
    Los flujos de Genkit suelen estar disponibles en `http://localhost:3400` para su inspección a través del "Genkit Developer UI".

## 6. Estructura del Proyecto

```
gestor-de-brigada/
├── src/
│   ├── ai/                     # Lógica de Inteligencia Artificial con Genkit
│   │   ├── flows/              # Flujos de Genkit (ej: respaldo, seguimiento)
│   │   ├── dev.ts              # Archivo para registrar flujos en Genkit Dev UI
│   │   └── genkit.ts           # Configuración global de Genkit
│   ├── app/                    # Rutas y UI principal (Next.js App Router)
│   │   ├── (app)/              # Rutas protegidas por autenticación
│   │   │   ├── dashboard/
│   │   │   ├── vehicles/
│   │   │   ├── equipment/
│   │   │   ├── maintenance/
│   │   │   ├── inventory/
│   │   │   ├── tasks/
│   │   │   ├── personnel/
│   │   │   ├── reports/
│   │   │   ├── checklists/
│   │   │   ├── tracking/
│   │   │   └── settings/
│   │   │       ├── appearance/
│   │   │       ├── roles-permissions/
│   │   │       └── warehouses/
│   │   ├── login/              # Página de inicio de sesión
│   │   ├── globals.css         # Estilos globales y variables de tema
│   │   ├── layout.tsx          # Layout raíz de la aplicación
│   │   └── page.tsx            # Página de entrada (redirige según autenticación)
│   ├── components/             # Componentes React reutilizables
│   │   ├── auth/               # Componentes de autenticación (ej: LoginForm)
│   │   ├── dashboard/
│   │   ├── vehicles/
│   │   ├── equipment/
│   │   ├── maintenance/
│   │   ├── inventory/
│   │   ├── tasks/
│   │   ├── personnel/
│   │   ├── checklists/
│   │   ├── settings/
│   │   ├── layout/             # Componentes del layout principal (Header, SidebarNav)
│   │   ├── icons/              # Componentes de iconos personalizados (ej: Logo)
│   │   └── ui/                 # Componentes de ShadCN UI (Button, Card, etc.)
│   ├── contexts/               # React Contexts para gestión de estado global
│   │   ├── auth-context.tsx
│   │   └── app-data-context.tsx
│   ├── hooks/                  # Hooks personalizados de React
│   │   ├── use-toast.ts
│   │   └── use-mobile.tsx
│   ├── lib/                    # Utilidades y helpers
│   │   ├── db.ts               # Lógica de conexión a la base de datos
│   │   └── utils.ts            # Funciones de utilidad general (ej: cn)
│   ├── scripts/                # Scripts (ej: seed-database.ts)
│   ├── services/               # Lógica de negocio y comunicación con "backend"
│   │   ├── userService.ts
│   │   ├── vehicleService.ts
│   │   ├── ... (otros servicios)
│   └── types/                  # Definiciones de tipos TypeScript
│       ├── vehicleTypes.ts
│       ├── ... (otros tipos)
├── public/                     # Archivos estáticos
├── .env.local                  # Variables de entorno (NO VERSIONAR)
├── next.config.ts              # Configuración de Next.js
├── package.json
├── tailwind.config.ts          # Configuración de Tailwind CSS
└── tsconfig.json               # Configuración de TypeScript
```

## 7. Módulos Detallados

*   **Dashboard:** Ofrece una vista general del estado de la brigada, incluyendo vehículos operativos, tareas activas, personal disponible, equipos listos y alertas críticas. Muestra actividad reciente y gráficos de resumen.
*   **Vehículos:** Permite el CRUD (Crear, Leer, Actualizar, Eliminar) de vehículos. Cada vehículo tiene detalles como marca, modelo, patente, estado, fechas de mantenimiento y documentación, y una imagen. Se pueden asignar equipos ERA e ítems de inventario a cada vehículo.
*   **Equipos (ERA):** Gestión específica para Equipos de Respiración Autónoma. Incluye CRUD, detalles de cada equipo (código, marca, modelo, fechas de inspección), y la capacidad de asignarlos a miembros del personal.
*   **Mantención:** Programación y seguimiento de tareas de mantenimiento para diversos tipos de ítems (vehículos, ERA, extintores, etc.). Permite registrar fechas programadas, responsables, estado y notas.
*   **Inventario:** Administración del inventario general. Permite registrar ítems con código, nombre, categoría, ubicación (bodega y sub-ubicación), cantidad, unidad de medida, stock mínimo, y si es un EPP. Se pueden asignar EPPs a personal y ver el historial de movimientos de cada ítem.
*   **Tareas:** Creación, asignación y seguimiento de tareas generales (no necesariamente de mantenimiento). Cada tarea tiene descripción, asignado, fecha de vencimiento y estado.
*   **Personal:** Lista de los miembros del personal con su información (nombre, email, rol, teléfono). Muestra EPP y tareas activas asignadas a cada usuario. La creación y edición de usuarios se realiza aquí.
*   **Informes:** Sección para visualizar datos consolidados. Actualmente muestra gráficos de torta sobre la disponibilidad de vehículos y equipos ERA, con filtros básicos.
*   **Checklists:** Permite definir plantillas de checklists (ej: revisión diaria de vehículo). Los checklists asociados a activos específicos (vehículos, ERA) se generan automáticamente y los usuarios pueden marcar los ítems como completados, añadiendo notas. Se guarda un historial de completitud.
*   **Seguimiento GPS:** Módulo (simulado) que muestra en un mapa Leaflet la ubicación y estado de los vehículos, actualizándose periódicamente a través de un flujo de Genkit.
*   **Configuración:**
    *   **Cuenta:** Permite al usuario cambiar su contraseña.
    *   **Herramientas Administrativas:**
        *   **Respaldo de Datos:** Simula la iniciación de un respaldo del sistema mediante un flujo de Genkit.
    *   **Roles y Permisos (Admin):** Creación y gestión de roles personalizados, asignando permisos específicos a cada rol para controlar el acceso a diferentes módulos y acciones.
    *   **Gestionar Bodegas (Admin):** CRUD para bodegas o centros de almacenamiento, usados en el módulo de Inventario.
    *   **Apariencia (Admin):** Permite personalizar el logo (subiendo una URL) y el texto que aparece en la barra de navegación. Estos cambios son locales al navegador del usuario.

## 8. Funcionalidades de IA (Genkit)

Genkit se utiliza para orquestar flujos que pueden involucrar modelos de IA o, como en este caso, simular operaciones del sistema.

*   **Respaldo del Sistema (`src/ai/flows/backup-system-flow.ts`):**
    *   Este flujo simula la lógica de iniciar un respaldo de datos del sistema.
    *   No realiza un respaldo real de la base de datos, pero muestra cómo un flujo de Genkit podría ser invocado para tal tarea.
    *   Incluye comentarios sobre consideraciones para una implementación real (ej. `mysqldump`).
*   **Seguimiento de Vehículos (`src/ai/flows/vehicle-tracking-flow.ts`):**
    *   Este flujo simula la recepción de actualizaciones de ubicación y estado de los vehículos.
    *   Mantiene un estado en memoria (solo para demostración) de los vehículos y actualiza sus coordenadas y estado aleatoriamente cada vez que se llama.
    *   La página de "Seguimiento GPS" consume este flujo para mostrar los datos en el mapa.

## 9. Consideraciones Adicionales

*   **Estado de Desarrollo:** Esta aplicación es un prototipo funcional con muchas características implementadas a nivel de UI y servicios simulados que interactúan con una base de datos MySQL. Algunas funcionalidades avanzadas o integraciones de IA más complejas pueden requerir desarrollo adicional en el backend.
*   **Backend Simulado:** La capa de `services` actúa como un backend simulado. En un entorno de producción, esta lógica se trasladaría a una API dedicada.
*   **Seguridad:** La autenticación se maneja, pero para producción se requerirían medidas de seguridad adicionales (HTTPS, protección contra ataques comunes, gestión robusta de sesiones, etc.). El hashing de contraseñas se realiza con `bcryptjs`.
*   **Subida de Archivos:** La subida de imágenes para vehículos está preparada en el frontend pero requiere una implementación de backend (almacenamiento de archivos) para funcionar completamente.
*   **Base de Datos:** Es crucial que el esquema de la base de datos (`db_schema.sql`) esté correctamente configurado y sea compatible con las operaciones que realizan los servicios.

Este README.md proporciona una visión general completa del proyecto Gestor de Brigada.
