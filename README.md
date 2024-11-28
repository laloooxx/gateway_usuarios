# Sistema de Usuarios (Gateway)

Este microservicio actúa como el Gateway para la arquitectura de microservicios del sistema. Se encarga de manejar la autenticación, autorización y enrutamiento hacia otros servicios. También implementa protección de rutas mediante JWT y la validación de roles.
---

## **Características**
- **Autenticación y autorización**: Manejo de usuarios con roles (`admin` y `client`) mediante JWT.
- **Hashing seguro de contraseñas**: Implementado con `bcrypt`.
- **Gestión de usuarios**: CRUD completo para usuarios.
- **Conexión a otros servicios**: Uso de cliente proxy para la comunicación con microservicios como el sistema de reservas de departamentos y registro de parcelas.
- **Middleware específico**: Guards para proteger rutas.

---

## **Tecnologías utilizadas**
- **NestJS**: Framework principal para el backend.
- **TypeORM**: ORM para la gestión de datos en la base de datos.
- **bcrypt**: Hashing de contraseñas.
- **JWT**: Manejo de autenticación basada en tokens.
- **TCP**: Para la comunicación entre microservicios.

---

## **Instalación y configuración**
### **Requisitos previos**
1. Node.js y npm instalados.
2. Base de datos configurada (MySQL, etc.).
3. TCP configurado para la comunicación entre microservicios.

### **Pasos**
1. Clona el repositorio:
   En el bash
   git clone https://github.com/laloooxx/gateway_usuarios
   cd gateway-usuarios
   npm install
   Configurar las variables de entorno
   Iniciamos la aplicacion con: npm run start:dev
