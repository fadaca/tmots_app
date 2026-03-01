# TMotS - Gestionnaire de menu hebdomadaire et d'ingrédients

Une application web simple et élégante en React pour vous aider à planifier vos menus hebdomadaires avec des recettes enregistrées et gérer vos listes de courses. Toutes les données sont désormais conservées sur le disque du serveur (idéalement une Raspberry Pi) dans de simples fichiers JSON. Le frontend communique avec une API REST Express pour lire/écrire ces fichiers ; il n'y a plus de dépendance au stockage local.

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

Deux serveurs sont maintenant disponibles : le frontend React et le backend Express.

1. **Backend** (persist les données dans `data/*.json`) :
   ```bash
   node server.js
   ```
   Le serveur écoute sur `http://localhost:3000` par défaut et fournit à la fois l'API et les fichiers statiques produits par le build.

2. **Frontend en développement** (optionnel) :
   ```bash
   npm start
   ```
   Ce qui lance la configuration de développement `react-scripts` sur `http://localhost:3000`.
   Si vous exécutez également le backend sur le même port, ajoutez un proxy dans `package.json` :
   ```json
   "proxy": "http://localhost:3000"
   ```
   (la configuration de proxy est déjà fournie par `react-scripts` lorsque le backend est sur le même port.)
3. **Tout en un** – utile sur un Raspberry Pi Lite où vous voulez un seul terminal :
   ```bash
   npm run dev
   ```
   Ce script démarre le serveur de l'API (`src/server.js`) et la version de développement React simultanément en utilisant le paquet `concurrently`. Les deux processus s'exécutent en parallèle dans le même shell.

#### Déploiement sur une Raspberry Pi
L'application se prête particulièrement bien à un hébergement sur une Pi (modèle 3/4 ou Zero 2). Voici la procédure recommandée :

1. Clonez votre dépôt et installez Node.js :
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo bash -
   sudo apt install -y nodejs git
   git clone <votre‑repo> tmots_app
   cd tmots_app
   npm install
   ```
2. Lancez le serveur à l'intérieur d'une session `screen` pour qu'il continue de tourner sans dépendre de votre connexion SSH :
   ```bash
   screen -S tmots        # nouvelle session nommée "tmots"
   npm start              # ou `node server.js` selon votre configuration
   # détachez avec Ctrl‑a d, revenez avec `screen -r tmots`
   ```
   Un simple `screen -ls` liste les sessions ; `screen -S tmots -X quit` termine la session proprement.

3. Utilisez `npm run build` pour une version de production, puis servez le dossier `build` avec `node server.js` ou un outil comme `pm2`/`systemd` si vous préférez un service.

> **Astuce** : si vous accédez à l'interface depuis un autre appareil via le réseau local, l'URL sera `http://<adresse-ip-de-la-pi>:3000`.

*Option DNS/local hostname* : pour éviter de taper l’adresse IP à chaque fois, vous pouvez donner un nom simple à la Pi.

1. **Modification de `/etc/hosts`** (valide uniquement pour la machine locale et les clients sur le même réseau si vous éditez aussi leurs fichiers) :
   ```bash
   sudo sh -c 'echo "192.168.1.X tmots" >> /etc/hosts'
   # remplacez 192.168.1.X par l'IP réelle de la Pi
   ```
   Ensuite accédez à `http://tmots:3000` depuis un poste qui a la même entrée dans son `/etc/hosts`.

2. **Avahi/Bonjour (mDNS)** : installez et activez `avahi-daemon` sur la Pi :
   ```bash
   sudo apt install avahi-daemon
   # le service expose automatiquement le nom <hostname>.local
   ```
   en supposant que le nom d'hôte de la Pi est `tmots`, vous pouvez visiter `http://tmots.local:3000` depuis n'importe quel appareil du réseau supportant mDNS (macOS, Linux, Windows avec Bonjour).

Les deux méthodes vous permettent d'éviter de mémoriser l'adresse IP et de saisir simplement `tmots` ou `tmots.local` dans votre navigateur.

### Démarrage automatique au boot (systemd)

Vous pouvez configurer l'application pour qu'elle démarre automatiquement au démarrage de la Raspberry Pi en utilisant un service `systemd`. Un fichier d'exemple `tmots.service` est fourni à la racine du projet : adaptez-le puis installez‑le.

1. Copiez le fichier `tmots.service` sur la Pi (ou éditez‑le directement) et adaptez `User` et `WorkingDirectory` :

```bash
# depuis la racine du projet sur la Pi
sudo cp tmots.service /etc/systemd/system/
sudo nano /etc/systemd/system/tmots.service   # ajustez User et WorkingDirectory
```

2. Rechargez `systemd`, activez et démarrez le service :

```bash
sudo systemctl daemon-reload
sudo systemctl enable tmots.service
sudo systemctl start tmots.service
```

3. Vérifiez le statut et les logs :

```bash
sudo systemctl status tmots.service
sudo journalctl -u tmots.service -f
```

Optionnel : un petit script d'installation est fourni dans `scripts/install-service.sh`. Exécutez‑le depuis la Pi (en fournissant le chemin vers le dossier de l'application et, optionnellement, l'utilisateur) :

```bash
sudo bash scripts/install-service.sh /home/pi/tmots_app pi
```

Alternative (pm2) : si vous préférez un gestionnaire de processus Node, installez `pm2` et faites démarrer l'app au boot via pm2 :

```bash
sudo npm install -g pm2
cd /home/pi/tmots_app
pm2 start server.js --name tmots
pm2 save
pm2 startup systemd
# suivez les instructions affichées par pm2 pour finaliser la configuration
```

Avec ces options, votre instance TMotS démarrera automatiquement au boot et redémarrera en cas de plantage.

#### Copier la liste de courses à distance
Sur un navigateur distant (par exemple en accès VNC ou SSH avec tunnel X11), l'API du presse‑papier peut échouer. Le bouton **Copier** gère désormais ce cas : s'il ne parvient pas à écrire, une fenêtre `prompt` affiche le texte de la liste, vous permettant de le sélectionner manuellement et de le coller dans n'importe quelle application de notes (Google Keep, Notes, etc.). Cette fallback est documentée dans le code `ShoppingList.js` pour transparence.

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

Depuis la refonte, les données sont persistées par l'API Express du serveur :

| Endpoint           | Fichier JSON stocké     | Type de données |
|--------------------|-------------------------|-----------------|
| `GET/POST /api/menu`         | `data/menu.json`          | Objet ou tableau
| `GET/POST /api/ingredients`  | `data/ingredients.json`   | Tableau de chaînes
| `GET/POST /api/recipes`      | `data/recipes.json`       | Tableau d'objets
| `GET/POST /api/shopping`     | `data/shopping.json`      | Tableau d'articles
| `GET/POST /api/suggestions`  | `data/suggestions.json`   | Tableau de chaînes

Le serveur crée automatiquement le répertoire `data/` et les fichiers correspondants à la première exécution. Si un fichier JSON est vide ou malformé (par exemple suite à une interruption pendant l’écriture), le serveur l’écrasera avec sa valeur par défaut lors du prochain accès. Vous pouvez également supprimer manuellement `data/*.json` pour repartir à zéro.

Vous pouvez modifier ou sauvegarder les données directement sur la machine hébergeant l'application (par exemple, une Raspberry Pi). Aucun stockage local n’est utilisé côté client, ce qui permet de partager les mêmes données entre plusieurs navigateurs.

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
