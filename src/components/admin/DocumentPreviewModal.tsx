
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Image, Users, Calendar } from 'lucide-react';

interface DocumentPreviewModalProps {
  document: any;
  isOpen: boolean;
  onClose: () => void;
  onValidate: (documentId: number, statut: 'valide' | 'rejete', commentaire?: string) => void;
  isValidating: boolean;
}

const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  document,
  isOpen,
  onClose,
  onValidate,
  isValidating
}) => {
  if (!document) return null;

  const handleDownload = () => {
    if (document.nom_fichier) {
      const url = `http://localhost:3000/uploads/documents/${document.nom_fichier}`;
      window.open(url, '_blank');
    }
  };

  const getFileIcon = (type: string) => {
    if (type?.includes('image')) return <Image className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {getFileIcon(document.type)}
            <span>Aperçu du document</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informations du document */}
          <div className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3 flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Informations document
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Nom :</span>
                  <p className="break-words">{document.nomdoc}</p>
                </div>
                <div>
                  <span className="font-medium">Type :</span>
                  <Badge variant="outline" className="ml-2">{document.type}</Badge>
                </div>
                <div>
                  <span className="font-medium">Date d'upload :</span>
                  <p>{new Date(document.created_at).toLocaleString('fr-FR')}</p>
                </div>
                <div>
                  <span className="font-medium">Statut :</span>
                  <Badge className={
                    document.statut === 'valide' ? 'bg-green-100 text-green-800 ml-2' :
                    document.statut === 'rejete' ? 'bg-red-100 text-red-800 ml-2' :
                    'bg-orange-100 text-orange-800 ml-2'
                  }>
                    {document.statut}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3 flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Informations candidat
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Nom :</span>
                  <p>{document.prncan} {document.nomcan}</p>
                </div>
                <div>
                  <span className="font-medium">NUPCAN :</span>
                  <p className="font-mono">{document.nupcan}</p>
                </div>
                <div>
                  <span className="font-medium">Email :</span>
                  <p>{document.maican}</p>
                </div>
                <div>
                  <span className="font-medium">Concours :</span>
                  <p>{document.libcnc}</p>
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleDownload} variant="outline" className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Télécharger
              </Button>
            </div>

            {document.statut === 'en_attente' && (
              <div className="flex space-x-2">
                <Button 
                  onClick={() => onValidate(document.id, 'valide')}
                  disabled={isValidating}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Valider
                </Button>
                <Button 
                  onClick={() => onValidate(document.id, 'rejete')}
                  disabled={isValidating}
                  variant="destructive"
                  className="flex-1"
                >
                  Rejeter
                </Button>
              </div>
            )}
          </div>

          {/* Aperçu du document */}
          <div className="lg:col-span-2">
            <div className="bg-muted/30 rounded-lg h-[600px] flex items-center justify-center">
              {document.nom_fichier ? (
                <iframe
                  src={`http://localhost:3000/uploads/documents/${document.nom_fichier}`}
                  className="w-full h-full rounded-lg"
                  title={document.nomdoc}
                />
              ) : (
                <div className="text-center text-muted-foreground">
                  <FileText className="h-16 w-16 mx-auto mb-4" />
                  <p>Aperçu non disponible</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentPreviewModal;
