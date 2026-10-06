# Cerrojo — Autenticación segura con cookies httpOnly en Next.js

Sistema de autenticación construido con **Next.js 16 (App Router)**, **Supabase Auth + Database** y **TypeScript**, donde la sesión vive exclusivamente en **cookies httpOnly** gestionadas por `@supabase/ssr`. Todas las operaciones de autenticación se ejecutan en **Server Actions**, las rutas privadas se protegen en el **proxy (middleware)** y cada respuesta incluye capas de defensa contra **XSS** y **CSRF**.

- **Demo en producción:** _(agregar enlace de Vercel)_
- **Repositorio:** _(agregar enlace de GitHub)_

---

## Funcionalidades

| Requisito | Implementación |
|---|---|
| Registro con validación | `/registro` — zod en cliente y servidor, medidor de fortaleza, confirmación de contraseña |
| Inicio de sesión | `/login` — vuelve a la página original con `?next=` saneado |
| Cierre de sesión | Server Action `cerrarSesion` por POST (revoca el refresh token y borra cookies) |
| Verificación de email | Enlace del correo → Route Handler `/auth/confirm` (PKCE `code` o `token_hash`) + reenvío |
| Recuperación de contraseña | `/recuperar` → correo → `/auth/confirm` → `/actualizar-contrasena` |
| Middleware de protección | `src/proxy.ts` + `src/lib/supabase/middleware.ts` |
| Rutas protegidas | `/dashboard`, `/perfil`, `/actualizar-contrasena` (grupo `(privado)`) |
| Navegación condicional | `src/components/Navegacion.tsx` (Server Component) |
| Base de datos | Tabla `profiles` con RLS y trigger que crea el perfil al registrarse |

> **Nota sobre Next.js 16:** el archivo `middleware.ts` fue renombrado a **`proxy.ts`** (misma funcionalidad, la convención anterior está obsoleta). Por eso el middleware de este proyecto vive en `src/proxy.ts`.

## Arquitectura

```
src/
├── proxy.ts                         # Middleware: CSP con nonce + refresco de sesión + protección de rutas
├── lib/
│   ├── supabase/
│   │   ├── server.ts                # Cliente para Server Components, Server Actions y Route Handlers
│   │   ├── client.ts                # Cliente para Client Components (solo rol anónimo, sin acceso al token)
│   │   ├── middleware.ts            # Cliente para el proxy: updateSession()
│   │   └── cookies.ts               # Banderas httpOnly / secure / sameSite aplicadas a todas las cookies
│   ├── dal.ts                       # Capa de acceso a datos (getUser, perfil, requerirUsuario)
│   ├── validacion.ts                # Esquemas zod compartidos cliente/servidor
│   ├── errores-auth.ts              # Errores de Supabase → mensajes seguros
│   ├── rutas.ts                     # Rutas privadas/públicas y saneo de ?next= (anti open-redirect)
│   └── env.ts                       # Variables de entorno validadas
├── app/
│   ├── actions/auth.ts              # Server Actions: registro, login, logout, recuperar, nueva contraseña
│   ├── actions/perfil.ts            # Server Action: actualizar perfil
│   ├── auth/confirm/route.ts        # Route Handler: verificación de correo y recuperación
│   ├── (auth)/                      # login, registro, recuperar, verificar-email
│   ├── (privado)/                   # dashboard, perfil, actualizar-contrasena (+ verificación en layout)
│   ├── robots.ts / sitemap.ts       # SEO: indexa solo páginas públicas
│   └── layout.tsx                   # Metadatos, navegación condicional
└── components/                      # Formularios (useActionState + validación cliente), UI
supabase/schema.sql                  # Tabla profiles, RLS, grants y triggers
```

### Flujo de una petición

1. El navegador envía las cookies `sb-<ref>-auth-token` (httpOnly) automáticamente.
2. `proxy.ts` genera un **nonce** y la **CSP**, crea el cliente de Supabase del middleware y llama a `getClaims()`, que verifica el JWT y, si expiró, lo **refresca** reescribiendo las cookies.
3. Si la ruta es privada y no hay sesión → `307 /login?next=/ruta`. Si hay sesión y se abre `/login` o `/registro` → `/dashboard`.
4. El Server Component vuelve a comprobar la sesión con `getUser()` (defensa en profundidad) y renderiza.
5. Los formularios llaman a Server Actions, que validan con zod, operan con el cliente de servidor y escriben las cookies con `cookies().set(...)`.

## Seguridad

### Cookies httpOnly, Secure, SameSite
`src/lib/supabase/cookies.ts` define `{ httpOnly: true, secure: true (en producción), sameSite: "lax", path: "/" }`. Se pasan como `cookieOptions` a `createServerClient` **y** se fuerzan en cada `setAll`, de modo que ninguna cookie de sesión puede emitirse sin ellas.

### Tokens fuera del alcance de JavaScript
- No se usa `localStorage` ni `sessionStorage`.
- El cliente del navegador (`client.ts`) tiene un adaptador de cookies vacío y `persistSession: false`.
- El panel incluye una **prueba en vivo** (`PruebaSeguridad.tsx`) que intenta leer `document.cookie`, el almacenamiento local y `supabase.auth.getSession()` desde el navegador, y confirma que nada es accesible.

