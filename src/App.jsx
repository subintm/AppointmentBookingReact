import React from 'react'
import { Route, Routes } from 'react-router-dom'
import AdminLogin from './Pages/Admin/AdminLogin'
import AdminDashBoard from './Pages/Admin/AdminDashBoard'
import Service from './Pages/Admin/Service'
import Appointments from './Pages/Admin/Appointments'
import Availability from './Pages/Admin/Availability'
import RegisterUser from './Pages/Admin/RegisterUser'
import UserDashBoard from './Pages/UserPages/UserDashBoard'

function App() {
  return (
    <Routes>
      <Route path="/" element={<AdminLogin />} />
      <Route path="/register" element={<RegisterUser />} />
      <Route path="/userdashboard" element={<UserDashBoard />} />
      <Route path="/admindashboard" element={<AdminDashBoard />} />
      <Route path='/servicePage' element={<Service/>} />
      <Route path='/appointmentPage' element={<Appointments/>} />
      <Route path='/availabilityPage' element={<Availability/>} />
    </Routes>
  )
}

export default App