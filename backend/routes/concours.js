
const express = require('express');
const router = express.Router();
const Concours = require('../models/Concours');

// GET /api/concours - Récupérer tous les concours
router.get('/', async (req, res) => {
  try {
    const concours = await Concours.findAll();
    res.json({ 
      success: true,
      data: concours 
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des concours:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur', 
      errors: [error.message] 
    });
  }
});

// GET /api/concours/:id - Récupérer un concours par ID
router.get('/:id', async (req, res) => {
  try {
    const concours = await Concours.findById(req.params.id);
    if (!concours) {
      return res.status(404).json({ 
        success: false, 
        message: 'Concours non trouvé' 
      });
    }
    res.json({ 
      success: true,
      data: concours 
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du concours:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur', 
      errors: [error.message] 
    });
  }
});

// GET /api/concours/:id/filieres - Récupérer les filières d'un concours
router.get('/:id/filieres', async (req, res) => {
  try {
    const connection = require('../config/database').getConnection();
    const [rows] = await connection.execute(
      `SELECT cf.*, f.nomfil, f.description 
       FROM concours_filieres cf
       LEFT JOIN filieres f ON cf.filiere_id = f.id
       WHERE cf.concours_id = ?
       ORDER BY f.nomfil ASC`,
      [req.params.id]
    );
    res.json({ 
      success: true,
      data: rows 
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des filières du concours:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur', 
      errors: [error.message] 
    });
  }
});

// POST /api/concours - Créer un nouveau concours
router.post('/', async (req, res) => {
  try {
    const concours = await Concours.create(req.body);
    res.status(201).json({ 
      success: true, 
      data: concours, 
      message: 'Concours créé avec succès' 
    });
  } catch (error) {
    console.error('Erreur lors de la création du concours:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur', 
      errors: [error.message] 
    });
  }
});

// DELETE /api/concours/:id - Supprimer un concours
router.delete('/:id', async (req, res) => {
  try {
    const concours = await Concours.findById(req.params.id);
    if (!concours) {
      return res.status(404).json({ 
        success: false, 
        message: 'Concours non trouvé' 
      });
    }
    
    await Concours.delete(req.params.id);
    res.json({ 
      success: true, 
      message: 'Concours supprimé avec succès' 
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du concours:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur', 
      errors: [error.message] 
    });
  }
});

module.exports = router;
