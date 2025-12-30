from app.db.supabase import supabase
from datetime import datetime
from typing import Optional

class BotService:
    """
    Service for creating automated bot messages in trading sessions.
    Messages appear in the chat UI to guide users through the trading flow.
    """
    
    @staticmethod
    def create_message(
        session_id: str,
        content: str,
        icon_type: str = "INFO"
    ) -> dict:
        """
        Creates a bot message in the chat_messages table.
        
        Args:
            session_id: UUID of the trade session
            content: Message text to display
            icon_type: Icon category - 'INFO', 'SUCCESS', 'WARNING', 'MONEY', 'QR'
            
        Returns:
            Created message record
        """
        message_data = {
            "session_id": session_id,
            "sender": "SYSTEM",
            "content": content,
            "icon_type": icon_type,
            "created_at": datetime.utcnow().isoformat()
        }
        
        result = supabase.table("chat_messages").insert(message_data).execute()
        return result.data[0] if result.data else None

# Singleton instance
bot = BotService()
