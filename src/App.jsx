import { Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Loader from './components/common/Loader';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import Recommendations from './pages/Recommendations';
import Shortlist from './pages/Shortlist';
import Tasks from './pages/Tasks';
import Profile from './pages/Profile';
import ApplicationGuidance from './pages/ApplicationGuidance';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <Loader fullScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if onboarding is complete
  const onboardingComplete = user?.onboarding_completed || user?.profile_data?.onboarding_completed;
  if (!onboardingComplete && window.location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
};

// Public Route Wrapper - redirects to dashboard if already logged in
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <Loader fullScreen />;
  }

  if (isAuthenticated) {
    const onboardingComplete = user?.onboarding_completed || user?.profile_data?.onboarding_completed;
    if (!onboardingComplete) {
      return <Navigate to="/onboarding" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Layout with Navbar and Sidebar
const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Navbar onToggleSidebar={toggleSidebar} />
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <main className="flex-1 lg:ml-72 p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-64px)] overflow-y-auto">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        }
      />

      {/* Onboarding Route (protected but no navbar) */}
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        }
      />

      {/* Protected Routes with Layout */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Chat />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/recommendations"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Recommendations />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/shortlist"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Shortlist />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tasks"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Tasks />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Profile />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/application"
        element={
          <ProtectedRoute>
            <MainLayout>
              <ApplicationGuidance />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
