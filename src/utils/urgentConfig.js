/**
 * 🚨 CONFIGURACIÓN URGENTE PARA EL BACKEND
 * Configuración específica basada en el diagnóstico actual
 */

console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                         🚨 CONFIGURACIÓN URGENTE REQUERIDA                   ║
╚══════════════════════════════════════════════════════════════════════════════╝

📊 DIAGNÓSTICO COMPLETADO:
   ✅ Backend ejecutándose en localhost:8080
   ❌ Token JWT válido pero SIN ROLES
   ❌ Endpoints de salud devuelven 403 (deberían ser públicos)
   ❌ Spring Security mal configurado

═══════════════════════════════════════════════════════════════════════════════

🔧 CORRECCIONES CRÍTICAS NECESARIAS:

1️⃣ CONFIGURACIÓN DE SPRING SECURITY (SecurityConfig.java):

@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http.csrf(csrf -> csrf.disable())
        .cors(cors -> cors.configurationSource(corsConfigurationSource()))
        .authorizeHttpRequests(authz -> authz
            // ===== ENDPOINTS PÚBLICOS (CRÍTICO) =====
            .requestMatchers("/health", "/actuator/health").permitAll()
            .requestMatchers("/auth/login", "/auth/register").permitAll()
            .requestMatchers("/auth/status").permitAll()
            .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
            
            // ===== ENDPOINTS PROTEGIDOS =====
            .requestMatchers("/api/profiles/**").hasRole("USER")
            .requestMatchers("/api/users/**").hasRole("USER")
            
            .anyRequest().authenticated()
        )
        .exceptionHandling(ex -> ex.authenticationEntryPoint(jwtAuthenticationEntryPoint))
        .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

    http.addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);
    return http.build();
}

═══════════════════════════════════════════════════════════════════════════════

2️⃣ ASIGNACIÓN DE ROLES (UserDetailsService):

@Service
public class JwtUserDetailsService implements UserDetailsService {

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + username));

        // ⚠️ CRÍTICO: ASIGNAR ROLE_USER
        List<GrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
        
        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                authorities);
    }
}

═══════════════════════════════════════════════════════════════════════════════

3️⃣ VERIFICAR JWT TOKEN UTIL (JwtTokenUtil.java):

Asegurar que el token incluya roles en el payload:

public String generateToken(UserDetails userDetails) {
    Map<String, Object> claims = new HashMap<>();
    
    // ⚠️ CRÍTICO: Incluir roles en el token
    Collection<? extends GrantedAuthority> authorities = userDetails.getAuthorities();
    List<String> roles = authorities.stream()
            .map(GrantedAuthority::getAuthority)
            .collect(Collectors.toList());
    claims.put("roles", roles);
    
    return createToken(claims, userDetails.getUsername());
}

═══════════════════════════════════════════════════════════════════════════════

🧪 VERIFICACIÓN DESPUÉS DE LOS CAMBIOS:

1. Reiniciar el servidor backend
2. Hacer login nuevamente (token nuevo con roles)
3. Verificar en consola: analyzeToken()
4. El token debería contener: "roles": ["ROLE_USER"]

═══════════════════════════════════════════════════════════════════════════════

⚡ COMANDOS DE VERIFICACIÓN:

En la consola del navegador:
• analyzeToken() - Ver contenido del token actual
• verifyBackend() - Verificar estado completo
• diagnose403() - Diagnóstico específico de errores 403

═══════════════════════════════════════════════════════════════════════════════
`);

// Función para copiar configuración específica al portapapeles
window.copySecurityConfig = () => {
  const config = `@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http.csrf(csrf -> csrf.disable())
        .cors(cors -> cors.configurationSource(corsConfigurationSource()))
        .authorizeHttpRequests(authz -> authz
            // ENDPOINTS PÚBLICOS
            .requestMatchers("/health", "/actuator/health").permitAll()
            .requestMatchers("/auth/login", "/auth/register").permitAll()
            .requestMatchers("/auth/status").permitAll()
            .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
            
            // ENDPOINTS PROTEGIDOS
            .requestMatchers("/api/profiles/**").hasRole("USER")
            .requestMatchers("/api/users/**").hasRole("USER")
            
            .anyRequest().authenticated()
        )
        .exceptionHandling(ex -> ex.authenticationEntryPoint(jwtAuthenticationEntryPoint))
        .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

    http.addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);
    return http.build();
}`;

  if (navigator.clipboard) {
    navigator.clipboard.writeText(config).then(() => {
      console.log('✅ Configuración de SecurityFilterChain copiada al portapapeles');
    });
  }
  
  return config;
};

window.copyUserDetailsService = () => {
  const service = `@Override
public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
    User user = userRepository.findByEmail(username)
            .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + username));

    List<GrantedAuthority> authorities = new ArrayList<>();
    authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
    
    return new org.springframework.security.core.userdetails.User(
            user.getEmail(),
            user.getPassword(),
            authorities);
}`;

  if (navigator.clipboard) {
    navigator.clipboard.writeText(service).then(() => {
      console.log('✅ Configuración de UserDetailsService copiada al portapapeles');
    });
  }
  
  return service;
};

console.log('📋 Funciones de configuración disponibles:');
console.log('   copySecurityConfig() - Copiar SecurityFilterChain');
console.log('   copyUserDetailsService() - Copiar UserDetailsService');

export default {
  message: "Configuración urgente cargada"
};