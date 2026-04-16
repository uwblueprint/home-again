# Schema Reference

Entity reference for the Home Again Furniture Bank backend. For enum values, see `backend/app/enums.py`. For implementation patterns, see `BACKEND_GUIDE.md`.

## Entity Relationship Summary

```
Admin          — standalone; no FK relationships
Agency         — no FKs; referenced by Agent, Client
Agent          — agency_id → Agency
Donor          — no FKs; referenced by Donation
Donation       — donor_id → Donor; referenced by Furniture, Pickup
Client         — agency_id → Agency (optional); referenced by Referral
Furniture      — donation_id → Donation (opt), referral_id → Referral (opt),
                 pickup_id → Pickup (opt); one-to-one back-ref to Dropoff
Referral       — client_id → Client, agent_id → Agent (opt),
                 secondary_agent_id → Agent (opt); referenced by Furniture, Dropoff
Route          — no FKs; referenced by Pickup, Dropoff
Pickup         — route_id → Route, donation_id → Donation (opt);
                 referenced by Furniture (many-to-one via furniture.pickup_id)
Dropoff        — route_id → Route, furniture_id → Furniture,
                 referral_id → Referral (opt)
```

**Key design decisions:**
- **Pickup** = collection stop (furniture gathered *from* a donor). Linked to a Route and optionally a Donation. Multiple furniture items can reference the same pickup via `furniture.pickup_id`.
- **Dropoff** = delivery stop (furniture delivered *to* a client). Linked to a Route, one specific Furniture item, and optionally a Referral. Carries dispatch flags.
- No `agency_id` on Referral — agency is reachable via `referral.client.agency_id` or `referral.agent.agency_id`.
- No main-contact fields on Agency — use `Agent.is_admin=True` to identify admin-level agents within an agency.
- Pickup and Dropoff replace Route's former JSON `pickup_furniture_ids`/`dropoff_furniture_ids` columns.

---

## Admin

Auth via Supabase; `supabase_user_id` links to Supabase Auth record.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | auto | Primary key |
| first_name | string | yes | |
| last_name | string | yes | |
| email | string | yes | Unique |
| phone_number | string | yes | |
| supabase_user_id | string | no | Links to Supabase Auth |
| created_at | datetime | auto | |
| updated_at | datetime | auto | |

**Relationships:** none

---

## Agency

Partner organization. Agents and Clients belong to an Agency. Use `Agent.is_admin=True` to designate admin-level agents within the agency.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | auto | Primary key |
| name | string | yes | |
| address_line_1 | string | yes | |
| address_line_2 | string | no | |
| city | string | yes | |
| postal_code | string | yes | |
| phone_number | string | yes | |
| program | string | no | Optional program name |
| created_at | datetime | auto | |
| updated_at | datetime | auto | |

**Relationships:**
- `agents` ← Agent.agency_id (one-to-many)
- `clients` ← Client.agency_id (one-to-many)

---

## Agent

Agency staff member. `is_admin=True` grants admin-level permissions within the agency.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | auto | Primary key |
| agency_id | string (UUID) | yes | FK → Agency |
| first_name | string | yes | |
| last_name | string | yes | |
| email | string | yes | |
| phone_number | string | yes | |
| is_admin | boolean | yes (default: false) | Admin flag |
| supabase_user_id | string | no | Links to Supabase Auth |
| created_at | datetime | auto | |
| updated_at | datetime | auto | |

**Relationships:**
- `agency` → Agency (many-to-one)

---

## Donor

Individual or organization who donates furniture.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | auto | Primary key |
| first_name | string | yes | |
| last_name | string | yes | |
| email | string | yes | |
| phone | string | yes | |
| created_at | datetime | auto | |
| updated_at | datetime | auto | |

**Relationships:**
- `donations` ← Donation.donor_id (one-to-many)

---

## Donation

A donation event — the source for one or more furniture items.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | auto | Primary key |
| donor_id | string (UUID) | yes | FK → Donor |
| donation_type | DonationTypeEnum | no | person, charity, business, community_drive |
| charitable_receipt_estimate | float | no | |
| address_line_1 | string | no | Collection address |
| address_line_2 | string | no | |
| city | string | no | |
| postal_code | string | no | |
| status | DonationStatus | no | pending, completed, cancelled |
| created_at | datetime | auto | |
| updated_at | datetime | auto | |

**Relationships:**
- `donor` → Donor (many-to-one)
- `furniture_items` ← Furniture.donation_id (one-to-many)
- `pickups` ← Pickup.donation_id (one-to-many)

---

## Client

