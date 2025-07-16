
const express = require('express');
const router = express.Router();
const Matiere = require('../models/Matiere');

// GET /api/matieres - Récupérer toutes les matières
router.get('/', async (req, res) => {
  try {
    const matieres = await Matiere.findAll();
    res.json({ data: matieres });
  } catch (error) {
    console.error('Erreur lors de la récupération des matières:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur', 
      errors: [error.message] 
    });
  }
});

// GET /api/matieres/:id - Récupérer une matière par ID
router.get('/:id', async (req, res) => {
  try {
    const matiere = await Matiere.findById(req.params.id);
    if (!matiere) {
      return res.status(404).json({ 
        success: false, 
        message: 'Matière non trouvée' 
      });
    }
    res.json({ data: matiere });
  } catch (error) {
    console.error('Erreur lors de la récupération de la matière:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur', 
      errors: [error.message] 
    });
  }
});

// POST /api/matieres - Créer une nouvelle matière
router.post('/', async (req, res) => {
  try {
    const matiere = await Matiere.create(req.body);
    res.status(201).json({ 
      success: true, 
      data: matiere, 
      message: 'Matière créée avec succès' 
    });
  } catch (error) {
    console.error('Erreur lors de la création de la matière:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur', 
      errors: [error.message] 
    });
  }
});

// PUT /api/matieres/:id - Mettre à jour une matière
router.put('/:id', async (req, res) => {
  try {
    const matiere = await Matiere.update(req.params.id, req.body);
    res.json({ 
      success: true, 
      data: matiere, 
      message: 'Matière mise à jour avec succès' 
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la matière:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur', 
      errors: [error.message] 
    });
  }
});

// DELETE /api/matieres/:id - Supprimer une matière
router.delete('/:id', async (req, res) => {
  try {
    const matiere = await Matiere.findById(req.params.id);
    if (!matiere) {
      return res.status(404).json({ 
        success: false, 
        message: 'Matière non trouvée' 
      });
    }
    
    await Matiere.delete(req.params.id);
    res.json({ 
      success: true, 
      message: 'Matière supprimée avec succès' 
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la matière:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur', 
      errors: [error.message] 
    });
  }
});

module.exports = router;
