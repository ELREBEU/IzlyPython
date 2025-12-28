import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RechargeIndex from './pages/RechargeIndex';
import RechargeCard from './pages/Recharge';
import Payment from './pages/Payment';
import Profile from './pages/Profile';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/recharge" element={<RechargeIndex />} />
                <Route path="/recharge/card" element={<RechargeCard />} />
                <Route path="/payment" element={<Payment />} />
                <Route path="/profile" element={<Profile />} />
            </Routes>
        </Router>
    );
}

export default App;
