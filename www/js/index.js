/**
    Licensed to the Apache Software Foundation (ASF) under one
    or more contributor license agreements.  See the NOTICE file
    distributed with this work for additional information
    regarding copyright ownership.  The ASF licenses this file
    to you under the Apache License, Version 2.0 (the
    "License"); you may not use this file except in compliance
    with the License.  You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing,
    software distributed under the License is distributed on an
    "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, either express or implied.  See the License for the
    specific language governing permissions and limitations
    under the License.
*/

// Wait for the deviceready event before using any of Cordova's device APIs.
// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready
document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    // Cordova is now initialized. Have fun!
    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
    
    var deviceReadyElement = document.getElementById('deviceready');
    if (deviceReadyElement) {
        deviceReadyElement.classList.add('ready');
    }

    // ==========================================================
    // INICIALIZACIÓN DE FIREBASE MESSAGING (PUSH NOTIFICATIONS)
    // ==========================================================
    if (window.FirebasePlugin) {
        console.log("Inicializando FirebasePlugin...");

        // 1. Pedir permisos de notificación (Necesario para Android 13+)
        window.FirebasePlugin.hasPermission(function(hasPermission) {
            if (!hasPermission) {
                window.FirebasePlugin.grantPermission(function() {
                    console.log("Permisos de notificación concedidos.");
                }, function(error) {
                    console.error("Error al pedir permisos:", error);
                });
            }
        });

        // 2. Suscribir automáticamente la App al tema "todos" (para envíos desde GAS)
        window.FirebasePlugin.subscribe("todos", function() {
            console.log("✅ Suscrito con éxito al tema 'todos'");
        }, function(error) {
            console.error("❌ Error al suscribirse al tema 'todos':", error);
        });

        // 3. Obtener el FCM Token único (registro interno)
        window.FirebasePlugin.getToken(function(token) {
            console.log("=========================================");
            console.log("FCM TOKEN REGISTRADO:");
            console.log(token);
            console.log("=========================================");
        }, function(error) {
            console.error("Error al obtener el Token FCM:", error);
        });

        // 4. Listener para renovación automática de Token
        window.FirebasePlugin.onTokenRefresh(function(token) {
            console.log("FCM Token renovado:", token);
        }, function(error) {
            console.error("Error en la renovación del token:", error);
        });

        // 5. Escuchar notificaciones entrantes
        window.FirebasePlugin.onMessageReceived(function(message) {
            console.log("Notificación recibida:", message);

            var titulo = message.title || "TitanMonitor";
            var cuerpo = message.body || "Tienes una nueva notificación";

            if (message.tap) {
                // El usuario presionó la notificación cuando la app estaba en segundo plano/cerrada
                alert("🔔 " + titulo + "\n\n" + cuerpo);
            } else {
                // La notificación llegó estando con la app abierta (primer plano)
                alert("⚡ " + titulo + "\n\n" + cuerpo);
            }
        }, function(error) {
            console.error("Error al recibir mensaje de Firebase:", error);
        });

    } else {
        console.error("El plugin cordova-plugin-firebasex no está disponible.");
    }
}