import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login/Login'
import Homepage from './pages/Landing/Homepage'
import Dashboard from './pages/Landing/Dashboard'
import Information from './pages/Landing/Information'
import ProfileUpdate from './pages/ProfileUpdate/ProfileUpdate'

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/homepage" element={<Homepage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/information" element={<Information />} />
        <Route path="/profileupdate" element={<ProfileUpdate />} />
      </Routes>
    </div>
  )
}

export default App
