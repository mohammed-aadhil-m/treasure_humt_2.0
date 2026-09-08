import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { TeamProvider } from './context/TeamContext';
import { AdminProvider } from './context/AdminContext';

import Landing from './pages/Landing';
import QrLanding from './pages/QrLanding';
import Game from './pages/Game';
import LeaderboardPage from './pages/LeaderboardPage';
import NotFound from './pages/NotFound';

import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminOverview from './pages/admin/AdminOverview';
import AdminTeams from './pages/admin/AdminTeams';
import AdminTeamDetail from './pages/admin/AdminTeamDetail';
import AdminChallenges from './pages/admin/AdminChallenges';
import AdminQrManagement from './pages/admin/AdminQrManagement';
import AdminQrDisplay from './pages/admin/AdminQrDisplay';
import AdminSettings from './pages/admin/AdminSettings';
import AdminLeaderboardPage from './pages/admin/AdminLeaderboardPage';

export default function App() {
  return (
    <BrowserRouter>
      <TeamProvider>
        <AdminProvider>
          <div className="th-app-bg" />
          <Routes>
            {/* Participant */}
            <Route path="/" element={<Landing />} />
            <Route path="/register" element={<Landing />} />
            <Route path="/join" element={<Landing />} />
            <Route path="/login" element={<Landing />} />
            <Route path="/hunt" element={<Game />} />
            <Route path="/hunt/qr/:token" element={<QrLanding />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />

            {/* Admin */}
            <Route path="/display" element={<AdminQrDisplay />} />
            <Route path="/admin/display" element={<AdminQrDisplay />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminOverview />} />
              <Route path="teams" element={<AdminTeams />} />
              <Route path="teams/:id" element={<AdminTeamDetail />} />
              <Route path="challenges" element={<AdminChallenges />} />
              <Route path="qr" element={<AdminQrManagement />} />
              <Route path="leaderboard" element={<AdminLeaderboardPage />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AdminProvider>
      </TeamProvider>
    </BrowserRouter>
  );
}