Recipient of furniture. May be linked to an Agency.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | auto | Primary key |
| first_name | string | yes | |
| last_name | string | yes | |
| birthday | date | yes | |
| gender | GenderEnum | no | female, male, other, prefer_not_to_say |
| phone | string | no | |
| phone_notes | string | no | |
| speaks_english | boolean | yes (default: true) | |
| language | string | no | Primary language when speaks_english=False |
| family_type | FamilyTypeEnum | yes | single, family |
| num_children | integer | yes (default: 0) | |
| num_adults | integer | yes (default: 1) | |
| coordinated_access_required | boolean | yes (default: false) | |
| agency_id | string (UUID) | no | FK → Agency (optional) |
| immigration_status | ImmigrationStatusEnum | no | PR, Refugee, Canadian citizen |
| created_at | datetime | auto | |
| updated_at | datetime | auto | |

**Relationships:**
- `agency` → Agency (many-to-one, optional)
- `referrals` ← Referral.client_id (one-to-many)

---

## Furniture

Individual furniture item. Linked to a Donation (source), optionally a Referral (client request), and optionally a Pickup (collection stop).

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | auto | Primary key |
| name | string | yes | |
| image_url | string | yes | |
| description | string | yes | |
| condition | FurnitureConditionEnum | no | excellent, good, fair, poor |
| colour | string | yes | |
| category | string | yes | |
| smoking_household | boolean | yes (default: false) | |
| has_pets | boolean | yes (default: false) | |
| status | FurnitureStatus | yes | PICKUP_PENDING, APPROVED, OFFERED, SCHEDULED, DELIVERED, CLOSED |
| donation_id | string (UUID) | no | FK → Donation |
| referral_id | string (UUID) | no | FK → Referral |
| pickup_id | string (UUID) | no | FK → Pickup (collection stop) |
| created_at | datetime | auto | |
| updated_at | datetime | auto | |

**Relationships:**
- `donation` → Donation (many-to-one, optional)
- `referral` → Referral (many-to-one, optional)
- `pickup` → Pickup (many-to-one, optional) — the collection stop this item belongs to
- `dropoff` ← Dropoff.furniture_id (one-to-one, optional) — the delivery stop for this item

---

## Referral

A request for furniture delivery to a Client.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | auto | Primary key |
| client_id | string (UUID) | yes | FK → Client |
| agent_id | string (UUID) | no | FK → Agent (primary) |
| secondary_agent_id | string (UUID) | no | FK → Agent (secondary) |
| requested_items | JSON array | yes | List of requested items |
| program | string | no | Program name |
| is_priority | boolean | yes (default: false) | |
| priority_description | string | no | |
| reason_* | boolean | yes (default: false) | Various referral reason flags |
| address_line_1 | string | yes | Delivery address |
| address_line_2 | string | no | |
| city | string | yes | |
| postal_code | string | no | |
| date_items_needed | datetime | no | |
| staircases | boolean | no | |
| narrow_passageways | boolean | no | |
| adequate_parking | boolean | no | |
| notes_and_instructions | string | no | |
| status | ReferralStatus | yes | pending, approved, completed, declined |
| created_at | datetime | auto | |
| updated_at | datetime | auto | |

**Relationships:**
- `client` → Client (many-to-one)
- `agent` → Agent (many-to-one, optional)
- `secondary_agent` → Agent (many-to-one, optional)
- `furniture_items` ← Furniture.referral_id (one-to-many)
- `dropoffs` ← Dropoff.referral_id (one-to-many)

---

## Route

A dispatch run for a given date. Contains Pickup and Dropoff stops.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | auto | Primary key |
| date | datetime | yes | Dispatch date/time |
| status | RouteStatus | no | pending, in_progress, completed |
| created_at | datetime | auto | |
| updated_at | datetime | auto | |

**Relationships:**
- `pickups` ← Pickup.route_id (one-to-many)
- `dropoffs` ← Dropoff.route_id (one-to-many)

---

## Pickup

A collection stop on a route — furniture is gathered from a donor at this stop. One or more furniture items reference a pickup via `furniture.pickup_id`.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | auto | Primary key |
| route_id | string (UUID) | yes | FK → Route |
| donation_id | string (UUID) | no | FK → Donation (the donation being collected) |
| created_at | datetime | auto | |
| updated_at | datetime | auto | |

**Relationships:**
- `route` → Route (many-to-one)
- `donation` → Donation (many-to-one, optional)
- `furniture_items` ← Furniture.pickup_id (one-to-many)

---

## Dropoff

A delivery stop on a route — furniture is delivered to a client at this stop. Each dropoff covers one specific furniture item.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | auto | Primary key |
| route_id | string (UUID) | yes | FK → Route |
| furniture_id | string (UUID) | yes | FK → Furniture (item being delivered) |
| referral_id | string (UUID) | no | FK → Referral |
| high_priority | boolean | yes (default: false) | |
| contact_in_case_of_cancellation | boolean | yes (default: false) | |
| dispatch_required | boolean | yes (default: false) | |
| created_at | datetime | auto | |
| updated_at | datetime | auto | |

**Relationships:**
- `route` → Route (many-to-one)
- `furniture` → Furniture (one-to-one)
- `referral` → Referral (many-to-one, optional)
