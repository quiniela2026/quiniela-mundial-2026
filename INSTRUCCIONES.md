# 🏆 Guía de despliegue — Quiniela Mundial 2026

## Lo que necesitas (todo gratis, sin tarjeta de crédito)
- Cuenta en **github.com**
- Cuenta en **supabase.com**
- Cuenta en **vercel.com**
- **Node.js** instalado en tu computador → nodejs.org

---

## PASO 1 — Crear la base de datos en Supabase (5 minutos)

1. Ve a **supabase.com** → "Start your project" → crea cuenta con Google
2. Crea un nuevo proyecto:
   - Name: `quiniela-mundial`
   - Database Password: anótala (no la necesitas más pero guárdala)
   - Region: elige la más cercana (US East está bien)
3. Espera ~2 minutos mientras se crea el proyecto
4. En el menú izquierdo: ve a **SQL Editor**
5. Haz clic en "+ New query"
6. **Abre el archivo `supabase_schema.sql`** que está en esta carpeta
7. Copia TODO el contenido y pégalo en el SQL Editor
8. Haz clic en **"Run"** (botón verde)
9. Deberías ver: "Success. No rows returned"

---

## PASO 2 — Obtener las credenciales de Supabase (2 minutos)

1. En tu proyecto Supabase, ve al menú: **Settings → API**
2. Copia estos dos valores:
   - **Project URL** → ejemplo: `https://abcdefghijk.supabase.co`
   - **anon public** (en "Project API Keys")
3. Guárdalos, los necesitas en el Paso 4

---

## PASO 3 — Instalar y probar en tu computador (3 minutos)

1. Descarga o descomprime la carpeta `quiniela-mundial` en tu computador
2. Abre una terminal (Command Prompt / Terminal) en esa carpeta
3. Ejecuta:
   ```
   npm install
   ```
4. Crea el archivo `.env` (en la misma carpeta):
   - Copia el archivo `.env.example`
   - Renómbralo a `.env`
   - Rellena con tus datos de Supabase:
     ```
     VITE_SUPABASE_URL=https://tuproyecto.supabase.co
     VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     ```
5. Ejecuta:
   ```
   npm run dev
   ```
6. Abre en el navegador: **http://localhost:5173**
7. Regístrate con tu email → ¡ya funciona localmente!

---

## PASO 4 — Hacerte administrador (1 minuto)

1. Regístrate en la app (con tu email)
2. Ve a Supabase → **SQL Editor** → New query
3. Ejecuta esto (cambia el email):
   ```sql
   update public.profiles set es_admin = true where email = 'tu@email.com';
   ```
4. Recarga la app → verás el tab **Admin** en el menú

---

## PASO 5 — Publicar en internet gratis con Vercel (5 minutos)

### Opción A: Desde GitHub (recomendada)

1. Crea un repositorio en **github.com** (puede ser privado)
2. Sube la carpeta del proyecto:
   ```
   git init
   git add .
   git commit -m "Quiniela Mundial 2026"
   git branch -M main
   git remote add origin https://github.com/TUUSUARIO/quiniela-mundial.git
   git push -u origin main
   ```
3. Ve a **vercel.com** → "New Project" → importa tu repo de GitHub
4. En la pantalla de configuración, antes de hacer deploy:
   - Haz clic en **"Environment Variables"**
   - Agrega:
     - `VITE_SUPABASE_URL` → tu URL de Supabase
     - `VITE_SUPABASE_ANON_KEY` → tu clave anon
5. Haz clic en **"Deploy"**
6. En ~2 minutos tendrás una URL tipo: `quiniela-mundial.vercel.app`

### Opción B: Arrastrar y soltar (sin GitHub)

1. Ejecuta en la terminal:
   ```
   npm run build
   ```
2. Se crea una carpeta llamada `dist`
3. Ve a **vercel.com** → arrastra la carpeta `dist` al área de deploy
4. ¡Listo! (pero no tendrá las variables de entorno automáticas, necesitas la opción A)

---

## PASO 6 — Invitar a tus participantes

1. Comparte el link de Vercel con todos
2. Cada persona:
   - Se registra con su email y un nombre
   - Va al fixture y llena sus predicciones
   - Las predicciones se guardan automáticamente

---

## Cómo cargar resultados de los partidos

1. Cuando termina un partido, ve a la pestaña **Admin**
2. Busca el partido por grupo
3. Ingresa el marcador final y haz clic en **Guardar**
4. Los puntos de todos se actualizan automáticamente en el Ranking

---

## Preguntas frecuentes

**¿Se puede trampar?**
No. Las predicciones se bloquean automáticamente a la hora de inicio de cada partido. Además, la base de datos tiene Row Level Security (RLS) activado: nadie puede modificar las predicciones de otro usuario, ni siquiera con la API.

**¿Qué pasa si se cae Supabase?**
El plan gratuito tiene 99.9% uptime. Para una quiniela entre amigos es más que suficiente.

**¿Y si llegan más de 50 personas?**
Supabase free aguanta hasta 50,000 usuarios activos/mes. No hay problema.

**¿La app funciona en celular?**
Sí, tiene diseño responsivo y barra de navegación inferior para móvil.

**¿Puedo cambiar el nombre de la quiniela?**
Sí, busca "QUINIELA 2026" en `src/App.jsx` y `src/pages/AuthPage.jsx` y cámbialo.

---

## Sistema de puntos

| Resultado | Puntos |
|-----------|--------|
| Marcador exacto (ej: predijiste 2-1 y fue 2-1) | **3 puntos** |
| Resultado correcto (ej: predijiste 2-1, fue 3-0, ganó el mismo) | **1 punto** |
| Incorrecto | 0 puntos |

Máximo posible: 72 partidos × 3 = **216 puntos**

---

¡Buena suerte y que gane el mejor! ⚽🏆
