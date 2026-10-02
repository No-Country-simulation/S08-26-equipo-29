Markdown
# SplitFlow - Frontend

Interfaz de usuario para **SplitFlow**, una plataforma web diseñada para gestionar y dividir gastos compartidos entre amigos, parejas o grupos de viaje de forma sencilla y transparente.

## 🚀 Enlace en Producción
- **Frontend App:** [https://splitflow-frontend.onrender.com/](https://splitflow-frontend.onrender.com/)

## 🛠️ Tecnologías Principales

- **React** con **Vite** para un entorno de desarrollo rápido y HMR fluido.
- **Axios** para la comunicación con el backend REST.
- **Bootstrap** / Tailwind para el diseño responsivo.

## 💻 Configuración y Ejecución Local

1. **Instalar dependencias y ejecutar:**
   ```bash
   npm install
   npm run dev
📱 Flujos Disponibles
Home con UUID anónimo y creación de grupos.

Invitación y unión por alias o nombre propio en /join/:inviteCode.

Gastos con participantes, división igualitaria o por monto específico.

Saldos expandibles con desglose por gasto.

Deudas direccionales, confirmación de pago y cierre total del grupo.

📜 Scripts
Bash
npm run dev