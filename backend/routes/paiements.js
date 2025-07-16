
const express = require('express');
const router = express.Router();
const Paiement = require('../models/Paiement');
const Candidat = require('../models/Candidat');

// GET /api/paiements/nupcan/:nupcan - Récupérer paiement par NUPCAN
router.get('/nupcan/:nupcan', async (req, res) => {
  try {
    const { nupcan } = req.params;
    const decodedNupcan = decodeURIComponent(nupcan);

    console.log('Recherche paiement pour NUPCAN:', decodedNupcan);

    const paiement = await Paiement.findByNupcan(decodedNupcan);

    res.json({
      success: true,
      data: paiement,
      message: 'Paiement récupéré avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du paiement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      errors: [error.message]
    });
  }
});

// POST /api/paiements - Créer un nouveau paiement
router.post('/', async (req, res) => {
  try {
    const paiementData = req.body;
    console.log('Création paiement - Données reçues:', paiementData);

    // Validation des données obligatoires
    if (!paiementData.nupcan && !paiementData.nipcan) {
      return res.status(400).json({
        success: false,
        message: 'NUPCAN requis',
        errors: ['Le NUPCAN est obligatoire pour créer un paiement']
      });
    }

    if (!paiementData.montant || parseFloat(paiementData.montant) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Montant invalide',
        errors: ['Le montant doit être supérieur à 0']
      });
    }

    // Récupérer les informations du candidat par NUPCAN
    let candidat = null;
    try {
      const nupcan = paiementData.nupcan || paiementData.nipcan;
      console.log('Recherche candidat pour NUPCAN:', nupcan);
      
      candidat = await Candidat.findByNupcan(nupcan);
      if (candidat) {
        paiementData.candidat_id = candidat.id;
        paiementData.concours_id = candidat.concours_id;
        paiementData.nupcan = candidat.nupcan;
        console.log('Candidat trouvé:', candidat.id);
      } else {
        console.log('Aucun candidat trouvé pour NUPCAN:', nupcan);
        // Continuer sans candidat_id pour permettre les paiements avec NUPCAN seulement
      }
    } catch (error) {
      console.log('Erreur lors de la recherche du candidat:', error.message);
      // Continuer sans candidat_id
    }

    // Créer le paiement
    const paiement = await Paiement.create(paiementData);
    console.log('Paiement créé avec succès:', paiement.id);

    res.status(201).json({
      success: true,
      data: paiement,
      message: 'Paiement créé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la création du paiement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du paiement',
      errors: [error.message]
    });
  }
});

// GET /api/paiements - Récupérer tous les paiements
router.get('/', async (req, res) => {
  try {
    const paiements = await Paiement.findAll();
    res.json({
      success: true,
      data: paiements || [],
      message: 'Paiements récupérés avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des paiements:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      errors: [error.message]
    });
  }
});

// PUT /api/paiements/:id - Mettre à jour un paiement
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const paiementData = req.body;

    const paiement = await Paiement.update(id, paiementData);

    res.json({
      success: true,
      data: paiement,
      message: 'Paiement mis à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du paiement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      errors: [error.message]
    });
  }
});

// PUT /api/paiements/:id/validate - Valider un paiement
router.put('/:id/validate', async (req, res) => {
  try {
    const { id } = req.params;
    const paiement = await Paiement.validate(id);

    res.json({
      success: true,
      data: paiement,
      message: 'Paiement validé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la validation du paiement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      errors: [error.message]
    });
  }
});

module.exports = router;
