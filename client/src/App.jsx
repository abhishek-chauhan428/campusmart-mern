import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import ListingDetail from './pages/ListingDetail';
import CreateListing from './pages/CreateListing';
import MyListings from './pages/MyListings';
import Offers from './pages/Offers';
import Deals from './pages/Deals';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app-container">
          <Navbar />

          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/listings/:id" element={<ListingDetail />} />

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

          <footer
            style={{
              borderTop: '1px solid var(--border-subtle)',
              padding: '1.75rem 1.5rem',
              background: '#ffffff',
              color: 'var(--text-muted)',
              fontSize: '0.8125rem',
              textAlign: 'center',
            }}
          >
            <div
              className="container"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}
            >
              <p style={{ fontWeight: '500' }}>
                © 2026 CampusMart — Campus Marketplace
              </p>
              <p>MERN • Atomic Offers • Verified Deals</p>
            </div>
          </footer>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
