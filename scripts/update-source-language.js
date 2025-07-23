// Script pour mettre à jour les flashcards existantes avec une estimation de sourceLanguage
// Basé sur l'analyse du texte source (front)

require('dotenv').config();
const { Flashcard } = require('../models');
const sequelize = require('../config/database');

async function updateSourceLanguages() {
  try {
    console.log('🔄 Début de la mise à jour des sourceLanguage...');
    
    // Récupérer toutes les flashcards sans sourceLanguage
    const flashcardsToUpdate = await Flashcard.findAll({
      where: {
        sourceLanguage: null
      }
    });
    
    console.log(`📊 ${flashcardsToUpdate.length} flashcards à mettre à jour`);
    
    if (flashcardsToUpdate.length === 0) {
      console.log('✅ Toutes les flashcards ont déjà un sourceLanguage');
      return;
    }
    
    // Analyser chaque flashcard et estimer la langue source
    let updatedCount = 0;
    for (const flashcard of flashcardsToUpdate) {
      const text = flashcard.front.toLowerCase();
      let detectedLang = 'en'; // Par défaut anglais
      
      // Détection basique par caractères spéciaux
      if (/[àâäéêëèîïôùûüÿç]/i.test(flashcard.front)) {
        detectedLang = 'fr';
      } else if (/[áéíóúñ¿¡]/i.test(flashcard.front)) {
        detectedLang = 'es';
      } else if (/[äöüß]/i.test(flashcard.front)) {
        detectedLang = 'de';
      } else if (/[àèéìíîòóù]/i.test(flashcard.front)) {
        detectedLang = 'it';
      } else if (/[àáâãçéêíõôú]/i.test(flashcard.front)) {
        detectedLang = 'pt';
      } else if (/[а-яё]/i.test(flashcard.front)) {
        detectedLang = 'ru';
      } else if (/[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/.test(flashcard.front)) {
        detectedLang = 'ja';
      } else if (/[\uac00-\ud7af\u1100-\u11ff]/.test(flashcard.front)) {
        detectedLang = 'ko';
      } else if (/[\u4e00-\u9fff]/.test(flashcard.front)) {
        detectedLang = 'zh';
      } else if (/[\u0600-\u06ff]/.test(flashcard.front)) {
        detectedLang = 'ar';
      } else {
        // Détection par mots communs pour l'anglais/français
        const words = text.split(/\s+/);
        const frenchWords = ['le', 'la', 'les', 'de', 'du', 'des', 'un', 'une', 'et', 'est', 'dans', 'avec', 'pour'];
        const englishWords = ['the', 'a', 'an', 'is', 'and', 'in', 'on', 'at', 'to', 'for', 'with', 'this', 'that'];
        
        const frenchScore = words.filter(w => frenchWords.includes(w)).length;
        const englishScore = words.filter(w => englishWords.includes(w)).length;
        
        if (frenchScore > englishScore) {
          detectedLang = 'fr';
        }
      }
      
      // Mettre à jour la flashcard
      flashcard.sourceLanguage = detectedLang;
      await flashcard.save();
      updatedCount++;
      
      console.log(`✅ Mis à jour: "${flashcard.front.substring(0, 30)}..." -> ${detectedLang}`);
    }
    
    console.log(`\n🎉 Mise à jour terminée: ${updatedCount} flashcards mises à jour`);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await sequelize.close();
  }
}

// Exécuter le script
updateSourceLanguages();