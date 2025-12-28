# 🥗 IZLY TRADING - Marketplace de Droits Universitaires

> **Le "Uber" du repas Crous.** > Une plateforme d'arbitrage qui permet aux étudiants boursiers de monétiser leurs avantages tarifaires auprès d'étudiants non-boursiers.

---

## 📖 Le Concept

Izly Trading est une application qui clone l'interface officielle Izly tout en ajoutant une couche de marketplace. Elle connecte deux besoins :
1.  **Le Vendeur (Boursier)** : Dispose de repas à 1€ (ou 0,30€) qu'il ne consomme pas toujours. Il souhaite récupérer du *vrai* argent (cash) plutôt que d'avoir un solde bloqué sur sa carte étudiante.
2.  **L'Acheteur (Non-Boursier)** : Paye ses repas 3,30€ et cherche une alternative moins chère.

L'application joue le rôle de tiers de confiance, gère la mise en relation, sécurise la transaction et prend une commission sur l'échange.

---

## 👥 Les Acteurs (Personas)

L'application identifie automatiquement le statut de l'utilisateur via un scraping de son profil Crous (Code Tarif).

### 1. KADER (Le Vendeur / Boursier)
* **Statut :** Boursier (Code Tarif 97).
* **Coût réel au Crous :** 1,00 €.
* **Motivation :** Transformer son solde Izly "virtuel" en virement bancaire réel.
* **Action :** Met son QR Code en location quand il ne mange pas au RU.

### 2. MEHDI (Le Super-Vendeur / Alternant)
* **Statut :** Précaire / Alternant (Code Tarif 35).
* **Coût réel au Crous :** 0,30 €.
* **Motivation :** Maximiser son profit grâce à une marge très élevée.

### 3. ABDEL (L'Acheteur / Non-Boursier)
* **Statut :** Étudiant classique (Code Tarif 01).
* **Coût réel au Crous :** 3,30 €.
* **Motivation :** Manger pour 1,50 € ou 2,00 € (économie significative).
* **Action :** Paye via l'application pour obtenir un code valide.

---

## 💰 Aspect Financier & Business Model

L'application fonctionne sur un modèle d'**arbitrage**. Le prix d'achat pour Abdel est fixe, mais le coût de revient dépend du vendeur (Kader ou Mehdi). L'application encaisse la différence.

### Les Deux Portefeuilles
Pour comprendre le flux, il faut distinguer deux types d'argent :
1.  **Le Solde Izly (Réel) :** L'argent stocké chez le Crous. On ne peut pas le toucher. Il diminue quand le vendeur prête son code.
2.  **Le Wallet App (Virtuel) :** L'argent gagné sur notre plateforme. Il augmente à chaque vente. Le vendeur peut virer cet argent sur son compte bancaire (Payout).

### Flux de Trésorerie (Exemple pour un repas vendu 1,50 €)

| Type de Vendeur | Coût Crous (Débité sur Izly) | Prix payé par Abdel | Remboursement Vendeur | Bonus Vendeur | **Marge App (Net)** |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Kader (Boursier)** | 1,00 € | 1,50 € | 1,00 € | + 0,20 € | **0,30 €** |
| **Mehdi (Alternant)** | 0,30 € | 1,50 € | 0,30 € | + 0,20 € | **1,00 €** |

> **Stratégie d'Algorithme :** Lors d'une commande, le backend privilégie toujours les vendeurs à bas coût (Mehdi) pour maximiser la marge de l'application.

---

## 🔄 Workflow Transactionnel (Parcours Utilisateur)

### Étape 1 : Matching & Caution
* **Kader** active le mode "Vente".
* **Abdel** commande un repas.
* 🔒 **Sécurité :** L'application effectue une **empreinte bancaire (Pre-authorization)** de 5,00 € sur la carte d'Abdel via Stripe (ou Apple Pay). Aucun débit n'est effectué, la somme est juste "gelée" pour garantir la solvabilité en cas d'abus.

### Étape 2 : Consommation
* L'application affiche le QR Code de Kader sur le téléphone d'Abdel.
* Abdel passe en caisse au Crous.
* Le compte Izly de Kader est débité (ex: 1,00 €).

### Étape 3 : Détection & Régularisation
Quelques minutes plus tard, le **Backend Python** scanne l'historique de Kader.

* **Cas Nominal (Honnête) :**
    * Le robot voit un débit de 1,00 €.
    * L'appli capture 1,50 € sur la carte d'Abdel.
    * La caution est relâchée.
    * Kader est crédité de 1,20 € sur son Wallet App.

* **Cas d'Abus (Dépassement) :**
    * Abdel a pris une canette en plus. Le robot voit un débit de **3,00 €**.
    * L'appli capture **3,50 €** sur la carte d'Abdel (Coût réel + Frais).
    * Kader est crédité de 3,20 € sur son Wallet App (Remboursement total + Bonus).

---

## 🛠 Architecture Technique

### Frontend (La Vitrine)
* **Framework :** React 18+ (Vite).
* **Style :** Tailwind CSS (Clone pixel-perfect du design Izly).
* **Format :** PWA (Progressive Web App) pour une expérience mobile native.

### Backend (L'Intelligence)
* **Langage :** Python (FastAPI).
* **Scraping Engine :** Utilise `requests` et `BeautifulSoup` pour se connecter légitimement aux comptes Izly, récupérer les soldes et surveiller les transactions.
* **Gestionnaire de Tâches :** Vérifie périodiquement les comptes vendeurs actifs.

### Base de Données
* **Provider :** Supabase (PostgreSQL).
* **Données Critiques :**
    * Tokens de session Izly (chiffrés).
    * Historique des transactions internes.
    * Statuts utilisateurs (Table `tariffs`).

### Paiements
* **Provider :** Stripe.
* **Mécanismes :**
    * `SetupIntent` pour enregistrer la carte.
    * `PaymentIntent` (Capture manuelle) pour le prélèvement post-consommation.
    * Support natif Apple Pay / Google Pay.

---

## 🛡 Sécurité "Anti-Gruge"

Pour empêcher un acheteur de vider le compte Izly d'un vendeur :

1.  **Pré-requis Vendeur :** Kader doit avoir un solde Izly suffisant (Buffer de sécurité > 5€) pour proposer son code.
2.  **Pré-requis Acheteur :** Abdel doit lier un moyen de paiement valide capable de supporter une caution.
3.  **Régularisation Automatique :** Le système de "Watchdog" vérifie le montant *réel* débité par le Crous et ajuste le prélèvement final sur l'acheteur. **Kader ne perd jamais d'argent.**