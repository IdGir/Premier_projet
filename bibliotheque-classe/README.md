# 📚 Bibliothèque de Classe

Application web de gestion de bibliothèque pour classe, compatible avec les Chromebooks.

## Fonctionnalités

### Gestion des Livres
- **Ajout de livres** par code-barres (ISBN), titre ou auteur
- **Scan de codes-barres** via la caméra des Chromebooks
- **Récupération automatique** des couvertures depuis OpenLibrary et Google Books API
- Recherche par nom, auteur ou numéro de code-barres
- Affichage en grille avec couvertures

### Gestion des Élèves
- Ajout et liste des élèves de la classe
- Suivi du nombre de livres empruntés par élève

### Gestion des Emprunts
- **Emprunt rapide** par scan du code-barres
- **Retour rapide** par scan du code-barres
- Tableau de suivi des emprunts en cours
- Historique des dates d'emprunt et de retour

## Installation

### Prérequis
- Node.js (v18 ou supérieur)
- npm

### Étapes d'installation

```bash
# Se déplacer dans le dossier du projet
cd bibliotheque-classe

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

L'application sera accessible à l'adresse `http://localhost:5173`

### Pour la production

```bash
# Construire l'application
npm run build

# Les fichiers de production seront dans le dossier dist/
```

## Utilisation sur Chromebook

1. **Ouvrir l'application** dans le navigateur Chrome
2. **Autoriser l'accès à la caméra** lorsque demandé
3. **Scanner un code-barres**:
   - Cliquer sur le bouton "📷 Scanner"
   - Présenter le code-barres devant la caméra
   - Le code est automatiquement détecté et rempli

4. **Ajouter un livre**:
   - Scanner ou entrer manuellement le code-barres (ISBN)
   - La couverture se charge automatiquement
   - Compléter le titre et l'auteur si nécessaire
   - Cliquer sur "➕ Ajouter le livre"

5. **Gérer les emprunts**:
   - Aller dans l'onglet "Élèves" pour ajouter les élèves
   - Sélectionner un élève dans la liste
   - Scanner un livre disponible pour l'emprunter
   - Scanner un livre emprunté pour le retourner

## Technologies Utilisées

- **React** - Framework JavaScript
- **Vite** - Outil de build rapide
- **html5-qrcode** - Bibliothèque de scan de codes-barres
- **localStorage** - Sauvegarde locale des données
- **OpenLibrary API** - Récupération des couvertures de livres
- **Google Books API** - Alternative pour les couvertures et informations

## Structure des Données

Les données sont sauvegardées localement dans le navigateur:
- `libraryBooks` - Liste des livres
- `libraryStudents` - Liste des élèves
- `libraryLoans` - Historique des emprunts

## Notes Importantes

⚠️ **Pour le scan de codes-barres:**
- Nécessite une connexion HTTPS (ou localhost)
- La caméra doit être autorisée
- Fonctionne mieux avec un bon éclairage

⚠️ **Sauvegarde des données:**
- Les données sont stockées localement dans le navigateur
- Penser à faire des sauvegardes régulières
- Les données persistent entre les sessions sur le même appareil

## Licence

MIT - Libre d'utilisation pour un usage éducatif
