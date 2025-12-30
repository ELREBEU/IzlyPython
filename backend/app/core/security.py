from cryptography.fernet import Fernet
import os
from dotenv import load_dotenv

# Load .env file explicitly
load_dotenv()

class SecurityService:
    """
    Encryption service for securing Izly credentials in database.
    Uses Fernet (symmetric encryption) from cryptography library.
    """
    
    def __init__(self):
        # Load encryption key from environment
        key = os.getenv("ENCRYPTION_KEY")
        
        if not key:
            raise ValueError(
                "ENCRYPTION_KEY not found in environment. "
                "Generate one with: python -c \"from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())\""
            )
        
        self.cipher = Fernet(key.encode())
    
    def encrypt(self, plain_text: str) -> str:
        """
        Encrypts a plaintext string.
        
        Args:
            plain_text: The text to encrypt (e.g., password)
            
        Returns:
            Encrypted string (Base64 encoded)
        """
        if not plain_text:
            return ""
        
        encrypted_bytes = self.cipher.encrypt(plain_text.encode())
        return encrypted_bytes.decode()
    
    def decrypt(self, encrypted_text: str) -> str:
        """
        Decrypts an encrypted string.
        
        Args:
            encrypted_text: The encrypted text (Base64 encoded)
            
        Returns:
            Decrypted plaintext string
        """
        if not encrypted_text:
            return ""
        
        decrypted_bytes = self.cipher.decrypt(encrypted_text.encode())
        return decrypted_bytes.decode()

# Singleton instance
security = SecurityService()
