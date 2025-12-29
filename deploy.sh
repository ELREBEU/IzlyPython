#!/bin/bash

# Izly Trading - Script de déploiement automatique
# Lance tous les services dans des terminaux séparés

set -e  # Arrêter en cas d'erreur

echo "🚀 Démarrage de Izly Trading..."
echo ""

# Couleurs pour les logs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour détecter le terminal
detect_terminal() {
    if command -v gnome-terminal &> /dev/null; then
        echo "gnome-terminal"
    elif command -v xterm &> /dev/null; then
        echo "xterm"
    elif command -v konsole &> /dev/null; then
        echo "konsole"
    else
        echo "default"
    fi
}

TERMINAL=$(detect_terminal)

# 1. Supabase (Docker Compose)
echo -e "${BLUE}[1/3]${NC} Lancement de Supabase..."
if [ "$TERMINAL" = "gnome-terminal" ]; then
    gnome-terminal --title="Supabase" -- bash -c "cd backend/supabase && docker-compose up; exec bash"
elif [ "$TERMINAL" = "xterm" ]; then
    xterm -title "Supabase" -hold -e "cd backend/supabase && docker-compose up" &
elif [ "$TERMINAL" = "konsole" ]; then
    konsole --title "Supabase" -e bash -c "cd backend/supabase && docker-compose up; exec bash" &
else
    echo -e "${YELLOW}⚠️  Terminal non détecté. Lancez manuellement:${NC}"
    echo "   cd backend/supabase && docker-compose up"
fi
sleep 2

# 2. Backend Python (FastAPI)
echo -e "${BLUE}[2/3]${NC} Lancement du Backend FastAPI..."
if [ "$TERMINAL" = "gnome-terminal" ]; then
    gnome-terminal --title="Backend FastAPI" -- bash -c "cd backend && source venv/bin/activate && uvicorn app.main:app --reload; exec bash"
elif [ "$TERMINAL" = "xterm" ]; then
    xterm -title "Backend FastAPI" -hold -e "cd backend && source venv/bin/activate && uvicorn app.main:app --reload" &
elif [ "$TERMINAL" = "konsole" ]; then
    konsole --title "Backend FastAPI" -e bash -c "cd backend && source venv/bin/activate && uvicorn app.main:app --reload; exec bash" &
else
    echo -e "${YELLOW}⚠️  Terminal non détecté. Lancez manuellement:${NC}"
    echo "   cd backend && source venv/bin/activate && uvicorn app.main:app --reload"
fi
sleep 2

# 3. Frontend (Vite + React)
echo -e "${BLUE}[3/3]${NC} Lancement du Frontend React..."
if [ "$TERMINAL" = "gnome-terminal" ]; then
    gnome-terminal --title="Frontend React" -- bash -c "cd frontend-web && npm run dev -- --host; exec bash"
elif [ "$TERMINAL" = "xterm" ]; then
    xterm -title "Frontend React" -hold -e "cd frontend-web && npm run dev -- --host" &
elif [ "$TERMINAL" = "konsole" ]; then
    konsole --title "Frontend React" -e bash -c "cd frontend-web && npm run dev -- --host; exec bash" &
else
    echo -e "${YELLOW}⚠️  Terminal non détecté. Lancez manuellement:${NC}"
    echo "   cd frontend-web && npm run dev -- --host"
fi

echo ""
echo -e "${GREEN}✅ Tous les services ont été lancés !${NC}"
echo ""
echo "📍 URLs d'accès :"
echo "   - Frontend : http://localhost:5173"
echo "   - Backend API : http://localhost:8000"
echo "   - Backend Docs : http://localhost:8000/docs"
echo "   - Supabase Studio : http://localhost:54323"
echo ""
echo "Pour arrêter tous les services, fermez les terminaux ou appuyez sur Ctrl+C dans chaque fenêtre."
