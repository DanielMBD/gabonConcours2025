
const express = require('express');
const router = express.Router();
const Document = require('../models/Document');

// PUT /api/document-validation/:id - Valider/Rejeter un document
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { statut, commentaire, admin_id } = req.body;

    console.log(`Validation document ${id} - Statut: ${statut}`);

    // Vérifier que le statut est valide
    if (!['valide', 'rejete', 'en_attente'].includes(statut)) {
      return res.status(400).json({
        success: false,
        message: 'Statut invalide',
        errors: ['Le statut doit être "valide", "rejete" ou "en_attente"']
      });
    }

    // Vérifier que le document existe
    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document non trouvé'
      });
    }

    // Mettre à jour le statut du document
    const updatedDocument = await Document.updateStatus(id, statut);

    // Log de la validation pour audit
    console.log(`Document ${id} ${statut} par admin ${admin_id || 'système'}`);
    if (commentaire) {
      console.log(`Commentaire: ${commentaire}`);
    }

    res.json({
      success: true,
      data: updatedDocument,
      message: `Document ${statut} avec succès`
    });
  } catch (error) {
    console.error('Erreur lors de la validation du document:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      errors: [error.message]
    });
  }
});

// GET /api/document-validation/stats - Statistiques de validation
router.get('/stats', async (req, res) => {
  try {
    const connection = require('../config/database').getConnection();
    
    const [stats] = await connection.execute(`
      SELECT 
        statut,
        COUNT(*) as count
      FROM documents 
      GROUP BY statut
    `);

    const [totalStats] = await connection.execute(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN statut = 'valide' THEN 1 END) as valide,
        COUNT(CASE WHEN statut = 'rejete' THEN 1 END) as rejete,
        COUNT(CASE WHEN statut = 'en_attente' THEN 1 END) as en_attente
      FROM documents
    `);

    res.json({
      success: true,
      data: {
        stats: stats,
        totals: totalStats[0]
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      errors: [error.message]
    });
  }
});

module.exports = router;
