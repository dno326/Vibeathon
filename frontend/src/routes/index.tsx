import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoginPage from '../pages/Auth/LoginPage';
import SignupPage from '../pages/Auth/SignupPage';
import DashboardPage from '../pages/Dashboard/DashboardPage';
import ClassPage from '../pages/Class/ClassPage';
import SessionPage from '../pages/Session/SessionPage';
import DeckPage from '../pages/Deck/DeckPage';
import StudyModePage from '../pages/Study/StudyModePage';
import ProfilePage from '../pages/Profile/ProfilePage';

export const routes = (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/signup" element={<SignupPage />} />
    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/class/:classId"
      element={
        <ProtectedRoute>
          <ClassPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/session/:sessionId"
      element={
        <ProtectedRoute>
          <SessionPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/deck/:deckId"
      element={
        <ProtectedRoute>
          <DeckPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/study/:deckId"
      element={
        <ProtectedRoute>
          <StudyModePage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/profile"
      element={
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      }
    />
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

