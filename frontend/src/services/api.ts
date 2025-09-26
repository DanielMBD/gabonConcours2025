import axios from 'axios';

const API_BASE_URL = '/ .netlify/functions/proxyConcours';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

// Helper type for legacy compatibility
export type LegacyApiResponse<T = any> = ApiResponse<T> | T;

export class ApiService {
  constructor(private baseUrl: string = API_BASE_URL) {}

  async makeRequest<T>(url: string, method: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const isFormData = data instanceof FormData;
      
      const response = await axios({
        url: `${this.baseUrl}${url}`,
        method,
        data,
        headers: isFormData ? {} : {
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error: any) {
      console.error(`Erreur lors de la requête vers ${url}:`, error);

      // Vérifier si la réponse contient des détails d'erreur
      if (error.response && error.response.data) {
        return {
          success: false,
          message: error.response.data.message || 'Erreur lors de la requête',
          errors: error.response.data.errors || [error.message],
        };
      }

      // Si aucune information d'erreur spécifique n'est disponible
      return {
        success: false,
        message: 'Erreur inconnue lors de la requête',
        errors: [error.message],
      };
    }
  }

  async makeFormDataRequest<T>(url: string, method: string, formData: FormData): Promise<ApiResponse<T>> {
    try {
      console.log('API: Envoi FormData vers', url);
      
      const response = await axios({
        url: `${this.baseUrl}${url}`,
        method,
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error: any) {
      console.error(`Erreur lors de la requête FormData vers ${url}:`, error);

      if (error.response && error.response.data) {
        return {
          success: false,
          message: error.response.data.message || 'Erreur lors de la requête',
          errors: error.response.data.errors || [error.message],
        };
      }

      return {
        success: false,
        message: 'Erreur inconnue lors de la requête',
        errors: [error.message],
      };
    }
  }

  // Au lieu de `/concours`, on passe la query `?route=concours`
  async getConcours<T>(): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('/?route=concours', 'GET');
  }


  async getNiveaux<T>(): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('/niveaux', 'GET');
  }

  async getFilieres<T>(): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('/filieres', 'GET');
  }

  async getEtablissements<T>(): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('/etablissements', 'GET');
  }

