import axios from 'axios';

const API_BASE_URL = '/api';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export class ApiService {
  constructor(private baseUrl: string = API_BASE_URL) {}

  private async request<T>(url: string, method: string, data?: any, isFormData: boolean = false): Promise<ApiResponse<T>> {
    try {
      const headers = isFormData ? {} : { 'Content-Type': 'application/json' };
      const response = await axios({ url: `${this.baseUrl}${url}`, method, data, headers });
      return response.data;
    } catch (error: any) {
      console.error(`Erreur lors de la requête vers ${url}:`, error);
      if (error.response && error.response.data) {
        return {
          success: false,
          message: error.response.data.message || 'Erreur lors de la requête',
          errors: error.response.data.errors || [error.message],
        };
      }
      return { success: false, message: 'Erreur inconnue lors de la requête', errors: [error.message] };
    }
  }

  private async formDataRequest<T>(url: string, method: string, formData: FormData): Promise<ApiResponse<T>> {
    return this.request<T>(url, method, formData, true);
  }

  // ==================== Concours ====================
  async getConcours<T>(): Promise<ApiResponse<T>> {
    return this.request<T>('/concours', 'GET'); // sans query string
  }


  async getConcoursById<T>(id: string): Promise<ApiResponse<T>> {
    return this.request<T>(`/concours/${id}`, 'GET');
  }

  async getConcoursFiliere<T>(concoursId: string): Promise<ApiResponse<T>> {
    return this.request<T>(`/concours/${concoursId}/filieres`, 'GET');
  }

  async createConcours<T>(data: any): Promise<ApiResponse<T>> {
    return this.request<T>('/concours', 'POST', data);
  }

  async deleteConcours<T>(id: string): Promise<ApiResponse<T>> {
    return this.request<T>(`/concours/${id}`, 'DELETE');
  }

  // ==================== Candidats ====================
  async createCandidat<T>(data: any): Promise<ApiResponse<T>> {
    return data instanceof FormData ? this.formDataRequest<T>('/candidats', 'POST', data) : this.request<T>('/candidats', 'POST', data);
  }

  async updateCandidat<T>(id: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(`/candidats/${id}`, 'PUT', data);
  }

  async getCandidatByNupcan<T>(nupcan: string): Promise<ApiResponse<T>> {
    return this.request<T>(`/candidats/nupcan/${nupcan}`, 'GET');
  }

  async getNupcanAvailability(nupcan: string): Promise<ApiResponse<boolean>> {
    return this.request<boolean>(`/candidats/check-nupcan?nupcan=${nupcan}`, 'GET');
  }

  // ==================== Documents ====================
  async getDocumentsByNupcan<T>(nupcan: string): Promise<ApiResponse<T>> {
    return this.request<T>(`/dossiers/nupcan/${nupcan}`, 'GET');
  }

  async updateDocumentStatus<T>(documentId: string, statut: 'valide' | 'rejete', commentaire?: string): Promise<ApiResponse<T>> {
    return this.request<T>(`/document-validation/${documentId}`, 'PUT', { statut, commentaire, admin_id: 1 });
  }

  async downloadDocument(documentId: string): Promise<Blob> {
    try {
      const response = await fetch(`${this.baseUrl}/documents/${documentId}/download`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.blob();
    } catch (error) {
      console.error('Erreur téléchargement document:', error);
      throw error;
    }
  }

  // ==================== Paiements ====================
  async createPaiement<T>(data: any): Promise<ApiResponse<T>> {
    return this.request<T>('/paiements', 'POST', data);
  }

  async getPaiementByNupcan<T>(nupcan: string): Promise<ApiResponse<T>> {
    return this.request<T>(`/paiements/nupcan/${nupcan}`, 'GET');
  }

  async getPaiements<T>(): Promise<ApiResponse<T>> {
    return this.request<T>('/paiements', 'GET');
  }

  // ==================== Niveaux, Filières, Établissements, Sessions ====================
  async getNiveaux<T>(): Promise<ApiResponse<T>> { return this.request<T>('/niveaux', 'GET'); }
  async getFilieres<T>(): Promise<ApiResponse<T>> { return this.request<T>('/filieres', 'GET'); }
  async getEtablissements<T>(): Promise<ApiResponse<T>> { return this.request<T>('/etablissements', 'GET'); }
  async getSessions<T>(): Promise<ApiResponse<T>> { return this.request<T>('/sessions', 'GET'); }

  async createEtablissement<T>(data: any): Promise<ApiResponse<T>> { return this.request<T>('/etablissements', 'POST', data); }
  async updateEtablissement<T>(id: string, data: any): Promise<ApiResponse<T>> { return this.request<T>(`/etablissements/${id}`, 'PUT', data); }
  async deleteEtablissement<T>(id: string): Promise<ApiResponse<T>> { return this.request<T>(`/etablissements/${id}`, 'DELETE'); }

  async createFiliere<T>(data: any): Promise<ApiResponse<T>> { return this.request<T>('/filieres', 'POST', data); }
  async updateFiliere<T>(id: string, data: any): Promise<ApiResponse<T>> { return this.request<T>(`/filieres/${id}`, 'PUT', data); }
  async deleteFiliere<T>(id: string): Promise<ApiResponse<T>> { return this.request<T>(`/filieres/${id}`, 'DELETE'); }

  async createNiveau<T>(data: any): Promise<ApiResponse<T>> { return this.request<T>('/niveaux', 'POST', data); }
  async updateNiveau<T>(id: string, data: any): Promise<ApiResponse<T>> { return this.request<T>(`/niveaux/${id}`, 'PUT', data); }
  async deleteNiveau<T>(id: string): Promise<ApiResponse<T>> { return this.request<T>(`/niveaux/${id}`, 'DELETE'); }

  async createSession<T>(data: any): Promise<ApiResponse<T>> { return this.request<T>('/sessions', 'POST', data); }

  // ==================== Provinces ====================
  async getProvinces<T>(): Promise<ApiResponse<T>> { return this.request<T>('/provinces', 'GET'); }

  // ==================== Statistiques ====================
  async getStatistics<T>(): Promise<ApiResponse<T>> { return this.request<T>('/statistics', 'GET'); }

  // ==================== Notifications ====================
  async getCandidateNotifications<T>(candidatId: string): Promise<ApiResponse<T>> { return this.request<T>(`/notifications/candidat/${candidatId}`, 'GET'); }
  async markNotificationAsRead<T>(notificationId: string): Promise<ApiResponse<T>> { return this.request<T>(`/notifications/${notificationId}/read`, 'PUT'); }

  // ==================== Emails ====================
  async sendReceiptByEmail<T>(nupcan: string, email: string): Promise<ApiResponse<T>> { return this.request<T>('/email/send-receipt', 'POST', { nupcan, email }); }
}

export const apiService = new ApiService();
