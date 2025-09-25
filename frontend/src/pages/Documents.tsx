
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, X, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import Layout from '@/components/Layout';
import CustomDocumentUpload from '@/components/CustomDocumentUpload';
import { apiService } from '@/services/api';
import { toast } from '@/hooks/use-toast';
import { DocumentOption } from '@/types/entities';
import { useCandidature } from '@/hooks/useCandidature';

const Documents = () => {
  const { numeroCandidature } = useParams<{ numeroCandidature: string }>();
  const navigate = useNavigate();
  const { candidatureData, loadCandidature } = useCandidature();

  const [selectedDocumentType, setSelectedDocumentType] = useState('');
  const [uploadedDocuments, setUploadedDocuments] = useState<{ [key: string]: File }>({});
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const documentOptions: DocumentOption[] = [
    { value: 'cni', label: 'Carte Nationale d\'Identité', required: true },
    { value: 'diplome', label: 'Diplôme ou Attestation', required: true },
    { value: 'photo', label: 'Photo d\'identité', required: true },
    { value: 'acte_naissance', label: 'Acte de naissance', required: true },
  ];

  // Charger la candidature au montage du composant
  useEffect(() => {
    if (numeroCandidature && !candidatureData) {
      loadCandidature(numeroCandidature).catch((err) => {
        console.error("Erreur lors du chargement de la candidature:", err);
        toast({
          title: "Erreur",
          description: "Impossible de charger les informations de candidature",
          variant: "destructive",
        });
        navigate('/');
      });
    }
  }, [numeroCandidature, candidatureData, loadCandidature, navigate]);

  const concoursId = candidatureData?.concours?.id?.toString();

  const uploadMutation = useMutation({
    mutationFn: async ({ files, concoursId, nupcan }: { files: { [key: string]: File }; concoursId: string; nupcan: string }) => {
      if (!nupcan) throw new Error('NUPCAN est requis pour l\'upload des documents');
      if (!concoursId) throw new Error('ID du concours manquant');

      const formData = new FormData();
      formData.append('concours_id', concoursId);
      formData.append('nupcan', nupcan);

      Object.entries(files).forEach(([type, file]) => {
        formData.append('documents', file);
      });

      return apiService.createDossier(formData);
    },
    onSuccess: (response) => {
      console.log('Upload réussi:', response);
      setUploadSuccess(true);
      toast({
        title: 'Documents enregistrés !',
        description: `${response.data?.length || 0} documents ont été uploadés avec succès`,
      });
      setTimeout(() => {
        navigate(`/paiement/${encodeURIComponent(numeroCandidature!)}`);
      }, 2000);
    },
    onError: (error) => {
      console.error('Erreur d\'upload:', error);
      setUploadSuccess(false);
      toast({
        title: 'Erreur d\'upload',
        description: 'Une erreur est survenue lors de l\'envoi des documents. Veuillez réessayer.',
        variant: 'destructive',
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedDocumentType) return;

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast({
        title: 'Fichier trop volumineux',
        description: 'Le fichier ne doit pas dépasser 5MB',
        variant: 'destructive',
      });
      return;
    }

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Format non supporté',
        description: 'Seuls les fichiers PDF, JPEG et PNG sont acceptés',
        variant: 'destructive',
      });
      return;
    }

    setUploadedDocuments((prev) => ({
      ...prev,
      [selectedDocumentType]: file,
    }));

    toast({
      title: 'Document ajouté',
      description: `${getDocumentLabel(selectedDocumentType)} ajouté avec succès`,
    });

    setSelectedDocumentType('');
  };

  const removeDocument = (documentType: string) => {
    setUploadedDocuments((prev) => {
      const newDocs = { ...prev };
      delete newDocs[documentType];
      return newDocs;
    });

    toast({
      title: 'Document supprimé',
      description: 'Le document a été retiré de votre dossier',
    });
  };

  const handleCustomDocumentsAdd = async (customDocuments: any[]) => {
    try {
      const formData = new FormData();
      formData.append('concours_id', concoursId!);
      formData.append('nupcan', numeroCandidature!);

      customDocuments.forEach((doc) => {
        formData.append('documents', doc.file);
      });

      const response = await apiService.createDossier(formData);
      
      toast({
        title: 'Documents personnalisés ajoutés',
        description: `${customDocuments.length} document(s) ajouté(s) avec succès`,
      });

    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'ajouter les documents personnalisés',
        variant: 'destructive',
      });
    }
  };

  const handleContinuer = () => {
    const requiredTypes = documentOptions.filter((opt) => opt.required).map((opt) => opt.value);
    const uploadedTypes = Object.keys(uploadedDocuments);
    const missingRequired = requiredTypes.filter((type) => !uploadedTypes.includes(type));

    if (missingRequired.length > 0) {
      const missingLabels = missingRequired.map((type) => getDocumentLabel(type)).join(', ');
      toast({
        title: 'Documents manquants',
        description: `Documents obligatoires manquants: ${missingLabels}`,
        variant: 'destructive',
      });
      return;
    }

    if (Object.keys(uploadedDocuments).length === 0) {
      toast({
        title: 'Aucun document',
        description: 'Veuillez ajouter au moins un document',
        variant: 'destructive',
      });
      return;
    }

    if (!concoursId) {
      toast({
        title: 'Erreur',
        description: 'ID du concours manquant. Veuillez reprendre depuis le début.',
        variant: 'destructive',
      });
      return;
    }

    const nupcan = numeroCandidature;
    if (!nupcan) {
      toast({
        title: 'Erreur de candidature',
        description: 'NUPCAN invalide. Veuillez vérifier votre candidature.',
        variant: 'destructive',
      });
      return;
    }

    uploadMutation.mutate({
      files: uploadedDocuments,
      concoursId: concoursId,
      nupcan: nupcan,
    });
  };

  const getDocumentLabel = (type: string) => {
    return documentOptions.find((opt) => opt.value === type)?.label || type;
  };

  const isDocumentRequired = (type: string) => {
    return documentOptions.find((opt) => opt.value === type)?.required || false;
  };

  const availableDocumentTypes = documentOptions.filter((opt) => !uploadedDocuments[opt.value]);

  const requiredDocuments = documentOptions.filter((opt) => opt.required);
  const uploadedRequiredCount = requiredDocuments.filter((doc) => uploadedDocuments[doc.value]).length;
  const completionPercentage = Math.round((uploadedRequiredCount / requiredDocuments.length) * 100);

  if (!candidatureData) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-700 mb-2">Chargement des données de candidature...</h2>
            <p className="text-red-600 mb-4">Veuillez patienter pendant le chargement.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* En-tête avec bouton retour */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">Dépôt des Documents</h1>
            <p className="text-muted-foreground">Candidature: {numeroCandidature}</p>
            <p className="text-muted-foreground">Concours: {candidatureData?.concours?.libcnc}</p>
          </div>
        </div>

        {/* Messages de statut */}
        {uploadMutation.isPending && (
          <Card className="mb-8 border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <p className="text-blue-700">Envoi et enregistrement des documents en cours...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {uploadSuccess && (
          <Card className="mb-8 border-green-200 bg-green-50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <p className="text-green-700">Documents enregistrés avec succès ! Redirection vers le paiement...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {uploadMutation.isError && (
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-6 w-6 text-red-600" />
                <p className="text-red-700">Erreur lors de l'enregistrement. Veuillez réessayer.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Progression du dossier */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Progression du dossier</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Documents requis uploadés</span>
                <span>{uploadedRequiredCount}/{requiredDocuments.length}</span>
              </div>
              <Progress value={completionPercentage} className="w-full" />
            </div>
          </CardContent>
        </Card>

        {/* Documents obligatoires */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Documents obligatoires</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <div>
                <Select value={selectedDocumentType} onValueChange={setSelectedDocumentType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir le type de document" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDocumentTypes.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label} {opt.required && <span className="text-red-500">*</span>}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileSelect}
                    disabled={!selectedDocumentType}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <div
                    className={`border-2 border-dashed rounded-lg p-4 text-center ${
                      selectedDocumentType
                        ? 'border-primary bg-primary/5 hover:bg-primary/10'
                        : 'border-gray-300 bg-gray-50'
                    } transition-colors`}
                  >
                    <Upload
                      className={`h-6 w-6 mx-auto mb-2 ${
                        selectedDocumentType ? 'text-primary' : 'text-gray-400'
                      }`}
                    />
                    <p
                      className={`text-sm ${
                        selectedDocumentType ? 'text-primary' : 'text-gray-500'
                      }`}
                    >
                      {selectedDocumentType
                        ? 'Cliquez pour sélectionner un fichier'
                        : 'Sélectionnez d\'abord un type de document'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">PDF, JPEG, PNG - Max 5MB</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents sélectionnés */}
        {Object.keys(uploadedDocuments).length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Documents sélectionnés ({Object.keys(uploadedDocuments).length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(uploadedDocuments).map(([type, file]) => (
                  <div key={type} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">
                          {getDocumentLabel(type)}
                          {isDocumentRequired(type) && <span className="text-red-500 ml-1">*</span>}
                        </p>
                        <p className="text-sm text-muted-foreground">{file.name}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-xs text-green-600">Prêt à envoyer</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeDocument(type)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Documents personnalisés */}
        <CustomDocumentUpload onDocumentsAdd={handleCustomDocumentsAdd} />

        {/* Instructions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Les documents marqués d'un astérisque (*) sont obligatoires</p>
              <p>• Formats acceptés: PDF, JPEG, PNG</p>
              <p>• Taille maximale par fichier: 5MB</p>
              <p>• Assurez-vous que vos documents sont lisibles et de bonne qualité</p>
              <p>• Vous pouvez ajouter des documents personnalisés en plus des documents obligatoires</p>
            </div>
          </CardContent>
        </Card>

        {/* Boutons d'action */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => navigate(-1)} disabled={uploadMutation.isPending}>
            Retour
          </Button>
          <Button
            onClick={handleContinuer}
            className="bg-primary hover:bg-primary/90"
            disabled={uploadMutation.isPending || completionPercentage < 100 || uploadSuccess}
          >
            {uploadMutation.isPending
              ? 'Enregistrement en cours...'
              : uploadSuccess
              ? 'Redirection...'
              : 'Enregistrer et continuer vers le paiement'}
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Documents;
