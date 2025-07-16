
const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

// Middleware pour vérifier le token admin
const authenticateAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'Token manquant' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const admin = await Admin.findById(decoded.adminId);
    
    if (!admin || admin.statut !== 'actif') {
      return res.status(401).json({ success: false, message: 'Admin non autorisé' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token invalide' });
  }
};

// Middleware pour vérifier le rôle super-admin
const requireSuperAdmin = (req, res, next) => {
  if (req.admin.role !== 'super_admin') {
    return res.status(403).json({ success: false, message: 'Accès réservé au super-admin' });
  }
  next();
};

// POST /api/admin/auth/login - Connexion administrateur
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe requis'
      });
    }

    const admin = await Admin.verifyPassword(email, password);
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants invalides'
      });
    }

    const token = jwt.sign(
      { adminId: admin.id, role: admin.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      data: {
        admin: {
          id: admin.id,
          nom: admin.nom,
          prenom: admin.prenom,
          email: admin.email,
          role: admin.role,
          etablissement_id: admin.etablissement_id,
          etablissement_nom: admin.etablissement_nom
        },
        token
      }
    });
  } catch (error) {
    console.error('Erreur login admin:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// POST /api/admin/auth/change-password - Changer mot de passe
router.post('/change-password', authenticateAdmin, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    // Vérifier l'ancien mot de passe
    const isValid = await Admin.verifyPassword(req.admin.email, current_password);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Mot de passe actuel incorrect'
      });
    }

    await Admin.updatePassword(req.admin.id, new_password);

    res.json({
      success: true,
      message: 'Mot de passe modifié avec succès'
    });
  } catch (error) {
    console.error('Erreur changement mot de passe:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// GET /api/admin/auth/me - Profil admin actuel
router.get('/me', authenticateAdmin, (req, res) => {
  res.json({
    success: true,
    data: {
      id: req.admin.id,
      nom: req.admin.nom,
      prenom: req.admin.prenom,
      email: req.admin.email,
      role: req.admin.role,
      etablissement_id: req.admin.etablissement_id,
      etablissement_nom: req.admin.etablissement_nom
    }
  });
});

module.exports = { router, authenticateAdmin, requireSuperAdmin };
