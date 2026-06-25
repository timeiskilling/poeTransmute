# Path of Exile 2 Web Tool: Architecture & Development Plan

This document outlines the step-by-step development process for building a custom PoE 2 web tool. The architecture relies on a **Backend** (acting as a data enricher and proxy), a **Rust Microservice** (acting as a high-performance math engine), and a **Browser-based Frontend** (acting as the UI and state manager).

---

## PART 1: BACKEND - Data Enrichment & Proxy
**Goal:** Fetch raw data from the official GGG API, translate it into structured mathematical objects using a game data dictionary, and serve a clean, comprehensive JSON.

### Phase 1.1: Game Data Dictionary (The Source of Truth)
- [ ] Create a dedicated service to interact with community APIs (e.g., POE2Scout API).
- [ ] Write a startup script or Cron Job to periodically fetch and update game dictionaries:
  - Base item types and their hidden implicit stats.
  - Modifiers (Affixes), modifier weights, and their text/Regex templates.
  - Passive Skill Tree node data and coordinates.
- [ ] Store these dictionaries in the database (or Redis) for ultra-fast, local lookup.

### Phase 1.2: Official GGG API Integration
- [ ] Implement an Authentication Service (OAuth2 or POESESSID) to securely access player profiles.
- [ ] Create an endpoint to fetch raw character equipment data (`/character-window/get-items`).
- [ ] Create an endpoint to fetch raw passive tree data (`/character-window/get-passive-skills`).

### Phase 1.3: Parsing Pipeline & Adapter
- [ ] Build the `ItemParserService`: Takes raw text (e.g., `+90 to maximum Life`) and uses the Game Data Dictionary to map it to a calculable object `{ stat: "life", value: 90 }`.
- [ ] Build the `GggApiAdapter`: Aggregates the parsed items, gems, and passives into a unified, frontend-friendly JSON structure.
- [ ] Validate the final aggregated JSON via `PoeNinjaApiResponseSchema` before dispatching it to the client.

---

## PART 2: MATH ENGINE (Rust Microservice)
**Goal:** Offload complex Path of Exile damage and defense calculations to a highly optimized, concurrent Rust server.

### Phase 2.1: Engine Infrastructure
- [ ] Initialize the Rust project (using Axum or Actix-Web for the HTTP/gRPC server).
- [ ] Define shared data schemas (to ensure strict parity with the backend and Frontend JSON structures).

### Phase 2.2: Simulation & Calculation Logic
- [ ] Implement a Defensive Calculator module: Summing up Life, Energy Shield, Armor, Evasion, and Resistances to compute EHP (Effective Health Pool).
- [ ] Implement an Offensive Calculator module: Parsing local/global modifiers, weapon base damage, and gem links to calculate main skill DPS.
- [ ] Expose an endpoint (`/calculate`) that accepts a modified character JSON payload and returns the calculation delta (e.g., exact EHP and DPS changes).

---

## PART 3: FRONTEND (Browser Interface) - UI & State Management
**Goal:** Render the character profile, manage local state, and interact with the backend and Rust engine for seamless upgrade simulations.

### Phase 3.1: Web App Infrastructure
- [ ] Initialize the Frontend application (React, Vue, or Next.js).
- [ ] Setup local caching (IndexedDB or LocalStorage) to store the heavy character JSON and prevent redundant API calls.
- [ ] Setup a global state manager (Zustand, Redux, or Jotai) to manage the character's active equipment and skill states.

### Phase 3.2: User Interface & Dashboard
- [ ] Implement data fetching from the backend.
- [ ] Build the Character Inventory UI (slots for Helm, Body Armour, Weapon, Chakra, Rings, etc.).
- [ ] Build the in-game accurate **Item Tooltip Component** (rendering explicit/implicit mods, gem links, and rune sockets visually).
- [ ] Build the Skills Tab (listing active skills, support gems, and meta-gems).

### Phase 3.3: Simulation & Upgrade Finder (Mock Equip)
- [ ] Implement the "Mock Equip" feature UI:
  - Allow users to paste an item from the trade site to swap with an existing item.
  - Clone the current character JSON state in memory and update the swapped item.
  - Dispatch the updated JSON payload to the Rust Math Engine API.
- [ ] Render the Calculation Delta dynamically in the UI:
  - Display positive changes in green (e.g., `+1200 EHP`, `+500 DPS`).
  - Display negative changes or warnings in red (e.g., `-5% Fire Resistance (Not Capped)`).
