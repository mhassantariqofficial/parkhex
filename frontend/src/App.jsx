import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Slots from './pages/Slots';
import Rates from './pages/Rates';
import Staff from './pages/Staff';
import VehicleEntry from './pages/VehicleEntry';
import ParkedVehicles from './pages/ParkedVehicles';
import History from './pages/History';
import Reports from './pages/Reports';
import Receipt from './pages/Receipt';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="entry" element={<VehicleEntry />} />
        <Route path="parked" element={<ParkedVehicles />} />
        <Route path="slots" element={<Slots />} />
        <Route path="history" element={<History />} />
        <Route path="receipt/:id" element={<Receipt />} />

        <Route
          path="reports"
          element={
            <ProtectedRoute adminOnly>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="rates"
          element={
            <ProtectedRoute adminOnly>
              <Rates />
            </ProtectedRoute>
          }
        />
        <Route
          path="staff"
          element={
            <ProtectedRoute adminOnly>
              <Staff />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
