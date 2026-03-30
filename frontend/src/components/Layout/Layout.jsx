import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col relative max-w-full">
      <Navbar className="sticky top-0 z-50 w-full" />
      <main className="flex-grow relative w-full overflow-x-clip">
        <Outlet />
      </main>
      <Footer className="w-full" />
    </div>
  );
};

export default Layout;