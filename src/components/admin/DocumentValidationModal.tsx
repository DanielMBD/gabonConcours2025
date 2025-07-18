
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, FileText, User, Calendar } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface DocumentValidationModalProps {
  document: any;
  isOpen: boolean;
  onClose: () => void;
  onValidate: (documentId: number, statut: 'valide' | 'rejete', commentaire?: string) => Promise<void>;
  isValidating: boolean;
}

const DocumentValidationModal: React.FC<DocumentValidationModalProps> = ({
  document,
  isOpen,
  onClose,
  onValidate,
  isValidating
}) => {
  const [validationType, setValidationType] = useState<'valide' | 'rejete' | null>(null);
  const [commentaire, setCommentaire] = useState('');

  const handleValidation = async (statut: 'valide' | 'rejete') => {
    if (statut === 'rejete' && !commentaire.trim()) {
      toast({
        title: "Commentaire requis",
        description: "Veuillez indiquer la raison du rejet",
        variant: "destructive",
      });
      return;
    }

    try {
      await onValidate(document.id, statut, commentaire);
      setCommentaire('');
      setValidationType(null);
      onClose();
      
      toast({
        title: `Document ${statut}`,
        description: `Le document a été ${statut} et le candidat a été notifié`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de valider le document",
        variant: "destructive",
      });
    }
  };

  if (!document) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Validation de document
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informations du document */}
          <div className="border rounded-lg p-4 bg-muted/20">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Type de document</Label>
                <p className="text-sm text-muted-foreground">{document.type || document.nomdoc}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Nom du fichier</Label>
                <p className="text-sm text-muted-foreground truncate">{document.nom_fichier}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Candidat</Label>
                <p className="text-sm text-muted-foreground">
                  {document.candidat_prncan} {document.candidat_nomcan}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">NUPCAN</Label>
                <p className="text-sm text-muted-foreground">{document.candidat_nupcan}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Date de soumission</Label>
                <p className="text-sm text-muted-foreground flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {new Date(document.created_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Statut actuel</Label>
                <Badge className={`${
                  document.statut === 'valide' ? 'bg-green-500' :
                  document.statut === 'rejete' ? 'bg-red-500' : 'bg-yellow-500'
                } text-white`}>
                  {document.statut}
                </Badge>
              </div>
            </div>
          </div>

          {/* Zone de prévisualisation */}
          <div className="border rounded-lg p-4 bg-gray-50 min-h-[200px] flex items-center justify-center">
            <div className="text-center">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">Prévisualisation du document</p>
              <p className="text-sm text-gray-400">{document.nom_fichier}</p>
            </div>
          </div>

          {/* Commentaire pour la validation */}
          <div className="space-y-2">
            <Label htmlFor="commentaire">
              Commentaire {validationType === 'rejete' ? '(requis pour un rejet)' : '(optionnel)'}
            </Label>
            <Textarea
              id="commentaire"
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              placeholder={
                validationType === 'rejete' 
                  ? "Expliquez la raison du rejet..."
                  : "Ajoutez un commentaire (optionnel)..."
              }
              rows={3}
            />
          </div>

          {/* Actions de validation */}
          <div className="flex justify-between items-center pt-4 border-t">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isValidating}
            >
              Annuler
            </Button>
            
            <div className="flex space-x-3">
              <Button
                onClick={() => handleValidation('rejete')}
                disabled={isValidating}
                variant="destructive"
                className="flex items-center"
              >
                <XCircle className="h-4 w-4 mr-2" />
                {isValidating ? 'Rejet...' : 'Rejeter'}
              </Button>
              
              <Button
                onClick={() => handleValidation('valide')}
                disabled={isValidating}
                className="bg-green-600 hover:bg-green-700 flex items-center"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {isValidating ? 'Validation...' : 'Valider'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentValidationModal;
