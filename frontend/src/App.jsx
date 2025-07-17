import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login/Login'
import Homepage from './pages/Homepage/Homepage'
import Dashboard from './pages/Dashboard/Dashboard'
import Information from './pages/Information/Information'
import ProfileUpdate from './pages/ProfileUpdate/ProfileUpdate'
import Confirm from './pages/Confirm/Confirm'

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/homepage" element={<Homepage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/information" element={<Information />} />
        <Route path="/profileupdate" element={<ProfileUpdate />} />
        <Route path="/confirm" element={<Confirm />} />
      </Routes>
    </div>
  )
}

export default App