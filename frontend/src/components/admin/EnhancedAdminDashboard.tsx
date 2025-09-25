// @ts-nocheck - Legacy API compatibility
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  FileCheck, 
  FileX, 
  DollarSign,
  Eye,
  AlertCircle,
  Clock,
  TrendingUp,
  Calendar,
  Search,
  Bell,
  CheckCircle,
  XCircle,
  User,
  Download,
  Mail
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { adminApiService } from '@/services/adminApi';
import DocumentValidationInterface from './DocumentValidationInterface';
import CandidatPhotoCard from './CandidatPhotoCard';
import { toast } from '@/hooks/use-toast';

const EnhancedAdminDashboard = () => {
  const navigate = useNavigate();
  const { admin } = useAdminAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCandidat, setSelectedCandidat] = useState(null);
  const [showValidationInterface, setShowValidationInterface] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Récupérer les données spécifiques à l'établissement
  const { data: candidatsData, refetch: refetchCandidats } = useQuery({
    queryKey: ['candidats-etablissement', admin?.etablissement_id],
    queryFn: () => adminApiService.getCandidatsByEtablissement(admin?.etablissement_id),
    enabled: !!admin?.etablissement_id,
  });

  const { data: dossiersData, refetch: refetchDossiers } = useQuery({
    queryKey: ['dossiers-etablissement', admin?.etablissement_id],
    queryFn: () => adminApiService.getDossiersByEtablissement(admin?.etablissement_id),
    enabled: !!admin?.etablissement_id,
  });

  const { data: parementsData } = useQuery({
    queryKey: ['paiements-etablissement', admin?.etablissement_id],
    queryFn: () => adminApiService.getPaiementsByEtablissement(admin?.etablissement_id),
    enabled: !!admin?.etablissement_id,
  });

  const candidats = candidatsData?.data || [];
  const dossiers = dossiersData?.data || [];
  const paiements = parementsData?.data || [];

  // Calculer les statistiques avancées
  const stats = {
    totalCandidats: candidats.length,
    documentsEnAttente: dossiers.filter((d: any) => d.statut === 'en_attente').length,
    documentsValides: dossiers.filter((d: any) => d.statut === 'valide').length,
    documentsRejetes: dossiers.filter((d: any) => d.statut === 'rejete').length,
    parementsEnAttente: paiements.filter((p: any) => p.statut === 'en_attente').length,
    parementsConfirmes: paiements.filter((p: any) => p.statut === 'confirme').length,
    candidatsComplets: candidats.filter((c: any) => c.statut_dossier === 'complet').length,
    candidatsEnCours: candidats.filter((c: any) => c.statut_dossier === 'en_cours').length,
  };

  // Filtrer les candidats selon la recherche
  const filteredCandidats = candidats.filter((candidat: any) =>
    candidat.nomcan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidat.prncan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidat.nupcan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidat.maican?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Candidats prioritaires (documents en attente)
  const candidatsPrioritaires = candidats.filter((c: any) => {
    const hasDocumentsEnAttente = c.documents?.some((d: any) => d.statut_validation === 'en_attente');
    return hasDocumentsEnAttente;
  });

  const handleValidationComplete = () => {
    refetchCandidats();
    refetchDossiers();
    setShowValidationInterface(false);
    setSelectedCandidat(null);
    
    toast({
      title: "Validation terminée",
      description: "Les données ont été mises à jour",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complet': return 'bg-green-100 text-green-800';
      case 'en_cours': return 'bg-orange-100 text-orange-800';
      case 'valide': return 'bg-green-100 text-green-800';
      case 'rejete': return 'bg-red-100 text-red-800';
      case 'en_attente': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const exportCandidatsData = () => {
    const csvContent = [
      ['N° Candidature', 'Nom', 'Prénom', 'Email', 'Téléphone', 'Statut Dossier'],
      ...candidats.map((c: any) => [
        c.nupcan,
        c.nomcan,
        c.prncan,
        c.maican,
        c.telcan,
        c.statut_dossier
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `candidats_${admin?.etablissement_nom}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard Établissement</h1>
          <p className="text-muted-foreground">
            Gestion des candidatures - {admin?.etablissement_nom}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportCandidatsData} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.totalCandidats}</p>
                <p className="text-sm text-muted-foreground">Candidats total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Clock className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{stats.documentsEnAttente}</p>
                <p className="text-sm text-muted-foreground">Docs à valider</p>
                {stats.documentsEnAttente > 0 && (
                  <Badge className="mt-1" variant="destructive">Urgent</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <FileCheck className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.documentsValides}</p>
                <p className="text-sm text-muted-foreground">Docs validés</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <DollarSign className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{stats.parementsConfirmes}</p>
                <p className="text-sm text-muted-foreground">Paiements OK</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertes prioritaires */}
      {candidatsPrioritaires.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertCircle className="h-5 w-5" />
              Documents en attente de validation ({candidatsPrioritaires.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {candidatsPrioritaires.slice(0, 6).map((candidat: any) => (
                <div key={candidat.nupcan} className="bg-white rounded-lg p-4 border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{candidat.prncan} {candidat.nomcan}</p>
                      <p className="text-sm text-muted-foreground">{candidat.nupcan}</p>
                      <p className="text-xs text-orange-600 mt-1">
                        {candidat.documents?.filter((d: any) => d.statut_validation === 'en_attente').length} doc(s) en attente
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedCandidat(candidat);
                        setShowValidationInterface(true);
                      }}
                    >
                      Valider
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recherche et liste des candidats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des candidats */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Candidats ({filteredCandidats.length})</CardTitle>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un candidat..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-64"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredCandidats.map((candidat: any) => (
                  <div key={candidat.nupcan} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden border bg-muted flex items-center justify-center">
                        {candidat.phtcan ? (
                          <img
                            src={`http://localhost:3000/uploads/photos/${candidat.phtcan}`}
                            alt={`${candidat.prncan} ${candidat.nomcan}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = '<div class="w-full h-full bg-muted flex items-center justify-center"><User class="h-4 w-4 text-muted-foreground" /></div>';
                              }
                            }}
                          />
                        ) : (
                          <User className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{candidat.prncan} {candidat.nomcan}</p>
                        <p className="text-sm text-muted-foreground">{candidat.nupcan}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getStatusColor(candidat.statut_dossier)} variant="secondary">
                            {candidat.statut_dossier}
                          </Badge>
                          {candidat.documents?.some((d: any) => d.statut_validation === 'en_attente') && (
                            <Badge variant="destructive" className="text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              À valider
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/candidats/${candidat.nupcan}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedCandidat(candidat);
                          setShowValidationInterface(true);
                        }}
                        disabled={!candidat.documents?.some((d: any) => d.statut_validation === 'en_attente')}
                      >
                        Valider
                      </Button>
                    </div>
                  </div>
                ))}
                
                {filteredCandidats.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchTerm ? 'Aucun candidat trouvé' : 'Aucun candidat'}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistiques détaillées */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Progression validation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Validés</span>
                  <span>{stats.documentsValides}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{width: `${dossiers.length > 0 ? (stats.documentsValides / dossiers.length) * 100 : 0}%`}}
                  ></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>En attente</span>
                  <span>{stats.documentsEnAttente}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full" 
                    style={{width: `${dossiers.length > 0 ? (stats.documentsEnAttente / dossiers.length) * 100 : 0}%`}}
                  ></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Rejetés</span>
                  <span>{stats.documentsRejetes}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full" 
                    style={{width: `${dossiers.length > 0 ? (stats.documentsRejetes / dossiers.length) * 100 : 0}%`}}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/admin/candidats')}
              >
                <Users className="h-4 w-4 mr-2" />
                Voir tous les candidats
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/admin/dossiers')}
              >
                <FileCheck className="h-4 w-4 mr-2" />
                Gérer les dossiers
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/admin/paiements')}
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Vérifier paiements
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Interface de validation des documents */}
      {showValidationInterface && selectedCandidat && (
        <DocumentValidationInterface
          candidat={selectedCandidat}
          onValidationComplete={handleValidationComplete}
          onClose={() => {
            setShowValidationInterface(false);
            setSelectedCandidat(null);
          }}
        />
      )}
    </div>
  );
};

export default EnhancedAdminDashboard;