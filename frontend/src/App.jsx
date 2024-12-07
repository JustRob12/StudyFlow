import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'
import Settings from './components/Settings'
import ViewTask from './components/ViewTask'
import History from './components/History'
import Progress from './components/Progress';
import { TimerProvider } from './context/TimerContext'

function App() {
  return (
    <TimerProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/tasks" element={<ViewTask />} />
          <Route path="/history" element={<History />} />
          <Route path="/progress" element={<Progress />} />
        </Routes>
      </Router>
    </TimerProvider>
  )
}

export default App
