
const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail', // ou votre service email
      auth: {
        user: process.env.EMAIL_USER || 'Dapierre25@gmail.com',
        pass: process.env.EMAIL_PASSWORD || 'iavr wlau pgvo lbbe'
      }
    });
  }

  async sendAdminCredentials(adminData) {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@gabconcours.ga',
      to: adminData.email,
      subject: 'Vos identifiants d\'accès - GabConcours Admin',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
            <h1 style="color: #333;">Bienvenue dans GabConcours</h1>
          </div>
          
          <div style="padding: 20px;">
            <p>Bonjour ${adminData.prenom} ${adminData.nom},</p>
            
            <p>Votre compte administrateur a été créé avec succès pour l'établissement <strong>${adminData.etablissement_nom}</strong>.</p>
            
            <div style="background-color: #e9ecef; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3>Vos identifiants de connexion :</h3>
              <p><strong>Email :</strong> ${adminData.email}</p>
              <p><strong>Mot de passe temporaire :</strong> ${adminData.temp_password}</p>
              <p><strong>URL de connexion :</strong> <a href="${process.env.APP_URL || 'http://localhost:3000'}/admin/login">Accéder à l'administration</a></p>
            </div>
            
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>⚠️ Important :</strong></p>
              <ul>
                <li>Changez votre mot de passe lors de votre première connexion</li>
                <li>Conservez ces informations en lieu sûr</li>
                <li>Ne partagez jamais vos identifiants</li>
              </ul>
            </div>
            
            <h3>Vos responsabilités :</h3>
            <ul>
              <li>Gérer les candidatures de votre établissement</li>
              <li>Valider ou rejeter les documents soumis</li>
              <li>Vérifier les paiements</li>
              <li>Suivre les statistiques de candidature</li>
            </ul>
            
            <p>Pour toute question ou assistance, n'hésitez pas à nous contacter.</p>
            
            <p>Cordialement,<br>L'équipe GabConcours</p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 10px; text-align: center; font-size: 12px; color: #6c757d;">
            <p>GabConcours - Plateforme de gestion des concours d'entrée</p>
          </div>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Email d'identifiants envoyé à ${adminData.email}`);
      return true;
    } catch (error) {
      console.error('Erreur envoi email:', error);
      return false;
    }
  }

  async sendDocumentValidationNotification(candidatData, documentData, statut, commentaire) {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@gabconcours.ga',
      to: candidatData.email,
      subject: `Validation de document - ${statut === 'valide' ? 'Approuvé' : 'Rejeté'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: ${statut === 'valide' ? '#d4edda' : '#f8d7da'}; padding: 20px; text-align: center;">
            <h1 style="color: ${statut === 'valide' ? '#155724' : '#721c24'};">
              Document ${statut === 'valide' ? 'Validé' : 'Rejeté'}
            </h1>
          </div>
          
          <div style="padding: 20px;">
            <p>Bonjour ${candidatData.prenom} ${candidatData.nom},</p>
            
            <p>Nous vous informons que votre document <strong>"${documentData.type}"</strong> a été ${statut === 'valide' ? 'validé' : 'rejeté'} par notre équipe.</p>
            
            <div style="background-color: #e9ecef; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>NUPCAN :</strong> ${candidatData.nupcan}</p>
              <p><strong>Document :</strong> ${documentData.type}</p>
              <p><strong>Statut :</strong> ${statut === 'valide' ? 'Validé ✅' : 'Rejeté ❌'}</p>
              ${commentaire ? `<p><strong>Commentaire :</strong> ${commentaire}</p>` : ''}
            </div>
            
            ${statut === 'rejete' ? `
              <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p><strong>Action requise :</strong></p>
                <p>Veuillez corriger et soumettre à nouveau votre document via votre espace candidat.</p>
              </div>
            ` : ''}
            
            <p>
              <a href="${process.env.APP_URL || 'http://localhost:3000'}/dashboard/${candidatData.nupcan}" 
                 style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                Voir mon espace candidat
              </a>
            </p>
            
            <p>Cordialement,<br>L'équipe GabConcours</p>
          </div>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Email de validation envoyé à ${candidatData.email}`);
      return true;
    } catch (error) {
      console.error('Erreur envoi email validation:', error);
      return false;
    }
  }
}

module.exports = new EmailService();
