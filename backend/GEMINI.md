# WhatsApp AI Bot - Photography Shop (Academic Project)

## Project Overview
This project is a **NestJS-based WhatsApp AI bot** developed as a college project (Projeto Integrador). It aims to demonstrate a prototype/MVP of an automated service for a **small photography shop**, utilizing natural language processing to guide customers through end-to-end processes, specifically **photo printing/revelation**.

### MVP Scope & Requirements
- **Photo Printing Flow:** Collect photos from users, define size/quantity, and generate payment.
- **AI-Driven Natural Language:** Use LLMs for fluid conversation.
- **Overflow (Transbordo):** Detection of when a human agent needs to intervene.
- **Message Auditing:** Persistent log of all interactions for quality and academic evaluation.

---

## Current Implementation (Status Quo)
*These components are already present in the codebase.*

1.  **WhatsApp Client Bridge (`src/whatsapp-client`):** Wraps `whatsapp-web.js` and emits events via `EventEmitter2`.
2.  **Message Buffer (`src/bot/bot-message-buffer.service.ts`):** Implements a **10-second debounce** to group sequential messages (especially useful for multi-photo uploads) into a single processing batch.
3.  **Basic Task Structure:** A preliminary `Task` entity exists in `src/task-manager/task/task.schema.ts` (using TypeORM, to be refactored).

---

## Planned Architecture (Next Steps)
*These are inferred requirements to be implemented.*

### 1. Persistence Layer (MongoDB/Mongoose)
- **Messages:** To be used for both AI context and **Auditing**.
- **Tasks/Orders:** Flexible documents to track the "State" of a customer's request.
- *Note:* Decision made to move from TypeORM to Mongoose for better flexibility with order metadata and chat logs.

### 2. Logic & AI Integration
- **AI Service (Planned):** Will handle the logic of interpreting intents and detecting if a "Transbordo" (overflow) to a human is needed.
- **Order State Machine (Planned):** Within `TaskManager`, to track states like `COLLECTING_PHOTOS`, `SELECTING_SIZE`, `AWAITING_PAYMENT`, etc.

---

## Development Conventions

### MVP Focus
Prioritize **demonstrable functionality** and a clean **proof of concept** over production-grade edge-case handling.

### Event-Driven Communication
- Maintain decoupling between the WhatsApp connection and business logic using `EventEmitter2`.

### Auditing
- Every message processed must be stored with its metadata to fulfill the project's auditing requirement.

---

## Roadmap / TODO
- [ ] **Finalize Persistence Integration:** Install and configure `@nestjs/mongoose` and refactor `Task` and `Message` to MongoDB Schemas.
- [ ] **Implement AI (LLM) Integration:** Setup communication for intent and overflow detection.
- [ ] **Develop Order Logic:** Create the state-machine logic for the printing process in `TaskManager`.
- [ ] **Authentication Flow:** Move away from terminal QR codes to a more robust authentication flow if time permits.
