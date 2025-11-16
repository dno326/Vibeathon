import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoginPage from '../pages/Auth/LoginPage';
import SignupPage from '../pages/Auth/SignupPage';
import DashboardPage from '../pages/Dashboard/DashboardPage';
import ClassesPage from '../pages/Classes/ClassesPage';
import ClassPage from '../pages/Class/ClassPage';
import SessionPage from '../pages/Session/SessionPage';
import DeckPage from '../pages/Deck/DeckPage';
import StudyModePage from '../pages/Study/StudyModePage';
import ProfilePage from '../pages/Profile/ProfilePage';
import NotesPage from '../pages/Notes/NotesPage';
import FlashcardsPage from '../pages/Flashcards/FlashcardsPage';
import ProfileViewPage from '../pages/Profile/ProfileViewPage';
import NoteViewPage from '../pages/Notes/NoteViewPage';

export const routes = (
  <Routes>
    <Route
      path="/login"
      element={
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      }
    />
    <Route
      path="/signup"
      element={
        <PublicRoute>
          <SignupPage />
        </PublicRoute>
      }
    />
    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/classes"
      element={
        <ProtectedRoute>
          <ClassesPage />
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
      path="/note/:noteId"
      element={
        <ProtectedRoute>
          <NoteViewPage />
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
    <Route
      path="/user/:userId"
      element={
        <ProtectedRoute>
          <ProfileViewPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/notes"
      element={
        <ProtectedRoute>
          <NotesPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/flashcards"
      element={
        <ProtectedRoute>
          <FlashcardsPage />
        </ProtectedRoute>
      }
    />
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

