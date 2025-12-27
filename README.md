# 🥗 Izly Bot - Solde & QR Code

Ce script Python permet d'automatiser les interactions avec votre compte **Izly** (le service de paiement des Crous). Il se connecte de manière sécurisée, récupère votre solde actuel et génère un QR Code de paiement valide prêt à l'emploi.

## ✨ Fonctionnalités

* **🔐 Authentification sécurisée :** Gère automatiquement la récupération des tokens CSRF et les cookies de session (`.ASPXAUTH`).
* **💰 Consultation du solde :** Récupère et affiche le solde restant sur le compte en temps réel.
* **📱 Génération de QR Code :** Demande un nouveau QR Code de paiement au serveur Izly et le sauvegarde localement sous forme d'image PNG.

## 🛠️ Prérequis

* Python 3.x installé sur votre machine.
* Un compte Izly actif.

## 🚀 Installation

1.  **Clonez ce dépôt** (ou téléchargez les fichiers) :
    ```bash
    git clone https://github.com/ELREBEU/IzlyPython.git
    ```

2.  **Installez les dépendances nécessaires** :
    ```bash
    pip install -r requirements.txt
    ```

## ⚙️ Configuration

Pour des raisons de sécurité, vos identifiants ne doivent jamais être écrits en dur dans le code. Ce projet utilise un fichier d'environnement.

1.  Renommez le fichier `.env.example` en `.env` :
    ```bash
    cp .env.example .env
    ```

2.  Ouvrez le fichier `.env` et renseignez vos informations :
    ```ini
    MAIL=votre.email@exemple.fr
    CODE=123456
    ```
    * `MAIL` : Votre identifiant de connexion Izly (email ou téléphone).
    * `CODE` : Votre code secret à 6 chiffres.

## ▶️ Utilisation

Lancez simplement le script principal :

```bash
python3 main.py