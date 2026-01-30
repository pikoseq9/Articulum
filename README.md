# BookAPP

BookAPP is a full-stack web application created as a student project.
It focuses on personal book management combined with basic social features such as community ratings and comments.

The project emphasizes clean separation of frontend and backend logic, reusable components, and real data flow instead of mocked data.

---

## Features

### Book Management

* Add books to your library
* Track reading progress (current, in-progress, finished)
* Move books between reading states
* Paginated views for larger book lists
* Import books from **Goodreads CSV**

### User Profile

* Profile page with reading goals
* Change display name and password
* Avatar support (dashboard & community views)
* Multi-Factor Authentication (MFA) handling and fixes

### Community

* Community view with user list
* Book rating system
* Rating wall with comments
* Community sidebar
* Backend endpoints and database migrations for community features

### UI & UX

* Reusable components (pagination, back button)
* Responsive CSS fixes and improvements
* Dedicated views for:

  * Dashboard
  * Profile page
  * All Read page
  * Community view
* Navbar logo and consistent styling

### Documentation

* TypeDoc-generated documentation linked in the footer
* Code comments prepared for dynamic documentation

---

## Tech Stack

**Frontend**

* Component-based architecture
* CSS modules / custom styling
* API-driven data (no mocked production data)

**Backend**

* REST API
* DTO-based request/response handling
* Database migrations
* CORS configuration for frontend integration
* Appsettings-based configuration

---

## Project Structure (High Level)

* `frontend/`

  * Views (Dashboard, Profile, Community, AllRead)
  * Reusable UI components
  * CSS styling
* `backend/`

  * Controllers
  * DTOs
  * Community endpoints
  * Authentication & MFA
  * Importer logic (Goodreads CSV)

---

## Key Learning Goals

* Full-stack application architecture
* State synchronization between frontend and backend
* Pagination and reusable component design
* Real authentication flows (including MFA)
* Importing and validating external data
* Community-driven features with database support

---

## Status

This project is **actively developed** and reflects incremental improvements through bug fixes, refactoring, and feature extensions.

---

## Notes

This is a **student project**, created to practice:

* Clean code structure
* Incremental development via commits
* Backend-driven UI logic
* Realistic application features rather than demo-only behavior
