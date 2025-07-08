const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const router = express.Router();

// Fonction pour générer un JWT
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// Route pour démarrer l'authentification Google
router.get('/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    prompt: 'select_account' // Force le choix du compte Google
  })
);

// Callback Google
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/oauth-error.html?error=authentication_failed' }),
  (req, res) => {
    // Générer le JWT
    const token = generateToken(req.user.id);
    
    // Pour les extensions Chrome, utiliser une page HTML intermédiaire
    if (process.env.CLIENT_URL && process.env.CLIENT_URL.startsWith('chrome-extension://')) {
      res.redirect(`/oauth-success.html?token=${token}`);
    } else {
      // Pour les applications web normales
      res.redirect(`${process.env.CLIENT_URL}/auth-success?token=${token}`);
    }
  }
);

// Route alternative pour recevoir le token depuis le frontend (pour extensions Chrome)
router.post('/token-exchange', express.json(), async (req, res) => {
  try {
    const { provider, accessToken, idToken, profile } = req.body;
    
    // Validation du provider
    if (provider !== 'google') {
      return res.status(400).json({ error: 'Invalid OAuth provider' });
    }
    
    // Ici vous pourriez valider le token avec le provider
    // Pour l'instant, on fait confiance au frontend
    
    let user = await User.findOne({
      where: {
        [require('sequelize').Op.or]: [
          { providerId: profile.id },
          { email: profile.email }
        ]
      }
    });

    if (!user) {
      user = await User.create({
        email: profile.email,
        username: profile.name || profile.email.split('@')[0],
        provider: provider,
        providerId: profile.id,
        profilePicture: profile.picture || null,
        password: null
      });
    } else if (user.provider === 'local') {
      // Lier le compte OAuth au compte existant
      await user.update({
        providerId: profile.id,
        provider: provider,
        profilePicture: profile.picture || user.profilePicture
      });
    }

    const token = generateToken(user.id);
    
    res.json({
      success: true,
      token,
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Token exchange error:', error);
    res.status(500).json({ error: 'OAuth authentication failed' });
  }
});

module.exports = router;