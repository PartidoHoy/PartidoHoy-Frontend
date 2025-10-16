/**
 * 🎯 CONFIGURACIÓN EXACTA PARA TU BACKEND SPRING BOOT
 * Basada en tu arquitectura y endpoints específicos
 */

// 📡 CONFIGURACIÓN DE ENDPOINTS (100% compatible con tu backend)
export const BACKEND_CONFIG = {
  BASE_URL: 'http://localhost:8080',
  
  // 🔐 AUTENTICACIÓN (exactos de tu diagrama)
  AUTH: {
    LOGIN: '/api/auth/login',           // POST - Login y generación JWT
    REGISTER: '/api/auth/register'      // POST - Registro de usuario
  },
  
  // 🏥 SALUD DEL SERVIDOR (exactos de tu diagrama)
  HEALTH: {
    SIMPLE: '/health',                  // GET - Estado del servidor
    DETAILED: '/api/health',            // GET - Estado con información detallada  
    PING: '/ping'                       // GET - Ping simple
  },
  
  // 👤 USUARIOS (exactos de tu diagrama)
  USERS: {
    ME: '/api/users/me'                 // GET/PUT - Mi información básica
  },
  
  // 👥 PERFILES (exactos de tu diagrama)
  PROFILES: {
    ME: '/api/profiles/me',             // GET/PUT - Mi perfil completo
    CARD: '/api/profiles/me/card',      // GET - Mi tarjeta resumida
    SEARCH: '/api/profiles/search',     // GET - Buscar perfiles
    TOP_PLAYERS: '/api/profiles/top-players', // GET - Rankings de jugadores
    PHOTO: '/api/profiles/me/photo'     // POST - Subir foto de perfil
  }
};

// 🔧 SOLUCIONADOR DEL BUCLE DE REGISTRO
export const registrationLoopFixer = {
  
  // 🎯 MÉTODO PRINCIPAL PARA SOLUCIONAR EL BUCLE
  fix: async () => {
    console.log('🔄 === SOLUCIONANDO BUCLE DE REGISTRO ===');
    console.log('Backend detectado: Spring Boot con JWT + MySQL');
    
    const results = {
      steps: [],
      errors: [],
      success: false
    };
    
    try {
      // PASO 1: Limpiar localStorage problemático
      const keysToRemove = Object.keys(localStorage).filter(key => 
        key.includes('profile') || 
        key.includes('fallback') || 
        key.includes('userProfile') ||
        key.includes('completion')
      );
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        results.steps.push(`✅ Limpiado: ${key}`);
      });
      
      // PASO 2: Verificar token y roles
      const token = localStorage.getItem('jwt');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const roles = payload.roles || payload.authorities || [];
          
          results.steps.push(`🔍 Usuario: ${payload.sub}`);
          results.steps.push(`👥 Roles: ${roles.join(', ')}`);
          
          // Verificar problema de roles
          if (roles.includes('ROLE_ADMIN') && !roles.includes('ROLE_USER')) {
            results.errors.push('⚠️ PROBLEMA CRÍTICO: Usuario tiene ROLE_ADMIN pero endpoints requieren ROLE_USER');
            results.errors.push('💡 SOLUCIÓN: Configurar backend para asignar ROLE_USER a usuarios normales');
          }
          
        } catch {
          results.errors.push('❌ Token JWT inválido');
        }
      }
      
      // PASO 3: Probar endpoint de perfil con método correcto
      if (token) {
        results.steps.push('🧪 Probando endpoint de perfil...');
        
        const profileTest = await fetch(`${BACKEND_CONFIG.BASE_URL}${BACKEND_CONFIG.PROFILES.ME}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (profileTest.ok) {
          results.steps.push('✅ Endpoint de perfil funciona');
          
          // Probar guardado con PUT (no POST)
          const updateTest = await fetch(`${BACKEND_CONFIG.BASE_URL}${BACKEND_CONFIG.PROFILES.ME}`, {
            method: 'PUT',  // ⚠️ IMPORTANTE: TU BACKEND USA PUT
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              posicion: 'Delantero',
              nivel: 'Intermedio', 
              ubicacion: 'Madrid',
              biografia: 'Test de perfil'
            })
          });
          
          if (updateTest.ok) {
            results.steps.push('✅ Actualización de perfil funciona');
            results.success = true;
          } else {
            const errorText = await updateTest.text();
            results.errors.push(`❌ Error actualizando perfil: ${updateTest.status} - ${errorText}`);
          }
          
        } else {
          results.errors.push(`❌ Endpoint de perfil falla: ${profileTest.status}`);
        }
      }
      
      // PASO 4: Recomendaciones finales
      if (results.success) {
        results.steps.push('🎉 BUCLE SOLUCIONADO: Refresca la página y vuelve a intentar');
      } else {
        results.steps.push('⚠️ Aún hay problemas - revisar configuración del backend');
      }
      
    } catch (error) {
      results.errors.push(`❌ Error general: ${error.message}`);
    }
    
    console.log('📋 Resultados:', results);
    return results;
  },
  
  // 🔧 CONFIGURACIÓN ESPECÍFICA PARA TU BACKEND SPRING BOOT
  getBackendConfig: () => {
    const config = `
// ============================================================================
// 🚨 CONFIGURACIÓN URGENTE PARA TU BACKEND SPRING BOOT
// ============================================================================

// 1. 🔐 EN AuthController.java - VERIFICAR ENDPOINTS:
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        // Tu lógica de login...
        // ⚠️ CRÍTICO: Asegurar que se incluyan roles en el JWT
    }
    
    @PostMapping("/register") 
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        // Tu lógica de registro...
        // ⚠️ CRÍTICO: Asignar ROLE_USER por defecto
    }
}

