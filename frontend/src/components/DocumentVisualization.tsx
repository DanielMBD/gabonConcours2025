
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Download, 
  Eye, 
  Plus,
  Upload,
  X
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

interface Document {
  id: number;
  nom_document: string;
  chemin_fichier: string;
  type_document: string;
  taille_fichier: number;
  statut_validation: 'en_attente' | 'valide' | 'rejete';
  date_upload: string;
}

interface DocumentVisualizationProps {
  documents: Document[];
  onRefresh?: () => void;
  onDocumentAdd?: () => void;
}

const DocumentVisualization: React.FC<DocumentVisualizationProps> = ({
  documents,
  onRefresh,
  onDocumentAdd
}) => {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [documentName, setDocumentName] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'valide':
        return <Badge className="bg-green-100 text-green-800">Validé</Badge>;
      case 'rejete':
        return <Badge className="bg-red-100 text-red-800">Rejeté</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>;
    }
  };

  const downloadDocument = (doc: Document) => {
    const link = window.document.createElement('a');
    link.href = `http://localhost:3000/uploads/documents/${doc.chemin_fichier}`;
    link.download = doc.nom_document;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
  };

  const viewDocument = (doc: Document) => {
    setSelectedDocument(doc);
    setIsViewModalOpen(true);
  };

  const handleUpload = async () => {
    if (!uploadFile || !documentName.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un fichier et renseigner le nom du document",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('documents', uploadFile);
      formData.append('type_document', documentName);

      const response = await fetch('http://localhost:3000/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Document ajouté avec succès",
        });
        setIsUploadModalOpen(false);
        setDocumentName('');
        setUploadFile(null);
        if (onRefresh) onRefresh();
        if (onDocumentAdd) onDocumentAdd();
      } else {
        throw new Error('Erreur lors de l\'upload');
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le document",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {documents.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          Aucun document disponible
        </p>
      ) : (
        <div className="grid gap-4">
          {documents.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium">{doc.nom_document}</p>
                  <p className="text-sm text-muted-foreground">
                    {(doc.taille_fichier / 1024 / 1024).toFixed(2)} MB • {new Date(doc.date_upload).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(doc.statut_validation)}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => viewDocument(doc)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => downloadDocument(doc)}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de visualisation des documents */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{selectedDocument?.nom_document}</DialogTitle>
          </DialogHeader>
          {selectedDocument && (
            <div className="flex-1 overflow-hidden">
              <iframe
                src={`http://localhost:3000/uploads/documents/${selectedDocument.chemin_fichier}`}
                className="w-full h-[70vh]"
                title={selectedDocument.nom_document}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal d'upload de document */}
      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un nouveau document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="documentName">Nom du document</Label>
              <Input
                id="documentName"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                placeholder="Ex: Acte de naissance, Diplôme..."
              />
            </div>
            <div>
              <Label htmlFor="documentFile">Fichier</Label>
              <Input
                id="documentFile"
                type="file"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                accept=".pdf,.jpg,.jpeg,.png"
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleUpload} disabled={isUploading}>
                <Upload className="h-4 w-4 mr-2" />
                {isUploading ? 'Upload...' : 'Ajouter'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsUploadModalOpen(false);
                  setDocumentName('');
                  setUploadFile(null);
                }}
              >
                Annuler
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentVisualization;
