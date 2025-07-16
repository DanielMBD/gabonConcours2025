
import jsPDF from 'jspdf';

export interface PDFData {
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

class PDFService {
  generateReceiptPDF(data: PDFData): jsPDF {
    const doc = new jsPDF();
    const isGratuit = !data.concours.fracnc || data.concours.fracnc === 0;
    
    // En-tête avec logo et titre
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setFontSize(28);
    doc.setTextColor(255, 255, 255);
    doc.text('GABConcours', 105, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.text('République Gabonaise - Plateforme Officielle des Concours', 105, 30, { align: 'center' });

    doc.setFontSize(22);
    doc.setTextColor(37, 99, 235);
    doc.text('REÇU OFFICIEL DE CANDIDATURE', 105, 55, { align: 'center' });

    if (isGratuit) {
      doc.setFontSize(16);
      doc.setTextColor(22, 163, 74);
      doc.text('🎓 Programme NGORI - Inscription Gratuite', 105, 65, { align: 'center' });
    }

    // Ligne de séparation élégante
    doc.setLineWidth(2);
    doc.setDrawColor(37, 99, 235);
    doc.line(20, 75, 190, 75);

    let yPos = 90;

    // Section candidat avec espace pour photo
    doc.setFillColor(248, 250, 252);
    doc.rect(15, yPos - 5, 180, 60, 'F');
    
    doc.setFontSize(18);
    doc.setTextColor(37, 99, 235);
    doc.text('👤 INFORMATIONS DU CANDIDAT', 20, yPos + 5);
    
    // Espace réservé pour la photo (simulation)
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(1);
    doc.rect(160, yPos + 10, 25, 30, 'S');
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Photo', 172, yPos + 27, { align: 'center' });
    
    yPos += 15;
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    
    const candidatInfo = [
      `📋 NUPCAN: ${data.candidat.nupcan}`,
      `👨‍🎓 Nom complet: ${data.candidat.prncan} ${data.candidat.nomcan}`,
      `📧 Email: ${data.candidat.maican}`,
      `📞 Téléphone: ${data.candidat.telcan}`,
      `🎂 Date de naissance: ${new Date(data.candidat.dtncan).toLocaleDateString('fr-FR')}`,
    ];

    if (data.candidat.ldncan) {
      candidatInfo.push(`📍 Lieu de naissance: ${data.candidat.ldncan}`);
    }

    candidatInfo.forEach((info, index) => {
      doc.text(info, 20, yPos + (index * 8));
    });

    yPos += 70;

    // Section concours
    doc.setFillColor(239, 246, 255);
    doc.rect(15, yPos - 5, 180, 50, 'F');
    
    doc.setFontSize(18);
    doc.setTextColor(37, 99, 235);
    doc.text('🎯 CONCOURS SÉLECTIONNÉ', 20, yPos + 5);
    
    yPos += 15;
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    
    const concoursInfo = [
      `🏆 Concours: ${data.concours.libcnc}`,
      `🏫 Établissement: ${data.concours.etablissement_nomets || 'N/A'}`,
      `📅 Session: ${data.concours.sescnc || 'N/A'}`,
      `💰 Frais: ${isGratuit ? '✅ GRATUIT (Programme NGORI)' : `${data.concours.fracnc} FCFA`}`
    ];
    
    concoursInfo.forEach((info, index) => {
      doc.text(info, 20, yPos + (index * 8));
    });

    yPos += 60;

    // Section filière
    if (data.filiere) {
      doc.setFillColor(254, 249, 195);
      doc.rect(15, yPos - 5, 180, 45, 'F');
      
      doc.setFontSize(18);
      doc.setTextColor(37, 99, 235);
      doc.text('📚 FILIÈRE D\'ÉTUDES', 20, yPos + 5);
      
      yPos += 15;
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      
      doc.text(`🎓 Filière: ${data.filiere.nomfil}`, 20, yPos);
      yPos += 8;
      
      if (data.filiere.description) {
        doc.text(`📝 Description: ${data.filiere.description}`, 20, yPos);
        yPos += 8;
      }

      if (data.filiere.matieres && data.filiere.matieres.length > 0) {
        yPos += 5;
        doc.text('📖 Matières d\'étude:', 20, yPos);
        yPos += 8;
        
        data.filiere.matieres.forEach((matiere, index) => {
          const matiereText = `   ${index + 1}. ${matiere.nom_matiere} (Coef. ${matiere.coefficient})${matiere.obligatoire ? ' ⭐ Obligatoire' : ''}`;
          doc.text(matiereText, 20, yPos);
          yPos += 6;
        });
      }
      
      yPos += 10;
    }

    // Section paiement
    if (data.paiement || isGratuit) {
      doc.setFillColor(240, 253, 244);
      doc.rect(15, yPos - 5, 180, 40, 'F');
      
      doc.setFontSize(18);
      doc.setTextColor(37, 99, 235);
      doc.text('💳 INFORMATIONS DE PAIEMENT', 20, yPos + 5);
      
      yPos += 15;
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      
      if (isGratuit) {
        const paiementInfo = [
          `✅ Statut: GRATUIT (Programme NGORI)`,
          `💰 Montant: 0 FCFA`,
          `🏛️ Gouvernement: Prise en charge totale`,
          `📅 Date: ${new Date().toLocaleDateString('fr-FR')}`
        ];
        
        paiementInfo.forEach((info, index) => {
          doc.text(info, 20, yPos + (index * 8));
        });
      } else if (data.paiement) {
        const paiementInfo = [
          `📊 Statut: ${data.paiement.statut}`,
          `💰 Montant: ${data.paiement.montant} FCFA`,
          `🔧 Méthode: ${data.paiement.methode}`,
          `🔢 Référence: ${data.paiement.reference}`,
          `📅 Date: ${new Date(data.paiement.date).toLocaleDateString('fr-FR')}`
        ];
        
        paiementInfo.forEach((info, index) => {
          doc.text(info, 20, yPos + (index * 8));
        });
      }
      
      yPos += 50;
    }

    // Section documents
    if (data.documents && data.documents.length > 0) {
      doc.setFillColor(252, 246, 245);
      doc.rect(15, yPos - 5, 180, Math.min(40, 10 + data.documents.length * 6), 'F');
      
      doc.setFontSize(18);
      doc.setTextColor(37, 99, 235);
      doc.text('📁 DOCUMENTS SOUMIS', 20, yPos + 5);
      
      yPos += 15;
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      
      data.documents.forEach((document, index) => {
        const statusIcon = document.statut === 'valide' ? '✅' : document.statut === 'rejete' ? '❌' : '⏳';
        doc.text(`${statusIcon} ${index + 1}. ${document.nomdoc} - ${document.statut.toUpperCase()}`, 20, yPos);
        yPos += 6;
      });
    }

    // Pied de page officiel
    const pageHeight = doc.internal.pageSize.height;
    yPos = pageHeight - 50;
    
    doc.setFillColor(37, 99, 235);
    doc.rect(0, yPos, 210, 50, 'F');
    
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text('🏛️ RÉPUBLIQUE GABONAISE', 105, yPos + 15, { align: 'center' });
    doc.text('Ce document certifie l\'inscription officielle du candidat au concours mentionné.', 105, yPos + 25, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text(`📅 Document généré automatiquement le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, 105, yPos + 35, { align: 'center' });
    doc.text('🌐 GABConcours - Plateforme Officielle des Concours du Gabon', 105, yPos + 42, { align: 'center' });

    return doc;
  }

  downloadReceiptPDF(data: PDFData): void {
    const doc = this.generateReceiptPDF(data);
    doc.save(`Recu_Candidature_${data.candidat.nupcan}_${new Date().toISOString().split('T')[0]}.pdf`);
  }

  generatePDFBlob(data: PDFData): Blob {
    const doc = this.generateReceiptPDF(data);
    return doc.output('blob');
  }
}

export const pdfService = new PDFService();
