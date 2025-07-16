
const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const emailService = require('../services/emailService');
const { authenticateAdmin, requireSuperAdmin } = require('./adminAuth');

// Appliquer l'authentification à toutes les routes
router.use(authenticateAdmin);
router.use(requireSuperAdmin);

// GET /api/admin/management/admins - Liste des admins
router.get('/admins', async (req, res) => {
  try {
    const { role, etablissement_id } = req.query;
    const filters = {};
    
    if (role) filters.role = role;
    if (etablissement_id) filters.etablissement_id = etablissement_id;
    
    const admins = await Admin.findAll(filters);
    
    res.json({
      success: true,
      data: admins
    });
  } catch (error) {
    console.error('Erreur récupération admins:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// POST /api/admin/management/admins - Créer un admin
router.post('/admins', async (req, res) => {
  try {
    const { nom, prenom, email, etablissement_id } = req.body;

    if (!nom || !prenom || !email) {
      return res.status(400).json({
        success: false,
        message: 'Nom, prénom et email requis'
      });
    }

    // Vérifier si l'email existe déjà
    const existingAdmin = await Admin.findByEmail(email);
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Un admin avec cet email existe déjà'
      });
    }

    const newAdmin = await Admin.create({
      nom,
      prenom,
      email,
      etablissement_id,
      role: 'admin_etablissement'
    }, req.admin.id);

    // Récupérer les informations complètes pour l'email
    const adminWithDetails = await Admin.findById(newAdmin.id);
    
    // Envoyer l'email avec les identifiants
    try {
      await emailService.sendAdminCredentials({
        ...adminWithDetails,
        temp_password: newAdmin.temp_password
      });
      console.log(`Email envoyé avec succès à ${email}`);
    } catch (emailError) {
      console.error('Erreur envoi email:', emailError);
      // On continue même si l'email échoue
    }

    res.status(201).json({
      success: true,
      data: {
        ...newAdmin,
        temp_password: undefined // Ne pas renvoyer le mot de passe dans la réponse
      },
      message: 'Admin créé avec succès. Les identifiants ont été envoyés par email.'
    });
  } catch (error) {
    console.error('Erreur création admin:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// PUT /api/admin/management/admins/:id - Modifier un admin
router.put('/admins/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, prenom, email, statut, etablissement_id } = req.body;

    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin non trouvé'
      });
    }

    if (admin.role === 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Impossible de modifier le super-admin'
      });
    }

    const updatedAdmin = await Admin.update(id, {
      nom,
      prenom,
      email,
      statut,
      etablissement_id
    });

    res.json({
      success: true,
      data: updatedAdmin,
      message: 'Admin modifié avec succès'
    });
  } catch (error) {
    console.error('Erreur modification admin:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// DELETE /api/admin/management/admins/:id - Supprimer un admin
router.delete('/admins/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin non trouvé'
      });
    }

    if (admin.role === 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Impossible de supprimer le super-admin'
      });
    }

    const deleted = await Admin.delete(id);
    if (!deleted) {
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer cet admin'
      });
    }

    res.json({
      success: true,
      message: 'Admin supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur suppression admin:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

module.exports = router;
