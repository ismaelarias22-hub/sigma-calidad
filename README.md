# Sistema de Aseguramiento de Calidad — Sigma Costa Rica

Sistema integral de control de calidad para la planta de embutidos de Sigma Costa Rica.
Incluye herramientas web (HTML) conectadas a Google Sheets mediante Google Apps Script.

## 📋 Componentes

| Archivo | Descripción |
|---------|-------------|
| `index.html` | Registro de Producción Diaria (página principal) |
| `registro_completo.html` | Detenciones / Liberaciones / Consultar |
| `F-CRC-AC-40.html` | Formato de Liberación de producto (genera PDF) |
| `buscador_skus.html` | Buscador rápido de SKUs por código y categoría |
| `vencimientos.html` | Visor de vencimientos |

## 🔗 Integración

- **Google Sheets**: base de datos central
- **Google Apps Script**: webhooks para leer/escribir (ver carpeta `apps-scripts/`)
- **Netlify**: hosting de las páginas web

## 📁 Estructura

```
sigma-calidad/
├── index.html                    # Producción diaria (principal)
├── registro_completo.html        # Detenciones/Liberaciones
├── F-CRC-AC-40.html              # Formato liberación PDF
├── buscador_skus.html            # Buscador de SKUs
├── vencimientos.html             # Visor vencimientos
├── apps-scripts/                 # Código de Google Apps Script
│   ├── produccion.gs
│   └── detenciones.gs
└── docs/                         # Documentación
    └── configuracion.md
```

## 👥 Equipo de Calidad

Hecson Chaves · Esteban Santamaria · Gabriel Morera · Ismael Acevedo · Danny Carranza · Jonathan Guido

## 🛠️ Máquinas

145, 240, 245, 440, Selladora Multivac 1, Multivac 2, Multivac 3, Proceso,
Rebanadora R2, R5, Rebanadora Multivac, Sierra Chuleta, Rebanadora 405, Textor/440, Webber/ 245
