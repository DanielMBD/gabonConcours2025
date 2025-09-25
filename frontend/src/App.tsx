
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AdminAuthProvider, useAdminAuth } from '@/contexts/AdminAuthContext';

// Pages publiques
import Index from '@/pages/Index';
import Concours from '@/pages/Concours';
import Candidature from '@/pages/Candidature';
import ChoixFiliere from '@/pages/ChoixFiliere';
import Confirmation from '@/pages/Confirmation';
import Documents from '@/pages/Documents';
import DocumentsContinue from '@/pages/DocumentsContinue';
import Paiement from '@/pages/Paiement';
import PaiementContinue from '@/pages/PaiementContinue';
import Succes from '@/pages/Succes';
import SuccesContinue from '@/pages/SuccesContinue';
import Connexion from '@/pages/Connexion';
import NotFound from '@/pages/NotFound';
import StatutCandidature from '@/pages/StatutCandidature';
import DashboardCandidat from '@/pages/DashboardCandidat';
import RecapPaiement from '@/pages/RecapPaiement';
import ConcoursDetails from "@/pages/ConcoursDetails";

// Pages admin
import AdminLayout from '@/components/admin/AdminLayout';
import AdminProtectedRoute from '@/components/admin/AdminProtectedRoute';
import AdminLogin from '@/pages/admin/Login';
import AdminDashboard from '@/pages/admin/Dashboard';
import AdminConcours from '@/pages/admin/Concours';
import AdminCandidats from '@/pages/admin/Candidats';
import AdminEtablissements from '@/pages/admin/Etablissements';
import AdminDossiers from '@/pages/admin/Dossiers';
import AdminPaiements from '@/pages/admin/Paiements';
import GestionCandidature from '@/pages/admin/GestionCandidature';
import GestionNiveaux from '@/pages/admin/GestionNiveaux';
import GestionFilieres from '@/pages/admin/GestionFilieres';
import GestionEtablissements from '@/pages/admin/GestionEtablissements';
import GestionAdmins from '@/pages/admin/GestionAdmins';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Composant pour les routes protégées super-admin
const SuperAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { admin } = useAdminAuth();
  
  if (!admin || admin.role !== 'super_admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
      <QueryClientProvider client={queryClient}>
        <AdminAuthProvider>
          <Router>
            <Routes>
              {/* Routes publiques */}
              <Route path="/" element={<Index />} />
              <Route path="/concours" element={<Concours />} />
              <Route path="/concours/:concoursId" element={<ConcoursDetails />} />
              
              {/* Routes pour nouvelles candidatures avec filières */}
              <Route path="/candidature/:concoursId" element={<ChoixFiliere />} />
              <Route path="/candidature/:concoursId/filiere/:filiereId" element={<Candidature />} />

              <Route path="/confirmation/:numeroCandidature" element={<Confirmation />} />
              <Route path="/documents/:numeroCandidature" element={<Documents />} />
              <Route path="/paiement/:numeroCandidature" element={<Paiement />} />
              <Route path="/succes/:numeroCandidature" element={<Succes />} />
              
              {/* Routes pour continuer candidatures existantes */}
              <Route path="/documents/continue/:nupcan" element={<DocumentsContinue />} />
              <Route path="/paiement/continue/:nupcan" element={<PaiementContinue />} />
              <Route path="/succes-continue/:nupcan" element={<SuccesContinue />} />
              
              {/* Routes pour statut et connexion */}
              <Route path="/statut/:nupcan" element={<StatutCandidature />} />
              <Route path="/dashboard/:nupcan" element={<DashboardCandidat />} />
              <Route path="/recap/:nupcan" element={<RecapPaiement />} />
              <Route path="/connexion" element={<Connexion />} />

              {/* Routes admin */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                  path="/admin"
                  element={
                    <AdminProtectedRoute>
                      <AdminLayout />
                    </AdminProtectedRoute>
                  }
              >
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="concours" element={<AdminConcours />} />
                <Route path="candidats" element={<AdminCandidats />} />
                <Route path="candidats/:nupcan" element={<GestionCandidature />} />
                <Route path="etablissements" element={<AdminEtablissements />} />
                <Route path="dossiers" element={<AdminDossiers />} />
                <Route path="paiements" element={<AdminPaiements />} />
                
                {/* Routes réservées au super-admin */}
                <Route path="gestion-admins" element={
                  <SuperAdminRoute>
                    <GestionAdmins />
                  </SuperAdminRoute>
                } />
                <Route path="niveaux" element={
                  <SuperAdminRoute>
                    <GestionNiveaux />
                  </SuperAdminRoute>
                } />
                <Route path="filieres" element={
                  <SuperAdminRoute>
                    <GestionFilieres />
                  </SuperAdminRoute>
                } />
                <Route path="gestion-etablissements" element={
                  <SuperAdminRoute>
                    <GestionEtablissements />
                  </SuperAdminRoute>
                } />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </Router>
        </AdminAuthProvider>
      </QueryClientProvider>
  );
}

export default App;
