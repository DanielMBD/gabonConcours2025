import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  User, 
  Trophy, 
  FileText, 
  CreditCard, 
  CheckCircle, 
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Clock,
  Download,
  Eye,
  Upload,
  BookOpen,
  GraduationCap,
  Mail,
  Phone,
  Calendar,
  MapPin,
  School,
  FileCheck,
  Send
} from 'lucide-react';
import Layout from '@/components/Layout';
import { candidatureService } from '@/services/candidatureService';
import BeautifulHorizontalReceipt from '@/components/BeautifulHorizontalReceipt';
import DocumentVisualization from '@/components/DocumentVisualization';
import DocumentUploadForm from '@/components/DocumentUploadForm';
import NotificationPanel from '@/components/candidate/NotificationPanel';
import CandidatePhotoDisplay from '@/components/CandidatePhotoDisplay';
import { receiptService } from '@/services/receiptService';
import { toast } from '@/hooks/use-toast';

const DashboardCandidat = () => {
  const { nupcan } = useParams<{ nupcan: string }>();
  const navigate = useNavigate();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const { data: candidatureData, isLoading, error, refetch } = useQuery({
    queryKey: ['candidature-complete', nupcan],
    queryFn: () => candidatureService.getCandidatureByNupcan(nupcan!),
    enabled: !!nupcan,
    refetchInterval: 30000,
  });

  const handleDownloadReceipt = async () => {
    if (!candidatureData) return;

    try {
      setIsDownloading(true);
      
      const receiptData = {
        candidat: candidatureData.candidat,
        concours: candidatureData.concours,
        filiere: candidatureData.filiere,
        paiement: candidatureData.paiement || {
          reference: 'N/A',
          montant: parseFloat(candidatureData.concours.fracnc || '0'),
          date: new Date().toISOString(),
          statut: parseFloat(candidatureData.concours.fracnc || '0') === 0 ? 'gratuit' : 'en_attente',
          methode: 'N/A'
        },
        documents: candidatureData.documents || []
      };

      await receiptService.downloadReceiptPDF(receiptData);
      
      toast({
        title: "Téléchargement réussi",
        description: "Votre reçu PDF a été téléchargé avec succès"
      });
    } catch (error) {
      toast({
        title: "Erreur de téléchargement",
        description: "Impossible de télécharger le reçu PDF",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleEmailReceipt = async () => {
    if (!candidatureData) return;

    try {
      setIsSendingEmail(true);
      
      const receiptData = {
        candidat: candidatureData.candidat,
        concours: candidatureData.concours,
        filiere: candidatureData.filiere,
        paiement: candidatureData.paiement || {
          reference: 'N/A',
          montant: parseFloat(candidatureData.concours.fracnc || '0'),
          date: new Date().toISOString(),
          statut: parseFloat(candidatureData.concours.fracnc || '0') === 0 ? 'gratuit' : 'en_attente',
          methode: 'N/A'
        },
        documents: candidatureData.documents || []
      };

      await receiptService.generateAndSendReceiptEmail(receiptData, candidatureData.candidat.maican);
      
      toast({
        title: "Reçu envoyé",
        description: "Le reçu a été envoyé à votre adresse email avec succès"
      });
    } catch (error) {
      toast({
        title: "Erreur d'envoi",
        description: "Impossible d'envoyer le reçu par email",
        variant: "destructive"
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleDocumentAdd = async (documents: { name: string; file: File }[]) => {
    if (!nupcan) return;

    try {
      console.log('Ajout de documents:', documents);
      
      toast({
        title: "Documents ajoutés",
        description: `${documents.length} document(s) ajouté(s) avec succès`
      });

      refetch();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter les documents",
        variant: "destructive"
      });
    }
  };

  const handleContinueApplication = () => {
    if (!candidatureData) return;
    
    const { progression } = candidatureData;
    
    if (progression?.etapeActuelle === 'documents') {
      navigate(`/documents/${nupcan}`);
    } else if (progression?.etapeActuelle === 'paiement') {
      navigate(`/paiement/${nupcan}`);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Chargement de votre tableau de bord...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !candidatureData) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              {error ? 'Erreur de chargement' : 'Candidature introuvable'}
            </h1>
            <Button onClick={() => navigate('/connexion')}>Retour à la connexion</Button>
          </div>
        </div>
      </Layout>
    );
  }

  const {
    candidat, concours, filiere, documents, paiement, progression 
  } = candidatureData;

  const isApplicationComplete = progression?.pourcentage === 100;
  const nextStepNeeded = !isApplicationComplete;
  const isGratuit = parseFloat(concours?.fracnc || '0') === 0;

  // Ensure phtcan is treated as string (filename) for photo display
  const photoPath = typeof candidat?.phtcan === 'string' ? candidat.phtcan : null;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête professionnel */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/connexion')}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          
          <div className="bg-gradient-to-r from-primary/10 to-blue-50 rounded-xl p-8 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <CandidatePhotoDisplay 
                  photoPath={photoPath}
                  candidateName={`${candidat?.prncan} ${candidat?.nomcan}`}
                  size="lg"
                />
                <div>
                  <h1 className="text-4xl font-bold text-foreground mb-2">
                    Tableau de Bord Candidat
                  </h1>
                  <p className="text-xl text-muted-foreground mb-1">
                    Bienvenue, {candidat?.prncan} {candidat?.nomcan}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-1" />
                      {candidat?.maican}
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-1" />
                      {candidat?.telcan}
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="text-lg px-4 py-2 mb-2">
                  NUPCAN: {candidat?.nupcan}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  Inscrit le {candidat?.created_at ? new Date(candidat.created_at).toLocaleDateString('fr-FR') : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Progression avec actions rapides */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Trophy className="h-6 w-6 mr-2 text-primary" />
                    Progression de votre candidature
                  </CardTitle>
                  {nextStepNeeded && (
                    <Button onClick={handleContinueApplication} size="sm">
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Continuer
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium">Progression globale</span>
                    <span className="text-2xl font-bold text-primary">{progression?.pourcentage || 0}%</span>
                  </div>
                  <Progress value={progression?.pourcentage || 0} className="h-3" />
                  
                  {/* Étapes détaillées */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-3 p-3 rounded-lg bg-green-50 border border-green-200">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-800">Inscription</p>
                        <p className="text-sm text-green-600">Terminée</p>
                      </div>
                    </div>
                    <div className={`flex items-center space-x-3 p-3 rounded-lg ${
                      documents && documents.length > 0 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-orange-50 border-orange-200'
                    }`}>
                      <FileText className={`h-5 w-5 ${
                        documents && documents.length > 0 ? 'text-green-600' : 'text-orange-600'
                      }`} />
                      <div>
                        <p className={`font-medium ${
                          documents && documents.length > 0 ? 'text-green-800' : 'text-orange-800'
                        }`}>Documents</p>
                        <p className={`text-sm ${
                          documents && documents.length > 0 ? 'text-green-600' : 'text-orange-600'
                        }`}>
                          {documents && documents.length > 0 ? 'Soumis' : 'En attente'}
                        </p>
                      </div>
                    </div>
                    <div className={`flex items-center space-x-3 p-3 rounded-lg ${
                      isGratuit
                        ? 'bg-green-50 border-green-200'
                        : paiement 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-orange-50 border-orange-200'
                    }`}>
                      <CreditCard className={`h-5 w-5 ${
                        isGratuit || paiement ? 'text-green-600' : 'text-orange-600'
                      }`} />
                      <div>
                        <p className={`font-medium ${
                          isGratuit || paiement ? 'text-green-800' : 'text-orange-800'
                        }`}>Paiement</p>
                        <p className={`text-sm ${
                          isGratuit || paiement ? 'text-green-600' : 'text-orange-600'
                        }`}>
                          {isGratuit ? 'Gratuit' : paiement ? 'Payé' : 'En attente'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {nextStepNeeded && (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-5 w-5 text-blue-600" />
                        <span className="font-medium text-blue-800">Prochaine étape :</span>
                        <span className="text-blue-700">
                          {progression?.etapeActuelle === 'documents' ? 'Télécharger vos documents' :
                           progression?.etapeActuelle === 'paiement' ? 'Effectuer le paiement' :
                           'Finaliser votre candidature'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Actions rapides */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={handleDownloadReceipt} 
                className="w-full justify-start" 
                variant="outline"
                disabled={isDownloading}
              >
                <Download className="h-4 w-4 mr-2" />
                {isDownloading ? 'Téléchargement...' : 'Télécharger le reçu PDF'}
              </Button>
              <Button 
                onClick={handleEmailReceipt} 
                className="w-full justify-start" 
                variant="outline"
                disabled={isSendingEmail}
              >
                <Send className="h-4 w-4 mr-2" />
                {isSendingEmail ? 'Envoi en cours...' : 'Envoyer le reçu par email'}
              </Button>
              <Button 
                onClick={() => navigate(`/documents/${nupcan}`)} 
                className="w-full justify-start" 
                variant="outline"
              >
                <Upload className="h-4 w-4 mr-2" />
                Gérer mes documents
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Notifications */}
        {candidat?.nupcan && (
          <div className="mb-8">
            <NotificationPanel nupcan={candidat.nupcan} />
          </div>
        )}

        {/* Informations détaillées */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Informations personnelles complètes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Profil Candidat
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start space-x-6">
                <CandidatePhotoDisplay 
                  photoPath={photoPath}
                  candidateName={`${candidat?.prncan} ${candidat?.nomcan}`}
                  size="md"
                />
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Nom</span>
                      <p className="font-medium">{candidat?.nomcan}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Prénom</span>
                      <p className="font-medium">{candidat?.prncan}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{candidat?.maican}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{candidat?.telcan}</span>
                    </div>
                    {candidat?.dtncan && (
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {new Date(candidat.dtncan).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    )}
                    {candidat?.ldncan && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{candidat.ldncan}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informations du concours */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <School className="h-5 w-5 mr-2" />
                Concours Sélectionné
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <h3 className="font-semibold text-lg mb-2">{concours?.libcnc || 'Non défini'}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-muted-foreground">Établissement:</span>
                    <p>{concours?.etablissement_nomets || 'Non défini'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Session:</span>
                    <p>{concours?.sescnc || 'Non définie'}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <span className="font-medium">Frais d'inscription:</span>
                <div className="text-right">
                  {isGratuit ? (
                    <Badge className="bg-green-100 text-green-800 border-green-300">
                      GRATUIT (NGORI)
                    </Badge>
                  ) : (
                    <span className="text-lg font-bold text-green-700">
                      {parseFloat(concours?.fracnc || '0').toLocaleString()} FCFA
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filière et matières */}
        {filiere && Object.keys(filiere).length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <GraduationCap className="h-5 w-5 mr-2" />
                Filière d'Études
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-lg text-blue-800">{filiere.nomfil || 'Non définie'}</h3>
                  {filiere.description && (
                    <p className="text-blue-700 mt-2">{filiere.description}</p>
                  )}
                </div>
                
                {filiere.matieres && filiere.matieres.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-4 flex items-center">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Matières d'étude ({filiere.matieres.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filiere.matieres.map((matiere: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
                          <div className="flex items-center space-x-3">
                            <BookOpen className="h-4 w-4 text-primary" />
                            <div>
                              <h5 className="font-medium">{matiere.nom_matiere}</h5>
                              <p className="text-sm text-muted-foreground">
                                Coefficient: {matiere.coefficient}
                              </p>
                            </div>
                          </div>
                          {matiere.obligatoire && (
                            <Badge variant="destructive" className="text-xs">
                              Obligatoire
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Gestion des documents */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <FileCheck className="h-5 w-5 mr-2" />
                Mes Documents ({documents?.length || 0})
              </CardTitle>
              <DocumentUploadForm
                onDocumentsAdd={handleDocumentAdd}
                existingDocuments={documents}
              />
            </div>
          </CardHeader>
          <CardContent>
            <DocumentVisualization
              documents={documents || []}
              onRefresh={refetch}
              onDocumentAdd={() => refetch()}
            />
          </CardContent>
        </Card>

        {/* Reçu de candidature */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Votre Reçu de Candidature</h2>
          <BeautifulHorizontalReceipt
            candidatureData={{
              candidat,
              concours,
              filiere,
              documents: documents || [],
              paiement,
              nupcan: candidat?.nupcan
            }}
            onEmailSend={handleEmailReceipt}
          />
        </div>
      </div>
    </Layout>
  );
};

export default DashboardCandidat;