  async getSessions<T>(): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('/sessions', 'GET');
  }

  async createCandidat<T>(data: any): Promise<ApiResponse<T>> {
    if (data instanceof FormData) {
      return this.makeFormDataRequest<T>('/candidats', 'POST', data);
    }
    return this.makeRequest<T>('/candidats', 'POST', data);
  }

  async updateCandidat<T>(id: string, data: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(`/candidats/${id}`, 'PUT', data);
  }

  async getNupcanAvailability(nupcan: string): Promise<ApiResponse<boolean>> {
    return this.makeRequest<boolean>(`/candidats/check-nupcan?nupcan=${nupcan}`, 'GET');
  }

  async getCandidatByNupcan<T>(nupcan: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(`/candidats/nupcan/${nupcan}`, 'GET');
  }

  async createPaiement<T>(data: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('/paiements', 'POST', data);
  }

  async getPaiementByNupcan<T>(nupcan: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(`/paiements/nupcan/${nupcan}`, 'GET');
  }

  async getCandidats<T>(): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('/candidats', 'GET');
  }

  // Récupérer les documents d'un candidat
  async getDocumentsByCandidat(nupcan: string) {
    console.log('API: Récupération documents pour candidat:', nupcan);
    try {
      const response = await this.makeRequest(`/dossiers/nupcan/${nupcan}`, 'GET');
      console.log('API: Documents récupérés:', response);
      return response;
    } catch (error) {
      console.error('API: Erreur récupération documents:', error);
      throw error;
    }
  }

  // Valider un document
  async validateDocument(documentId: string, statut: 'valide' | 'rejete', commentaire?: string) {
    console.log('API: Validation document:', documentId, statut);
    try {
      const response = await this.makeRequest(`/document-validation/${documentId}`, 'PUT', {
        statut,
        commentaire,
        admin_id: 1 // À adapter selon le système d'authentification admin
      });
      console.log('API: Document validé:', response);
      return response;
    } catch (error) {
      console.error('API: Erreur validation document:', error);
      throw error;
    }
  }

  // Télécharger un document
  async downloadDocument(documentId: string): Promise<Blob> {
    console.log('API: Téléchargement document:', documentId);
    try {
      const response = await fetch(`${this.baseUrl}/documents/${documentId}/download`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.blob();
    } catch (error) {
      console.error('API: Erreur téléchargement document:', error);
      throw error;
    }
  }

  async getDossiers<T>(): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('/dossiers', 'GET');
  }

  // Récupérer tous les dossiers pour l'admin avec informations complètes
  async getAdminDossiers<T>(): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('/dossiers/admin/all', 'GET');
  }

  // Additional methods for document management
  async getDocumentsByNupcan<T>(nupcan: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(`/dossiers/nupcan/${nupcan}`, 'GET');
  }

  async updateDocumentStatus<T>(documentId: string, statut: string, commentaire?: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(`/document-validation/${documentId}`, 'PUT', {
      statut,
      commentaire,
      admin_id: 1
    });
  }

  async createDossier<T>(data: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('/dossiers', 'POST', data);
  }

  // Concours management
  async getConcoursById<T>(id: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(`/concours/${id}`, 'GET');
  }

  async getConcoursFiliere<T>(concoursId: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(`/concours/${concoursId}/filieres`, 'GET');
  }

  async createConcours<T>(data: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('/concours', 'POST', data);
  }

  async deleteConcours<T>(id: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(`/concours/${id}`, 'DELETE');
  }

  // Filiere management
  async getFiliereWithMatieres<T>(filiereId: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(`/filieres/${filiereId}/matieres`, 'GET');
  }

  // Province management
  async getProvinces<T>(): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('/provinces', 'GET');
  }

  // Statistics
  async getStatistics<T>(): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('/statistics', 'GET');
  }

  // Paiements management
  async getPaiements<T>(): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('/paiements', 'GET');
  }

  async getPaiementByCandidat<T>(candidatId: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(`/paiements/candidat/${candidatId}`, 'GET');
  }

  // Alias for backward compatibility
  async getCandidatByNip<T>(nip: string): Promise<ApiResponse<T>> {
    return this.getCandidatByNupcan<T>(nip);
  }

  // Student management
  async createEtudiant<T>(data: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('/etudiants', 'POST', data);
  }

  // Notifications
  async getCandidateNotifications<T>(candidatId: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(`/notifications/candidat/${candidatId}`, 'GET');
  }

  async markNotificationAsRead<T>(notificationId: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(`/notifications/${notificationId}/read`, 'PUT');
  }

  // Email services
  async sendReceiptByEmail<T>(nupcan: string, email: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('/email/send-receipt', 'POST', { nupcan, email });
  }

  // Etablissements CRUD
  async createEtablissement<T>(data: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('/etablissements', 'POST', data);
  }

  async updateEtablissement<T>(id: string, data: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(`/etablissements/${id}`, 'PUT', data);
  }

  async deleteEtablissement<T>(id: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(`/etablissements/${id}`, 'DELETE');
  }

  // Filieres CRUD
  async createFiliere<T>(data: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('/filieres', 'POST', data);
  }

  async updateFiliere<T>(id: string, data: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(`/filieres/${id}`, 'PUT', data);
  }

  async deleteFiliere<T>(id: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(`/filieres/${id}`, 'DELETE');
  }

  // Niveaux CRUD
  async createNiveau<T>(data: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('/niveaux', 'POST', data);
  }

  async updateNiveau<T>(id: string, data: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(`/niveaux/${id}`, 'PUT', data);
  }

  async deleteNiveau<T>(id: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(`/niveaux/${id}`, 'DELETE');
  }

  // Sessions
  async createSession<T>(data: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('/sessions', 'POST', data);
  }
}

export const apiService = new ApiService();
