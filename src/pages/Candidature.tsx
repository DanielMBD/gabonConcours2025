// @ts-nocheck
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Camera, Upload, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';
import { apiService } from '@/services/api';
import { useCandidature } from '@/hooks/useCandidature';

const Candidature = () => {
  const { concoursId } = useParams<{ concoursId: string }>();
  const {filiere} = useParams<{ filiere: string }>();
  const navigate = useNavigate();
  const { createCandidature, isLoading: candidatureLoading } = useCandidature();

  const [candidat, setCandidatForm] = useState({
    nipcan: '',
    nomcan: '',
    prncan: '',
    dtncan: '',
    ldncan: '',
    telcan: '',
    phtcan:'',
    maican: '',
    proorg: '',
    proact: '',
    proaff: '',
  });

  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [searchingNip, setSearchingNip] = useState(false);
  const [ageError, setAgeError] = useState<string | null>(null);

  // Fonction pour calculer l'âge
  const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  };

  // Fonction pour valider l'âge
  const validateAge = (birthDate: string) => {
    if (!birthDate || !concours?.agecnc) {
      setAgeError(null);
      return;
    }

    const age = calculateAge(birthDate);
    const maxAge = parseInt(concours.agecnc);

    if (age > maxAge) {
      setAgeError(`Votre âge (${age} ans) dépasse la limite autorisée pour ce concours (${maxAge} ans maximum)`);
    } else if (age < 16) {
      setAgeError(`Vous devez avoir au moins 16 ans pour candidater. Votre âge: ${age} ans`);
    } else {
      setAgeError(null);
    }
  };

  // Fonction pour gérer la sélection de photo
  const handlePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Format non supporté",
        description: "Veuillez sélectionner une image (JPEG, PNG, etc.)",
        variant: "destructive"
      });
      return;
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Fichier trop volumineux",
        description: "La photo ne doit pas dépasser 5MB",
        variant: "destructive"
      });
      return;
    }

    setSelectedPhoto(file);

    // Créer un aperçu avec fond blanc
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Créer un canvas avec fond blanc
        const canvas = window.document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Définir les dimensions (format identité)
        const size = 400;
        canvas.width = size;
        canvas.height = size;

        // Fond blanc
        if (ctx) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, size, size);

          // Calculer les dimensions pour centrer l'image
          const scale = Math.min(size / img.width, size / img.height);
          const newWidth = img.width * scale;
          const newHeight = img.height * scale;
          const x = (size - newWidth) / 2;
          const y = (size - newHeight) / 2;

          // Dessiner l'image centrée
          ctx.drawImage(img, x, y, newWidth, newHeight);

          // Convertir en blob et créer l'aperçu
          canvas.toBlob((blob) => {
            if (blob) {
              const processedFile = new File([blob], file.name, { type: 'image/jpeg' });
              setSelectedPhoto(processedFile);
              setPhotoPreview(canvas.toDataURL());
            }
          }, 'image/jpeg', 0.9);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);

    toast({
      title: "Photo ajoutée",
      description: "Votre photo a été traitée avec fond blanc"
    });
  };

  const removePhoto = () => {
    setSelectedPhoto(null);
    setPhotoPreview(null);
    toast({
      title: "Photo supprimée",
      description: "La photo a été retirée de votre candidature"
    });
  };

  // Recherche par NIP gabonais
  const nipSearchMutation = useMutation({
    mutationFn: (nip: string) => apiService.getCandidatByNupcan(nip),
    onSuccess: (response) => {
      if (response.success && response.data) {
        const candidatData = response.data;
        setCandidatForm(prev => ({
          ...prev,
          nomcan: candidatData.nomcan || '',
          prncan: candidatData.prncan || '',
          dtncan: candidatData.dtncan ? candidatData.dtncan.split('T')[0] : '',
          ldncan: candidatData.ldncan || '',
          telcan: candidatData.telcan || '',
          phtcan: candidatData.phtcan || '',
          maican: candidatData.maican || '',
          proorg: candidatData.proorg?.toString() || '',
          proact: candidatData.proact?.toString() || '',
          proaff: candidatData.proaff?.toString() || '',
        }));

        // Valider l'âge après le remplissage automatique
        if (candidatData.dtncan) {
          validateAge(candidatData.dtncan.split('T')[0]);
        }

        toast({
          title: "Informations trouvées",
          description: "Vos informations ont été automatiquement remplies",
        });
      }
    },
    onError: () => {
      toast({
        title: "NIP non trouvé",
        description: "Aucun candidat trouvé avec ce NIP gabonais. Vous pouvez continuer manuellement.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setSearchingNip(false);
    }
  });

  // Récupération des données de référence
  const { data: provincesResponse, isError: provincesError } = useQuery({
    queryKey: ['provinces'],
    queryFn: () => apiService.getProvinces(),
    retry: 2,
  });

  const { data: concoursResponse, isError: concoursError } = useQuery({
    queryKey: ['concours', concoursId],
    queryFn: () => apiService.getConcoursById(concoursId!),
    enabled: !!concoursId,
    retry: 2,
  });

  const {data : filieresResponse, isError: filiereError} = useQuery({
    queryKey: ['filiere'],
    queryFn:()=>apiService.getConcoursFiliere(concoursId!),
    retry : 2,
  })

  // Gestion des erreurs de chargement
  if (provincesError || concoursError) {
    return (
        <Layout>
          <div className="max-w-4xl mx-auto px-4 py-12">
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                Erreur de chargement des données. Veuillez actualiser la page ou réessayer plus tard.
              </AlertDescription>
            </Alert>
          </div>
        </Layout>
    );
  }

  const provinces = provincesResponse?.data || [];
  const filieres = filieresResponse?.data || [];
  const concours = concoursResponse?.data;

  const handleInputChange = (field: string, value: string) => {
    setCandidatForm(prev => ({
      ...prev,
      [field]: value
    }));

    // Valider l'âge si c'est le champ de date de naissance
    if (field === 'dtncan') {
      validateAge(value);
    }
  };

  const handleNipSearch = () => {
    if (candidat.nipcan.trim()) {
      setSearchingNip(true);
      nipSearchMutation.mutate(candidat.nipcan);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Vérifier l'âge avant soumission
    if (ageError) {
      toast({
        title: "Âge invalide",
        description: ageError,
        variant: "destructive",
      });
      return;
    }

    // Validation basique
    if (!candidat.nomcan || !candidat.prncan || !candidat.maican || !candidat.telcan ||
        !candidat.dtncan || !candidat.proorg || !candidat.ldncan) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    // Vérifier qu'une photo est sélectionnée
    if (!selectedPhoto) {
      toast({
        title: "Photo requise",
        description: "Veuillez ajouter votre photo d'identité",
        variant: "destructive",
      });
      return;
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(candidat.maican)) {
      toast({
        title: "Email invalide",
        description: "Veuillez saisir une adresse email valide",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Soumission candidature avec données:', candidat);
      console.log('Données concours:', concours);

      // Validation des données requises
      if (!concours?.niveau_id) {
        throw new Error('Niveau du concours non trouvé');
      }

      // Préparer les données pour l'endpoint
      const formData = new FormData();
      formData.append('niveau_id', concours.niveau_id.toString());

      // Ajouter la photo

      // NIP optionnel
      if (candidat.nipcan && candidat.nipcan.trim()) {
        formData.append('nipcan', candidat.nipcan.trim());
      }

      // Champs obligatoires
      formData.append('nomcan', candidat.nomcan);
      formData.append('prncan', candidat.prncan);
      formData.append('maican', candidat.maican);
      formData.append('dtncan', candidat.dtncan);
      formData.append('telcan', candidat.telcan);
      formData.append('ldncan', candidat.ldncan);
      formData.append('proorg', candidat.proorg);
      formData.append('proact', candidat.proact || candidat.proorg);
      formData.append('proaff', candidat.proaff || candidat.proorg);
      formData.append('concours_id', concoursId || '');
      formData.append('phtcan', selectedPhoto);

      // Utiliser le nouveau service de candidature
      const candidatureComplete = await createCandidature(formData);

      console.log('Candidature créée, redirection vers:', `/confirmation/${encodeURIComponent(candidatureComplete.nupcan)}`);
      navigate(`/confirmation/${encodeURIComponent(candidatureComplete.nupcan)}`);

    } catch (error: any) {
      console.error('Erreur lors de la soumission:', error);
      // L'erreur est déjà gérée par useCandidature
    }
  };

  return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Formulaire de Candidature
            </h1>
            {concours && (
                <div className="bg-primary/10 p-4 rounded-lg">
                  <p className="text-lg font-semibold text-primary">
                    {concours.libcnc}
                  </p>
                  <p className="text-muted-foreground">
                    {concours.etablissement_nomets} - Session {concours.sescnc}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Frais: {concours.fracnc} FCFA
                  </p>
                  {concours.agecnc && (
                      <p className="text-sm text-amber-600 font-medium mt-1">
                        Âge maximum: {concours.agecnc} ans
                      </p>
                  )}
                </div>
            )}

            {/* Alerte d'erreur d'âge */}
            {ageError && (
                <Alert className="mt-4 border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700">
                    {ageError}
                  </AlertDescription>
                </Alert>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Informations Personnelles</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Section Photo d'identité */}
                <div className="p-4 bg-muted rounded-lg">
                  <Label className="text-sm font-medium">
                    Photo d'identité * (Fond blanc obligatoire)
                  </Label>
                  <p className="text-xs text-muted-foreground mb-3">
                    Ajoutez votre photo d'identité sur fond blanc (traitement automatique)
                  </p>
                  <div className="flex flex-col items-center space-y-4">
                    {photoPreview ? (
                        <div className="relative">
                          <div className="w-48 h-48 rounded-lg overflow-hidden border-4 border-primary/20 shadow-lg bg-white">
                            <img
                                src={photoPreview}
                                alt="Photo de candidature sur fond blanc"
                                className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                              type="button"
                              onClick={removePhoto}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 shadow-lg"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                    ) : (
                        <div className="relative">
                          <input
                              type="file"
                              accept="image/*"
                              onChange={handlePhotoSelect}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              required
                          />
                          <div className="w-48 h-48 border-2 border-dashed border-primary/30 rounded-lg flex flex-col items-center justify-center bg-white hover:bg-primary/5 transition-colors cursor-pointer">
                            <Upload className="h-12 w-12 text-primary/60 mb-3" />
                            <p className="text-sm text-primary/60 text-center font-medium">
                              Cliquer pour ajouter<br />votre photo d'identité
                            </p>
                            <p className="text-xs text-primary/40 mt-2">
                              Fond blanc requis
                            </p>
                          </div>
                        </div>
                    )}
                    <div className="text-center bg-blue-50 p-3 rounded-lg">
                      <p className="text-xs text-blue-700 font-medium">
                        <strong>📋 Exigences photo d'identité :</strong><br />
                        • Format : JPEG ou PNG (max 5MB)<br />
                        • Fond : Blanc obligatoire (traitement automatique)<br />
                        • Qualité : Photo récente et nette<br />
                        • Cadrage : Visage centré, épaules visibles
                      </p>
                    </div>
                  </div>
                </div>

                {/* Champ NIP gabonais en premier */}
                <div className="p-4 bg-muted rounded-lg">
                  <Label htmlFor="nipcan" className="text-sm font-medium">
                    NIP Gabonais (Numéro d'Identification Personnel) - Optionnel
                  </Label>
                  <p className="text-xs text-muted-foreground mb-3">
                    Si vous avez un NIP gabonais, saisissez-le pour auto-remplir vos informations
                  </p>
                  <div className="flex gap-2">
                    <Input
                        id="nipcan"
                        placeholder="Ex: 1234567890123"
                        value={candidat.nipcan}
                        onChange={(e) => handleInputChange('nipcan', e.target.value)}
                        maxLength={13}
                    />
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleNipSearch}
                        disabled={searchingNip || !candidat.nipcan.trim()}
                    >
                      {searchingNip ? 'Recherche...' : 'Rechercher'}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="prncan">Prénom *</Label>
                    <Input
                        id="prncan"
                        value={candidat.prncan}
                        onChange={(e) => handleInputChange('prncan', e.target.value)}
                        placeholder="Votre prénom"
                        required
                    />
                  </div>

                  <div>
                    <Label htmlFor="nomcan">Nom *</Label>
                    <Input
                        id="nomcan"
                        value={candidat.nomcan}
                        onChange={(e) => handleInputChange('nomcan', e.target.value)}
                        placeholder="Votre nom"
                        required
                    />
                  </div>

                  <div>
                    <Label htmlFor="dtncan">Date de naissance *</Label>
                    <Input
                        id="dtncan"
                        type="date"
                        value={candidat.dtncan}
                        onChange={(e) => handleInputChange('dtncan', e.target.value)}
                        required
                        className={ageError ? 'border-red-500' : ''}
                    />
                  </div>

                  <div>
                    <Label htmlFor="ldncan">Lieu de naissance *</Label>
                    <Input
                        id="ldncan"
                        value={candidat.ldncan}
                        onChange={(e) => handleInputChange('ldncan', e.target.value)}
                        placeholder="Votre lieu de naissance"
                        required
                    />
                  </div>

                  <div>
                    <Label htmlFor="telcan">Téléphone *</Label>
                    <Input
                        id="telcan"
                        value={candidat.telcan}
                        onChange={(e) => handleInputChange('telcan', e.target.value)}
                        placeholder="+241 XX XX XX XX"
                        required
                    />
                  </div>

                  <div>
                    <Label htmlFor="maican">Email *</Label>
                    <Input
                        id="maican"
                        type="email"
                        value={candidat.maican}
                        onChange={(e) => handleInputChange('maican', e.target.value)}
                        placeholder="votre@email.com"
                        required
                    />
                  </div>

                  <div>
                    <Label htmlFor="proorg">Province d'origine *</Label>
                    <Select value={candidat.proorg} onValueChange={(value) => handleInputChange('proorg', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir votre province d'origine" />
                      </SelectTrigger>
                      <SelectContent>
                        {provinces.map(province => (
                            <SelectItem key={province.id} value={province.id.toString()}>
                              {province.nompro}
                            </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="proact">Province actuelle</Label>
                    <Select value={candidat.proact} onValueChange={(value) => handleInputChange('proact', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir votre province actuelle" />
                      </SelectTrigger>
                      <SelectContent>
                        {provinces.map(province => (
                            <SelectItem key={province.id} value={province.id.toString()}>
                              {province.nompro}
                            </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="proaff">Province d'affectation souhaitée</Label>
                    <Select value={candidat.proaff} onValueChange={(value) => handleInputChange('proaff', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir votre province d'affectation" />
                      </SelectTrigger>
                      <SelectContent>
                        {provinces.map(province => (
                            <SelectItem key={province.id} value={province.id.toString()}>
                              {province.nompro}
                            </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>


                </div>

                <div className="flex justify-end">
                  <Button
                      type="submit"
                      disabled={candidatureLoading || !!ageError || !selectedPhoto}
                      className="bg-primary hover:bg-primary/90"
                      size="lg"
                  >
                    {candidatureLoading ? 'Création...' : 'Créer ma candidature'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </Layout>
  );
};

export default Candidature;
