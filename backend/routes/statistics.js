
const express = require('express');
const router = express.Router();
const { getConnection } = require('../config/database');

// GET /api/statistics - Récupérer les statistiques
router.get('/', async (req, res) => {
  try {
    const connection = getConnection();
    
    // Statistiques des candidats
    const [candidatsStats] = await connection.execute(
      'SELECT COUNT(*) as total_candidats FROM candidats'
    );
    
    // Statistiques des paiements
    const [paiementsStats] = await connection.execute(
      `SELECT 
         COUNT(*) as total_paiements,
         SUM(montant) as total_montant,
         COUNT(CASE WHEN statut = 'valide' THEN 1 END) as paiements_valides
       FROM paiements`
    );
    
    // Statistiques des concours
    const [concoursStats] = await connection.execute(
      'SELECT COUNT(*) as total_concours FROM concours WHERE stacnc = "1"'
    );
    
    // Statistiques des documents
    const [documentsStats] = await connection.execute(
      'SELECT COUNT(*) as total_documents FROM dossiers'
    );
    
    const statistics = {
      candidats: {
        total: candidatsStats[0].total_candidats || 0
      },
      paiements: {
        total: paiementsStats[0].total_paiements || 0,
        montant_total: paiementsStats[0].total_montant || 0,
        valides: paiementsStats[0].paiements_valides || 0
      },
      concours: {
        total: concoursStats[0].total_concours || 0
      },
      documents: {
        total: documentsStats[0].total_documents || 0
      }
    };
    
    res.json({
      success: true,
      data: statistics
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
