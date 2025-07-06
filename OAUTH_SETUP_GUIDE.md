# Guide de Configuration OAuth pour LexiFlow

Ce guide vous explique comment configurer OAuth pour votre API sur Render.

## 🚀 Étapes à suivre

### 1. Installer les dépendances
```bash
npm install
```

### 2. Configurer Google OAuth

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Activez l'API Google+ (ou Google Identity)
4. Allez dans "Credentials" > "Create Credentials" > "OAuth client ID"
5. Choisissez "Web application"
6. Ajoutez ces URLs :
   - **Authorized JavaScript origins**: 
     - `https://votre-api.onrender.com`
     - `http://localhost:5000` (pour les tests)
   - **Authorized redirect URIs**: 
     - `https://votre-api.onrender.com/api/auth/google/callback`
     - `http://localhost:5000/api/auth/google/callback`
7. Copiez le Client ID et Client Secret

### 3. Configurer Facebook OAuth

1. Allez sur [Facebook Developers](https://developers.facebook.com/)
2. Créez une nouvelle app
3. Ajoutez le produit "Facebook Login"
4. Dans Settings > Basic, copiez l'App ID et App Secret
5. Dans Facebook Login > Settings, ajoutez :
   - **Valid OAuth Redirect URIs**:
     - `https://votre-api.onrender.com/api/auth/facebook/callback`
     - `http://localhost:5000/api/auth/facebook/callback`

### 4. Configurer les variables sur Render

1. Dans votre dashboard Render, allez dans votre service
2. Cliquez sur "Environment" dans le menu de gauche
3. Ajoutez ces variables :

```
API_URL=https://votre-service.onrender.com
GOOGLE_CLIENT_ID=votre_google_client_id
GOOGLE_CLIENT_SECRET=votre_google_client_secret
FACEBOOK_APP_ID=votre_facebook_app_id
FACEBOOK_APP_SECRET=votre_facebook_app_secret
```

### 5. Tester votre configuration

#### Test avec curl :
```bash
# Vérifier que les routes sont disponibles
curl https://votre-api.onrender.com/api/auth/google
```

#### Test dans le navigateur :
Visitez : `https://votre-api.onrender.com/api/auth/google`
Vous devriez être redirigé vers Google pour vous connecter.

## 🔧 Intégration dans votre Extension Chrome

### Option 1 : Popup OAuth (Recommandé)

Dans votre extension, ajoutez ce code :

```javascript
// popup.js ou background.js
function loginWithGoogle() {
  chrome.identity.launchWebAuthFlow({
    url: 'https://votre-api.onrender.com/api/auth/google',
    interactive: true
  }, function(redirectUrl) {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
      return;
    }
    
    // Extraire le token de l'URL
    const url = new URL(redirectUrl);
    const token = url.searchParams.get('token');
    
    if (token) {
      // Sauvegarder le token
      chrome.storage.local.set({ token: token }, function() {
        console.log('Token saved!');
        // Rediriger ou mettre à jour l'UI
      });
    }
  });
}
```

### Option 2 : Token Exchange

Si vous utilisez une librairie OAuth côté client :

```javascript
// Après avoir obtenu le token Google côté client
async function exchangeToken(accessToken, profile) {
  const response = await fetch('https://votre-api.onrender.com/api/auth/token-exchange', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      provider: 'google',
      accessToken: accessToken,
      profile: {
        id: profile.getId(),
        email: profile.getEmail(),
        name: profile.getName(),
        picture: profile.getImageUrl()
      }
    })
  });
  
  const data = await response.json();
  if (data.success) {
    // Sauvegarder data.token
    localStorage.setItem('token', data.token);
  }
}
```

## 🐛 Dépannage

### Erreur CORS
- Vérifiez que `CLIENT_URL` est correctement configuré dans Render
- Assurez-vous que l'URL de votre extension est dans les origines autorisées

### Token non reçu
- Vérifiez les logs sur Render Dashboard
- Testez d'abord avec Postman ou curl

### Erreur de callback
- Vérifiez que les URLs de callback sont exactement les mêmes dans Google/Facebook et votre code
- N'oubliez pas le `/api/auth/provider/callback` à la fin

## 📝 Notes importantes

1. **Sécurité** : Ne jamais exposer les secrets OAuth côté client
2. **HTTPS** : OAuth nécessite HTTPS en production (Render le fournit automatiquement)
3. **Sessions** : Les sessions sont temporaires, le JWT est permanent
4. **Apple Sign In** : Plus complexe, nécessite un compte développeur Apple payant

## 🔄 Prochaines étapes

1. Tester avec un utilisateur réel
2. Ajouter la gestion des erreurs
3. Implémenter le refresh token si nécessaire
4. Ajouter Apple Sign In (optionnel)