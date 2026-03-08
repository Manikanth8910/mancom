# Visitor Service API

**Status:** Not Implemented

Base URL: `http://localhost:3002`

## Overview

The visitor service manages visitor pre-registration and entry approvals for residential societies.

## Planned Endpoints

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| POST | /visitors | Required | resident+ | Create visitor entry |
| GET | /visitors | Required | resident+ | List visitors |
| GET | /visitors/:id | Required | resident+ | Get visitor details |
| PATCH | /visitors/:id/approve | Required | security+ | Approve entry |
| DELETE | /visitors/:id | Required | resident+ | Cancel visitor |
| GET | /health | Public | - | Health check |

---

## POST /visitors

Create a new visitor entry (pre-registration).

### Request

```http
POST /visitors
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Jane Smith",
  "phone": "+919876543210",
  "purpose": "delivery",
  "expectedDate": "2024-01-15",
  "expectedTime": "14:00",
  "vehicleNumber": "MH12AB1234",
  "notes": "Amazon delivery"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Visitor's name |
| `phone` | string | Yes | Contact number |
| `purpose` | string | Yes | Visit purpose (delivery, guest, service, other) |
| `expectedDate` | string | Yes | Expected date (YYYY-MM-DD) |
| `expectedTime` | string | No | Expected time (HH:mm) |
| `vehicleNumber` | string | No | Vehicle registration |
| `notes` | string | No | Additional notes |

### Response

**Success (201):**

```json
{
  "success": true,
  "data": {
    "id": "visitor-123",
    "name": "Jane Smith",
    "phone": "+919876543210",
    "purpose": "delivery",
    "expectedDate": "2024-01-15",
    "expectedTime": "14:00",
    "vehicleNumber": "MH12AB1234",
    "notes": "Amazon delivery",
    "status": "pending",
    "createdBy": "user-456",
    "flatId": "flat-789",
    "societyId": "society-abc",
    "createdAt": "2024-01-14T10:30:00.000Z"
  },
  "meta": {
    "timestamp": "2024-01-14T10:30:00.000Z"
  }
}
```

---

## GET /visitors

List visitors for the user's flat or society.

### Request

```http
GET /visitors?status=pending&page=1&limit=20
Authorization: Bearer <token>
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `status` | string | all | Filter: pending, approved, rejected, completed |
| `date` | string | today | Filter by expected date |
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page |

### Response

**Success (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "visitor-123",
      "name": "Jane Smith",
      "phone": "+919876543210",
      "purpose": "delivery",
      "expectedDate": "2024-01-15",
      "status": "pending",
      "createdAt": "2024-01-14T10:30:00.000Z"
    }
  ],
  "meta": {
    "timestamp": "2024-01-15T10:30:00.000Z",
    "pagination": {
      "total": 45,
      "page": 1,
      "limit": 20,
      "totalPages": 3,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

---

## GET /visitors/:id

Get detailed visitor information.

### Request

```http
GET /visitors/visitor-123
Authorization: Bearer <token>
```

### Response

**Success (200):** Full visitor object (same as POST response).

**Errors:**

| Code | Status | Cause |
|------|--------|-------|
| `VISITOR_NOT_FOUND` | 404 | Visitor doesn't exist |

---

## PATCH /visitors/:id/approve

Approve or reject a visitor entry (security only).

### Request

```http
PATCH /visitors/visitor-123/approve
Authorization: Bearer <token>
Content-Type: application/json

{
  "action": "approve",
  "notes": "ID verified"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `action` | string | Yes | "approve" or "reject" |
| `notes` | string | No | Security notes |

### Response

**Success (200):** Updated visitor object.

**Errors:**

| Code | Status | Cause |
|------|--------|-------|
| `VISITOR_NOT_FOUND` | 404 | Visitor doesn't exist |
| `VISITOR_ALREADY_APPROVED` | 409 | Already processed |
| `INSUFFICIENT_PERMISSIONS` | 403 | Not security role |

---

## DELETE /visitors/:id

Cancel a visitor entry.

### Request

```http
DELETE /visitors/visitor-123
Authorization: Bearer <token>
```

### Response

**Success (204):** No content.

**Errors:**

| Code | Status | Cause |
|------|--------|-------|
| `VISITOR_NOT_FOUND` | 404 | Visitor doesn't exist |
| `VISITOR_ALREADY_APPROVED` | 409 | Cannot cancel approved visitor |

---

## Role Requirements

| Role | Permissions |
|------|-------------|
| `resident` | Create, view own flat's visitors, cancel own |
| `security` | View all visitors, approve/reject |
| `committee` | View all visitors, reports |
| `admin` | Full access |

---

## Business Rules

1. Residents can only see visitors for their flat
2. Security can see all pending visitors for the society
3. Visitors can only be cancelled before approval
4. Approved visitors show at security gate
5. Expired visitors are auto-completed after 24 hours
