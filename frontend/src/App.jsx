import { Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layout Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Page Components
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import BookDetails from './pages/BookDetails';
import Dashboard from './pages/Dashboard';
import BookForm from './pages/BookForm';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import ReadBook from './pages/ReadBook';
import TestAuth from './pages/TestAuth';

// Protected Route Component
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/books/:id" element={<BookDetails />} />
          
          {/* Protected Routes - Any authenticated user */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/books/:id/read" element={
            <ProtectedRoute>
              <ReadBook />
            </ProtectedRoute>
          } />
          
          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={
            <AdminRoute>
              <Dashboard />
            </AdminRoute>
          } />
          <Route path="/admin/books/add" element={
            <AdminRoute>
              <BookForm />
            </AdminRoute>
          } />
          <Route path="/admin/books/edit/:id" element={
            <AdminRoute>
              <BookForm />
            </AdminRoute>
          } />
          
          {/* Test Route */}
          <Route path="/test-auth" element={<TestAuth />} />
          
          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
