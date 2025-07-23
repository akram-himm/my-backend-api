# Instructions de déploiement sur Render

## Mise à jour nécessaire : Ajout du champ sourceLanguage

Le modèle Flashcard a été mis à jour pour inclure un nouveau champ `sourceLanguage`. 

### Option 1 : Synchronisation automatique (Recommandé)

1. Connectez-vous à la console Render
2. Allez dans votre service backend
3. Ouvrez le Shell
4. Exécutez :
```bash
node sync-db.js
```

### Option 2 : Migration manuelle

Si la synchronisation automatique ne fonctionne pas, exécutez :
```bash
node migrations/add-source-language.js
```

### Option 3 : Requête SQL directe

Si les options précédentes échouent, vous pouvez exécuter cette requête SQL directement :
```sql
ALTER TABLE "Flashcards"
ADD COLUMN IF NOT EXISTS "sourceLanguage" VARCHAR(5) DEFAULT NULL;
```

## Vérification

Après la mise à jour, vérifiez que la colonne a été ajoutée :
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'Flashcards' AND column_name = 'sourceLanguage';
```

## Changements dans le code

Les fichiers suivants ont été modifiés :
- `models/Flashcard.js` : Ajout du champ sourceLanguage
- `routes/flashcards.js` : Support du nouveau champ dans les routes POST et PUT

L'extension Chrome a également été mise à jour pour :
- Ne plus utiliser 'auto' comme sourceLanguage
- Envoyer le sourceLanguage détecté par Google Translate
- Gérer les anciennes flashcards sans sourceLanguage