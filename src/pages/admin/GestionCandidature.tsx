
// @ts-nocheck

import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar,
  MapPin,
  FileText,
  ArrowLeft,
  CreditCard,
  Download,
  Send
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { candidatureService } from '@/services/candidatureService';
import { receiptService } from '@/services/receiptService';
import { emailService } from '@/services/emailService';
import CandidatDocumentsManager from '@/components/admin/CandidatDocumentsManager';
import CandidatPhotoCard from '@/components/admin/CandidatPhotoCard';

const GestionCandidature = () => {
  const { nupcan } = useParams();
  const navigate = useNavigate();

  const { data: candidatureData, isLoading, refetch } = useQuery({
    queryKey: ['candidature', nupcan],
    queryFn: () => candidatureService.getCandidatureByNupcan(nupcan!),
    enabled: !!nupcan,
  });

  const handleDownloadReceipt = async () => {
    if (!candidatureData) return;

    try {
      await receiptService.downloadReceiptPDF(candidatureData);
      toast({
        title: "Téléchargement",
        description: "Le reçu a été téléchargé avec succès",
      });
    } catch (error) {
      console.error('Erreur téléchargement reçu:', error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger le reçu",
        variant: "destructive",
      });
    }
  };

  const handleSendReceiptEmail = async () => {
    if (!candidatureData) return;

    try {
      await receiptService.generateAndSendReceiptEmail(candidatureData, candidatureData.candidat.maican);
      toast({
        title: "Email envoyé",
        description: "Le reçu a été envoyé par email avec succès",
      });
    } catch (error) {
      console.error('Erreur envoi email:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le reçu par email",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!candidatureData) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Candidature non trouvée</h2>
        <p className="text-muted-foreground">Cette candidature n'existe pas ou n'est plus accessible.</p>
      </div>
    );
  }

  const candidat = candidatureData.candidat;
  const concours = candidatureData.concours;
  const filiere = candidatureData.filiere;
  const paiement = candidatureData.paiement;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => navigate('/admin/candidats')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Gestion de la Candidature</h1>
          <p className="text-muted-foreground">NUPCAN: {nupcan}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Photo du candidat */}
        <CandidatPhotoCard candidat={candidat} />

        {/* Informations du candidat */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Informations Personnelles</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Nom</label>
                <p className="font-medium">{candidat.nomcan}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Prénom</label>
                <p className="font-medium">{candidat.prncan}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{candidat.maican}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{candidat.telcan}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{new Date(candidat.dtncan).toLocaleDateString('fr-FR')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{candidat.ldncan}</span>
            </div>
          </CardContent>
        </Card>

        {/* Informations candidature */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Informations Candidature</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Concours</label>
              <p className="font-medium">{concours?.libcnc || 'Non défini'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Filière</label>
              <p className="font-medium">{filiere?.nomfil || 'Non définie'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Statut</label>
              <div className="mt-1">
                <Badge 
                  className={
                    candidat.statut === 'valide' ? 'bg-green-100 text-green-800' :
                    candidat.statut === 'rejete' ? 'bg-red-100 text-red-800' :
                    'bg-orange-100 text-orange-800'
                  }
                >
                  {candidat.statut || 'En attente'}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Date de candidature</label>
              <p>{candidat.created_at ? new Date(candidat.created_at).toLocaleDateString('fr-FR') : 'Non définie'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Frais de concours</label>
              <p className="font-medium">
                {!concours?.fracnc || concours.fracnc === 0 || concours.fracnc === '0' 
                  ? 'GRATUIT (Programme NGORI)' 
                  : `${concours.fracnc} FCFA`}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Informations de paiement */}
      {paiement && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5" />
              <span>Informations de Paiement</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Montant</label>
                <p className="font-medium">{paiement.montant} FCFA</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Méthode</label>
                <p className="font-medium">{paiement.methode}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Référence</label>
                <p className="font-medium">{paiement.reference_paiement}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Statut</label>
                <Badge 
                  className={
                    paiement.statut === 'valide' ? 'bg-green-100 text-green-800' :
                    paiement.statut === 'rejete' ? 'bg-red-100 text-red-800' :
                    'bg-orange-100 text-orange-800'
                  }
                >
                  {paiement.statut}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions administratives */}
      <Card>
        <CardHeader>
          <CardTitle>Actions Administratives</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleDownloadReceipt} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Télécharger le reçu
            </Button>
            <Button onClick={handleSendReceiptEmail} variant="outline">
              <Send className="h-4 w-4 mr-2" />
              Envoyer le reçu par email
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Gestion des documents */}
      <CandidatDocumentsManager
        candidatNupcan={nupcan!}
        candidatInfo={{
          nom: candidat.nomcan,
          prenom: candidat.prncan,
          email: candidat.maican
        }}
        onDocumentValidated={() => refetch()}
      />
    </div>
  );
};

export default GestionCandidature;
