# Sysconfig API Integration Setup

This guide explains how to configure the phone number selection to fetch data from your Sysconfig API.

## Configuration

### 1. Environment Variables

Create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

For production:
```bash
NEXT_PUBLIC_API_BASE_URL=https://api.sysconfig.com/api
```

### 2. API Endpoints Expected

The integration expects the following Sysconfig API endpoints:

#### Get Available Numbers
```
GET /api/numbers/available?country=UK
```

**Response Format:**
```json
{
  "data": [
    {
      "number": "+44 20 7946 0958",
      "location": "London, UK",
      "country": "UK",
      "area": "London"
    }
  ]
}
```

#### Purchase Number
```
POST /api/numbers/purchase
Content-Type: application/json

{
  "number": "+44 20 7946 0958"
}
```

**Response Format:**
```json
{
  "success": true,
  "message": "Number purchased successfully"
}
```

### 3. Authentication (Optional)

If your API requires authentication, update `lib/api.ts` to include auth headers:

```typescript
headers: {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`, // Add your auth token
}
```

### 4. Customizing API Endpoints

If your Sysconfig API uses different endpoints, update the functions in `lib/api.ts`:

- `fetchAvailableNumbers()` - Change the URL path
- `purchaseNumber()` - Change the URL path and request body format

## Testing

1. Start your Sysconfig API server
2. Set the `NEXT_PUBLIC_API_BASE_URL` environment variable
3. Run the Next.js app: `npm run dev`
4. Navigate to the phone number selection step in onboarding

## Fallback Behavior

If the API is unavailable:
- The page will show an error message
- Users can retry loading numbers
- Consider implementing a fallback to cached/mock data if needed

