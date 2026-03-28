# 🤖 META RP — Bot de Calificación de Staff

> Desarrollado por **Vladimir** para la comunidad **META RP**

---

## 📋 Descripción

Bot de Discord para calificar a los miembros del Staff de META RP mediante el comando `/calificar-staff`. Incluye sistema de estadísticas, embeds personalizados y registro en canales internos.

---

## ⚙️ Instalación

### 1. Requisitos previos
- [Node.js](https://nodejs.org/) v18 o superior
- Una aplicación creada en el [Portal de Desarrolladores de Discord](https://discord.com/developers/applications)

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar el `.env`
Copia el archivo `.env.example` y renómbralo a `.env`:
```bash
cp .env.example .env
```

Luego completa los valores:
```env
TOKEN=tu_token_de_bot
CLIENT_ID=id_de_tu_aplicacion
GUILD_ID=id_de_tu_servidor
```

### 4. Registrar los comandos slash
```bash
npm run deploy
```

### 5. Iniciar el bot
```bash
npm start
```

---

## 🛠️ Configuración de IDs

Todos los IDs están centralizados en `src/config.js`:

| Variable | ID | Descripción |
|---|---|---|
| `ROL_STAFF_ID` | `1487478314309390488` | Rol que identifica al Staff |
| `CANAL_CALIFICACIONES_ID` | `1487480310764540055` | Canal donde se publican las calificaciones |
| `CANAL_REGISTRO_ID` | `1487480346114261143` | Canal de registro/logs internos |

---

## 📌 Uso del comando

```
/calificar-staff staff:@Usuario estrellas:5 motivo:Muy buen trato
```

| Opción | Descripción |
|---|---|
| `staff` | Menciona al miembro del staff a calificar |
| `estrellas` | De 1 a 5 estrellas |
| `motivo` | Opinión personal (máx. 500 caracteres) |

### Validaciones incluidas:
- ✅ El miembro seleccionado debe tener el **rol de Staff**
- ❌ Si no tiene el rol → mensaje ephemeral: *"😡 | Ese no es STAFF, bobo!"*
- 🚫 No se puede calificar a uno mismo
- 📊 Estadísticas automáticas (cantidad y promedio de calificaciones)

---

## 📁 Estructura del proyecto

```
metarp-bot/
├── src/
│   ├── commands/
│   │   └── calificar-staff.js   # Lógica del comando principal
│   ├── config.js                # IDs y configuración central
│   ├── ratingsManager.js        # Gestor de calificaciones en memoria
│   ├── deploy-commands.js       # Script para registrar comandos slash
│   └── index.js                 # Archivo principal del bot
├── .env.example                 # Plantilla de variables de entorno
├── package.json
└── README.md
```

---

## 💾 Nota sobre persistencia

Las calificaciones se almacenan **en memoria** (se resetean al reiniciar el bot). Si necesitás persistencia permanente, podés integrar una base de datos como **SQLite**, **MongoDB** o **PostgreSQL** en el archivo `src/ratingsManager.js`.

---

## 📄 Licencia

© 2026 META RP — Argentina RP. Todos los derechos reservados.
