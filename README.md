# Delivery App Frontend

A modern React.js frontend for the Delivery App Services microservices architecture. This application provides a comprehensive interface for managing delivery orders, route optimization, and traffic monitoring.

## Features

### 🚚 Order Management
- Create, view, edit, and delete delivery orders
- Track order status and priority levels
- Manage customer information and delivery addresses
- Real-time order updates

### 🗺️ Route Optimization
- Start optimization jobs with customizable parameters
- View optimization results and route details
- Monitor job progress and status
- Support for multiple optimization criteria (distance, time, cost)

### 🚦 Traffic Monitoring
- Real-time traffic flow data from HERE Maps API
- Traffic incident monitoring and alerts
- Cache statistics and management
- Location-based traffic flow checking

### 👥 Customer & Driver Management
- Customer profile management
- Driver availability tracking
- Vehicle information and capacity management
- Contact information and location tracking

### 📊 Dashboard
- Overview of system metrics
- Recent orders and optimization jobs
- Traffic alerts and system status
- Performance statistics

## Technology Stack

- **React 18** with TypeScript
- **Redux Toolkit** for state management
- **React Query** for server state management
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Heroicons** for icons
- **React Hook Form** for form handling
- **React Hot Toast** for notifications
- **Date-fns** for date formatting

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Running backend services (Order Service, Route Optimizer, Traffic Service)

### Installation

1. Clone the repository and navigate to the frontend directory:
```bash
cd delivery-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment configuration:
```bash
cp .env.example .env
```

4. Update the `.env` file with your service URLs:
```env
REACT_APP_API_BASE_URL=http://localhost:8000
REACT_APP_ORDER_SERVICE_URL=http://localhost:8000
REACT_APP_ROUTE_OPTIMIZER_URL=http://localhost:8001
REACT_APP_TRAFFIC_SERVICE_URL=http://localhost:8002
```

5. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`.

### Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.tsx      # Main layout with sidebar and header
│   ├── Sidebar.tsx     # Navigation sidebar
│   ├── Header.tsx      # Top navigation header
│   ├── StatsCard.tsx   # Dashboard statistics cards
│   ├── RecentOrders.tsx # Recent orders component
│   ├── OptimizationJobs.tsx # Optimization jobs component
│   └── TrafficAlerts.tsx # Traffic alerts component
├── pages/              # Page components
│   ├── Dashboard.tsx   # Main dashboard
│   ├── OrdersPage.tsx  # Order management
│   ├── RouteOptimizationPage.tsx # Route optimization
│   ├── TrafficPage.tsx # Traffic monitoring
│   ├── CustomersPage.tsx # Customer management
│   ├── DriversPage.tsx # Driver management
│   └── LoginPage.tsx   # Authentication
├── services/           # API service layer
│   ├── api.ts         # Axios configuration
│   ├── orderService.ts # Order service API
│   ├── routeOptimizerService.ts # Route optimizer API
│   └── trafficService.ts # Traffic service API
├── store/             # Redux store and slices
│   ├── store.ts       # Store configuration
│   ├── slices/
│   │   ├── authSlice.ts # Authentication state
│   │   ├── ordersSlice.ts # Orders state
│   │   ├── routesSlice.ts # Routes state
│   │   └── trafficSlice.ts # Traffic state
├── App.tsx            # Main app component
├── index.tsx          # App entry point
└── index.css          # Global styles
```

## API Integration

The frontend integrates with three microservices:

### Order Service (Port 8000)
- Customer management
- Order CRUD operations
- Driver management
- Address management
- Authentication

### Route Optimizer Service (Port 8001)
- Route optimization jobs
- Optimization results
- Performance metrics
- Route management

### Traffic Service (Port 8002)
- Traffic flow data
- Traffic incidents
- Cache management
- API usage statistics

## Authentication

The application uses JWT-based authentication:
- Login with email/password
- Automatic token refresh
- Protected routes
- Role-based access control

Demo credentials:
- Email: `admin@delivery.com`
- Password: `password123`

## State Management

The application uses Redux Toolkit for state management with the following slices:

- **authSlice**: User authentication and session management
- **ordersSlice**: Order data and customer/driver information
- **routesSlice**: Route optimization jobs and results
- **trafficSlice**: Traffic data and incidents

## Styling

The application uses Tailwind CSS with a custom design system:
- Primary colors for actions and highlights
- Secondary colors for text and backgrounds
- Responsive design for mobile and desktop
- Consistent spacing and typography
- Custom component classes for reusability

## Development

### Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

### Code Style

- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting
- Consistent naming conventions
- Component-based architecture

## Deployment

The application can be deployed to any static hosting service:

1. Build the application: `npm run build`
2. Deploy the `build` folder to your hosting service
3. Configure environment variables for production
4. Ensure CORS is properly configured on backend services

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
