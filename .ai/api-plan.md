# REST API Plan - YourList MVP

## 1. Resources

| Resource | Database Table | Description |
|----------|---------------|-------------|
| User | `users` | Registered user accounts |
| List | `lists` | Shopping lists owned or shared with users |
| Item | `items` | Individual products on shopping lists |
| ListShare | `list_shares` | Shared list access relationships |

## 2. Endpoints

### 2.1 Authentication & User Management

#### Register New User
- **Method**: `POST`
- **Path**: `/api/auth/register`
- **Description**: Create a new user account
- **Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```
- **Success Response** (201 Created):
```json
{
  "id": 1,
  "email": "user@example.com",
  "createdAt": "2025-01-18T15:00:00Z",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
- **Error Responses**:
  - `400 Bad Request`: Invalid email format or password too short
  ```json
  {
    "error": "VALIDATION_ERROR",
    "message": "Email must be valid and password must be at least 8 characters",
    "fields": {
      "email": "Invalid email format",
      "password": "Password must be at least 8 characters"
    }
  }
  ```
  - `409 Conflict`: Email already registered
  ```json
  {
    "error": "EMAIL_ALREADY_EXISTS",
    "message": "An account with this email already exists"
  }
  ```

#### Login
- **Method**: `POST`
- **Path**: `/api/auth/login`
- **Description**: Authenticate user and receive JWT token
- **Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```
- **Success Response** (200 OK):
```json
{
  "id": 1,
  "email": "user@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
- **Error Responses**:
  - `401 Unauthorized`: Invalid credentials
  ```json
  {
    "error": "INVALID_CREDENTIALS",
    "message": "Invalid email or password"
  }
  ```

#### Get Current User
- **Method**: `GET`
- **Path**: `/api/users/current`
- **Description**: Retrieve authenticated user's profile
- **Headers**: `Authorization: Bearer {token}`
- **Success Response** (200 OK):
```json
{
  "id": 1,
  "email": "user@example.com",
  "createdAt": "2025-01-18T15:00:00Z"
}
```
- **Error Responses**:
  - `401 Unauthorized`: Missing or invalid token

#### Delete Account
- **Method**: `DELETE`
- **Path**: `/api/users/current`
- **Description**: Permanently delete user account and all owned lists
- **Headers**: `Authorization: Bearer {token}`
- **Request Body**:
```json
{
  "password": "securePassword123"
}
```
- **Success Response** (204 No Content)
- **Error Responses**:
  - `401 Unauthorized`: Invalid password
  - `403 Forbidden`: Password confirmation required

### 2.2 List Management

#### Get All Lists
- **Method**: `GET`
- **Path**: `/api/lists`
- **Description**: Retrieve all lists owned by or shared with the authenticated user
- **Headers**: `Authorization: Bearer {token}`
- **Query Parameters**:
  - `page` (optional, default: 0): Page number for pagination
  - `size` (optional, default: 20): Number of items per page
  - `sort` (optional, default: updatedAt,desc): Sort field and direction
- **Success Response** (200 OK):
```json
{
  "content": [
    {
      "id": 1,
      "name": "Weekly Groceries",
      "ownerId": 1,
      "isOwner": true,
      "shareToken": "550e8400-e29b-41d4-a716-446655440000",
      "createdAt": "2025-01-18T15:00:00Z",
      "updatedAt": "2025-01-18T16:30:00Z",
      "itemCount": 5,
      "boughtItemCount": 2
    },
    {
      "id": 2,
      "name": "Party Supplies",
      "ownerId": 2,
      "isOwner": false,
      "shareToken": "660e8400-e29b-41d4-a716-446655440001",
      "createdAt": "2025-01-17T10:00:00Z",
      "updatedAt": "2025-01-18T14:00:00Z",
      "itemCount": 8,
      "boughtItemCount": 3
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 2,
  "totalPages": 1
}
```
- **Error Responses**:
  - `401 Unauthorized`: Missing or invalid token

#### Get Single List
- **Method**: `GET`
- **Path**: `/api/lists/{id}`
- **Description**: Retrieve details of a specific list
- **Headers**: `Authorization: Bearer {token}`
- **Success Response** (200 OK):
```json
{
  "id": 1,
  "name": "Weekly Groceries",
  "ownerId": 1,
  "isOwner": true,
  "shareToken": "550e8400-e29b-41d4-a716-446655440000",
  "createdAt": "2025-01-18T15:00:00Z",
  "updatedAt": "2025-01-18T16:30:00Z"
}
```
- **Error Responses**:
  - `401 Unauthorized`: Missing or invalid token
  - `403 Forbidden`: User doesn't have access to this list
  - `404 Not Found`: List doesn't exist

#### Create List
- **Method**: `POST`
- **Path**: `/api/lists`
- **Description**: Create a new shopping list
- **Headers**: `Authorization: Bearer {token}`
- **Request Body**:
```json
{
  "name": "Weekly Groceries"
}
```
- **Success Response** (201 Created):
```json
{
  "id": 1,
  "name": "Weekly Groceries",
  "ownerId": 1,
  "isOwner": true,
  "shareToken": "550e8400-e29b-41d4-a716-446655440000",
  "createdAt": "2025-01-18T15:00:00Z",
  "updatedAt": "2025-01-18T15:00:00Z"
}
```
- **Error Responses**:
  - `400 Bad Request`: Invalid or missing name
  ```json
  {
    "error": "VALIDATION_ERROR",
    "message": "List name is required and must not exceed 255 characters",
    "fields": {
      "name": "Name is required"
    }
  }
  ```
  - `401 Unauthorized`: Missing or invalid token

#### Update List
- **Method**: `PUT`
- **Path**: `/api/lists/{id}`
- **Description**: Update list name (owner only)
- **Headers**: `Authorization: Bearer {token}`
- **Request Body**:
```json
{
  "name": "Updated List Name"
}
```
- **Success Response** (200 OK):
```json
{
  "id": 1,
  "name": "Updated List Name",
  "ownerId": 1,
  "isOwner": true,
  "shareToken": "550e8400-e29b-41d4-a716-446655440000",
  "createdAt": "2025-01-18T15:00:00Z",
  "updatedAt": "2025-01-18T17:00:00Z"
}
```
- **Error Responses**:
  - `400 Bad Request`: Invalid name
  - `401 Unauthorized`: Missing or invalid token
  - `403 Forbidden`: User is not the owner
  - `404 Not Found`: List doesn't exist

#### Delete List
- **Method**: `DELETE`
- **Path**: `/api/lists/{id}`
- **Description**: Permanently delete a list (owner only)
- **Headers**: `Authorization: Bearer {token}`
- **Success Response** (204 No Content)
- **Error Responses**:
  - `401 Unauthorized`: Missing or invalid token
  - `403 Forbidden`: User is not the owner
  - `404 Not Found`: List doesn't exist

#### Migrate Guest List
- **Method**: `POST`
- **Path**: `/api/lists/migrate`
- **Description**: Migrate a guest user's local list to authenticated account
- **Headers**: `Authorization: Bearer {token}`
- **Request Body**:
```json
{
  "name": "My Local List",
  "items": [
    {
      "name": "Milk",
      "description": "2 liters",
      "isBought": false
    },
    {
      "name": "Bread",
      "description": null,
      "isBought": true
    }
  ]
}
```
- **Success Response** (201 Created):
```json
{
  "id": 1,
  "name": "My Local List",
  "ownerId": 1,
  "isOwner": true,
  "shareToken": "550e8400-e29b-41d4-a716-446655440000",
  "createdAt": "2025-01-18T15:00:00Z",
  "updatedAt": "2025-01-18T15:00:00Z",
  "itemCount": 2
}
```
- **Error Responses**:
  - `400 Bad Request`: Invalid list data
  - `401 Unauthorized`: Missing or invalid token

### 2.3 List Sharing

#### Get Share Token
- **Method**: `GET`
- **Path**: `/api/lists/{id}/share`
- **Description**: Retrieve the share token for a list (owner only)
- **Headers**: `Authorization: Bearer {token}`
- **Success Response** (200 OK):
```json
{
  "shareToken": "550e8400-e29b-41d4-a716-446655440000",
  "shareUrl": "https://yourlist.app/join/550e8400-e29b-41d4-a716-446655440000"
}
```
- **Error Responses**:
  - `401 Unauthorized`: Missing or invalid token
  - `403 Forbidden`: User is not the owner
  - `404 Not Found`: List doesn't exist

#### Join Shared List
- **Method**: `POST`
- **Path**: `/api/lists/join`
- **Description**: Add authenticated user to a shared list
- **Headers**: `Authorization: Bearer {token}`
- **Request Body**:
```json
{
  "shareToken": "550e8400-e29b-41d4-a716-446655440000"
}
```
- **Success Response** (200 OK):
```json
{
  "id": 1,
  "name": "Weekly Groceries",
  "ownerId": 2,
  "isOwner": false,
  "shareToken": "550e8400-e29b-41d4-a716-446655440000",
  "createdAt": "2025-01-18T15:00:00Z",
  "updatedAt": "2025-01-18T16:30:00Z"
}
```
- **Error Responses**:
  - `400 Bad Request`: Invalid share token format
  - `401 Unauthorized`: Missing or invalid token
  - `404 Not Found`: List with this share token doesn't exist
  - `409 Conflict`: User already has access to this list

#### Get List Collaborators
- **Method**: `GET`
- **Path**: `/api/lists/{id}/collaborators`
- **Description**: Get all users who have access to the list
- **Headers**: `Authorization: Bearer {token}`
- **Success Response** (200 OK):
```json
{
  "owner": {
    "id": 1,
    "email": "owner@example.com"
  },
  "collaborators": [
    {
      "id": 2,
      "email": "collaborator1@example.com"
    },
    {
      "id": 3,
      "email": "collaborator2@example.com"
    }
  ]
}
```
- **Error Responses**:
  - `401 Unauthorized`: Missing or invalid token
  - `403 Forbidden`: User doesn't have access to this list
  - `404 Not Found`: List doesn't exist

### 2.4 Item Management

#### Get List Items
- **Method**: `GET`
- **Path**: `/api/lists/{listId}/items`
- **Description**: Retrieve all items for a specific list
- **Headers**: `Authorization: Bearer {token}`
- **Success Response** (200 OK):
```json
[
  {
    "id": 1,
    "listId": 1,
    "listName": "firstList",
    "name": "Milk",
    "description": "2 liters",
    "isBought": false,
    "createdAt": "2025-01-18T15:00:00Z"
  },
  {
    "id": 2,
    "listId": 1,
    "listName": "andrzej",
    "name": "Bread",
    "description": null,
    "isBought": true,
    "createdAt": "2025-01-18T15:05:00Z"
  }
]
```
- **Error Responses**:
  - `401 Unauthorized`: Missing or invalid token
  - `403 Forbidden`: User doesn't have access to this list
  - `404 Not Found`: List doesn't exist

#### Create Item
- **Method**: `POST`
- **Path**: `/api/lists/{listId}/items`
- **Description**: Add a new item to a list
- **Headers**: `Authorization: Bearer {token}`
- **Request Body**:
```json
{
  "name": "Milk",
  "description": "2 liters"
}
```
- **Success Response** (201 Created):
```json
{
  "id": 1,
  "listId": 1,
  "name": "Milk",
  "description": "2 liters",
  "isBought": false,
  "createdAt": "2025-01-18T15:00:00Z"
}
```
- **Error Responses**:
  - `400 Bad Request`: Invalid or missing name
  ```json
  {
    "error": "VALIDATION_ERROR",
    "message": "Item name is required and must not exceed 255 characters",
    "fields": {
      "name": "Name is required"
    }
  }
  ```
  - `401 Unauthorized`: Missing or invalid token
  - `403 Forbidden`: User doesn't have access to this list
  - `404 Not Found`: List doesn't exist

#### Update Item
- **Method**: `PATCH`
- **Path**: `/api/lists/{listId}/items/{itemId}`
- **Description**: Update item properties (name, description, or bought status)
- **Headers**: `Authorization: Bearer {token}`
- **Request Body** (all fields optional):
```json
{
  "name": "Whole Milk",
  "description": "3 liters",
  "isBought": true
}
```
- **Success Response** (200 OK):
```json
{
  "id": 1,
  "listId": 1,
  "name": "Whole Milk",
  "description": "3 liters",
  "isBought": true,
  "createdAt": "2025-01-18T15:00:00Z"
}
```
- **Error Responses**:
  - `400 Bad Request`: Invalid data
  - `401 Unauthorized`: Missing or invalid token
  - `403 Forbidden`: User doesn't have access to this list
  - `404 Not Found`: List or item doesn't exist

#### Delete Item
- **Method**: `DELETE`
- **Path**: `/api/lists/{listId}/items/{itemId}`
- **Description**: Remove an item from a list
- **Headers**: `Authorization: Bearer {token}`
- **Success Response** (204 No Content)
- **Error Responses**:
  - `401 Unauthorized`: Missing or invalid token
  - `403 Forbidden`: User doesn't have access to this list
  - `404 Not Found`: List or item doesn't exist

### 2.5 Real-time Updates

#### Subscribe to List Updates
- **Method**: `WebSocket`
- **Path**: `/ws/lists/{listId}`
- **Description**: Establish WebSocket connection for real-time list updates
- **Headers**: `Authorization: Bearer {token}`
- **Message Types**:

**Item Added**:
```json
{
  "type": "ITEM_ADDED",
  "timestamp": "2025-01-18T15:00:00Z",
  "data": {
    "id": 1,
    "listId": 1,
    "name": "Milk",
    "description": "2 liters",
    "isBought": false,
    "createdAt": "2025-01-18T15:00:00Z"
  }
}
```

**Item Updated**:
```json
{
  "type": "ITEM_UPDATED",
  "timestamp": "2025-01-18T15:05:00Z",
  "data": {
    "id": 1,
    "listId": 1,
    "name": "Milk",
    "description": "2 liters",
    "isBought": true,
    "createdAt": "2025-01-18T15:00:00Z"
  }
}
```

**Item Deleted**:
```json
{
  "type": "ITEM_DELETED",
  "timestamp": "2025-01-18T15:10:00Z",
  "data": {
    "id": 1,
    "listId": 1
  }
}
```

**List Updated**:
```json
{
  "type": "LIST_UPDATED",
  "timestamp": "2025-01-18T15:15:00Z",
  "data": {
    "id": 1,
    "name": "Updated List Name",
    "updatedAt": "2025-01-18T15:15:00Z"
  }
}
```

## 3. Authentication and Authorization

### 3.1 Authentication Mechanism

**JWT (JSON Web Token) based authentication**

- Users receive a JWT token upon successful registration or login
- Token must be included in the `Authorization` header as `Bearer {token}` for all protected endpoints
- Token contains user ID and email claims
- Token expiration: 24 hours (configurable)
- Refresh token mechanism not included in MVP

### 3.2 Implementation Details

**Spring Security Configuration**:
- Use Spring Security with JWT filter
- Password encoding: BCrypt (strength 10)
- Stateless session management
- CORS configuration for Angular frontend

**Token Structure**:
```json
{
  "sub": "1",
  "email": "user@example.com",
  "iat": 1705590000,
  "exp": 1705676400
}
```

### 3.3 Authorization Rules

| Resource | Operation | Authorization Rule |
|----------|-----------|-------------------|
| List | Create | Authenticated user |
| List | Read | Owner or collaborator (via list_shares) |
| List | Update | Owner only |
| List | Delete | Owner only |
| List | Share | Owner only |
| Item | Create | Owner or collaborator |
| Item | Read | Owner or collaborator |
| Item | Update | Owner or collaborator |
| Item | Delete | Owner or collaborator |

### 3.4 Security Considerations

- All passwords hashed with BCrypt before storage
- Email validation on registration
- Rate limiting on authentication endpoints (not implemented in MVP)
- HTTPS required in production
- CSRF protection disabled for stateless API
- SQL injection prevention via JPA parameterized queries

## 4. Validation and Business Logic

### 4.1 Validation Rules

#### User Registration
- **Email**:
  - Required: Yes
  - Format: Valid email address (RFC 5322)
  - Unique: Yes
  - Max length: 255 characters
  - Annotation: `@Email`, `@NotNull`, `@Size(max = 255)`

- **Password**:
  - Required: Yes
  - Min length: 8 characters
  - Max length: 255 characters (before hashing)
  - Annotation: `@NotNull`, `@Size(min = 8, max = 255)`

#### List
- **Name**:
  - Required: Yes
  - Max length: 255 characters
  - Annotation: `@NotNull`, `@Size(max = 255)`

- **Owner ID**:
  - Required: Yes (set automatically from authenticated user)
  - Must reference existing user
  - Annotation: `@NotNull`

#### Item
- **Name**:
  - Required: Yes
  - Max length: 255 characters
  - Annotation: `@NotNull`, `@Size(max = 255)`

- **Description**:
  - Required: No
  - Max length: 255 characters
  - Annotation: `@Size(max = 255)`

- **List ID**:
  - Required: Yes (from URL path)
  - Must reference existing list
  - User must have access to the list

- **Is Bought**:
  - Required: No (defaults to false)
  - Type: Boolean
  - Annotation: `@NotNull` (with default value)

### 4.2 Business Logic
