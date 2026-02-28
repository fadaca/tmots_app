# Exécution de TMotS sur le réseau local (Raspberry Pi)

Ce guide explique comment exécuter l’application TMotS sur un Raspberry Pi et y accéder depuis d’autres appareils de votre réseau local.

## Prérequis
- Node.js (v14 ou supérieur) installé sur le Raspberry Pi
- Raspberry Pi connecté au réseau local
- Connexion Internet pour l’installation initiale

## Étapes de configuration

### 1. Transférer les fichiers vers le Raspberry Pi

```bash
# Depuis votre machine de développement, copiez le dossier tmots_app vers le Pi
scp -r tmots_app pi@<adresse-ip-du-pi>:~/
# Ou : rsync -av tmots_app/ pi@<adresse-ip-du-pi>:~/tmots_app/
```

### 2. Se connecter en SSH au Raspberry Pi

```bash
ssh pi@<adresse-ip-du-pi>
```

### 3. Aller dans le répertoire de l’application

```bash
cd ~/tmots_app
```

### 4. Installer les dépendances

```bash
npm install
```

Cela installe toutes les dépendances, y compris **Express** pour le serveur.

### 5. Compiler l’application

```bash
npm run build
```

Cela génère la version de production optimisée dans le dossier `build/` (2–3 minutes).

### 6. Démarrer le serveur de production

```bash
npm run serve
```

Ou utilisez la commande combinée :

```bash
npm run prod
```

### 7. Accéder à l’application

Le serveur affichera quelque chose comme :

```
🚀 L'application TMotS est en cours d'exécution !
📱 Local :   http://localhost:3000
🌐 Réseau : http://<adresse-ip-du-pi>:3000
```

**Depuis d’autres appareils du réseau local** :
- Trouvez l’IP du Pi : `hostname -I` (sur le Pi)
- Dans un navigateur : `http://<adresse-ip-du-pi>:3000`

Exemples :
- `http://192.168.1.100:3000`
- `http://192.168.0.50:3000`

## Exécution en arrière‑plan (screen ou nohup)

Pour que le serveur continue de tourner après la fermeture de la session SSH :

### Avec `screen` :

```bash
screen -S tmots
npm run serve
# Ctrl+A puis D pour détacher
# Récupérer : screen -r tmots
```

### Avec `nohup` :

```bash
nohup npm run serve > tmots.log 2>&1 &
```

## Démarrage automatique (service systemd)

Créez un fichier de service systemd :

```bash
sudo nano /etc/systemd/system/tmots.service
```

Collez :

```ini
[Unit]
Description=Application de menu hebdomadaire TMotS
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/tmots_app
ExecStart=/usr/bin/node server.js
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Activez et lancez :

```bash
sudo systemctl enable tmots
sudo systemctl start tmots
sudo systemctl status tmots
```

## Dépannage

**L’application n’est pas accessible depuis d’autres appareils ?**
- Vérifiez le pare-feu : `sudo ufw status` (autoriser le port 3000)
- Vérifiez l’IP du Pi : `hostname -I`
- Pinguez le Pi depuis un autre appareil : `ping <adresse-ip-du-pi>`
- Consultez les logs du serveur : `npm run serve`

**Le port 3000 est déjà utilisé ?**

```bash
PORT=3001 npm run serve
```

**Problèmes d’installation ?**
- Videz le cache npm : `npm cache clean --force`
- Supprimez `node_modules` : `rm -rf node_modules`
- Réinstallez : `npm install`

## Persistance des données

L’application utilise le **stockage local** du navigateur, qui enregistre les données localement sur chaque appareil.

**Pour synchroniser entre appareils :**
- Chaque navigateur gère sa propre copie
- Une synchronisation cloud (Firebase, Supabase) pourrait être ajoutée ultérieurement

## Développement sur Raspberry Pi

Pour utiliser le serveur de développement :

```bash
npm start
# Le serveur écoute sur : http://<adresse-ip-du-pi>:3000
```

⚠️ **Attention :** le serveur de développement est plus lent et non destiné à la production.

---

Bonne planification des repas ! 🍽️
