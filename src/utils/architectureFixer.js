/**
 * 🏗️ SOLUCIONADOR BASADO EN ARQUITECTURA COMPLETA
 * Soluciona problemas específicos del bucle de registro y roles
 * Basado en la arquitectura: Frontend → JWT + Roles → Backend Spring Boot
 */

export const architectureFixer = {
  
  // 📋 CONFIGURACIÓN BASADA EN TU ARQUITECTURA
  config: {
    endpoints: {
      // Información de usuario
      userInfo: '/api/users/me',
      updateUser: '/api/users/me',
      
      // Perfil completo
      getProfile: '/api/profiles/me',
      updateProfile: '/api/profiles/me',
      getCard: '/api/profiles/me/card',
      uploadPhoto: '/api/profiles/me/photo',
      
      // Búsquedas y rankings
      searchProfiles: '/api/profiles/search',
      topPlayers: '/api/profiles/top-players',
      
      // Salud del sistema
      health: '/health',
      apiHealth: '/api/health',
      ping: '/ping',
      
      // Autenticación
      register: '/api/auth/register',
      login: '/api/auth/login'
    },
    
    baseUrl: 'http://localhost:8080',
    requiredRole: 'ROLE_USER'
  },

  // 🔍 DIAGNÓSTICO ESPECÍFICO DEL BUCLE DE REGISTRO
  diagnoseRegistrationLoop: async () => {
    console.log('🔍 === DIAGNÓSTICO DEL BUCLE DE REGISTRO ===');
    
    const diagnosis = {
      step: 'unknown',
      userExists: false,
      profileExists: false,
      tokenValid: false,
      correctRole: false,
      endpoints: {},
      issue: null,
      solution: null
    };

    // 1. Verificar token y roles
    const token = localStorage.getItem('jwt');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        diagnosis.tokenValid = true;
        
        const roles = payload.roles || payload.authorities || [];
        diagnosis.correctRole = roles.includes('ROLE_USER');
        
        console.log('🎫 Token info:', {
          usuario: payload.sub,
          roles: roles,
          tieneRolCorrecto: diagnosis.correctRole
        });
        
        if (!diagnosis.correctRole) {
          diagnosis.issue = 'ROL_INCORRECTO';
          diagnosis.solution = 'Backend debe asignar ROLE_USER a usuarios normales';
        }
        
      } catch  {
        diagnosis.issue = 'TOKEN_INVÁLIDO';
        diagnosis.solution = 'Hacer login nuevamente';
      }
    } else {
      diagnosis.issue = 'SIN_TOKEN';
      diagnosis.solution = 'Usuario no está autenticado';
    }

    // 2. Si tenemos token válido, verificar endpoints
    if (diagnosis.tokenValid && token) {
      
      // Verificar si el usuario existe en el backend
      try {
        const userResponse = await fetch(`${this.config.baseUrl}${this.config.endpoints.userInfo}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        diagnosis.userExists = userResponse.ok;
        diagnosis.endpoints.userInfo = {
          status: userResponse.status,
          working: userResponse.ok
        };
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          console.log('👤 Datos de usuario:', userData);
        }
        
      } catch (error) {
        diagnosis.endpoints.userInfo = { error: error.message };
      }

      // Verificar si el perfil existe
      try {
        const profileResponse = await fetch(`${this.config.baseUrl}${this.config.endpoints.getProfile}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        diagnosis.profileExists = profileResponse.ok;
        diagnosis.endpoints.getProfile = {
          status: profileResponse.status,
          working: profileResponse.ok
        };
        
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          console.log('📝 Datos de perfil:', profileData);
          
          // Si el perfil existe, determinar por qué hay bucle
          if (profileData && Object.keys(profileData).length > 1) {
            diagnosis.step = 'PERFIL_COMPLETO';
            diagnosis.issue = 'BUCLE_CON_PERFIL_EXISTENTE';
            diagnosis.solution = 'Limpiar localStorage y redirigir al Dashboard';
          } else {
            diagnosis.step = 'PERFIL_INCOMPLETO';
          }
        } else if (profileResponse.status === 404) {
          diagnosis.step = 'SIN_PERFIL';
        }
        
      } catch (error) {
        diagnosis.endpoints.getProfile = { error: error.message };
      }
    }

    console.log('📋 Diagnóstico completo:', diagnosis);
    return diagnosis;
  },

  // 🔄 SOLUCIONAR BUCLE DE REGISTRO
  fixRegistrationLoop: async () => {
    console.log('🔄 === SOLUCIONANDO BUCLE DE REGISTRO ===');
    
    const diagnosis = await this.diagnoseRegistrationLoop();
    const fixes = [];

    // 1. Limpiar localStorage problemático
    const problematicKeys = [
      'hasProfile', 'profileComplete', 'registrationStep', 
      'fallbackProfile', 'profileData', 'tempProfileData'
    ];
    
    problematicKeys.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        fixes.push(`✅ Limpiado localStorage: ${key}`);
      }
    });

    // 2. Soluciones basadas en el diagnóstico
    if (diagnosis.issue === 'ROL_INCORRECTO') {
      fixes.push('⚠️ PROBLEMA CRÍTICO: Usuario tiene rol incorrecto');
      fixes.push('💡 SOLUCIÓN: Actualizar backend para asignar ROLE_USER');
      
      // Mostrar configuración de backend
      this.showBackendRoleFix();
      
    } else if (diagnosis.issue === 'BUCLE_CON_PERFIL_EXISTENTE') {
      fixes.push('✅ Perfil ya existe en el backend');
      fixes.push('🔄 Forzando redirección al Dashboard');
      
      // Forzar redirección al dashboard
      setTimeout(() => {
        if (window.location.pathname !== '/dashboard') {
          window.location.href = '/dashboard';
        }
      }, 1000);
      
    } else if (diagnosis.step === 'SIN_PERFIL' || diagnosis.step === 'PERFIL_INCOMPLETO') {
      fixes.push('📝 Usuario necesita completar perfil');
      fixes.push('🔄 Preparando formulario de perfil limpio');
    }

    console.log('🔧 Correcciones aplicadas:', fixes);
    
    return {
      diagnosis: diagnosis,
      fixes: fixes,
      nextAction: this.getNextAction(diagnosis)
    };
  },

  // 🎯 DETERMINAR PRÓXIMA ACCIÓN
  getNextAction: (diagnosis) => {
    if (!diagnosis.tokenValid) {
      return 'Hacer login nuevamente';
    }
    
    if (!diagnosis.correctRole) {
      return 'Actualizar configuración de roles en el backend';
    }
    
    if (diagnosis.profileExists && diagnosis.step === 'PERFIL_COMPLETO') {
      return 'Redirigir al Dashboard (perfil ya está completo)';
    }
    
    if (!diagnosis.profileExists || diagnosis.step === 'PERFIL_INCOMPLETO') {
      return 'Completar formulario de perfil';
    }
    
    return 'Refrescar página y verificar';
  },

  // 👥 CONFIGURACIÓN DE ROLES PARA EL BACKEND
  showBackendRoleFix: () => {
    const backendConfig = `
🚨 CONFIGURACIÓN URGENTE PARA EL BACKEND - ROLES

// ============================================================================
// 1. EN TU UserProfileController.java
// ============================================================================

@RestController
@RequestMapping("/api/profiles")
@PreAuthorize("hasRole('USER')")  // ⚠️ CRÍTICO: Usar 'USER', no 'ADMIN'
public class UserProfileController {
    
    @GetMapping("/me")
    public ResponseEntity<?> getUserProfile(Authentication authentication) {
        String email = authentication.getName();
        // Tu lógica existente...
    }
    
    @PutMapping("/me")
    public ResponseEntity<?> updateUserProfile(
        @RequestBody UserProfileRequest request,
        Authentication authentication) {
        String email = authentication.getName();
        // Tu lógica existente...
    }
}

// ============================================================================
// 2. EN TU JwtAuthenticationFilter.java - VERIFICAR EXTRACCIÓN DE ROLES
// ============================================================================

public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                  HttpServletResponse response, 
                                  FilterChain filterChain) throws ServletException, IOException {
        
        String token = extractToken(request);
        
        if (token != null && jwtUtil.validateToken(token)) {
            String email = jwtUtil.getEmailFromToken(token);
            
            // ⚠️ CRÍTICO: Extraer roles del token
            List<String> roles = jwtUtil.getRolesFromToken(token);
            
            List<GrantedAuthority> authorities = roles.stream()
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toList());
            
            UsernamePasswordAuthenticationToken authToken = 
                new UsernamePasswordAuthenticationToken(email, null, authorities);
            
            SecurityContextHolder.getContext().setAuthentication(authToken);
        }
        
        filterChain.doFilter(request, response);
    }
}

// ============================================================================
// 3. EN TU UserService.java - ASIGNAR ROLE_USER A USUARIOS NORMALES
// ============================================================================

@Service
public class UserService {
    
    public User registerUser(RegisterRequest request) {
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        
        // ⚠️ CRÍTICO: Asignar ROLE_USER por defecto
        user.setRole("USER");  // No "ADMIN"
        
        return userRepository.save(user);
    }
}

// ============================================================================
// 4. EN TU JwtUtil.java - INCLUIR ROLES EN EL TOKEN
// ============================================================================

public String generateToken(String email, List<String> roles) {
    Map<String, Object> claims = new HashMap<>();
    claims.put("roles", roles);
    claims.put("authorities", roles);  // Por compatibilidad
    
    return Jwts.builder()
        .setClaims(claims)
        .setSubject(email)
        .setIssuedAt(new Date())
        .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration))
        .signWith(SignatureAlgorithm.HS256, jwtSecret)
        .compact();
}

public List<String> getRolesFromToken(String token) {
    Claims claims = getClaimsFromToken(token);
    return (List<String>) claims.get("roles");
}
`;

    console.log(backendConfig);
    
    // Copiar al portapapeles si es posible
    if (navigator.clipboard) {
      navigator.clipboard.writeText(backendConfig);
    }
    
    return backendConfig;
  },

  // 💾 PROBAR GUARDADO DE PERFIL CON TU ESTRUCTURA
  testProfileSave: async () => {
    console.log('💾 === PROBANDO GUARDADO DE PERFIL ===');
    
    const token = localStorage.getItem('jwt');
    if (!token) {
      return { error: 'No hay token para probar' };
    }

    // Datos de prueba que coinciden con tu estructura
    const testProfileData = {
      posicion: 'Delantero',
      nivel: 'Intermedio',
      ubicacion: 'Madrid, España',
      biografia: 'Jugador apasionado del fútbol'
    };

    try {
      console.log('📤 Enviando datos al endpoint PUT /api/profiles/me');
      console.log('📊 Datos:', testProfileData);
      
      const response = await fetch(`${this.config.baseUrl}${this.config.endpoints.updateProfile}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testProfileData)
      });

      const responseText = await response.text();
      console.log('📡 Respuesta del servidor:', {
        status: response.status,
        statusText: response.statusText,
        body: responseText
      });

      if (response.ok) {
        console.log('✅ Perfil guardado exitosamente');
        return { 
          success: true, 
          data: responseText ? JSON.parse(responseText) : null 
        };
      } else {
        console.log('❌ Error guardando perfil:', response.status);
        return { 
          success: false, 
          status: response.status, 
          error: responseText 
        };
      }

    } catch (error) {
      console.log('❌ Error de conexión:', error.message);
      return { success: false, error: error.message };
    }
  },

  // 🔧 REPARACIÓN AUTOMÁTICA COMPLETA
  autoFix: async () => {
    console.log('🔧 === REPARACIÓN AUTOMÁTICA BASADA EN ARQUITECTURA ===');
    
    const result = await this.fixRegistrationLoop();
    
    console.log('📋 Resultado de la reparación:', result);
    console.log('🎯 Próxima acción recomendada:', result.nextAction);
    
    // Si el perfil existe, forzar salida del bucle
    if (result.diagnosis.profileExists && result.diagnosis.step === 'PERFIL_COMPLETO') {
      console.log('🔄 Forzando salida del bucle de registro...');
      
      // Limpiar completamente el estado de registro
      localStorage.removeItem('registrationStep');
      localStorage.removeItem('profileComplete');
      sessionStorage.clear();
      
      // Redirigir después de un breve delay
      setTimeout(() => {
        if (window.location.pathname.includes('profile') || window.location.pathname.includes('register')) {
          console.log('🏠 Redirigiendo al Dashboard...');
          window.location.href = '/dashboard';
        }
      }, 1500);
    }
    
    return result;
  }
};

// 🌍 HACER DISPONIBLE GLOBALMENTE
if (typeof window !== 'undefined') {
  window.fixLoop = architectureFixer.autoFix;
  window.testProfile = architectureFixer.testProfileSave;
  window.diagnoseLoop = architectureFixer.diagnoseRegistrationLoop;
  window.showRoleFix = architectureFixer.showBackendRoleFix;
  
  console.log('🏗️ Solucionador de arquitectura disponible:');
  console.log('   fixLoop() - Reparación automática del bucle');
  console.log('   testProfile() - Probar guardado de perfil');
  console.log('   diagnoseLoop() - Diagnóstico del bucle');
  console.log('   showRoleFix() - Configuración de roles del backend');
}

export default architectureFixer;