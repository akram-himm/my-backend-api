const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User } = require('../models');

// Configuration Google OAuth
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `${process.env.API_URL}/api/auth/google/callback`
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Rechercher l'utilisateur par providerId ou email
    let user = await User.findOne({
      where: {
        [require('sequelize').Op.or]: [
          { providerId: profile.id },
          { email: profile.emails[0].value }
        ]
      }
    });

    if (user) {
      // Si l'utilisateur existe, mettre à jour ses infos si nécessaire
      if (user.provider === 'local') {
        // L'utilisateur s'est inscrit avec email/password avant
        // On lie son compte Google
        await user.update({
          providerId: profile.id,
          provider: 'google',
          profilePicture: profile.photos[0]?.value || null,
          username: user.username || profile.displayName
        });
      }
      return done(null, user);
    }

    // Créer un nouvel utilisateur
    user = await User.create({
      email: profile.emails[0].value,
      username: profile.displayName,
      provider: 'google',
      providerId: profile.id,
      profilePicture: profile.photos[0]?.value || null,
      password: null // Pas de mot de passe pour OAuth
    });

    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

// Sérialisation des utilisateurs pour les sessions
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;