import React, { useState } from 'react';
import { authService } from '../services/authService';

const DetailedTestConnection = () => {
  const [testResults, setTestResults] = useState([]);
  const [testing, setTesting] = useState(false);

  const addResult = (test, status, message, details = null) => {
    setTestResults(prev => [...prev, { test, status, message, details, timestamp: new Date().toLocaleTimeString() }]);
  };

  const testBackend = async () => {
    setTesting(true);
    setTestResults([]);
    
    const API_BASE_URL = 'http://localhost:8080';
    
    // Test 1: Ping básico
    addResult('ping', 'testing', 'Verificando conectividad básica...');
    try {
      const response = await fetch(API_BASE_URL, { 
        method: 'GET',
        mode: 'cors' // Forzar CORS
      });
      addResult('ping', 'success', `Backend responde: ${response.status}`, {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries())
      });
    } catch (error) {
      addResult('ping', 'error', `Backend no accesible: ${error.message}`, error);
    }

    // Test 2: Verificar CORS headers
    addResult('cors', 'testing', 'Verificando configuración CORS...');
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'OPTIONS',
      });
      const corsHeaders = {
        'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
        'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
        'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
      };
      addResult('cors', 'success', 'Headers CORS obtenidos', corsHeaders);
    } catch (error) {
      addResult('cors', 'error', `Error verificando CORS: ${error.message}`, error);
    }

    // Test 3: Registro real
    addResult('register', 'testing', 'Probando registro...');
    const testUser = {
      nombre: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'TestPass123' // Contraseña que cumple requisitos: mayúscula, minúscula, número
    };
    
    try {
      const result = await authService.register(testUser.nombre, testUser.email, testUser.password);
      addResult('register', 'success', 'Registro exitoso', result);
      
      // Test 4: Login con el usuario recién creado
      addResult('login', 'testing', 'Probando login...');
      try {
        const loginResult = await authService.login(testUser.email, testUser.password);
        addResult('login', 'success', 'Login exitoso', loginResult);
      } catch (loginError) {
        addResult('login', 'error', `Error en login: ${loginError.message}`, loginError);
      }
      
    } catch (registerError) {
      addResult('register', 'error', `Error en registro: ${registerError.message}`, registerError);
    }

    setTesting(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return '#28a745';
      case 'error': return '#dc3545';
      case 'testing': return '#ffc107';
      default: return '#6c757d';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'testing': return '🔄';
      default: return '⏳';
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'monospace' }}>
      <h2>🔧 Diagnóstico Detallado de Conexión</h2>
      
      <button 
        onClick={testBackend} 
        disabled={testing}
        style={{
          padding: '10px 20px',
          backgroundColor: testing ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: testing ? 'not-allowed' : 'pointer',
          marginBottom: '20px'
        }}
      >
        {testing ? 'Ejecutando pruebas...' : 'Ejecutar Diagnóstico Completo'}
      </button>

      <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '4px' }}>
        {testResults.length === 0 && !testing && (
          <p>Haz clic en "Ejecutar Diagnóstico Completo" para comenzar las pruebas.</p>
        )}
        
        {testResults.map((result, index) => (
          <div key={index} style={{ 
            marginBottom: '15px', 
            padding: '10px', 
            backgroundColor: 'white', 
            borderRadius: '4px',
            borderLeft: `4px solid ${getStatusColor(result.status)}`
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
              {getStatusIcon(result.status)} {result.test.toUpperCase()} - {result.timestamp}
            </div>
            <div style={{ color: getStatusColor(result.status), marginBottom: '5px' }}>
              {result.message}
            </div>
            {result.details && (
              <details style={{ fontSize: '12px', color: '#666' }}>
                <summary>Ver detalles</summary>
                <pre style={{ 
                  backgroundColor: '#f1f3f4', 
                  padding: '10px', 
                  marginTop: '5px',
                  overflow: 'auto',
                  borderRadius: '4px'
                }}>
                  {JSON.stringify(result.details, null, 2)}
                </pre>
              </details>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <h3>💡 Soluciones Comunes:</h3>
        <ul>
          <li><strong>Error 403:</strong> Problema de CORS. Verifica que tu backend tenga configurado CORS para localhost:5173</li>
          <li><strong>Network Error:</strong> Backend no está corriendo o no está en puerto 8080</li>
          <li><strong>JSON Parse Error:</strong> El backend está devolviendo HTML en lugar de JSON (típico de errores 403/404)</li>
          <li><strong>Connection refused:</strong> El backend no está iniciado</li>
        </ul>
      </div>
    </div>
  );
};

export default DetailedTestConnection;