/**
 * 🔧 GENERADOR DE CONFIGURACIÓN DE SPRING SECURITY
 * Genera la configuración exacta que necesita el backend para solucionar los errores 403
 */

export const springSecurityFixer = {
  
  // 📋 GENERAR CONFIGURACIÓN COMPLETA DE SPRING SECURITY
  generateSecurityConfig: () => {
    const config = `
/*
 * ⚠️ CONFIGURACIÓN DE SPRING SECURITY REQUERIDA
 * Copia este código en tu archivo SecurityConfig.java para solucionar los errores 403
 */

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    @Autowired
    private JwtRequestFilter jwtRequestFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(authz -> authz
                // ===== ENDPOINTS PÚBLICOS (SIN AUTENTICACIÓN) =====
                .requestMatchers("/auth/login").permitAll()
                .requestMatchers("/auth/register").permitAll()
                .requestMatchers("/auth/status").permitAll()
                .requestMatchers("/health", "/actuator/health").permitAll()
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() // CORS preflight
                
                // ===== ENDPOINTS DE PERFIL (CON AUTENTICACIÓN) =====
                // 🔧 ESTOS SON LOS ENDPOINTS QUE ESTÁN FALLANDO
                .requestMatchers(HttpMethod.GET, "/api/profiles/me").hasRole("USER")
                .requestMatchers(HttpMethod.PUT, "/api/profiles/me").hasRole("USER")
                .requestMatchers(HttpMethod.PATCH, "/api/profiles/me").hasRole("USER")
                .requestMatchers(HttpMethod.POST, "/api/profiles/me/photo").hasRole("USER")
                
                // Endpoints alternativos que el frontend está probando
                .requestMatchers(HttpMethod.GET, "/api/users/me").hasRole("USER")
                .requestMatchers(HttpMethod.PUT, "/api/users/me").hasRole("USER")
                .requestMatchers(HttpMethod.GET, "/api/user/profile").hasRole("USER")
                .requestMatchers(HttpMethod.PUT, "/api/user/profile").hasRole("USER")
                .requestMatchers(HttpMethod.GET, "/api/auth/me").hasRole("USER")
                .requestMatchers(HttpMethod.POST, "/api/profiles/update").hasRole("USER")
                .requestMatchers(HttpMethod.GET, "/auth/user").hasRole("USER")
                
                // ===== TARJETAS Y RANKING =====
                .requestMatchers(HttpMethod.GET, "/api/profiles/*/card").hasRole("USER")
                .requestMatchers(HttpMethod.GET, "/api/profiles/*/profile").hasRole("USER")
                .requestMatchers(HttpMethod.GET, "/api/profiles/search").hasRole("USER")
                .requestMatchers(HttpMethod.GET, "/api/profiles/top/goals").hasRole("USER")
                .requestMatchers(HttpMethod.GET, "/api/profiles/top/assists").hasRole("USER")
                .requestMatchers(HttpMethod.GET, "/api/profiles/top/matches").hasRole("USER")
                
                // ===== ADMIN =====
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                
                // ===== RESTO REQUIERE AUTENTICACIÓN =====
                .anyRequest().authenticated()
            )
            .exceptionHandling(ex -> ex.authenticationEntryPoint(jwtAuthenticationEntryPoint))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        http.addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}

/*
 * ⚠️ VERIFICAR TAMBIÉN EL JWT REQUEST FILTER
 * Asegúrate de que tu JwtRequestFilter contenga esta lógica:
 */

@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUserDetailsService jwtUserDetailsService;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        final String requestTokenHeader = request.getHeader("Authorization");

        String username = null;
        String jwtToken = null;

        // JWT Token está en el formato "Bearer token". Remover la palabra Bearer
        if (requestTokenHeader != null && requestTokenHeader.startsWith("Bearer ")) {
            jwtToken = requestTokenHeader.substring(7);
            try {
                username = jwtTokenUtil.getUsernameFromToken(jwtToken);
            } catch (IllegalArgumentException e) {
                System.out.println("No se puede obtener el JWT Token");
            } catch (ExpiredJwtException e) {
                System.out.println("JWT Token ha expirado");
            }
        } else {
            logger.warn("JWT Token no empieza con Bearer String");
        }

        // Una vez que obtenemos el token validamos
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            UserDetails userDetails = this.jwtUserDetailsService.loadUserByUsername(username);

            // Si el token es válido configuramos Spring Security para establecer la autenticación manualmente
            if (jwtTokenUtil.validateToken(jwtToken, userDetails)) {

                // ⚠️ CRÍTICO: Asegúrate de que los roles se asignen correctamente
                Collection<? extends GrantedAuthority> authorities = userDetails.getAuthorities();
                
                UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken = 
                    new UsernamePasswordAuthenticationToken(userDetails, null, authorities);
                    
                usernamePasswordAuthenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                
                SecurityContextHolder.getContext().setAuthentication(usernamePasswordAuthenticationToken);
            }
        }
        chain.doFilter(request, response);
    }
}

/*
 * ⚠️ VERIFICAR EL SERVICIO DE USUARIO
 * Asegúrate de que tu UserDetailsService devuelva los roles correctos:
 */

@Service
public class JwtUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + username));

        // ⚠️ CRÍTICO: Asegúrate de que los roles incluyan ROLE_USER
        List<GrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority("ROLE_USER")); // ← ESTO ES CRÍTICO
        
        // Si tienes otros roles, añádelos aquí
        // authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                authorities);
    }
}
`;

    return config;
  },

  // 📊 GENERAR DIAGNÓSTICO PARA EL EQUIPO DE BACKEND
  generateBackendDiagnosis: () => {
    const diagnosis = `
🚨 DIAGNÓSTICO DE PROBLEMAS 403 - PARA EL EQUIPO DE BACKEND

═══════════════════════════════════════════════════════════════

📋 PROBLEMA IDENTIFICADO:
   • Todos los endpoints de perfil devuelven HTTP 403 Forbidden
   • El login funciona correctamente (HTTP 200)
   • El token JWT se genera correctamente
   • Spring Security está bloqueando endpoints que deberían funcionar

═══════════════════════════════════════════════════════════════

🔍 ENDPOINTS QUE FALLAN:
   ❌ GET /api/profiles/me (obtener mi perfil)
   ❌ PUT /api/profiles/me (actualizar mi perfil)  
   ❌ POST /api/profiles/me/photo (subir foto)
   ❌ GET /api/users/me (endpoint alternativo)
   ❌ GET /auth/user (información del usuario)

═══════════════════════════════════════════════════════════════

✅ ENDPOINTS QUE FUNCIONAN:
   ✅ POST /auth/login (200 OK)
   ✅ POST /auth/register (201 Created)
   ✅ GET /health (200 OK)

═══════════════════════════════════════════════════════════════

🔧 SOLUCIONES REQUERIDAS:

1. VERIFICAR CONFIGURACIÓN DE SPRING SECURITY
   • Asegurar que los endpoints de perfil tienen .hasRole("USER")
   • Verificar que no hay configuración conflictiva

2. VERIFICAR ASIGNACIÓN DE ROLES
   • El UserDetailsService debe devolver ROLE_USER
   • Verificar que el JWT contiene los roles correctos

3. VERIFICAR JWT REQUEST FILTER
   • Asegurar que procesa correctamente "Bearer token"
   • Verificar que establece SecurityContext correctamente

4. VERIFICAR CORS
   • Asegurar que las cabeceras CORS están correctas
   • Verificar que OPTIONS requests se manejan correctamente

═══════════════════════════════════════════════════════════════

🧪 PRUEBAS RECOMENDADAS:

1. Probar endpoints con Postman:
   • POST /auth/login → debería devolver token
   • GET /api/profiles/me con header "Authorization: Bearer {token}"

2. Verificar logs del backend:
   • Buscar mensajes de Spring Security
   • Verificar que el filtro JWT procesa correctamente

3. Verificar contenido del token JWT:
   • Decodificar en jwt.io
   • Verificar que contiene roles/authorities

═══════════════════════════════════════════════════════════════

💡 CONFIGURACIÓN URGENTE NECESARIA:
   Aplicar la configuración de SecurityConfig.java proporcionada
   que incluye los matchers correctos para todos los endpoints.

═══════════════════════════════════════════════════════════════
`;

    return diagnosis;
  },

  // 🎯 GENERAR TOKEN DE PRUEBA
  generateTestInstructions: () => {
    const instructions = `
🧪 INSTRUCCIONES PARA PROBAR LA CONFIGURACIÓN

═══════════════════════════════════════════════════════════════

1. PROBAR CON POSTMAN O CURL:

   # Paso 1: Login (esto funciona)
   POST http://localhost:8080/auth/login
   Content-Type: application/json
   
   {
     "username": "usuario@ejemplo.com",
     "password": "password123"
   }
   
   # Respuesta esperada: token JWT

   # Paso 2: Usar el token para acceder al perfil
   GET http://localhost:8080/api/profiles/me
   Authorization: Bearer {EL_TOKEN_OBTENIDO}
   Content-Type: application/json
   
   # Respuesta esperada: 200 OK con datos del perfil
   # Respuesta actual: 403 Forbidden

═══════════════════════════════════════════════════════════════

2. VERIFICAR EN LOS LOGS DEL BACKEND:

   Buscar mensajes como:
   • "JWT Token no empieza con Bearer String"
   • "No se puede obtener el JWT Token"
   • "Usuario no encontrado"
   • Mensajes de Spring Security sobre autorización

═══════════════════════════════════════════════════════════════

3. DECODIFICAR EL TOKEN JWT:

   Ir a https://jwt.io/
   Pegar el token obtenido del login
   Verificar que el payload contenga:
   
   {
     "sub": "usuario@ejemplo.com",
     "roles": ["ROLE_USER"] // ← ESTO ES CRÍTICO
     "exp": ...
     "iat": ...
   }

═══════════════════════════════════════════════════════════════

4. VERIFICAR BASE DE DATOS:

   • Verificar que el usuario existe
   • Verificar que tiene roles asignados
   • Verificar que el email coincide con el username

═══════════════════════════════════════════════════════════════
`;

    return instructions;
  }
};

// 🌍 EXPONER FUNCIONES GLOBALMENTE
if (typeof window !== 'undefined') {
  window.generateSecurityConfig = () => {
    const config = springSecurityFixer.generateSecurityConfig();
    console.log(config);
    
    // Copiar al clipboard si es posible
    if (navigator.clipboard) {
      navigator.clipboard.writeText(config).then(() => {
        console.log('✅ Configuración copiada al portapapeles');
      });
    }
    
    return config;
  };
  
  window.generateBackendDiagnosis = () => {
    const diagnosis = springSecurityFixer.generateBackendDiagnosis();
    console.log(diagnosis);
    return diagnosis;
  };
  
  window.generateTestInstructions = () => {
    const instructions = springSecurityFixer.generateTestInstructions();
    console.log(instructions);
    return instructions;
  };
  
  console.log('🔧 Generador de configuración Spring Security disponible:');
  console.log('   generateSecurityConfig() - Generar SecurityConfig.java');
  console.log('   generateBackendDiagnosis() - Diagnóstico para backend');
  console.log('   generateTestInstructions() - Instrucciones de prueba');
}

export default springSecurityFixer;