### XSS
- **Content Security Policy estricta con nonce por petición** (`script-src 'self' 'nonce-…' 'strict-dynamic'`, `object-src 'none'`, `base-uri 'self'`, `frame-ancestors 'none'`). Un `<script>` inyectado no se ejecuta.
- React escapa todo el texto renderizado; no se usa `dangerouslySetInnerHTML` con datos de usuario (el único uso es el JSON-LD estático, serializado escapando `<`).
- Validación de entradas (el nombre rechaza `<`, `>`, etc.) y restricciones `CHECK` en la base de datos.
- Aunque un XSS llegara a ejecutarse, no podría robar la sesión porque las cookies son httpOnly.

### CSRF
- Las Server Actions solo aceptan `POST` y Next.js **compara `Origin` con `Host`**, rechazando peticiones de otros sitios.
- Cookies `SameSite=Lax`: el navegador no las adjunta a POST/fetch de otros orígenes.
- CSP `form-action 'self'`: los formularios no pueden enviarse a otros dominios.
- El cierre de sesión es un `POST` (no un enlace `GET` que pudiera dispararse con `<img src>`).

### Otras medidas
- **Open redirect:** `rutaSegura()` solo acepta rutas internas en `?next=` (`//evil.com`, `https://…` y `/\evil.com` se descartan).
- **Enumeración de usuarios:** registro, recuperación y reenvío muestran el mismo mensaje exista o no la cuenta; el login responde siempre "Correo o contraseña incorrectos".
- **Mensajes de error seguros:** `errores-auth.ts` traduce los códigos de Supabase; los detalles solo se registran en el servidor.
- **Cabeceras:** HSTS, `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`; `X-Powered-By` desactivado.
- **Sesiones:** al cambiar la contraseña se cierran las sesiones de otros dispositivos (`signOut({ scope: "others" })`).
- **Honeypot** anti-bots en los formularios públicos y límite de tamaño del cuerpo de las Server Actions.
- **RLS:** cada usuario solo lee/edita su perfil; el rol `anon` no tiene permisos; `authenticated` solo puede actualizar `full_name` y `bio`.
- **Variables de entorno:** solo la URL y la clave *publishable* (públicas por diseño). No se usa la `service_role`. `.env*` está en `.gitignore`.

### SEO (posicionamiento orgánico)
Metadatos por página (título con plantilla, descripción, canonical, Open Graph, Twitter), `lang="es"`, HTML semántico, JSON-LD `WebApplication`, `robots.txt` y `sitemap.xml` generados, y `noindex` en las páginas privadas y de callback.

## Instalación

Requisitos: Node.js 20.9+ y una cuenta de [Supabase](https://supabase.com).

```bash
git clone <url-del-repositorio>
cd auth-segura
npm install
cp .env.example .env.local
```

### 1. Configurar Supabase
1. Crea un proyecto en Supabase.
2. **SQL Editor → New query**: pega el contenido de `supabase/schema.sql` y ejecútalo.
3. **Authentication → URL Configuration**:
   - *Site URL*: `http://localhost:3000` (en producción, la URL de Vercel).
   - *Redirect URLs*: `http://localhost:3000/auth/confirm**` y `https://<tu-dominio>/auth/confirm**`.
4. **Authentication → Sign In / Providers → Email**: deja activado *Confirm email* (recomendado).
5. *(Opcional, permite abrir el enlace en otro dispositivo)* En **Authentication → Emails**, cambia el enlace de las plantillas por:
   - Confirm signup: `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/dashboard`
   - Reset password: `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery`

   Con las plantillas por defecto también funciona (flujo PKCE), pero el enlace debe abrirse en el mismo navegador.

### 2. Variables de entorno (`.env.local`)

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Project Settings → API Keys → *publishable* (o la *anon* legacy) |
| `NEXT_PUBLIC_SITE_URL` | URL pública de la app (`http://localhost:3000` en local) |

### 3. Ejecutar

```bash
npm run dev      # desarrollo en http://localhost:3000
npm run build    # compilación de producción
npm start        # servidor de producción
npm run lint
```

## Despliegue en Vercel
1. Importa el repositorio en Vercel.
2. Agrega las tres variables de entorno (con `NEXT_PUBLIC_SITE_URL` = URL de producción).
3. Agrega `https://<tu-dominio>/auth/confirm**` a las *Redirect URLs* de Supabase y actualiza la *Site URL*.

## Uso
1. **Crear cuenta** en `/registro` → revisa tu correo y abre el enlace → llegas al panel con la sesión iniciada.
2. **Panel** (`/dashboard`): datos de la cuenta, claims del JWT, cookies recibidas por el servidor y la prueba en vivo de que JavaScript no puede leer el token.
3. **Perfil** (`/perfil`): edita nombre y biografía (prueba escribir `<script>alert(1)</script>`: se muestra como texto), cambia la contraseña o cierra sesión.
4. **Recuperar contraseña** en `/recuperar` → enlace por correo → `/actualizar-contrasena`.
5. Intenta abrir `/dashboard` sin sesión: el proxy te envía a `/login?next=/dashboard` y, al iniciar sesión, vuelves ahí.

## Tecnologías
Next.js 16.3 · React 19.2 · TypeScript 5 · Supabase (`@supabase/ssr`, `@supabase/supabase-js`) · zod 4 · Tailwind CSS 4
