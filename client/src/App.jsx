import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Browse from './pages/Browse';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import ListingDetail from './pages/ListingDetail';
import CreateListing from './pages/CreateListing';
import MyListings from './pages/MyListings';
import Offers from './pages/Offers';
import Deals from './pages/Deals';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app-container">
          <Navbar />

          <main className="main-content">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/browse" element={<Browse />} />
              {/* /shop alias so any old links still work */}
              <Route path="/shop" element={<Browse />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/listings/:id" element={<ListingDetail />} />
              <Route path="/users/:id" element={<Profile />} />

              {/* Protected routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/my-listings" element={<MyListings />} />
                <Route path="/listings/create" element={<CreateListing />} />
                <Route path="/listings/:id/edit" element={<CreateListing />} />
                <Route path="/my-offers" element={<Offers />} />
                <Route path="/deals" element={<Deals />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>

          <footer style={{
            borderTop: '1px solid var(--border-subtle)',
            padding: '1.75rem 1.5rem',
            background: '#ffffff',
            color: 'var(--text-muted)',
            fontSize: '0.8125rem',
            textAlign: 'center',
          }}>
            <div className="container" style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem',
            }}>
              <p style={{ fontWeight: '500' }}>© 2026 CampusMart — Campus Marketplace</p>
              <div style={{ display: 'flex', gap: '1.25rem' }}>
                <a href="/browse" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Browse</a>
                <a href="/listings/create" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Sell</a>
                <a href="/my-offers" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Offers</a>
              </div>
              <p>Built as an end-term project · MERN Stack</p>
            </div>
          </footer>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
