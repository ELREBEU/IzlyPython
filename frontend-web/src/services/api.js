import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

// Helper to simulate delay if needed, but we are real now
// const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// We need to store credentials temporarily for the session (since we re-login for QR code)
// In a real production app, we would use a proper session/token flow.
// For this MVP, we will store them in memory or localStorage.
// Load credentials from localStorage if available
const savedCredentials = JSON.parse(localStorage.getItem('izly_credentials') || '{}');

let currentCredentials = {
    email: savedCredentials.email || '',
    password: savedCredentials.password || '',
    userId: savedCredentials.userId || '69722997-dcb6-4628-881c-0747f139ddeb'
};

export const api = {
    auth: {
        login: async (email, password) => {
            try {
                // Store credentials for future calls
                currentCredentials.email = email;
                currentCredentials.password = password;

                // Persist to localStorage
                localStorage.setItem('izly_credentials', JSON.stringify(currentCredentials));

                const response = await axios.post(`${API_URL}/auth/import-izly`, {
                    email,
                    password,
                    user_id_supabase: currentCredentials.userId
                });

                return {
                    user: response.data.profile,
                    token: "session-active"
                };
            } catch (error) {
                console.error("Login error:", error);
                throw new Error(error.response?.data?.detail || "Erreur de connexion");
            }
        },
        logout: () => {
            currentCredentials = { email: '', password: '', userId: '69722997-dcb6-4628-881c-0747f139ddeb' };
            localStorage.removeItem('izly_credentials');
        }
    },
    wallet: {
        getBalance: async () => {
            try {
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
    payment: {
        getQRCode: async () => {
            try {
                // Check if we have credentials
                if (!currentCredentials.email || !currentCredentials.password) {
                    throw new Error("Credentials missing. Please login again.");
                }

                const response = await axios.post(`${API_URL}/auth/qr-code`, {
                    email: currentCredentials.email,
                    password: currentCredentials.password
                });
                return response.data.qr_code_base64;
            } catch (error) {
                console.error("QR Code error:", error);
                throw error;
            }
        }
    }
};