// ============================================================================

// 2. 👥 EN UserProfileController.java - VERIFICAR ENDPOINTS:
@RestController
@RequestMapping("/api/profiles")
@PreAuthorize("hasRole('USER')") // ⚠️ CRÍTICO: Requiere ROLE_USER
public class UserProfileController {
    
    @GetMapping("/me")
    public ResponseEntity<UserProfile> getMyProfile(Authentication auth) {
        // Tu lógica para obtener perfil...
    }
    
    @PutMapping("/me") // ⚠️ IMPORTANTE: PUT, no POST
    public ResponseEntity<UserProfile> updateMyProfile(
            @RequestBody UserProfile profile, 
            Authentication auth) {
        // Tu lógica para actualizar perfil...
        // ⚠️ CRÍTICO: Esto debe GUARDAR en la base de datos
    }
    
    @PostMapping("/me/photo")
    public ResponseEntity<?> uploadPhoto(@RequestParam("file") MultipartFile file) {
        // Tu lógica para subir foto...
    }
}

// ============================================================================

// 3. 🔐 EN SecurityConfig.java - VERIFICAR PERMISOS:
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(authz -> authz
                // Endpoints públicos
                .requestMatchers("/health", "/api/health", "/ping").permitAll()
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                
                // ⚠️ CRÍTICO: Endpoints de perfil requieren ROLE_USER
                .requestMatchers("/api/profiles/**").hasRole("USER")  
                .requestMatchers("/api/users/**").hasRole("USER")
                
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
            .build();
    }
}

// ============================================================================

// 4. 🔑 EN JwtUtil.java - INCLUIR ROLES EN TOKEN:
public String generateToken(UserDetails userDetails) {
    Map<String, Object> claims = new HashMap<>();
    
    // ⚠️ CRÍTICO: Incluir roles en el payload
    List<String> roles = userDetails.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .collect(Collectors.toList());
    claims.put("roles", roles);
    claims.put("authorities", roles);
    
    return createToken(claims, userDetails.getUsername());
}

// ============================================================================

// 5. 👤 EN UserDetailsService.java - ASIGNAR ROLES CORRECTOS:
@Override
public UserDetails loadUserByUsername(String username) {
    User user = userRepository.findByEmail(username)
            .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));
    
    List<GrantedAuthority> authorities = new ArrayList<>();
    
    // ⚠️ CRÍTICO: Para usuarios normales usar ROLE_USER
    if ("ADMIN".equals(user.getRole())) {
        authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
    } else {
        // TODOS los usuarios normales deben tener ROLE_USER
        authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
    }
    
    return new User(user.getEmail(), user.getPassword(), authorities);
}

// ============================================================================
`;
    
    console.log(config);
    
    // Copiar al portapapeles si es posible
    if (navigator.clipboard) {
      navigator.clipboard.writeText(config);
    }
    
    return config;
  }
};

// 🌍 EXPONER FUNCIONES GLOBALMENTE
if (typeof window !== 'undefined') {
  window.fixRegistrationLoop = registrationLoopFixer.fix;
  window.getBackendConfig = registrationLoopFixer.getBackendConfig;
  window.BACKEND_CONFIG = BACKEND_CONFIG;
  
  console.log('🎯 Solucionador específico para tu Backend Spring Boot:');
  console.log('   fixRegistrationLoop() - Soluciona el bucle de registro');
  console.log('   getBackendConfig() - Configuración exacta para tu backend');
  console.log('   BACKEND_CONFIG - Endpoints exactos de tu arquitectura');
}

// export { BACKEND_CONFIG, registrationLoopFixer }; // Removed duplicate export to fix parsing error