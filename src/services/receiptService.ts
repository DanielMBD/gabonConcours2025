
import { pdfService, PDFData } from './pdfService';
import { apiService } from './api';

export interface ReceiptData {
  candidat: {
    nupcan: string;
    nomcan: string;
    prncan: string;
    maican: string;
    telcan: string;
    dtncan: string;
    ldncan?: string;
    phtcan?: File;
  };
  concours: {
    libcnc: string;
    fracnc?: number;
    etablissement_nomets?: string;
    sescnc?: string;
  };
  filiere?: {
    nomfil: string;
    description?: string;
    matieres?: Array<{
      nom_matiere: string;
      coefficient: number;
      obligatoire?: boolean;
    }>;
  };
  paiement?: {
    reference: string;
    montant: number;
    date: string;
    statut: string;
    methode: string;
  };
  documents: Array<{
    nomdoc: string;
    type: string;
    statut: string;
  }>;
}

class ReceiptService {
  async generateReceiptPDF(data: ReceiptData): Promise<Blob> {
    const pdfData: PDFData = {
      candidat: data.candidat,
      concours: data.concours,
      filiere: data.filiere,
      paiement: data.paiement,
      documents: data.documents
    };

    return pdfService.generatePDFBlob(pdfData);
  }

  async downloadReceiptPDF(data: ReceiptData): Promise<void> {
    const pdfData: PDFData = {
      candidat: data.candidat,
      concours: data.concours,
      filiere: data.filiere,
      paiement: data.paiement,
      documents: data.documents
    };

    pdfService.downloadReceiptPDF(pdfData);
  }

  async generateAndSendReceiptEmail(data: ReceiptData, email: string): Promise<void> {
    try {
      // Générer le PDF
      const pdfBlob = await this.generateReceiptPDF(data);
      
      // Convertir le blob en base64 pour l'envoi
      const pdfBase64 = await this.blobToBase64(pdfBlob);
      
      // Envoyer l'email avec le PDF en pièce jointe
      const response = await apiService.makeRequest('/email/receipt', 'POST', {
        email: email,
        nupcan: data.candidat.nupcan,
        candidatData: data,
        pdfAttachment: pdfBase64
      });

      if (!response.success) {
        throw new Error('Erreur lors de l\'envoi de l\'email');
      }
    } catch (error) {
      console.error('Erreur envoi email reçu:', error);
      throw new Error('Impossible d\'envoyer le reçu par email');
    }
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}

export const receiptService = new ReceiptService();
