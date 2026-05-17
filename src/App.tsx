import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom';
import AuthBootstrap from '@/components/AuthBootstrap';
import ProtectedRoute from '@/components/ProtectedRoute';
import SiteShell from '@/components/SiteShell';
import Home from '@/pages/Home';
import Catalog from '@/pages/Catalog';
import AircraftDetail from '@/pages/AircraftDetail';
import EventDetail from '@/pages/EventDetail';
import ExpertDetail from '@/pages/ExpertDetail';
import Compare from '@/pages/Compare';
import Timeline from '@/pages/Timeline';
import Admin from '@/pages/Admin';
import Login from '@/pages/Login';
import AccessDenied from '@/pages/AccessDenied';

export default function App() {
  return (
    <BrowserRouter>
      <AuthBootstrap />
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          element={(
            <ProtectedRoute>
              <SiteShell>
                <Outlet />
              </SiteShell>
            </ProtectedRoute>
          )}
        >
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/aircraft/:id" element={<AircraftDetail />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/experts/:id" element={<ExpertDetail />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/forbidden" element={<AccessDenied />} />

          <Route
            element={(
              <ProtectedRoute allowedRoles={['admin']}>
                <Outlet />
              </ProtectedRoute>
            )}
          >
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/aircraft/new" element={<Admin />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
