# MedRef API Documentation

## Overview

MedRef API provides RESTful endpoints for managing medical reference data including drugs, herbals, clinical notes, symptoms, and drug interactions. The API follows standard HTTP conventions and returns JSON responses.

**Base URL:** `https://medref.app/api` (Production)  
**Base URL:** `http://localhost:3000/api` (Development)

## Authentication

MedRef uses NextAuth.js for authentication. Most read endpoints are publicly accessible, while write operations require authentication.

### Authentication Headers

Include the session token in requests:

```
Cookie: next-auth.session-token=<token>
```

### Authentication Endpoints

#### POST /api/auth/register

Register a new user account.

**Request Body:**
```json
{
  "email": "doctor@hospital.com",
  "password": "SecurePass123!",
  "name": "Dr. John Smith",
  "role": "DOCTOR"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "clh123456789",
    "email": "doctor@hospital.com",
    "name": "Dr. John Smith",
    "role": "DOCTOR"
  }
}
```

---

## Drugs API

### GET /api/drugs

Retrieve a paginated list of drugs.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | integer | 1 | Page number |
| limit | integer | 20 | Items per page (max 100) |
| class | string | - | Filter by drug class |
| search | string | - | Search by name or generic name |

**Example Request:**
```
GET /api/drugs?page=1&limit=20&class=antibiotik&search=amoxicillin
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "clh123456789",
      "name": "Amoxicillin",
      "genericName": "Amoxicillin Trihydrate",
      "drugClass": "antibiotik",
      "doses": [...],
      "indications": [...],
      "_count": {
        "interactions": 5,
        "contraindications": 3
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### GET /api/drugs/[id]

Retrieve detailed information about a specific drug.

**Response (200):**
```json
{
  "id": "clh123456789",
  "name": "Amoxicillin",
  "genericName": "Amoxicillin Trihydrate",
  "brandNames": "Amoxil, Biomox, Trimox",
  "drugClass": "antibiotik",
  "mechanism": "Inhibits bacterial cell wall synthesis",
  "route": "oral",
  "halfLife": "1-1.5 hours",
  "pregnancyCat": "B",
  "doses": [
    {
      "indication": "Bacterial infection",
      "adultDose": "250-500 mg every 8 hours",
      "pediatricDose": "20-40 mg/kg/day divided q8h",
      "maxDose": "3000 mg",
      "frequency": "q8h"
    }
  ],
  "indications": [
    {
      "indication": "Otitis Media",
      "icdCode": "H66.9",
      "priority": 1
    }
  ],
  "contraindications": [
    {
      "contraindication": "Penicillin hypersensitivity",
      "severity": "absolut"
    }
  ],
  "interactions": [
    {
      "interactingDrug": {
        "id": "clh987654321",
        "name": "Warfarin"
      },
      "interactionType": "moderat",
      "effect": "Increased anticoagulant effect",
      "management": "Monitor INR closely"
    }
  ]
}
```

### POST /api/drugs

Create a new drug entry. Requires authentication with DOCTOR, PHARMACIST, or ADMIN role.

**Request Body:**
```json
{
  "name": "New Drug",
  "genericName": "Generic Name",
  "brandNames": ["Brand1", "Brand2"],
  "drugClass": "analgesik",
  "mechanism": "Mechanism of action",
  "route": "oral",
  "halfLife": "4 hours",
  "pregnancyCat": "C"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { ... },
  "message": "Obat berhasil dibuat"
}
```

---

## Herbals API

### GET /api/herbals

Retrieve a paginated list of herbal medicines.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | integer | 1 | Page number |
| limit | integer | 20 | Items per page |
| safety | string | - | Filter by safety rating (aman, hati-hati, tidak-aman) |
| search | string | - | Search by name |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "clh123456789",
      "name": "Jahe",
      "latinName": "Zingiber officinale",
      "safetyRating": "aman",
      "category": "digestive"
    }
  ],
  "pagination": { ... }
}
```

### GET /api/herbals/[id]

Retrieve detailed herbal medicine information including:
- Traditional uses
- Active compounds
- Preparation methods
- Safety information
- Drug interactions

---

## Clinical Notes API

### GET /api/notes

Retrieve clinical notes and reference materials.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | integer | 1 | Page number |
| limit | integer | 20 | Items per page |
| category | string | - | Filter by specialty category |
| search | string | - | Search by title or content |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "clh123456789",
      "title": "Diabetes Management Protocol",
      "category": "Endocrinology",
      "specialty": "Endocrinology",
      "tags": "diabetes,protocol,insulin",
      "version": 1
    }
  ],
  "pagination": { ... }
}
```

---

## Symptoms API

### GET /api/symptoms

Retrieve list of symptoms with associated conditions.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "clh123456789",
      "name": "Demam",
      "description": "Peningkatan suhu tubuh di atas normal",
      "icdCode": "R50",
      "relatedDrugs": [...]
    }
  ],
  "pagination": { ... }
}
```

