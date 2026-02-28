# TMotS - Gestionnaire de menu hebdomadaire et d'ingrédients

Une application web simple et élégante en React pour vous aider à planifier vos menus hebdomadaires avec des recettes enregistrées et gérer vos listes de courses. Toutes les données sont stockées localement dans votre navigateur via le stockage local.

## Fonctionnalités

- 📖 **Gestion des recettes** – Créez et enregistrez des recettes avec ingrédients, étapes de cuisson et liens optionnels vers des sites externes
- 📅 **Planification du menu hebdomadaire** – Planifiez vos repas en sélectionnant des recettes ou en ajoutant des plats personnalisés
- 🥕 **Inventaire des ingrédients** – Suivez les ingrédients que vous avez avec quantités et unités
- 🛒 **Liste de courses intelligente** – Créez des listes de courses manuellement ou auto‑remplissez-les avec les ingrédients des recettes de votre menu
- 💾 **Stockage local** – Toutes les données sont enregistrées automatiquement dans le stockage local de votre navigateur
- 📱 **Design responsive** – Fonctionne aussi bien sur ordinateur que sur mobile
- 🎨 **Interface soignée** – Interface moderne à dégradés avec animations fluides

## Démarrage

### Prérequis

- Node.js (v14 ou supérieur)
- npm (v6 ou supérieur)

### Installation

1. Placez‑vous dans le dossier du projet :
   ```bash
   cd tmots_app
   ```

2. Installez les dépendances :
   ```bash
   npm install
   ```

### Lancement de l’application

Lancez le serveur de développement :

```bash
npm start
```

L’application s’ouvrira automatiquement dans votre navigateur à l’adresse [http://localhost:3000](http://localhost:3000).

### Compilation pour la production

Pour générer une version optimisée :

```bash
npm run build
```

Un dossier `build` contenant les fichiers optimisés sera créé.

## Utilisation

### Onglet Recettes
- Cliquez sur "➕ Créer une recette" pour ajouter une nouvelle recette
- Saisissez le nom, les ingrédients (quantités et unités), les étapes de cuisson et éventuellement un lien vers la recette
- Consultez toutes vos recettes sous forme de cartes
- Modifiez ou supprimez des recettes si besoin
- Chaque carte affiche un aperçu des ingrédients et des étapes

### Onglet Menu hebdomadaire
- Cliquez sur "📅 Ajouter au menu" dans l’onglet Recettes pour insérer une recette dans le menu
- Affichez toutes les recettes ajoutées sous forme de liste
- Supprimez une recette ou videz le menu complet

### Onglet Ingrédients
- Cette page sert désormais de **base d'ingrédients** : tous les ingrédients saisis dans une recette sont enregistrés ici
- Vous pouvez **ajouter**, **modifier** ou **supprimer** des ingrédients de la base
- Lors de la création d’une recette, un champ de saisie propose des suggestions issues de cette base pour éviter les doublons
- La section inférieure rassemble automatiquement toutes les quantités d’ingrédients nécessaires pour les recettes du menu
- Voyez les totaux par ingrédient et quelles recettes l’utilisent

### Onglet Liste de courses
- **Ajoutez manuellement** des articles, ou
- **Cliquez "📖 Depuis les recettes"** pour importer tous les ingrédients du menu
- Cochez les articles au fur et à mesure de vos achats
- Suivez votre progression grâce à la barre visuelle
- Supprimez les cochés ou videz l’ensemble

## Stockage des données

Toutes les données sont conservées dans le stockage local du navigateur :
- **Recettes** : `tmots_recipes`
- **Menu hebdomadaire** : `tmots_weekly_menu`
- **Ingrédients** : `tmots_ingredients`
- **Liste de courses** : `tmots_shopping_list`

Les données persistent entre les sessions de navigation. Pour tout effacer, videz le stockage local du navigateur.

## Structure du projet

```
tmots_app/
├── src/
│   ├── components/
│   │   ├── RecipeManager.js       # Création et gestion des recettes
│   │   ├── RecipeManager.css
│   │   ├── MenuManager.js         # Planification du menu hebdomadaire
│   │   ├── MenuManager.css
│   │   ├── IngredientTracker.js   # Inventaire des ingrédients
│   │   ├── IngredientTracker.css
│   │   ├── ShoppingList.js        # Liste de courses avec synchronisation recette
│   │   └── ShoppingList.css
│   ├── utils/
│   │   └── storage.js             # Utilitaires de stockage local
│   ├── App.js                     # Composant principal
│   ├── App.css                    # Styles principaux
│   └── index.js
├── public/
├── package.json
└── README.md
```

## Technologies utilisées

- **React** – bibliothèque UI
- **React Hooks** – gestion d’état (`useState`, `useEffect`)
- **CSS3** – styles avec dégradés et animations
- **API Storage local** – persistance des données

## Compatibilité navigateurs

Fonctionne dans tous les navigateurs modernes supportant :
- React 18+
- JavaScript ES6+
- Stockage local

## Exemple de workflow

1. **Créer des recettes** – Commencez par enregistrer vos recettes favorites
2. **Planifier la semaine** – Ajoutez des recettes au menu
3. **Générer la liste de courses** – Cliquez sur "Depuis les recettes" pour remplir la liste
4. **Faire les courses** – Cochez les articles au fur et à mesure

## Améliorations futures

Fonctionnalités possibles pour les versions ultérieures :
- Ajuster les portions (multiplier les ingrédients)
- Exporter la liste de courses en PDF ou par e‑mail
- Notes et évaluations des recettes
- Filtres pour régimes alimentaires
- Synchronisation cloud entre appareils
- Application mobile
- Minuteurs et notifications de préparation

## Licence

Ce projet est open source et disponible pour un usage personnel.

## Support

Pour toute question, consultez les commentaires dans le code source ou jetez un œil aux fichiers des composants pour des notes détaillées.
