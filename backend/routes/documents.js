const express = require('express');
const router = express.Router();
const Document = require('../models/Document');
const Dossier = require('../models/Dossier');

// GET /api/documents/nupcan/:nupcan - Récupérer les documents par NUPCAN
router.get('/nupcan/:nupcan', async (req, res) => {
  try {
    const { nupcan } = req.params;
    console.log('Recherche documents pour NUPCAN:', nupcan);
    
    if (!nupcan || nupcan === 'null' || nupcan === 'undefined') {
      return res.status(400).json({
        success: false,
        message: 'NUPCAN invalide'
      });
    }

    // Utiliser la classe Dossier pour récupérer les documents par NUPCAN
    const documents = await Dossier.findByNupcan(nupcan);
    
    res.json({
      success: true,
      data: documents || [],
      message: 'Documents récupérés avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des documents:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      errors: [error.message]
    });
  }
});

// POST /api/documents - Créer un nouveau document
router.post('/', async (req, res) => {
  try {
    const documentData = req.body;
    console.log('Création document:', documentData);
    
    if (!documentData.nupcan) {
      return res.status(400).json({
        success: false,
        message: 'NUPCAN requis pour créer un document'
      });
    }

    const document = await Document.create(documentData);
    
    res.status(201).json({
      success: true,
      data: document,
      message: 'Document créé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la création du document:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      errors: [error.message]
    });
  }
});

// PUT /api/documents/:id/status - Mettre à jour le statut d'un document
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Statut requis'
      });
    }

    const document = await Document.updateStatus(id, status);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document non trouvé'
      });
    }

    res.json({
      success: true,
      data: document,
      message: 'Statut du document mis à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur mise à jour statut document:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      errors: [error.message]
    });
  }
});

// GET /api/documents/:id/download - Télécharger un document
router.get('/:id/download', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Téléchargement document ID:', id);
    
    const document = await Document.findById(id);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document non trouvé'
      });
    }

    const filePath = path.join(__dirname, '..', 'uploads', 'documents', document.nom_fichier);
    const fs = require('fs');

    // Vérifier si le fichier existe
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Fichier non trouvé sur le serveur'
      });
    }

    // Définir le type MIME selon l'extension
    const ext = path.extname(document.nom_fichier).toLowerCase();
    let contentType = 'application/octet-stream';
    
    switch (ext) {
      case '.pdf':
        contentType = 'application/pdf';
        break;
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.png':
        contentType = 'image/png';
        break;
    }

    // Envoyer le fichier
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${document.nomdoc}"`);
    
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

  } catch (error) {
    console.error('Erreur téléchargement document:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors du téléchargement'
    });
  }
});

// GET /api/documents - Récupérer tous les documents
router.get('/', async (req, res) => {
  try {
    const documents = await Document.findAll();
    res.json({
      success: true,
      data: documents || [],
      message: 'Documents récupérés avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des documents:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      errors: [error.message]
    });
  }
});

module.exports = router;
