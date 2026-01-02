import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

// Load credentials from localStorage if available
const savedCredentials = JSON.parse(localStorage.getItem('izly_credentials') || '{}');

console.log("📦 Loaded from localStorage:", savedCredentials);

let currentCredentials = {
    email: savedCredentials.email || '',
    password: savedCredentials.password || '',
    userId: savedCredentials.userId || ''
};

console.log("🔑 Current credentials state:", {
    email: currentCredentials.email || 'EMPTY',
    password: currentCredentials.password ? '***' : 'EMPTY',
    userId: currentCredentials.userId || 'EMPTY'
});

export const api = {
    auth: {
        login: async (email, password) => {
            try {
                console.log(`🔑 Login attempt for email: ${email}`);

                // Le backend génère automatiquement l'UUID basé sur l'email
                const response = await axios.post(`${API_URL}/auth/import-izly`, {
                    email,
                    password
                    // user_id_supabase: ❌ NON ENVOYÉ - auto-généré par le backend !
                });

                console.log('✅ Backend response:', response.data);

                // Store credentials + user_id returned from backend
                const userId = response.data.user_id;
                currentCredentials.email = email;
                currentCredentials.password = password;
                currentCredentials.userId = userId;

                // Persist to localStorage
                localStorage.setItem('izly_credentials', JSON.stringify(currentCredentials));

                console.log(`✅ Logged in successfully with user_id: ${userId}`);

                return {
                    user: response.data.profile,
                    token: "session-active"
                };
            } catch (error) {
                console.error("❌ Login error:", error.response?.data || error.message);
                throw new Error(error.response?.data?.detail || "Erreur de connexion");
            }
        },
        logout: () => {
            currentCredentials = { email: '', password: '', userId: '' };
            localStorage.removeItem('izly_credentials');
            console.log('🚪 Logged out');
        },
        getMyIzlyIdentifierQR: async () => {
            try {
                if (!currentCredentials.email || !currentCredentials.password) {
                    throw new Error("Credentials missing");
                }
                const response = await axios.post(`${API_URL}/auth/my-izly-identifier-qr`, {
                    email: currentCredentials.email,
                    password: currentCredentials.password
                });
                return response.data.qr_code_base64;
            } catch (error) {
                console.error("My Izly Identifier QR error:", error);
                throw error;
            }
        }
    },
    wallet: {
        getBalance: async () => {
            try {
                if (!currentCredentials.userId) {
                    console.warn('No userId, returning 0 balance');
                    return { balance: 0.0 };
                }
                const response = await axios.get(`${API_URL}/users/wallet/${currentCredentials.userId}`);
                return { balance: response.data.izly_balance };
            } catch (error) {
                console.error("Get balance error:", error);
                return { balance: 0.0 };
            }
        },
        topup: async (amount) => {
            console.warn("Topup not implemented in backend");
            return { success: true, newBalance: 0 };
        }
    },
    transactions: {
        getHistory: async () => {
            try {
                if (!currentCredentials.userId) {
                    console.warn('No userId, returning empty transactions');
                    return [];
                }
                const response = await axios.get(`${API_URL}/users/transactions/${currentCredentials.userId}`);
                return response.data.map(tx => ({
                    id: tx.id,
                    label: tx.label,
                    amount: tx.amount,
                    type: tx.type,
                    date: tx.izly_date
                }));
            } catch (error) {
                console.error("Get transactions error:", error);
                return [];
            }
        }
    },
    profile: {
        getProfile: async () => {
            try {
                if (!currentCredentials.userId) {
                    console.warn('No userId, cannot get profile');
                    return null;
                }
                const response = await axios.get(`${API_URL}/users/profile/${currentCredentials.userId}`);
                return response.data;
            } catch (error) {
                console.error("Get profile error:", error);
                return null;
            }
        },
        syncWithIzly: async () => {
            try {
                if (!currentCredentials.email || !currentCredentials.password) {
                    throw new Error("Identifiants manquants pour la synchronisation");
                }
                console.log("🔄 Starting background sync with Izly...");
                const response = await axios.post(`${API_URL}/auth/import-izly`, {
                    email: currentCredentials.email,
                    password: currentCredentials.password
                });
                console.log("✅ Sync successful:", response.data);
                return response.data.profile;
            } catch (error) {
                console.error("Sync error:", error);
                throw error;
            }
        }
    },
    payment: {
        getQRCode: async () => {
            try {
                // Check if we have credentials
                if (!currentCredentials.email || !currentCredentials.password) {
                    throw new Error("Credentials missing. Please login again.");
                }

                console.log("🔍 Sending QR code request...");

                const response = await axios.post(`${API_URL}/auth/qr-code`, {
                    email: currentCredentials.email,
                    password: currentCredentials.password
                });
                console.log("✅ QR Code received successfully");
                return response.data; // Return full response with expiration
            } catch (error) {
                console.error("❌ QR Code error:", error);
                console.error("Error response:", error.response?.data);
                throw error;
            }
        }
    },
    trade: {
        bookOffer: async (offerId, password) => {
            try {
                if (!currentCredentials.userId) throw new Error("User ID missing");

                // We need to send the password again for security verification in book_trade
                const response = await axios.post(`${API_URL}/trade/book/${offerId}`, {
                    buyer_id: currentCredentials.userId,
                    email: currentCredentials.email,
                    password: password || currentCredentials.password // Use passed password or stored one
                });
                return response.data;
            } catch (error) {
                console.error("Book offer error:", error);
                throw error;
            }
        },
        getChat: async (sessionId) => {
            try {
                const response = await axios.get(`${API_URL}/trade/chat/${sessionId}`);
                return response.data;
            } catch (error) {
                console.error("Get chat error:", error);
                return [];
            }
        },
        regenerateQR: async (sessionId) => {
            try {
                if (!currentCredentials.userId) throw new Error("User ID missing");

                const response = await axios.post(`${API_URL}/trade/regenerate/${sessionId}`, {
                    buyer_id: currentCredentials.userId
                });
                return response.data;
            } catch (error) {
                console.error("Regenerate QR error:", error);
                throw error;
            }
        },
        getHistory: async (userId) => {
            try {
                const response = await axios.get(`${API_URL}/trade/history/${userId}`);
                return response.data;
            } catch (error) {
                console.error("Get trade history error:", error);
                return [];
            }
        }
    },
    market: {
        listOffers: async () => {
            try {
                const response = await axios.get(`${API_URL}/market/offers`);
                return response.data;
            } catch (error) {
                console.error("List offers error:", error);
                return [];
            }
        },
        shareCode: async (password) => {
            try {
                if (!currentCredentials.email) throw new Error("Email missing");

                const response = await axios.post(`${API_URL}/market/share-my-code`, {
                    izly_login: currentCredentials.email,
                    izly_password: password || currentCredentials.password
                });
                return response.data;
            } catch (error) {
                console.error("Share code error:", error);
                throw error;
            }
        }
    }
};
