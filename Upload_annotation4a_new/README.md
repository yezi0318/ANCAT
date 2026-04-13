# Anonymized Research Artifact

## Overview

This repository contains an **anonymized research artifact** accompanying a paper submission currently under **double-blind review**.

The artifact provides the source code of a **web-based annotation system** developed to support an empirical study on language and communication in workplace-related contexts.

All identifying information (e.g., author names, institutions, project identifiers, credentials) has been removed to preserve anonymity.

---

## Artifact Scope

This artifact is intended to demonstrate:

- System architecture and implementation structure
- Front-end interaction design
- Annotation workflow and interface logic

The artifact is **not intended as a production-ready deployment** and does not include live backend services or participant data.

---

## Repository Structure

This repository includes:

- `src/` – Front-end source code of the annotation system
- `public/` – Static assets
- `package.json` / `package-lock.json` – Dependency specifications
- `vite.config.js` – Build configuration
- `README.md` – Artifact documentation

The artifact **does not include**:

- Participant data or study annotations
- Interview transcripts or user-generated content
- Private credentials, API keys, or service tokens
- Institutional servers or cloud resources

---

## System Requirements

- Node.js (version ≥ 18 recommended)
- npm
- A modern web browser (Chrome / Firefox / Edge)

---

## Installation

1. Download and unzip the artifact.
2. Navigate to the project directory.
3. Install dependencies:

```bash
npm install
```

---

## External Services & Configuration

This system originally relied on external backend services (e.g., authentication, database, file storage).

To preserve anonymity and protect sensitive information, all backend configurations have been removed from this artifact.

The file `src/firebase.js` contains placeholder configuration only.  
No Firebase project, credentials, or live services are connected by default.

Researchers who wish to fully deploy the system may connect the front-end to their own backend services (e.g., Firebase or custom servers).  
A backend connection is **not required** to evaluate this artifact.
