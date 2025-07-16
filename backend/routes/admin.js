
const express = require('express');
const router = express.Router();
const Concours = require('../models/Concours');
const Candidat = require('../models/Candidat');

// DELETE /api/concours/:id - Supprimer un concours
router.delete('/concours/:id', async (req, res) => {
  try {
    const { getConnection } = require('../config/database');
    const connection = getConnection();
    
    const [result] = await connection.execute(
      'DELETE FROM concours WHERE id = ?',
      [req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Concours non trouvé' 
      });
    }
    
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

// PUT /api/concours/:id - Mettre à jour un concours
router.put('/concours/:id', async (req, res) => {
  try {
    const concours = await Concours.update(req.params.id, req.body);
    if (!concours) {
      return res.status(404).json({ 
        success: false, 
        message: 'Concours non trouvé' 
      });
    }
    res.json({ 
      success: true, 
      data: concours, 
      message: 'Concours mis à jour avec succès' 
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du concours:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur', 
      errors: [error.message] 
    });
  }
});

module.exports = router;
