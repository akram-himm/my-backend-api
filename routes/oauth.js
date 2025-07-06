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
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Callback Google
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth_failed` }),
  (req, res) => {
    // Générer le JWT
    const token = generateToken(req.user.id);
    
    // Rediriger vers l'extension Chrome avec le token
    res.redirect(`${process.env.CLIENT_URL}/auth-success?token=${token}`);
  }
);

// Route pour démarrer l'authentification Facebook
router.get('/facebook',
  passport.authenticate('facebook', { scope: ['email'] })
);

// Callback Facebook
router.get('/facebook/callback',
  passport.authenticate('facebook', { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth_failed` }),
  (req, res) => {
    const token = generateToken(req.user.id);
    res.redirect(`${process.env.CLIENT_URL}/auth-success?token=${token}`);
  }
);

// Route pour démarrer l'authentification Apple
router.get('/apple',
  passport.authenticate('apple', { scope: ['email', 'name'] })
);

// Callback Apple
router.post('/apple/callback',
  passport.authenticate('apple', { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth_failed` }),
  (req, res) => {
    const token = generateToken(req.user.id);
    res.redirect(`${process.env.CLIENT_URL}/auth-success?token=${token}`);
  }
);

// Route alternative pour recevoir le token depuis le frontend (pour extensions Chrome)
router.post('/token-exchange', express.json(), async (req, res) => {
  try {
    const { provider, accessToken, idToken, profile } = req.body;
    
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