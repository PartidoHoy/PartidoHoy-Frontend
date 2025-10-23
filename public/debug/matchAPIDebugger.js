// 🔍 Match API Debugger - Interceptor para debuggear llamadas a la API de partidos
console.log('🚀 Cargando Match API Debugger...');

class MatchAPIDebugger {
  constructor() {
    this.originalFetch = window.fetch;
    this.setupInterceptor();
  }

  setupInterceptor() {
    window.fetch = async (url, options) => {
      // Solo interceptar llamadas a partidos
      if (url.includes('/api/partidos') && options?.method === 'POST') {
        console.log('🔍 === INTERCEPTING MATCH CREATION ===');
        console.log('📍 URL:', url);
        console.log('🔧 Options:', options);
        
        if (options.body) {
          try {
            const bodyData = JSON.parse(options.body);
            console.log('📦 Body Data:', bodyData);
            console.log('📝 Body JSON:', JSON.stringify(bodyData, null, 2));
          } catch (e) {
            console.log('📦 Raw Body:', options.body);
          }
        }

        console.log('🔐 Headers:', options.headers);
        
        // Hacer la llamada original
        const response = await this.originalFetch(url, options);
        
        console.log('📡 Response Status:', response.status);
        console.log('📡 Response Headers:', Object.fromEntries(response.headers.entries()));
        
        // Clonar response para poder leer el body sin consumirlo
        const responseClone = response.clone();
        
        try {
          const responseText = await responseClone.text();
          console.log('📄 Response Body:', responseText);
          
          if (responseText) {
            try {
              const responseJson = JSON.parse(responseText);
              console.log('📋 Response JSON:', responseJson);
            } catch (e) {
              console.log('⚠️ Response is not JSON');
            }
          }
        } catch (e) {
          console.log('⚠️ Could not read response body');
        }
        
        console.log('🔍 === END INTERCEPTION ===');
        return response;
      }
      
      // Para otras llamadas, usar fetch original
      return this.originalFetch(url, options);
    };
  }

  restore() {
    window.fetch = this.originalFetch;
  }

  // Método para probar manualmente el endpoint
  async testMatchCreation(matchData) {
    console.log('🧪 === TESTING MATCH CREATION MANUALLY ===');
    
    const token = localStorage.getItem('jwt');
    const testData = matchData || {
      titulo: 'Test Partido',
      descripcion: 'Partido de prueba desde debugger',
      fecha: '2024-10-25',
      hora: '18:00',
      ubicacion: 'Campo de prueba',
      direccion: 'Calle Test 123',
      ciudad: 'Madrid',
      capacidadMaxima: 10,
      precio: 15,
      nivelRequerido: 'Intermedio',
      tipoCancha: 'Césped sintético'
    };

    console.log('🎯 Test Data:', testData);
    console.log('🔑 Token:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');

    try {
      const response = await fetch('http://localhost:8080/api/partidos', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(testData)
      });

      console.log('✅ Test Response Status:', response.status);
      
      const responseText = await response.text();
      console.log('📄 Test Response Body:', responseText);
      
      if (responseText) {
        try {
          const responseJson = JSON.parse(responseText);
          console.log('📋 Test Response JSON:', responseJson);
        } catch (e) {
          console.log('⚠️ Test Response is not JSON');
        }
      }

      return { status: response.status, body: responseText };
    } catch (error) {
      console.error('❌ Test Error:', error);
      return { error: error.message };
    }
  }

  // Método para comparar diferentes formatos de datos
  async testDifferentFormats() {
    console.log('🔬 === TESTING DIFFERENT DATA FORMATS ===');

    // Formato 1: Como lo está enviando actualmente
    const format1 = {
      titulo: 'Partido Formato 1',
      descripcion: 'Descripción básica',
      fecha: '2024-10-25',
      hora: '18:00',
      ubicacion: 'Campo test',
      direccion: 'Calle test',
      ciudad: 'Madrid',
      capacidadMaxima: 10,
      precio: 15,
      nivelRequerido: 'Intermedio',
      tipoCancha: 'Césped sintético'
    };

    // Formato 2: Con más detalles como el backend podría esperar
    const format2 = {
      titulo: 'Partido Formato 2',
      descripcion: 'Descripción básica',
      fecha: '2024-10-25',
      hora: '18:00',
      ubicacion: 'Campo test',
      direccion: 'Calle test',
      ciudad: 'Madrid',
      capacidadMaxima: 10,
      jugadoresActuales: 1, // Añadir organizador
      precio: 15.0, // Como float explícito
      nivelRequerido: 'Intermedio',
      tipoCancha: 'Césped sintético',
      estado: 'abierto' // Estado explícito
    };

    // Formato 3: Con fecha/hora combinada como el backend podría esperar
    const format3 = {
      titulo: 'Partido Formato 3',
      descripcion: 'Descripción básica',
      fechaHora: '2024-10-25T18:00:00',
      ubicacion: 'Campo test',
      direccion: 'Calle test',
      ciudad: 'Madrid',
      capacidadMaxima: 10,
      precio: 15,
      nivelRequerido: 'Intermedio',
      tipoCancha: 'Césped sintético'
    };

    console.log('🧪 Testing Format 1 (Current)...');
    await this.testMatchCreation(format1);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('🧪 Testing Format 2 (Enhanced)...');
    await this.testMatchCreation(format2);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('🧪 Testing Format 3 (DateTime)...');
    await this.testMatchCreation(format3);
  }
}

// Crear instancia global
window.matchAPIDebugger = new MatchAPIDebugger();

// Funciones disponibles en consola
window.testMatchCreation = (data) => window.matchAPIDebugger.testMatchCreation(data);
window.testDifferentFormats = () => window.matchAPIDebugger.testDifferentFormats();
window.restoreOriginalFetch = () => window.matchAPIDebugger.restore();

console.log('✅ Match API Debugger cargado!');
console.log('🔧 Funciones disponibles:');
console.log('   testMatchCreation(data) - Probar creación de partido con datos específicos');
console.log('   testDifferentFormats() - Probar diferentes formatos de datos');
console.log('   restoreOriginalFetch() - Restaurar fetch original');