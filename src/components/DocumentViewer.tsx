
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileText, Download, Eye, ExternalLink } from 'lucide-react';
import { apiService } from '@/services/api';
import { toast } from '@/hooks/use-toast';

interface DocumentViewerProps {
  documents: Array<{
    id: number;
    type: string;
    nom_fichier: string;
    statut: string;
    nomdoc?: string;
    document_statut?: string;
  }>;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ documents }) => {
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleViewDocument = (document: any) => {
    setSelectedDocument(document);
    setIsDialogOpen(true);
  };

  const handleDownloadDocument = async (documentId: number, fileName: string) => {
    try {
      await apiService.downloadDocument(documentId.toString());
      toast({
        title: "Téléchargement réussi",
        description: `Le document ${fileName} a été téléchargé`,
      });
    } catch (error) {
      toast({
        title: "Erreur de téléchargement",
        description: "Impossible de télécharger le document",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'valide':
        return 'bg-green-500';
      case 'rejete':
        return 'bg-red-500';
      default:
        return 'bg-yellow-500';
    }
  };

  const getStatusText = (statut: string) => {
    switch (statut) {
      case 'valide':
        return 'Validé';
      case 'rejete':
        return 'Rejeté';
      default:
        return 'En attente';
    }
  };

  if (!documents || documents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Mes Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Aucun document soumis</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Mes Documents ({documents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {documents.map((document, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-primary" />
                  <div>
                    <h4 className="font-medium">{document.type || document.nomdoc}</h4>
                    <p className="text-sm text-muted-foreground">{document.nom_fichier}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge className={`${getStatusColor(document.statut || document.document_statut)} text-white`}>
                    {getStatusText(document.statut || document.document_statut)}
                  </Badge>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewDocument(document)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Voir
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownloadDocument(document.id, document.nom_fichier)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Télécharger
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              {selectedDocument?.type || selectedDocument?.nomdoc}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Nom du fichier: {selectedDocument?.nom_fichier}</p>
                <p className="text-sm text-muted-foreground">
                  Statut: <span className={`font-medium ${
                    selectedDocument?.statut === 'valide' || selectedDocument?.document_statut === 'valide' 
                      ? 'text-green-600' 
                      : selectedDocument?.statut === 'rejete' || selectedDocument?.document_statut === 'rejete'
                      ? 'text-red-600'
                      : 'text-yellow-600'
                  }`}>
                    {getStatusText(selectedDocument?.statut || selectedDocument?.document_statut)}
                  </span>
                </p>
              </div>
              <Button
                onClick={() => handleDownloadDocument(selectedDocument?.id, selectedDocument?.nom_fichier)}
              >
                <Download className="h-4 w-4 mr-2" />
                Télécharger
              </Button>
            </div>
            <div className="border rounded-lg p-4 bg-muted/20">
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Prévisualisation non disponible
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => handleDownloadDocument(selectedDocument?.id, selectedDocument?.nom_fichier)}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ouvrir le document
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DocumentViewer;
