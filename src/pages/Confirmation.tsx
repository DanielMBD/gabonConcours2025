
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, AlertTriangle } from 'lucide-react';
import Layout from '@/components/Layout';
import { useCandidature } from '@/hooks/useCandidature';

const Confirmation = () => {
  const { numeroCandidature } = useParams<{ numeroCandidature: string }>();
  const navigate = useNavigate();
  const { candidatureData, isLoading, error, loadCandidature } = useCandidature();


  useEffect(() => {
    if (numeroCandidature) {
      console.log('Confirmation: Chargement candidature pour NUPCAN:', numeroCandidature);
      loadCandidature(numeroCandidature).then(r => {});
    }
  }, [numeroCandidature, loadCandidature]);

  const handleContinuerVersDocuments = () => {
    console.log('Navigation vers documents pour NUPCAN:', numeroCandidature);
    navigate(`/documents/${encodeURIComponent(numeroCandidature)}`);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Chargement de votre candidature...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !candidatureData) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-red-700 mb-2">Erreur de chargement</h2>
                <p className="text-red-600 mb-4">{error || 'Candidature introuvable'}</p>
                <Button onClick={() => navigate('/concours')} variant="outline">
                  Retour aux concours
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Candidature Créée avec Succès !
          </h1>
          <p className="text-muted-foreground">
            Votre candidature a été enregistrée. Voici les détails :
          </p>
        </div>

        <div className="grid gap-6">
          {/* Informations de candidature */}
          <Card>
            <CardHeader>
              <CardTitle>Détails de votre candidature</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Numéro de candidature</p>
                  <p className="font-bold text-lg text-primary">{candidatureData.nupcan}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Candidat</p>
                  <p className="font-semibold">{candidatureData.candidat.prncan} {candidatureData.candidat.nomcan}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-semibold">{candidatureData.candidat.maican}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Téléphone</p>
                  <p className="font-semibold">{candidatureData.candidat.telcan}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informations du concours */}
          <Card>
            <CardHeader>
              <CardTitle>Concours sélectionné</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-semibold text-lg">{candidatureData.concours.libcnc}</p>
                <p className="text-muted-foreground">{candidatureData.concours.etablissement_nomets}</p>
                <p className="text-sm text-muted-foreground">Session: {candidatureData.concours.sescnc}</p>
                <p className="text-sm text-muted-foreground">
                  Frais d'inscription: {candidatureData.concours.fracnc} FCFA
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Progression */}
          <Card>
            <CardHeader>
              <CardTitle>Progression de votre candidature</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="font-medium">Inscription complétée</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-5 w-5 border-2 border-muted rounded-full"></div>
                  <span className="text-muted-foreground">Soumission des documents (prochaine étape)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="h-5 w-5 border-2 border-muted rounded-full"></div>
                  <span className="text-muted-foreground">Paiement des frais</span>
                </div>
              </div>
              
              <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-700 font-medium mb-2">Prochaines étapes :</p>
                <ol className="text-blue-600 text-sm space-y-1 list-decimal list-inside">
                  <li>Préparez vos documents requis (diplômes, certificats, etc.)</li>
                  <li>Téléchargez-les dans votre espace candidature</li>
                  <li>Procédez au paiement des frais d'inscription</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleContinuerVersDocuments}
              className="bg-primary hover:bg-primary/90"
              size="lg"
            >
              Continuer vers les documents
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => navigate('/concours')}
              size="lg"
            >
              Retour aux concours
            </Button>
          </div>

          {/* Information importante */}
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                <h3 className="font-semibold text-amber-700 mb-2">Important</h3>
                <p className="text-amber-600 text-sm">
                  Conservez précieusement votre numéro de candidature : <strong>{candidatureData.nupcan}</strong>
                  <br />
                  Il vous permettra de suivre l'état de votre candidature et de vous connecter à votre espace.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Confirmation;
