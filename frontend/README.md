# SplitFlow - Frontend

Interfaz de usuario para **SplitFlow**, una plataforma web diseñada para gestionar y dividir gastos compartidos entre amigos, parejas o grupos de viaje de forma sencilla y transparente.

## 🚀 Tecnologías Principales

- **React** con **Vite** para un entorno de desarrollo rápido y HMR fluido.
- **Axios** (o Fetch API) para la comunicación con el backend REST.
- **Bootstrap** / Tailwind (según preferencia) para el diseño responsivo.

## 🛠️ Configuración y Ejecución Local

1. **Instalar dependencias:**
   ```bash
   npm install
   npm run dev

## Flujos disponibles

- Home con UUID anonimo y creacion de grupos.
- Invitacion y union por alias o nombre propio en `/join/:inviteCode`.
- Gastos con participantes, division igualitaria o por monto especifico.
- Saldos expandibles con desglose por gasto.
- Deudas direccionales, confirmacion de pago y cierre total del grupo.

## Scripts

```bash
npm run dev
npm run build
npm run lint
```