# Frontend Integration Guide: Mon Identifiant Izly QR Code

## Overview

This guide shows how to integrate the new Izly Identifier QR code endpoint into your frontend React application.

## API Endpoint

**GET** `/api/auth/my-izly-identifier-qr/{user_id}`

### Parameters
- `user_id` (path parameter): The Supabase user UUID

### Response
```json
{
  "qr_code_base64": "iVBORw0KGgoAAAANSUhEUgAA..."
}
```

### Error Responses
- `404`: User profile not found or QR code not generated yet
- `500`: Server error

---

## Step 1: Add API Function

Add this to `/frontend-web/src/services/api.js`:

```javascript
// Get My Izly Identifier QR Code (cached from Supabase)
export const getMyIzlyIdentifierQR = async (userId) => {
  try {
    const response = await apiClient.get(`/api/auth/my-izly-identifier-qr/${userId}`);
    return response.data.qr_code_base64;
  } catch (error) {
    console.error('Failed to fetch Izly identifier QR:', error);
    throw error;
  }
};
```

---

## Step 2: Create React Component

Create a new page component (example: `/frontend-web/src/pages/MyIzlyIdentifier.jsx`):

```jsx
import { useState, useEffect } from 'react';
import { getMyIzlyIdentifierQR } from '../services/api';

const MyIzlyIdentifier = () => {
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get user ID from your auth context/state
  const userId = localStorage.getItem('user_id'); // Adjust based on your auth implementation
  
  useEffect(() => {
    const fetchQR = async () => {
      try {
        setLoading(true);
        const base64QR = await getMyIzlyIdentifierQR(userId);
        setQrCode(`data:image/png;base64,${base64QR}`);
      } catch (err) {
        if (err.response?.status === 404) {
          setError("QR code non disponible. Veuillez réimporter vos données Izly.");
        } else {
          setError("Erreur lors du chargement du QR code.");
        }
      } finally {
        setLoading(false);
      }
    };
    
    if (userId) {
      fetchQR();
    }
  }, [userId]);
  
  return (
    <div className="my-izly-identifier-page">
      <h1>Mon identifiant Izly</h1>
      
      {loading && <p>Chargement...</p>}
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}
      
      {qrCode && !loading && (
        <div className="qr-container">
          <img 
            src={qrCode} 
            alt="Mon identifiant Izly" 
            className="qr-code-image"
          />
          <p className="qr-description">
            Présentez ce QR code pour vous identifier
          </p>
        </div>
      )}
    </div>
  );
};

export default MyIzlyIdentifier;
```

---

## Step 3: Add Styling

Example CSS for the QR code display:

```css
.my-izly-identifier-page {
  padding: 2rem;
  text-align: center;
}

.qr-container {
  margin-top: 2rem;
  padding: 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  margin: 2rem auto;
}

.qr-code-image {
  width: 100%;
  max-width: 300px;
  height: auto;
  border-radius: 8px;
}

.qr-description {
  margin-top: 1rem;
  color: #666;
  font-size: 0.9rem;
}

.error-message {
  padding: 1rem;
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 8px;
  color: #c33;
  margin: 1rem auto;
  max-width: 400px;
}
```

---

## Step 4: Add Route

Add the route to your router configuration:

```javascript
import MyIzlyIdentifier from './pages/MyIzlyIdentifier';

// In your router setup
<Route path="/my-izly-identifier" element={<MyIzlyIdentifier />} />
```

---

## Important Notes

1. **Database Migration Required**: Before using this feature, ensure you've added the `izly_identifier_qr_base64` column to your Supabase `profiles` table:
   ```sql
   ALTER TABLE profiles 
   ADD COLUMN izly_identifier_qr_base64 TEXT;
   ```

2. **First-Time Users**: Users who haven't imported their Izly data yet will get a 404 error. Make sure to handle this gracefully and direct them to the import flow.

3. **Re-import for Existing Users**: Users who imported their data before this feature was implemented will need to re-run `/api/auth/import-izly` once to generate and cache their QR code.

4. **User ID Source**: Adjust the `userId` retrieval based on your authentication implementation (Supabase Auth, JWT token, local storage, etc.).

---

## Testing

Test the integration:

1. Import Izly data via `/api/auth/import-izly`
2. Navigate to `/my-izly-identifier` in your app
3. Verify the QR code displays correctly
4. Test error handling by using an invalid user ID
