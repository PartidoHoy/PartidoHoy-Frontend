import React, { useState } from 'react';
import { Container, Button, Typography, Box, Alert, Paper, Grid, Card, CardContent } from '@mui/material';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { advancedDiagnostic } from '../utils/advancedDiagnostic';

const TestConnection = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});

  const updateResult = (testName, result) => {
    setResults(prev => ({ ...prev, [testName]: result }));
  };

  const setTestLoading = (testName, isLoading) => {
    setLoading(prev => ({ ...prev, [testName]: isLoading }));
  };

  const testBasicConnection = async () => {
    const testName = 'basic';
    setTestLoading(testName, true);
    
    try {
      console.log('🧪 Testing register endpoint with real data...');
      
      // Usar el endpoint correcto que existe en tu backend
      const response = await fetch('http://localhost:8080/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: 'Test User',
          email: `test${Date.now()}@example.com`, // Email único para evitar conflictos
          password: '12345678'
        })
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        updateResult(testName, `✅ Registro exitoso: ${response.status} ${response.statusText}. Response: ${JSON.stringify(data)}`);
      } else {
        const errorData = await response.text(); // Usar text() en caso de que no sea JSON válido
        updateResult(testName, `⚠️ Error en registro: ${response.status} ${response.statusText}. Error: ${errorData}`);
      }
    } catch (error) {
      console.error('Register test failed:', error);
      updateResult(testName, `❌ No se puede conectar al backend: ${error.message}`);
    } finally {
      setTestLoading(testName, false);
    }
  };

  const testCorsPreflightOptions = async () => {
    const testName = 'preflight';
    setTestLoading(testName, true);
    
    try {
      console.log('🧪 Testing CORS preflight (OPTIONS)...');
      
      const response = await fetch('http://localhost:8080/auth/register', {
        method: 'OPTIONS',
        headers: {
          'Origin': window.location.origin,
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type'
        }
      });
      
      console.log('Preflight response:', response);
      
      if (response.ok) {
        updateResult(testName, `✅ CORS Preflight OK: ${response.status}`);
      } else {
        updateResult(testName, `❌ CORS Preflight failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('CORS preflight test failed:', error);
      updateResult(testName, `❌ CORS Preflight error: ${error.message}`);
    } finally {
      setTestLoading(testName, false);
    }
  };

  const testRegisterWithAxios = async () => {
    const testName = 'register';
    setTestLoading(testName, true);
    
    try {
      console.log('🧪 Testing /auth/register with Axios...');
      
      const testData = {
        nombre: 'Test User ' + Date.now(),
        email: `test${Date.now()}@test.com`,
        password: 'password123'
      };
      
      const response = await api.post('/auth/register', testData);
      updateResult(testName, `✅ Registro exitoso: ${response.status}`);
    } catch (error) {
      console.error('Register test failed:', error);
      
      let errorMsg = `❌ Error ${error.response?.status || 'Network'}: `;
      
      if (error.response?.status === 403) {
        errorMsg += `CORS/Forbidden - Tu configuración CORS parece correcta, verifica:
1. Que el backend esté reiniciado después de aplicar los cambios
2. Que no hay cache del navegador
3. Revisar logs del backend para más detalles`;
      } else if (error.response?.status === 409) {
        errorMsg += 'Email ya existe (esto es NORMAL en tests repetidos)';
      } else if (error.code === 'ERR_NETWORK') {
        errorMsg += 'No se puede conectar al backend en http://localhost:8080';
      } else {
        errorMsg += error.message;
      }
      
      updateResult(testName, errorMsg);
    } finally {
      setTestLoading(testName, false);
    }
  };

  const testRegisterWithFetch = async () => {
    const testName = 'fetchRegister';
    setTestLoading(testName, true);
    
    try {
      console.log('🧪 Testing /auth/register with fetch...');
      
      const testData = {
        nombre: 'Fetch Test User ' + Date.now(),
        email: `fetchtest${Date.now()}@test.com`,
        password: 'password123'
      };
      
      const response = await fetch('http://localhost:8080/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(testData)
      });
      
      if (response.ok) {
        await response.json(); // Parse response but don't need to use it
        updateResult(testName, `✅ Fetch registro exitoso: ${response.status}`);
      } else {
        await response.text(); // Parse error but don't need to use it
        updateResult(testName, `❌ Fetch error: ${response.status} ${response.statusText}`);
      }
      
    } catch (error) {
      updateResult(testName, `❌ Fetch error: ${error.message}`);
    } finally {
      setTestLoading(testName, false);
    }
  };

  const testLogin = async () => {
    const testName = 'login';
    setTestLoading(testName, true);
    
    try {
      console.log('🧪 Testing login endpoint...');
      
      const response = await fetch('http://localhost:8080/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com', // Usuario conocido
          password: '12345678'
        })
      });
      
      console.log('Login response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        updateResult(testName, `✅ Login exitoso: ${response.status}. Token recibido: ${data.token ? 'SÍ' : 'NO'}`);
      } else {
        const errorData = await response.text();
        updateResult(testName, `⚠️ Error en login: ${response.status} ${response.statusText}. Error: ${errorData}`);
      }
    } catch (error) {
      console.error('Login test failed:', error);
      updateResult(testName, `❌ No se puede hacer login: ${error.message}`);
    } finally {
      setTestLoading(testName, false);
    }
  };

  const runAdvancedDiagnostic = async () => {
    const testName = 'advanced';
    setTestLoading(testName, true);
    
    try {
      console.log('🔬 Ejecutando diagnóstico avanzado...');
      await advancedDiagnostic();
      updateResult(testName, '✅ Diagnóstico completado. Revisa la consola del navegador (F12) para ver todos los detalles.');
    } catch (error) {
      updateResult(testName, `❌ Error en diagnóstico: ${error.message}`);
    } finally {
      setTestLoading(testName, false);
    }
  };

  const tests = [
    {
      name: 'basic',
      title: '� Test Registro (Fetch)',
      description: 'Prueba el endpoint /auth/register con datos reales',
      action: testBasicConnection
    },
    {
      name: 'preflight',
      title: '✈️ CORS Preflight',
      description: 'Verifica si CORS permite OPTIONS',
      action: testCorsPreflightOptions
    },
    {
      name: 'fetchRegister',
      title: '📡 Fetch Register',
      description: 'Test con fetch nativo (sin Axios)',
      action: testRegisterWithFetch
    },
    {
      name: 'register',
      title: '📝 Axios Register',
      description: 'Test con Axios (configuración actual)',
      action: testRegisterWithAxios
    },
    {
      name: 'login',
      title: '🔐 Test Login',
      description: 'Prueba el endpoint /auth/login',
      action: testLogin
    },
    {
      name: 'advanced',
      title: '🔬 Diagnóstico Avanzado',
      description: 'Análisis completo de conectividad (ver consola F12)',
      action: runAdvancedDiagnostic
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          🔧 Diagnóstico CORS - PartidoHoy
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          <strong>Tu configuración CORS está muy bien:</strong><br/>
          • Permite localhost:* (todos los puertos)<br/>
          • Headers: todos permitidos (*)<br/>
          • Métodos: GET, POST, PUT, DELETE, OPTIONS, PATCH<br/>
          • Credentials: habilitado<br/>
          <br/>
          <strong>Frontend:</strong> {window.location.origin}<br/>
          <strong>Backend:</strong> http://localhost:8080
        </Alert>

        <Box sx={{ mb: 3 }}>
          <Button
            component={Link}
            to="/register"
            variant="outlined"
            sx={{ mr: 2 }}
          >
            ← Volver al Registro
          </Button>
        </Box>

        <Grid container spacing={2}>
          {tests.map(test => (
            <Grid size={{ xs: 12, md: 6 }} key={test.name}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {test.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {test.description}
                  </Typography>
                  <Button 
                    variant="contained" 
                    onClick={test.action}
                    disabled={loading[test.name]}
                    fullWidth
                    sx={{ mb: 2 }}
                  >
                    {loading[test.name] ? 'Probando...' : 'Ejecutar Test'}
                  </Button>
                  {results[test.name] && (
                    <Alert 
                      severity={results[test.name].includes('✅') ? 'success' : 'error'}
                      sx={{ mt: 1 }}
                    >
                      <pre style={{ 
                        whiteSpace: 'pre-wrap', 
                        fontFamily: 'monospace',
                        fontSize: '0.85rem',
                        margin: 0
                      }}>
                        {results[test.name]}
                      </pre>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h6" gutterBottom>
          ✅ Tu Configuración CORS (Ya Aplicada)
        </Typography>
        <Alert severity="success" sx={{ mb: 2 }}>
          Tu configuración CORS es excelente y debería funcionar. Si aún tienes errores 403:
        </Alert>
        <Box component="pre" sx={{ 
          bgcolor: 'grey.100', 
          p: 2, 
          borderRadius: 1, 
          overflow: 'auto',
          fontSize: '0.85rem'
        }}>
{`🔧 PASOS PARA SOLUCIONAR:

1. REINICIA el backend después de aplicar cambios CORS
2. LIMPIA cache del navegador (Ctrl+Shift+R o F12 > Network > Disable cache)
3. Verifica que el backend esté en puerto 8080
4. Revisa logs del backend para errores específicos

📋 TU CONFIGURACIÓN ACTUAL (MUY BUENA):
✅ allowedOriginPatterns: http://localhost:*, http://127.0.0.1:*
✅ allowedOrigins: http://localhost:5173, 3000, 4200, 8081
✅ allowedMethods: GET, POST, PUT, DELETE, OPTIONS, PATCH
✅ allowedHeaders: * (todos)
✅ allowCredentials: true
✅ maxAge: 3600L`}
        </Box>
      </Paper>
    </Container>
  );
};

export default TestConnection;