import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Donors from './pages/Donors';
import RequestBlood from './pages/RequestBlood';
import ActiveRequests from './pages/ActiveRequests';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/donors" element={<Donors />} />
          <Route
            path="/request-blood"
            element={
              <ProtectedRoute>
                <RequestBlood />
              </ProtectedRoute>
            }
          />
          <Route path="/active-requests" element={<ActiveRequests />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
    </div>
  );
}
