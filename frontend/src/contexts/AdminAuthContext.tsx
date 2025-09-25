
import React, { createContext, useContext, useState, useEffect } from 'react';

interface Admin {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: 'super_admin' | 'admin_etablissement';
  etablissement_id?: number;
  etablissement_nom?: string;
}

interface AdminAuthContextType {
  admin: Admin | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Vérifier si l'admin est déjà connecté au chargement
    const savedToken = localStorage.getItem('adminToken');
    const savedAdmin = localStorage.getItem('adminData');

    if (savedToken && savedAdmin) {
      try {
        setToken(savedToken);
        setAdmin(JSON.parse(savedAdmin));
      } catch (error) {
        console.error('Erreur lors de la restauration de la session admin:', error);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Tentative de connexion admin:', email);
      
      const response = await fetch('http://localhost:3000/api/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('Réponse serveur:', response.status, response.statusText);

      if (!response.ok) {
        if (response.status === 404) {
          console.error('Route admin/auth/login non trouvée');
          throw new Error('Service administrateur temporairement indisponible');
        }
        
        const errorText = await response.text();
        console.error('Erreur de réponse:', errorText);
        
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.message || 'Erreur de connexion');
        } catch {
          throw new Error('Erreur de connexion au serveur');
        }
      }

      const data = await response.json();
      console.log('Données de connexion reçues:', data);

      if (data.success && data.data) {
        setAdmin(data.data.admin);
        setToken(data.data.token);
        
        // Sauvegarder en localStorage
        localStorage.setItem('adminToken', data.data.token);
        localStorage.setItem('adminData', JSON.stringify(data.data.admin));
        
        return true;
      } else {
        throw new Error(data.message || 'Échec de la connexion');
      }
    } catch (error: any) {
      console.error('Erreur de login:', error);
      throw error;
    }
  };

  const logout = () => {
    setAdmin(null);
    setToken(null);
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
  };

  const isAuthenticated = !!admin && !!token;
  const isSuperAdmin = admin?.role === 'super_admin';

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        token,
        isLoading,
        login,
        logout,
        isAuthenticated,
        isSuperAdmin,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
