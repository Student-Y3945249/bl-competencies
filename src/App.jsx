import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CompetencyProvider } from './context/CompetencyContext';
import Login from './components/Login';
import MemberDashboard from './components/MemberDashboard';
import AdminDashboard from './components/AdminDashboard';
import AdminAnalytics from './components/AdminAnalytics';
import ManageCompetencies from './components/ManageCompetencies';
import Navbar from './components/Navbar';

const ProtectedRoute = ({ children, requireAdmin }) => {
  const { currentUser } = useAuth();

  if (!currentUser) return <Navigate to="/login" />;

  if (requireAdmin && currentUser.role !== 'admin') {
    return <Navigate to="/" />;
  }

  return children;
};

const DashboardRouter = () => {
  const { currentUser } = useAuth();

  if (!currentUser) return <Navigate to="/login" />;

  return currentUser.role === 'admin' ? <AdminDashboard /> : <MemberDashboard />;
};

function App() {
  return (
    <Router>
      <CompetencyProvider>
        <AuthProvider>
          <div className="min-h-screen bg-transparent">
            <Navbar />
            <main className="py-8">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<DashboardRouter />} />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/analytics"
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      <AdminAnalytics />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/competencies"
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      <ManageCompetencies />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
          </div>
        </AuthProvider>
      </CompetencyProvider>
    </Router>
  );
}

export default App;
