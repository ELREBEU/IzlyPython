// Mock data étendue pour Izly Trading avec utilisateurs réalistes
export const CURRENT_USER = {
    id: "user_nolan",
    name: "Nolan",
    email: "nolan@example.com",
    role: "buyer",
    lat: 43.6107,
    lng: 3.8767,
    wallet: 12.50,
    rating: 5.0,
    trades_count: 0,
    tariff_code: "97" // Non boursier
};

export const AVAILABLE_SELLERS = [
    {
        id: "seller_kader",
        name: "Kader B.",
        initial: "K",
        role: "seller",
        tariff_code: "98", // Boursier
        price: 1.50,
        payout: 1.20, // Ce qu'il gagne
        izly_cost: 1.00, // Coût réel
        lat: 43.6110,
        lng: 3.8770,
        time_left: "15 min",
        rating: 4.8,
        distance: "200m",
        trades_count: 23
    },
    {
        id: "seller_mehdi",
        name: "Mehdi A.",
        initial: "M",
        role: "super_seller",
        tariff_code: "35", // Alternant
        price: 1.50,
        payout: 0.50,
        izly_cost: 0.30,
        lat: 43.6095,
        lng: 3.8755,
        time_left: "40 min",
        rating: 5.0,
        distance: "450m",
        trades_count: 47
    },
    {
        id: "seller_sarah",
        name: "Sarah L.",
        initial: "S",
        role: "seller",
        tariff_code: "98",
        price: 1.50,
        payout: 1.20,
        izly_cost: 1.00,
        lat: 43.6120,
        lng: 3.8790,
        time_left: "25 min",
        rating: 4.9,
        distance: "350m",
        trades_count: 12
    }
];

export const BOT_LOGS = [
    {
        id: 1,
        type: "info",
        text: "Bienvenue dans la zone de trading Izly.",
        time: "12:00"
    },
    {
        id: 2,
        type: "success",
        text: "Code de Kader récupéré avec succès.",
        time: "12:05"
    },
    {
        id: 3,
        type: "warning",
        text: "Vérification du solde en cours...",
        time: "12:06"
    },
    {
        id: 4,
        type: "success",
        text: "Transaction validée : 1,50€ débités.",
        time: "12:07"
    }
];

// Mock des favoris de l'utilisateur
export const USER_FAVORITES = [
    "seller_kader",
    "seller_mehdi"
];

// Mock d'une session de trade en cours
export const MOCK_TRADE_SESSION = {
    id: "session_001",
    offer_id: "offer_kader_001",
    buyer_id: "user_nolan",
    seller_id: "seller_kader",
    seller_name: "Kader B.",
    agreed_price: 1.50,
    status: "QR_SENT", // CREATED, QR_SENT, CHECKING, FINALIZED
    created_at: new Date().toISOString(),
    messages: [
        {
            sender: "SYSTEM",
            content: "Réservation confirmée avec Kader B.",
            time: "12:05"
        },
        {
            sender: "SYSTEM",
            content: "QR Code envoyé. Bon appétit !",
            time: "12:06"
        }
    ]
};

// Statuts possibles pour les offres
export const OFFER_STATUS = {
    OPEN: "OPEN",       // Visible sur la carte
    LOCKED: "LOCKED",   // Réservé par un acheteur
    COMPLETED: "COMPLETED", // Transaction terminée
    CANCELLED: "CANCELLED"  // Annulé par le vendeur
};

// Statuts possibles pour les trades
export const TRADE_STATUS = {
    CREATED: "CREATED",     // Réservation faite
    QR_SENT: "QR_SENT",     // QR code envoyé
    CHECKING: "CHECKING",   // Vérification en cours
    FINALIZED: "FINALIZED", // Terminé
    DISPUTE: "DISPUTE"      // Litige ouvert
};
