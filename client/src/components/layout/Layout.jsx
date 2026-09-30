import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

export const Layout = ({ hideFooter = false, hideNavbar = false }) => {
  return (
    <div className="app-container">
      {!hideNavbar && <Navbar />}
      <main className="main-content">
        <Outlet />
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
};

export default Layout;
