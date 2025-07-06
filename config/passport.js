const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const AppleStrategy = require('passport-apple').Strategy;
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

// Configuration Facebook OAuth
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: `${process.env.API_URL}/api/auth/facebook/callback`,
  profileFields: ['id', 'emails', 'name', 'picture']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({
      where: {
        [require('sequelize').Op.or]: [
          { providerId: profile.id },
          { email: profile.emails[0].value }
        ]
      }
    });

    if (user) {
      if (user.provider === 'local') {
        await user.update({
          providerId: profile.id,
          provider: 'facebook',
          profilePicture: profile.photos[0]?.value || null,
          username: user.username || profile.displayName
        });
      }
      return done(null, user);
    }

    user = await User.create({
      email: profile.emails[0].value,
      username: profile.displayName,
      provider: 'facebook',
      providerId: profile.id,
      profilePicture: profile.photos[0]?.value || null,
      password: null
    });

    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

// Configuration Apple OAuth
passport.use(new AppleStrategy({
  clientID: process.env.APPLE_CLIENT_ID,
  teamID: process.env.APPLE_TEAM_ID,
  keyID: process.env.APPLE_KEY_ID,
  privateKeyLocation: process.env.APPLE_PRIVATE_KEY_LOCATION,
  callbackURL: `${process.env.API_URL}/api/auth/apple/callback`,
  passReqToCallback: true
}, async (req, accessToken, refreshToken, idToken, profile, done) => {
  try {
    const email = idToken.email;
    
    let user = await User.findOne({
      where: {
        [require('sequelize').Op.or]: [
          { providerId: profile.id },
          { email: email }
        ]
      }
    });

    if (user) {
      if (user.provider === 'local') {
        await user.update({
          providerId: profile.id,
          provider: 'apple',
          username: user.username || profile.displayName || email.split('@')[0]
        });
      }
      return done(null, user);
    }

    user = await User.create({
      email: email,
      username: profile.displayName || email.split('@')[0],
      provider: 'apple',
      providerId: profile.id,
      password: null
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