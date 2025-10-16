// ============================================================================
// BACKEND AUTHORIZATION FIXER
// ============================================================================
// Herramienta para diagnosticar y documentar problemas de autorización del backend
// Específicamente para resolver errores 403 en endpoints de usuarios
// ============================================================================

export const backendAuthFixer = {
    
    // Diagnóstico completo de problemas de autorización
    async diagnoseAuthIssues() {
        console.log('🔍 === DIAGNÓSTICO DE AUTORIZACIÓN BACKEND ===');
        
        const issues = [];
        const endpoints = [
            '/api/profiles/search',
            '/api/profiles/me/stats',
            '/api/users/me'
        ];
        
        // Verificar token actual
        const token = localStorage.getItem('token');
        if (!token) {
            issues.push('❌ No hay token de autenticación');
            return { issues, recommendations: ['Hacer login nuevamente'] };
        }
        
        // Decodificar token para ver roles
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            console.log('🔑 Token payload:', payload);
            
            const currentRoles = payload.roles || [];
            console.log('👥 Roles actuales:', currentRoles);
            
            // Verificar roles necesarios
            if (!currentRoles.includes('ROLE_USER') && !currentRoles.includes('ROLE_ADMIN')) {
                issues.push('❌ Token no tiene roles USER ni ADMIN requeridos');
            }
            
            // Verificar expiración
            const now = Math.floor(Date.now() / 1000);
            if (payload.exp && payload.exp < now) {
                issues.push('❌ Token expirado');
            }
            
        } catch (error) {
            issues.push('❌ Token malformado o inválido');
            console.error('Error decodificando token:', error);
        }
        
        // Probar endpoints específicos
        for (const endpoint of endpoints) {
            try {
                console.log(`📡 Probando ${endpoint}...`);
                const response = await fetch(`http://localhost:8080${endpoint}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                console.log(`📊 ${endpoint}: ${response.status}`);
                
                if (response.status === 403) {
                    issues.push(`❌ 403 Forbidden en ${endpoint}`);
                } else if (response.status === 401) {
                    issues.push(`❌ 401 Unauthorized en ${endpoint}`);
                } else if (response.ok) {
                    console.log(`✅ ${endpoint}: Acceso correcto`);
                }
                
            } catch (error) {
                issues.push(`❌ Error de conexión en ${endpoint}: ${error.message}`);
            }
        }
        
        const recommendations = this.generateRecommendations(issues);
        
        return {
            timestamp: new Date().toISOString(),
            issues,
            recommendations,
            backendConfigNeeded: this.getBackendConfigSolution()
        };
    },
    
    // Generar recomendaciones basadas en los problemas encontrados
    generateRecommendations(issues) {
        const recommendations = [];
        
        if (issues.some(issue => issue.includes('403 Forbidden'))) {
            recommendations.push('🔧 BACKEND: Configurar Spring Security para permitir acceso a /api/profiles/search');
            recommendations.push('🔧 BACKEND: Verificar que el endpoint requiera solo ROLE_USER o ROLE_ADMIN');
            recommendations.push('🔧 BACKEND: Revisar SecurityConfig.java para permisos correctos');
        }
        
        if (issues.some(issue => issue.includes('roles'))) {
            recommendations.push('🔧 BACKEND: Verificar que el JWT incluya roles correctos');
            recommendations.push('🔧 FRONTEND: Renovar token con roles actualizados');
        }
        
        if (issues.some(issue => issue.includes('expirado'))) {
            recommendations.push('🔄 Hacer logout y login nuevamente');
            recommendations.push('🔧 BACKEND: Verificar tiempo de expiración del token');
        }
        
        return recommendations;
    },
    
    // Solución específica para la configuración del backend
    getBackendConfigSolution() {
        return {
            problem: "403 Forbidden en /api/profiles/search indica problema de autorización en Spring Security",
            solution: `
// ============================================================================
// SOLUCIÓN BACKEND: SecurityConfig.java
// ============================================================================

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Endpoints públicos
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                
                // Endpoints que requieren autenticación
                .requestMatchers("/api/profiles/search").hasAnyRole("USER", "ADMIN")
                .requestMatchers("/api/profiles/me/**").hasAnyRole("USER", "ADMIN")
                .requestMatchers("/api/users/me").hasAnyRole("USER", "ADMIN")
                
                // Todos los demás endpoints requieren autenticación
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter(), 
                UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
    
    // ========================================================================
    // CONTROLLER: ProfileController.java - Verificar anotaciones
    // ========================================================================
    
    @RestController
    @RequestMapping("/api/profiles")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')") // ← CRÍTICO: Esta línea
    public class ProfileController {
        
        @GetMapping("/search")
        @PreAuthorize("hasAnyRole('USER', 'ADMIN')") // ← VERIFICAR ESTO
        public ResponseEntity<List<UserProfile>> searchProfiles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int limit) {
            // Implementation
        }
    }
}

// ============================================================================
// VERIFICAR JWT TOKEN GENERATION
// ============================================================================

// Asegurar que el token incluya los roles correctos:
public String generateToken(UserDetails userDetails) {
    Collection<? extends GrantedAuthority> authorities = userDetails.getAuthorities();
    List<String> roles = authorities.stream()
        .map(GrantedAuthority::getAuthority)
        .collect(Collectors.toList());
    
    return Jwts.builder()
        .setSubject(userDetails.getUsername())
        .claim("roles", roles) // ← CRÍTICO: Incluir roles
        .setIssuedAt(new Date())
        .setExpiration(new Date(System.currentTimeMillis() + JWT_EXPIRATION))
        .signWith(getSigningKey(), SignatureAlgorithm.HS256)
        .compact();
}`,
            steps: [
                "1. Verificar SecurityConfig.java permite acceso a /api/profiles/search",
                "2. Confirmar que el endpoint requiere solo ROLE_USER o ROLE_ADMIN",
                "3. Verificar que el JWT incluye roles correctos en el payload",
                "4. Confirmar que @PreAuthorize en ProfileController es correcto",
                "5. Reiniciar el servidor backend después de cambios"
            ]
        };
    },
    
    // Herramienta para probar endpoints específicos
    async testSpecificEndpoint(endpoint, method = 'GET', body = null) {
        console.log(`🧪 === PROBANDO ENDPOINT ESPECÍFICO ===`);
        console.log(`📡 Endpoint: ${endpoint}`);
        console.log(`🔧 Método: ${method}`);
        
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('❌ No hay token disponible');
            return { success: false, error: 'No token' };
        }
        
        try {
            const options = {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            };
            
            if (body && (method === 'POST' || method === 'PUT')) {
                options.body = JSON.stringify(body);
            }
            
            const response = await fetch(`http://localhost:8080${endpoint}`, options);
            
            console.log(`📊 Status: ${response.status}`);
            console.log(`📋 Status Text: ${response.statusText}`);
            
            let data = null;
            try {
                data = await response.json();
                console.log('📄 Response Data:', data);
            } catch {
                console.log('📄 No JSON response');
            }
            
            return {
                success: response.ok,
                status: response.status,
                statusText: response.statusText,
                data,
                headers: Object.fromEntries(response.headers.entries())
            };
            
        } catch (error) {
            console.error('❌ Error en la petición:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Generar reporte completo para el desarrollador backend
    async generateBackendReport() {
        console.log('📋 === GENERANDO REPORTE PARA BACKEND ===');
        
        const diagnosis = await this.diagnoseAuthIssues();
        
        const report = {
            timestamp: new Date().toISOString(),
            summary: "Diagnóstico de problemas de autorización 403",
            issues: diagnosis.issues,
            recommendations: diagnosis.recommendations,
            backendConfig: diagnosis.backendConfigNeeded,
            frontendToken: this.getTokenInfo(),
            urgentActions: [
                "1. Verificar SecurityConfig.java en el backend",
                "2. Confirmar que /api/profiles/search permite ROLE_USER",
                "3. Verificar que el JWT incluye roles correctos",
                "4. Probar endpoints después de cambios en backend"
            ]
        };
        
        console.log('📋 Reporte completo:', report);
        return report;
    },
    
    // Obtener información del token actual
    getTokenInfo() {
        const token = localStorage.getItem('token');
        if (!token) return null;
        
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return {
                userId: payload.sub,
                roles: payload.roles || [],
                exp: new Date(payload.exp * 1000).toISOString(),
                iat: new Date(payload.iat * 1000).toISOString()
            };
        } catch  {
            return { error: 'Token malformado' };
        }
    }
};

// Hacer funciones disponibles globalmente para debugging
window.backendAuthFixer = backendAuthFixer;
window.diagnoseAuth = () => backendAuthFixer.diagnoseAuthIssues();
window.testEndpoint = (endpoint, method, body) => backendAuthFixer.testSpecificEndpoint(endpoint, method, body);
window.generateBackendReport = () => backendAuthFixer.generateBackendReport();

console.log('🔧 BackendAuthFixer cargado. Usa estas funciones:');
console.log('   diagnoseAuth() - Diagnosticar problemas de autorización');
console.log('   testEndpoint(endpoint, method, body) - Probar endpoint específico');
console.log('   generateBackendReport() - Generar reporte completo');