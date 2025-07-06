# Guide de Déploiement sur Render

## 1. Préparation

### Variables d'environnement nécessaires :

```env
# Automatiquement fourni par Render
DATABASE_URL=postgresql://...

# Généré automatiquement par Render
JWT_SECRET=...

# À configurer manuellement
CLIENT_URL=chrome-extension://YOUR_EXTENSION_ID
FRONTEND_URL=https://your-website.com
CHROME_EXTENSION_ID=YOUR_EXTENSION_ID

# Stripe (utiliser les clés de test d'abord)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_MONTHLY_PRICE_ID=price_...
STRIPE_YEARLY_PRICE_ID=price_...
```

## 2. Étapes de déploiement

### Sur Render :

1. **Créer un nouveau Web Service**
   - Connecter votre repo GitHub
   - Choisir la branche `main`
   - Runtime: Node
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: Starter ($7/mois)

2. **Créer une base de données PostgreSQL**
   - Name: `lexiflow-db`
   - Database: `lexiflow_db`
   - User: `lexiflow_user`
   - Plan: Starter

3. **Configurer les variables d'environnement**
   - Aller dans Dashboard > Environment
   - Ajouter toutes les variables listées ci-dessus

4. **Configurer le Health Check**
   - Path: `/ping`
   - Déjà configuré dans render.yaml

### Dans votre extension Chrome :

1. **Obtenir l'ID de l'extension**
   - Charger l'extension dans Chrome
   - Aller dans chrome://extensions/
   - Copier l'ID

2. **Mettre à jour manifest.json**
   ```json
   "host_permissions": [
     "https://your-app-name.onrender.com/*",
     // ... autres permissions
   ]
   ```

3. **Mettre à jour les URLs dans popup.js**
   - Remplacer `http://localhost:5000` par `https://your-app-name.onrender.com`

## 3. Test de l'API

### Endpoints disponibles :
- `GET /ping` - Health check
- `GET /health` - Status de l'API
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/flashcards` - Liste des flashcards (auth requise)
- `POST /api/flashcards` - Créer une flashcard (auth requise)

### Test avec curl :
```bash
# Health check
curl https://your-app-name.onrender.com/ping

# Status
curl https://your-app-name.onrender.com/health
```

## 4. Débogage

### Logs sur Render :
- Dashboard > Logs pour voir les erreurs

### Problèmes fréquents :
1. **CORS errors** : Vérifier CLIENT_URL et l'ID de l'extension
2. **Database connection** : Vérifier DATABASE_URL
3. **Port binding** : Render utilise le port 10000 par défaut

## 5. Mise à jour

Pour déployer des changements :
```bash
git add .
git commit -m "Update"
git push origin main
```

Render redéploiera automatiquement.

## 6. Sécurité

- Ne jamais commiter le fichier `.env`
- Utiliser les clés Stripe de test en développement
- Activer 2FA sur GitHub et Render
- Surveiller les logs pour détecter les erreurs

## 7. Monitoring

- Utiliser Render Dashboard pour surveiller :
  - CPU et mémoire
  - Requêtes par minute
  - Temps de réponse
  - Erreurs

## 8. Prochaines étapes

1. Tester tous les endpoints
2. Configurer Stripe webhook endpoint
3. Mettre en place des alertes
4. Optimiser les performances si nécessaire