/**
 * 🚀 GUÍA PARA INICIAR EL BACKEND
 * Instrucciones paso a paso para levantar el servidor backend
 */

console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                           🚀 INICIAR SERVIDOR BACKEND                        ║
╚══════════════════════════════════════════════════════════════════════════════╝

🚨 PROBLEMA DETECTADO:
   ❌ El servidor backend NO está ejecutándose
   ❌ No hay conexión a localhost:8080
   ✅ Frontend funcionando correctamente en localhost:5173

═══════════════════════════════════════════════════════════════════════════════

🛠️ PASOS PARA INICIAR EL BACKEND:

1️⃣ ABRIR TERMINAL/PROMPT DE COMANDOS:
   • Abrir nueva terminal
   • Navegar al directorio del proyecto backend

2️⃣ COMANDOS PARA SPRING BOOT:

   📁 Si usas Maven:
   mvn spring-boot:run
   
   📁 Si usas Gradle:
   ./gradlew bootRun
   
   📁 Si tienes JAR compilado:
   java -jar target/tu-aplicacion.jar

3️⃣ VERIFICAR QUE INICIE CORRECTAMENTE:
   • Buscar mensaje: "Started [NombreApp] in X seconds"
   • Verificar puerto: "Tomcat started on port(s): 8080"
   • Sin errores en los logs

═══════════════════════════════════════════════════════════════════════════════

🔍 VERIFICACIÓN MANUAL:

Una vez iniciado el backend, prueba en el navegador:
   • http://localhost:8080/health
   • Debería devolver estado del servidor

═══════════════════════════════════════════════════════════════════════════════

⚡ VERIFICACIÓN AUTOMÁTICA:

Una vez que el backend esté corriendo:
   1. Refrescar esta página (F5)
   2. Ejecutar en consola: verifyBackend()
   3. Debería mostrar ✅ en lugar de ❌

═══════════════════════════════════════════════════════════════════════════════

🚨 SI HAY ERRORES AL INICIAR:

• Verificar puerto 8080 libre: netstat -an | findstr 8080
• Verificar Java instalado: java -version
• Revisar logs de errores en la terminal
• Verificar base de datos conectada (si aplica)

═══════════════════════════════════════════════════════════════════════════════

💡 DESPUÉS DE INICIAR EL BACKEND:

1. ✅ Backend corriendo en localhost:8080
2. ✅ Frontend corriendo en localhost:5173  
3. 🔐 Hacer login en la aplicación
4. 🧪 Probar funcionalidades completas
5. 🎉 ¡Todo debería funcionar sin errores 403!

═══════════════════════════════════════════════════════════════════════════════

🔄 PRÓXIMOS PASOS:
1. Iniciar servidor backend
2. Refrescar página frontend  
3. Hacer login y probar
`);

// Función para chequear cada 5 segundos si el backend ya está corriendo
let checkInterval;

const startBackendMonitoring = () => {
  console.log('🔍 Iniciando monitoreo del backend...');
  
  checkInterval = setInterval(async () => {
    try {
      const response = await fetch('http://localhost:8080/health', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        console.log('🎉 ¡BACKEND DETECTADO! El servidor está corriendo');
        console.log('✅ Ejecutando verificación automática...');
        
        // Limpiar el intervalo
        clearInterval(checkInterval);
        
        // Ejecutar verificación completa
        setTimeout(() => {
          if (typeof window.verifyBackend === 'function') {
            window.verifyBackend();
          }
        }, 1000);
        
        // Notificación visual
        showBackendOnlineNotification();
      }
    } catch {
      // Backend aún no está disponible, continuar monitoreando
    }
  }, 5000);
};

const showBackendOnlineNotification = () => {
  const notification = document.createElement('div');
  notification.innerHTML = `
    <div style="
      position: fixed; 
      top: 20px; 
      right: 20px; 
      background: #4CAF50; 
      color: white; 
      padding: 15px; 
      border-radius: 8px; 
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 9999;
      max-width: 350px;
      font-family: Arial, sans-serif;
    ">
      <h4 style="margin: 0 0 10px 0;">🎉 ¡Backend Conectado!</h4>
      <p style="margin: 0 0 10px 0;">El servidor backend está funcionando correctamente.</p>
      <p style="margin: 0; font-size: 12px;">
        Puedes hacer login y usar todas las funcionalidades.
      </p>
      <button onclick="this.parentNode.parentNode.remove()" style="
        background: white; 
        color: #4CAF50; 
        border: none; 
        padding: 5px 10px; 
        border-radius: 4px; 
        cursor: pointer; 
        margin-top: 10px;
      ">Entendido</button>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Auto-remover después de 10 segundos
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 10000);
};

// Exponer función para detener el monitoreo
if (typeof window !== 'undefined') {
  window.stopBackendMonitoring = () => {
    if (checkInterval) {
      clearInterval(checkInterval);
      console.log('⏹️ Monitoreo del backend detenido');
    }
  };
  
  console.log('🔍 Funciones de monitoreo disponibles:');
  console.log('   stopBackendMonitoring() - Detener monitoreo automático');
}

// Iniciar monitoreo automático
startBackendMonitoring();

export default {
  message: "Guía de inicio de backend cargada"
};