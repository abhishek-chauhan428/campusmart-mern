import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import PlaceholderPage from './pages/PlaceholderPage';

import { Tag, PlusCircle, ArrowLeftRight, MessageSquare, CheckCircle2, Shield } from 'lucide-react';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Student Routes */}
              <Route element={<ProtectedRoute />}>
                <Route
                  path="/my-listings"
                  element={
                    <PlaceholderPage
                      title="My Campus Listings"
                      phase="Phase 2: Listings & Search"
                      description="Manage all your active, reserved, and sold listings, edit descriptions, and track buyer interest."
                      icon={Tag}
                    />
                  }
                />
                <Route
                  path="/listings/create"
                  element={
                    <PlaceholderPage
                      title="List an Item"
                      phase="Phase 2: Listings & Cloudinary"
                      description="Upload up to 5 photos, set price or swap requirements, condition, and category."
                      icon={PlusCircle}
                    />
                  }
                />
                <Route
                  path="/my-offers"
                  element={
                    <PlaceholderPage
                      title="Structured Offers & Counters"
                      phase="Phase 3: State Machine"
                      description="Review incoming and sent offers. Accept offers with atomic reservation or negotiate with linked counter-offers."
                      icon={ArrowLeftRight}
                    />
                  }
                />
                <Route
                  path="/inbox"
                  element={
                    <PlaceholderPage
                      title="Real-Time Campus Chat"
                      phase="Phase 4: Socket.io Chat"
                      description="Private, authenticated chat per listing with instant notifications and system transaction logs."
                      icon={MessageSquare}
                    />
                  }
                />
                <Route
                  path="/deals"
                  element={
                    <PlaceholderPage
                      title="Verified Deal Completion"
                      phase="Phase 5: Mutual Handover"
                      description="Coordinate physical item handovers on campus. Both buyer and seller confirm handover before rating each other."
                      icon={CheckCircle2}
                    />
                  }
                />
              </Route>

              {/* Admin Routes */}
              <Route element={<AdminRoute />}>
                <Route
                  path="/admin"
                  element={
                    <PlaceholderPage
                      title="Moderator Dashboard"
                      phase="Phase 6: Admin Moderation"
                      description="Review community reports, remove inappropriate listings, and suspend banned users."
                      icon={Shield}
                    />
                  }
                />
              </Route>

              {/* 404 Catch-All */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>

          {/* Minimalist modern footer */}
          <footer style={{
            borderTop: '1px solid var(--border-subtle)',
            padding: '1.75rem 1.5rem',
            background: '#ffffff',
            color: 'var(--text-muted)',
            fontSize: '0.8125rem',
            textAlign: 'center'
          }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <p style={{ fontWeight: '500' }}>© 2026 Shop — Campus Marketplace</p>
              <p>MERN • Real-Time Chat • Atomic Offers</p>
            </div>
          </footer>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
