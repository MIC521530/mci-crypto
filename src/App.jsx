import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Admin from './Admin';
import Login from './Login';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <nav className="flex justify-between mb-6">
          <h1 className="text-xl font-bold">MCI 交易所</h1>
          <div className="space-x-4">
            <Link to="/">首頁</Link>
            <Link to="/admin">後台模擬</Link>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
