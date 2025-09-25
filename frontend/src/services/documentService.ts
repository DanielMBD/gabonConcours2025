
import { apiService } from './api';

export interface DocumentData {
  id: number;
  nom_document: string;
  type_document: string;
  chemin_fichier: string;
  taille_fichier: number;
  statut_validation: 'en_attente' | 'valide' | 'rejete';
  date_upload: string;
  candidat_nupcan: string;
  commentaire?: string;
}

export interface DocumentValidationData {
  statut: 'valide' | 'rejete';
  commentaire?: string;
  admin_id?: number;
}

class DocumentService {
  // Récupérer tous les documents d'un candidat
  async getDocumentsByCandidat(nupcan: string): Promise<{ success: boolean; data: DocumentData[]; message: string }> {
    try {
      console.log('Récupération documents pour candidat:', nupcan);
      const response = await apiService.makeRequest(`/documents/nupcan/${nupcan}`, 'GET');
    return {
      success: response.success || false,
      data: (response.data as any) || [],
      message: response.message || 'Documents récupérés'
    };
    } catch (error) {
      console.error('Erreur récupération documents:', error);
      throw error;
    }
  }

  // Valider un document
  async validateDocument(documentId: string, validationData: DocumentValidationData): Promise<{ success: boolean; message: string }> {
    try {
      console.log('Validation document:', documentId, validationData);
      const response = await apiService.makeRequest(`/document-validation/${documentId}`, 'PUT', validationData);
    return {
      success: response.success || false,
      message: response.message || 'Document validé'
    };
    } catch (error) {
      console.error('Erreur validation document:', error);
      throw error;
    }
  }

  // Télécharger un document
  async downloadDocument(documentId: string): Promise<Blob> {
    try {
      console.log('Téléchargement document:', documentId);
      const response = await fetch(`http://localhost:3000/api/documents/${documentId}/download`);
      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement');
      }
      return await response.blob();
    } catch (error) {
      console.error('Erreur téléchargement document:', error);
      throw error;
    }
  }

  // Obtenir l'URL de prévisualisation d'un document
  getDocumentPreviewUrl(chemin_fichier: string): string {
    return `http://localhost:3000/uploads/documents/${chemin_fichier}`;
  }
}

export const documentService = new DocumentService();
