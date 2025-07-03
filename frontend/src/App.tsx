// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'
import { Outlet } from 'react-router'
import Layout from './components/layout'

function App() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  )
}

export default App
