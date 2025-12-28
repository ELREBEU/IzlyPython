
// Simulation of backend state
let mockState = {
    balance: 12.50,
    transactions: [
        { id: 1, label: "Resto U", amount: -3.30, type: "payment", date: "2023-10-25T12:30:00" },
        { id: 2, label: "Rechargement CB", amount: 20.00, type: "topup", date: "2023-10-24T18:15:00" },
        { id: 3, label: "Cafétéria", amount: -1.50, type: "payment", date: "2023-10-24T08:45:00" },
        { id: 4, label: "Resto U", amount: -3.30, type: "payment", date: "2023-10-23T12:35:00" },
        { id: 5, label: "Rechargement CB", amount: 10.00, type: "topup", date: "2023-10-20T09:00:00" },
    ]
};

const DELAY = 500;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
    auth: {
        login: async (email, password) => {
            await delay(DELAY);
            if (email === "demo" && password === "demo") {
                return { token: "fake-jwt-token", user: { firstName: "Jean", lastName: "Dupont" } };
            }
            throw new Error("Identifiants invalides");
        }
    },
    wallet: {
        getBalance: async () => {
            await delay(DELAY);
            return { balance: mockState.balance };
        },
        topup: async (amount) => {
            await delay(DELAY);
            if (amount < 10) throw new Error("Le montant minimum est de 10€");
            mockState.balance += amount;
            mockState.transactions.unshift({
                id: Date.now(),
                label: "Rechargement CB",
                amount: amount,
                type: "topup",
                date: new Date().toISOString()
            });
            return { success: true, newBalance: mockState.balance };
        }
    },
    transactions: {
        getHistory: async () => {
            await delay(DELAY);
            return [...mockState.transactions];
        }
    },
    payment: {
        getToken: async () => {
            await delay(DELAY);
            return { token: "qr-token-" + Date.now() };
        }
    }
};
