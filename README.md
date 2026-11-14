# Smile Estudio — Sistema Odontológico Integral

Sistema web moderno para la gestión integral de la clínica dental **Smile Estudio** (Piura, Perú).

---

## 🚀 Tecnologías y Arquitectura

* **Frontend:** React 19, TypeScript, TanStack Router & Start, Tailwind CSS v4, Lucide Icons, Radix UI.
* **Backend / API:** TanStack Start Server Functions, Nitro engine.
* **Base de Datos & Sincronización:** Supabase (PostgreSQL en tiempo real) y PGLite local de respaldo.
* **Formatos y Exportación:** Generación de PDFs (`jspdf`, `modern-screenshot`) y hojas de cálculo Excel (`xlsx`).
* **Integración WhatsApp:** Webhooks y captura automatizada de leads/confirmaciones.

---

## 📁 Estructura del Proyecto

```text
smile-estudio/
├── public/                 # Favicon, logos de la clínica y PWA manifest
├── src/
│   ├── components/
│   │   ├── clinic/         # Fichas clínicas, odontograma interactivo, ortodoncia y plan de tratamiento
│   │   └── smile/          # Dashboard (Inicio), Agenda (Hoy), Pacientes, Caja, Deudas, Paneles
│   ├── lib/
│   │   ├── clinic/         # Modelos y utilidades de odontograma y exportación PDF
│   │   ├── smile/          # Sincronización Supabase, lógica de agenda, Excel, WhatsApp
│   │   └── auth/           # Autenticación y control de accesos
│   ├── routes/             # Enrutamiento basado en archivos (TanStack Router)
│   │   ├── index.tsx       # Aplicación principal
│   │   ├── c.$id.tsx       # Portal de confirmación/reprogramación para pacientes
│   │   └── api/whatsapp/   # Webhook receptor de Meta WhatsApp
│   ├── router.tsx          # Configuración del enrutador
│   └── styles.css          # Estilos globales y paleta de la clínica
├── supabase/
│   └── schema.sql          # Esquema SQL y políticas RLS para Supabase
└── package.json            # Scripts y dependencias
```

---

## 🛠️ Comandos de Desarrollo

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Verificar tipos de TypeScript
npm run typecheck

# Validar estándares con ESLint
npm run lint

# Compilar para producción
npm run build

# Previsualizar compilación
npm run preview
```

---

## 🦷 Módulos Principales

1. **Agenda Diaria (`Hoy`)**: Asignación de turnos por doctor (Dra. Judith y Dr. Miguel), visualización de citas y notas de atención.
2. **Fichas Clínicas (`Fichas`)**: Odontograma gráfico de dentición permanente y temporal, historial de ortodoncia y presupuestos.
3. **Control de Pacientes**: Directorio con búsqueda en tiempo real, importación y exportación de datos.
4. **Caja y Cobranzas (`Caja` / `Deudas`)**: Cuadre diario, registro de pagos en efectivo, transferencias, Yape/Plin y facturación.
5. **Portal de Confirmación (`/c/$id`)**: Enlace interactivo enviado por WhatsApp al paciente para confirmar asistencia con un clic.
