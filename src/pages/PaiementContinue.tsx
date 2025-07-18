import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { AlertTriangle, CreditCard, Smartphone, Building2, CheckCircle, Clock, User, Gift, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';
import { useCandidatureState } from '@/hooks/useCandidatureState';
import { apiService } from '@/services/api';
import { validatePhoneNumber, formatPhoneDisplay } from '@/utils/phoneValidation';

const PaiementContinue = () => {
  const { nupcan } = useParams<{ nupcan: string }>();
  const navigate = useNavigate();
  const { candidatureState, isLoading, initializeContinueCandidature, updateProgression } = useCandidatureState();

  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [phoneError, setPhoneError] = useState<string>('');

  useEffect(() => {
    if (nupcan && !candidatureState) {
      initializeContinueCandidature(nupcan).catch((error) => {
        console.error('Erreur initialisation:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les informations de candidature",
          variant: "destructive"
        });
        navigate('/');
      });
    }
  }, [nupcan, candidatureState, initializeContinueCandidature, navigate]);

  useEffect(() => {
    if (candidatureState?.candidatData?.telcan) {
      setPhoneNumber(candidatureState.candidatData.telcan);
    }
  }, [candidatureState]);

  const handleMethodChange = (method: string) => {
    setSelectedMethod(method);
    setShowInput(method === 'moov' || method === 'airtel_money');
    setPhoneError('');
  };

  const handlePhoneChange = (value: string) => {
    setPhoneNumber(value);
    setPhoneError('');
  };

  const handlePayment = async () => {
    if (!candidatureState?.candidatData || !candidatureState?.concoursData) {
      toast({
        title: "Erreur",
        description: "Données de candidature manquantes",
        variant: "destructive"
      });
      return;
    }

    const montant = parseFloat(candidatureState.concoursData.fracnc);
    
    if (montant === 0) {
      toast({
        title: "Concours gratuit",
        description: "Ce concours est entièrement gratuit !",
      });
      
      await updateProgression(nupcan || '', 'paiement');
      navigate(`/succes-continue/${encodeURIComponent(nupcan || '')}`);
      return;
    }

    if (!selectedMethod) {
      toast({
        title: "Méthode de paiement requise",
        description: "Veuillez sélectionner une méthode de paiement",
        variant: "destructive"
      });
      return;
    }

    if ((selectedMethod === 'moov' || selectedMethod === 'airtel_money') && !phoneNumber) {
      setPhoneError('Numéro de téléphone requis');
      return;
    }

    if (selectedMethod === 'moov' || selectedMethod === 'airtel_money') {
      const validation = validatePhoneNumber(phoneNumber, selectedMethod as 'moov' | 'airtel_money');
      if (!validation.isValid) {
        setPhoneError(validation.message);
        return;
      }
    }

    setIsProcessing(true);

    try {
      const candidat = candidatureState.candidatData;
      
      const paiementData = {
        nipcan: candidat.nipcan || candidat.nupcan,
        montant: montant,
        methode: selectedMethod,
        statut: 'valide',
        telephone: phoneNumber
      };

      console.log('Données paiement:', paiementData);

      const response = await apiService.createPaiement(paiementData);

      if (!response.success) {
        throw new Error(response.message || 'Erreur lors du paiement');
      }

      toast({
        title: "Paiement validé",
        description: "Votre paiement a été traité avec succès. Un email de confirmation vous a été envoyé."
      });

      await updateProgression(nupcan || '', 'paiement');
      navigate(`/succes-continue/${encodeURIComponent(nupcan || '')}`);

    } catch (error: any) {
      console.error('Erreur paiement:', error);
      toast({
        title: "Erreur de paiement",
        description: error.message || "Une erreur est survenue lors du paiement",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Chargement des informations...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!candidatureState?.candidatData || !candidatureState?.concoursData) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              Candidature non trouvée. Veuillez vérifier votre NUPCAN.
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  const candidat = candidatureState.candidatData;
  const concours = candidatureState.concoursData;
  const montant = parseFloat(concours.fracnc);
  const paiement = candidatureState.paiementData;
  const isGratuit = montant === 0;

  // Si le paiement est déjà effectué
  if (paiement && paiement.statut === 'valide') {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-green-700 mb-2">
                  Paiement déjà effectué
                </h2>
                <p className="text-muted-foreground mb-4">
                  Votre paiement a déjà été validé pour cette candidature.
                </p>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Montant: {Number(paiement.montant).toLocaleString()} FCFA
                </Badge>
                <div className="mt-6">
                  <Button onClick={() => navigate(`/dashboard/${encodeURIComponent(nupcan || '')}`)}>
                    Voir mon dashboard
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // Si le paiement est en attente
  if (paiement && paiement.statut === 'en_attente') {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Clock className="h-16 w-16 text-amber-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-amber-700 mb-2">
                  Paiement en cours de traitement
                </h2>
                <p className="text-muted-foreground mb-4">
                  Votre paiement est en cours de vérification. Vous recevrez une confirmation par email.
                </p>
                <Badge variant="default" className="bg-amber-100 text-amber-800">
                  Montant: {Number(paiement.montant).toLocaleString()} FCFA
                </Badge>
                <div className="mt-6">
                  <Button onClick={() => navigate(`/dashboard/${encodeURIComponent(nupcan || '')}`)}>
                    Voir mon dashboard
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const paymentMethods = [
    {
      id: 'moov' as const,
      name: 'Moov Money',
      icon: <Smartphone className="h-6 w-6" />,
      description: 'Paiement via Moov money (060, 062, 066)',
      prefixes: ['060', '062', '066']
    },
    {
      id: 'airtel_money' as const,
      name: 'Airtel Money',
      icon: <Smartphone className="h-6 w-6" />,
      description: 'Paiement via Airtel Money (074, 076)',
      prefixes: ['074', '076']
    },
  ];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {isGratuit ? 'Candidature Gratuite' : 'Paiement'}
          </h1>
          <p className="text-muted-foreground">
            {isGratuit 
              ? 'Ce concours est entièrement gratuit !' 
              : 'Complétez votre candidature en effectuant le paiement'
            }
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Récapitulatif */}
          <Card>
            <CardHeader>
              <CardTitle>Récapitulatif de votre candidature</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">{concours.libcnc}</h3>
                <p className="text-sm text-muted-foreground mb-1">
                  {concours.etablissement_nomets}
                </p>
                <p className="text-sm text-muted-foreground">
                  Session {concours.sescnc}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Candidat:</span>
                  <span className="font-medium">
                    {candidat.prncan} {candidat.nomcan}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>NUPCAN:</span>
                  <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
                    {candidat.nupcan}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Email:</span>
                  <span className="text-sm">{candidat.maican}</span>
                </div>
                <div className="flex justify-between">
                  <span>Documents:</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    {candidatureState.documentsData.length} soumis
                  </Badge>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Montant à payer:</span>
                  <span className={isGratuit ? "text-green-600" : "text-primary"}>
                    {isGratuit ? (
                      <div className="flex items-center">
                        <Gift className="h-4 w-4 mr-1" />
                        GRATUIT
                      </div>
                    ) : (
                      `${montant.toLocaleString()} FCFA`
                    )}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section paiement */}
          <Card>
            <CardHeader>
              <CardTitle>
                {isGratuit ? 'Finaliser votre candidature' : 'Choisir une méthode de paiement'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isGratuit ? (
                <div className="text-center space-y-4">
                  <div className="p-6 bg-green-50 rounded-lg">
                    <Gift className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-green-700 mb-2">
                      Concours Gratuit (NGORI)
                    </h3>
                    <p className="text-green-600">
                      Ce concours ne nécessite aucun frais d'inscription. 
                      Cliquez sur continuer pour finaliser votre candidature.
                    </p>
                  </div>
                  <Button
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className="w-full bg-green-600 hover:bg-green-700"
                    size="lg"
                  >
                    {isProcessing ? 'Finalisation...' : 'Continuer vers la confirmation'}
                  </Button>
                </div>
              ) : (
                <>
                  <RadioGroup value={selectedMethod} onValueChange={handleMethodChange}>
                    <div className="space-y-4">
                      {paymentMethods.map((method) => (
                        <div key={method.id} className="space-y-3">
                          <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                            <RadioGroupItem value={method.id} id={method.id} />
                            <Label htmlFor={method.id} className="flex items-center space-x-3 cursor-pointer flex-1">
                              <div className="text-primary">
                                {method.icon}
                              </div>
                              <div>
                                <div className="font-medium">{method.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {method.description}
                                </div>
                              </div>
                            </Label>
                          </div>
                          
                          {selectedMethod === method.id && showInput && (
                            <div className="ml-8 p-3 bg-muted/30 rounded-lg">
                              <Label htmlFor="phone" className="text-sm font-medium">
                                Numéro de téléphone {method.name}
                              </Label>
                              <Input
                                id="phone"
                                type="tel"
                                placeholder={`Ex: ${method.prefixes[0]}XXXXXX`}
                                value={phoneNumber}
                                onChange={(e) => handlePhoneChange(e.target.value)}
                                className={`mt-1 ${phoneError ? 'border-red-500' : ''}`}
                              />
                              {phoneError && (
                                <div className="flex items-center mt-1 text-red-600 text-sm">
                                  <AlertCircle className="h-4 w-4 mr-1" />
                                  {phoneError}
                                </div>
                              )}
                              <p className="text-xs text-muted-foreground mt-1">
                                Numéro utilisé lors de l'inscription: {formatPhoneDisplay(candidat.telcan)}
                              </p>
                              <div className="text-xs text-muted-foreground mt-1">
                                Préfixes acceptés: {method.prefixes.join(', ')}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </RadioGroup>

                  <div className="mt-8">
                    <Button
                      onClick={handlePayment}
                      disabled={!selectedMethod || isProcessing}
                      className="w-full bg-primary hover:bg-primary/90"
                      size="lg"
                    >
                      {isProcessing ? 'Traitement en cours...' : `Payer ${montant.toLocaleString()} FCFA`}
                    </Button>
                  </div>

                  <Alert className="mt-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Le paiement sera validé automatiquement et un email de confirmation vous sera envoyé.
                    </AlertDescription>
                  </Alert>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default PaiementContinue;
