# PartidoHoy - Frontend

Frontend de la aplicación PartidoHoy construido con React + Vite. Sistema de autenticación JWT que se conecta con el backend de PartidoHoy.

## 🚀 Características

- ✅ **Sistema de Autenticación JWT**
  - Login con validación en tiempo real
  - Registro de usuarios
  - Protección de rutas
  - Manejo automático de tokens

- ✅ **Tecnologías Modernas**
  - React 19 con hooks
  - Material-UI para componentes
  - React Router para navegación
  - Axios para API calls

- ✅ **Seguridad**
  - Validaciones frontend y backend
  - Interceptores para manejo de tokens
  - Protección de rutas privadas
  - Logout automático en expiración

## 🛠️ Tecnologías

- **React 19** - Biblioteca de interfaz de usuario
- **Vite** - Herramienta de desarrollo y build
- **Material-UI** - Componentes de interfaz
- **React Router** - Navegación
- **Axios** - Cliente HTTP
- **JWT** - Autenticación

## 📦 Instalación

1. Clona el repositorio
```bash
git clone <url-del-repo>
cd partidohoy
```

2. Instala las dependencias
```bash
npm install
```

3. Configura las variables de entorno
```bash
# Crea un archivo .env en la raíz del proyecto
REACT_APP_API_URL=http://localhost:8080
REACT_APP_API_TIMEOUT=5000
REACT_APP_VERSION=1.0.0
```

4. Ejecuta el servidor de desarrollo
```bash
npm run dev
```

## 🏗️ Estructura del Proyecto

```
src/
├── components/
│   ├── auth/
│   │   ├── LoginForm.jsx      # Formulario de login
│   │   ├── RegisterForm.jsx   # Formulario de registro
│   │   └── ProtectedRoute.jsx # Protección de rutas
│   └── common/               # Componentes reutilizables
├── pages/
│   ├── Login.jsx            # Página de login
│   ├── Register.jsx         # Página de registro
│   └── Dashboard.jsx        # Dashboard principal
├── services/
│   ├── api.js              # Configuración axios
│   └── authService.js      # Servicios de autenticación
├── contexts/
│   └── AuthContext.jsx     # Estado global de auth
├── hooks/
│   └── useAuth.js          # Hook de autenticación
└── utils/
    ├── constants.js        # Constantes
    └── validators.js       # Validaciones
```

## 🔌 Integración con Backend

### Endpoints utilizados:
- `POST /auth/login` - Iniciar sesión
- `POST /auth/register` - Registrar usuario
- `GET /api/auth/status` - Verificar estado de autenticación

### Roles soportados:
- `USER` - Usuario básico
- `ADMIN` - Administrador
- `MODERATOR` - Moderador
- `ORGANIZER` - Organizador

## 🎮 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la build de producción
- `npm run lint` - Ejecuta ESLint

## � Flujo de Autenticación

1. **Registro**: El usuario se registra con nombre, email y contraseña
2. **Login**: Autenticación con email y contraseña
3. **Token JWT**: Se almacena automáticamente en localStorage
4. **Protección**: Las rutas privadas requieren autenticación
5. **Logout**: Limpia el token y redirige al login

## 🎯 Funcionalidades Implementadas

### ✅ **Autenticación Completa**
- Formularios de login y registro con validación
- Manejo de errores del backend
- Loading states durante API calls
- Redirección automática después del login

### ✅ **Dashboard Protegido**
- Información del usuario autenticado
- Visualización de roles
- Funcionalidad de logout
- Preparado para futuras funcionalidades

### ✅ **Validaciones**
- Email format validation
- Contraseña mínimo 8 caracteres
- Nombre entre 2-100 caracteres
- Confirmación de contraseña

## 🔮 Próximas Características

- [ ] Gestión de perfil de usuario
- [ ] Panel de administración (roles)
- [ ] Recuperación de contraseña
- [ ] Notificaciones toast
- [ ] Modo oscuro
- [ ] Integración con funcionalidades de partidos

## 🚨 Requisitos del Backend

Para que funcione correctamente, necesitas el backend corriendo en:
- **URL**: `http://localhost:8080`
- **Endpoints**: `/auth/login`, `/auth/register`, `/api/auth/status`
- **CORS**: Configurado para permitir el frontend

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor, abre un issue primero para discutir qué te gustaría cambiar.

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.
