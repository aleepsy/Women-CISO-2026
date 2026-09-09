# Proyecto: Blindaje de Identidad y Respuesta ante Crisis (BIRC) | OSINT Explorer

Proyecto de concientización sobre la huella digital que dejamos en internet como herramienta de visualización de mapa digital y un framework para limpiar nuestra huella digital.

<p align="center">
<img src="https://github.com/user-attachments/assets/c794b050-96b6-4882-a675-6f68bb9f7f8f#center" alt="Description" width="500" height="500">  
</p>

**Video Pitch**: https://youtu.be/dSqqYfoxJ8k

**Live app**: https://osintexplorer.lovable.app

## Caso de negocio

PYMES mexicanas con infraestructura de nube, cuyos directivos manejan información sensible y financiera, convirtiéndolos en blancos de alta prioridad.

## Estrategia del proyecto

Auditoría basada en inteligencia de fuentes abiertas (OSINT) para identificar fugas de información, seguida de un plan de respuesta y limpieza de huella digital corporativa.

## Arquitectura de la solución

<p align="center">
<img src="https://github.com/user-attachments/assets/7e26c237-63dd-4dce-ba93-b152dc0399dc#center" alt="Description" width="900" height="500">  
</p>

#### Tecnologías Empleadas:

Búsqueda dirigida:
Metadatos en documentos: Usar herramientas como FOCA o Google Dorks para encontrar PDFs o Excels subidos por la empresa donde aparezcan nombres de usuarios, versiones de software o rutas de servidores locales.

Fugas de Credenciales: Verificar en Have I Been Pwned no solo el correo corporativo, sino el personal de los líderes (que suelen usar para servicios del trabajo).
Exposición en Redes: Mapear si el Director de Finanzas publica fotos en la oficina donde se ven post-its con claves o el modelo de los equipos.


#### Estructura General del Sistema:

Fase de Reconocimiento: Escaneo pasivo de la huella digital del C-Suite y la empresa.

Fase de Simulación: Prueba de Phishing dirigida basada en los hallazgos del OSINT. (opcional)

Fase de Remediación: Ejecución del framework de limpieza y ajuste de privacidad.

## Desarrollo

Para correr localmente, se requiere Node.js y npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```



This project was built with [Lovable](https://lovable.dev)

Made with 💜 by ThePowerPuffGirls
