# Tutorial: RoomFinder

RoomFinder is a platform that helps users **discover and manage room rentals**. It allows people looking for a place to **browse available rooms with powerful search and filter options**, and even **save their favorite listings** for later. Room owners can easily **list, update, and manage their properties** through a dedicated dashboard, all powered by a secure Supabase backend.


## Visual Overview

```mermaid
flowchart TD
    A0["Supabase Client & Auth Management
"]
    A1["User Authentication & Profiles
"]
    A2["Room Data Management API
"]
    A3["Room Owner Dashboard
"]
    A4["Room Browsing & Search
"]
    A5["Saved Rooms Functionality
"]
    A6["Reusable UI Building Blocks
"]
    A1 -- "Performs Auth & Profile CRU..." --> A0
    A2 -- "Interacts with Database via" --> A0
    A5 -- "Manages Data with" --> A0
    A3 -- "Requires Authentication from" --> A1
    A4 -- "Checks User Status with" --> A1
    A3 -- "Modifies Room Data through" --> A2
    A4 -- "Retrieves Room Data from" --> A2
    A4 -- "Offers Saved Rooms Option via" --> A5
    A6 -- "Forms UI for" --> A1
    A6 -- "Composes Interface for" --> A3
    A6 -- "Structures Display for" --> A4
    A6 -- "Presents Saved Rooms with" --> A5
```

## Chapters

1. [Supabase Client & Auth Management
](01_supabase_client___auth_management_.md)
2. [Room Data Management API
](02_room_data_management_api_.md)
3. [User Authentication & Profiles
](03_user_authentication___profiles_.md)
4. [Room Browsing & Search
](04_room_browsing___search_.md)
5. [Saved Rooms Functionality
](05_saved_rooms_functionality_.md)
6. [Room Owner Dashboard
](06_room_owner_dashboard_.md)
7. [Reusable UI Building Blocks
](07_reusable_ui_building_blocks_.md)

---