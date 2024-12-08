import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import Dashboard from './components/Dashboard'
import Goals from './components/Goals'
import History from './components/History'
import Login from './components/Login'
import Profile from './components/Profile'
import Progress from './components/Progress'
import Register from './components/Register'
import Settings from './components/Settings'
import ViewTask from './components/ViewTask'
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
          <Route path="/goals" element={<Goals />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Router>
    </TimerProvider>
  )
}

export default App
