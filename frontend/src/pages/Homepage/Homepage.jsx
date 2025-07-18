import React from 'react'
import Header from '../../components/Header/Header'
import Footer from '../../components/Footer/Footer'
import UserReport from './UserReport/UserReport'

const Homepage = () => {
  return (
    <div>
      <Header />
      <UserReport />
      <Footer />
    </div>
  )
}

export default Homepage