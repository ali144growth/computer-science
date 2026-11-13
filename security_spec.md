# Security Specification

## 1. Data Invariants
1. Only a verified administrator (`request.auth.token.email_verified == true` and either `request.auth.token.email == 'ali144.growth@gmail.com'` or an existing `/admins/{uid}` record) may create, update, or delete projects, site settings, or CV documents.
2. All project, site settings, and CV document writes must enforce server timestamps (`request.time`) and exact allowed field lists (`hasAll` / `hasOnly` on create, `affectedKeys().hasOnly(...)` on update).
3. Project `ownerId` and `createdAt` fields are immutable after creation.
4. All document IDs must pass `^[a-zA-Z0-9_\-]+$` with maximum length 128 characters.
5. `admins` collection cannot be written from client SDKs or listed publicly.

## 2. Adversarial Payloads Blocked
1. Unauthenticated project creation -> PERMISSION_DENIED
2. Non-admin authenticated user creating/editing/deleting a project -> PERMISSION_DENIED
3. Unverified email matching admin email attempting write -> PERMISSION_DENIED
4. Project creation with shadow field (`isAdmin: true`) -> PERMISSION_DENIED
5. Project update modifying immutable `ownerId` or `createdAt` -> PERMISSION_DENIED
6. Project creation with client-forged `createdAt` timestamp != `request.time` -> PERMISSION_DENIED
7. Oversized `title` (> 140 chars) or `description` (> 600 chars) -> PERMISSION_DENIED
8. Malformed document ID with path traversal or > 128 chars -> PERMISSION_DENIED
9. Writing to arbitrary `site_settings/{otherId}` instead of `main` -> PERMISSION_DENIED
10. Listing `site_settings`, `cv_documents`, or `admins` -> PERMISSION_DENIED
11. Deleting `site_settings/main` -> PERMISSION_DENIED
12. Self-registering in `/admins/{uid}` -> PERMISSION_DENIED