---

## Drug Interaction Checker

### POST /api/interaksi/check

Check for interactions between multiple drugs.

**Request Body:**
```json
{
  "drugIds": ["clh123456789", "clh987654321", "clh555555555"]
}
```

**Response (200):**
```json
{
  "success": true,
  "interactions": [
    {
      "drug1": {
        "id": "clh123456789",
        "name": "Warfarin"
      },
      "drug2": {
        "id": "clh987654321",
        "name": "Amoxicillin"
      },
      "interactionType": "moderat",
      "effect": "Increased bleeding risk",
      "mechanism": "Alteration of intestinal flora",
      "management": "Monitor INR, consider alternative antibiotic"
    }
  ],
  "summary": {
    "mayor": 0,
    "moderat": 1,
    "minor": 0
  }
}
```

---

## Search API

### GET /api/search

Global search across all content types.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| q | string | - | Search query (required) |
| type | string | all | Filter by type: drugs, herbals, notes, symptoms |
| limit | integer | 10 | Maximum results |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "drugs": [...],
    "herbals": [...],
    "notes": [...],
    "symptoms": [...]
  },
  "total": 25
}
```

---

## Favorites API

### GET /api/favorites

Retrieve user's favorite items. Requires authentication.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "drugs": [...],
    "herbals": [...],
    "notes": [...]
  }
}
```

### POST /api/favorites

Add item to favorites.

**Request Body:**
```json
{
  "itemType": "drug",
  "itemId": "clh123456789"
}
```

### DELETE /api/favorites/[id]

Remove item from favorites.

---

## Error Responses

All endpoints return consistent error responses:

**400 Bad Request:**
```json
{
  "success": false,
  "errors": ["Name is required", "Invalid drug class"]
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "error": "Unauthorized"
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "error": "Forbidden"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "error": "Drug not found"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": "Gagal mengambil data obat"
}
```

---

## Rate Limiting

API endpoints are rate-limited:

- **Read operations:** 100 requests per minute
- **Write operations:** 30 requests per minute

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 60
```

---

## Data Validation

All input data is validated using Zod schemas:

### Drug Schema
```typescript
{
  name: string (required, max 200 chars)
  genericName: string (optional)
  brandNames: string[] (max 20 items)
  drugClass: enum (analgesik, antibiotik, antiviral, ...)
  route: enum (oral, iv, im, sc, topical, ...)
  pregnancyCat: enum (a, b, c, d, x, n)
}
```

### Pagination Schema
```typescript
{
  page: integer (min 1, max 1000, default 1)
  pageSize: integer (min 1, max 100, default 20)
}
```

---

## Role-Based Access Control

| Role | Read | Write | Delete | Admin |
|------|------|-------|--------|-------|
| ADMIN | ✅ | ✅ | ✅ | ✅ |
| DOCTOR | ✅ | ✅ | ❌ | ❌ |
| PHARMACIST | ✅ | ✅ (drugs, herbals) | ❌ | ❌ |
| NURSE | ✅ | ❌ | ❌ | ❌ |
| STUDENT | ✅ (limited) | ❌ | ❌ | ❌ |
| GUEST | ✅ (drugs, herbals) | ❌ | ❌ | ❌ |

---

## Webhooks (Coming Soon)

Future releases will support webhooks for:
- New drug additions
- Interaction updates
- Critical safety alerts

---

## SDK Examples

### JavaScript/TypeScript
```typescript
// Fetch drugs list
const response = await fetch('/api/drugs?page=1&limit=20');
const { data, pagination } = await response.json();

// Check interactions
const checkResponse = await fetch('/api/interaksi/check', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    drugIds: ['id1', 'id2', 'id3']
  })
});
const { interactions } = await checkResponse.json();
```

### cURL
```bash
# Get drug details
curl -X GET "https://medref.app/api/drugs/clh123456789"

# Search drugs
curl -X GET "https://medref.app/api/drugs?search=paracetamol"

# Check interactions
curl -X POST "https://medref.app/api/interaksi/check" \
  -H "Content-Type: application/json" \
  -d '{"drugIds": ["id1", "id2"]}'
```

---

## Versioning

The API is currently at version 1.0. Breaking changes will be announced and versioned appropriately.

---

## Support

For API support, please contact:
- GitHub Issues: https://github.com/medref/medref/issues
- Email: support@medref.app