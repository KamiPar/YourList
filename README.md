# YourList

YourList is an intelligent shopping list web application designed to streamline the grocery shopping process for families and housemates. The primary goal is to eliminate the problem of duplicate purchases by enabling shared lists and real-time synchronization of changes.

## Table of Contents
1. [Project Description](#project-description)
2. [Tech Stack](#tech-stack)
3. [Getting Started Locally](#getting-started-locally)
4. [Available Scripts](#available-scripts)
5. [Project Scope](#project-scope)
6. [Project Status](#project-status)
7. [License](#license)

## Project Description

Parallel grocery shopping by multiple household members often leads to inefficiency, frustration, and wasted money from buying the same items twice. YourList solves this by providing a simple, intuitive platform for real-time list collaboration. Users can create, manage, and share shopping lists, with all changes instantly synced across devices, ensuring everyone is always on the same page.

## Tech Stack

### Backend
- **Framework**: Spring Boot 3.5.6
- **Language**: Java 17
- **Database**: PostgreSQL
- **Data Access**: Spring Data JPA
- **Migrations**: Flyway
- **API Documentation**: SpringDoc (OpenAPI)
- **Real-time**: Spring WebSocket
- **Security**: Spring Security, JWT

### Frontend
- **Framework**: Angular 20.3.5
- **Language**: TypeScript ~5.9.2
- **Styling**: TailwindCSS
- **UI Components**: Angular Material
- **Monorepo Tool**: Nx 21.6.4

### Testing
- **Unit Testing (Backend)**: JUnit 5, Mockito, Spring Test
- **Unit Testing (Frontend)**: Jest, Angular Testing Library
- **E2E Testing**: Playwright

## Getting Started Locally

To set up and run the project on your local machine, follow these steps.

### Prerequisites
- JDK 17
- Node.js (LTS version recommended)
- npm package manager

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/KamiPar/YourList.git
    cd YourList
    ```

2.  **Install frontend dependencies:**
    ```bash
    npm install
    ```

3.  **Run the Backend Application:**
    The backend is a Spring Boot application. You can run it using the Gradle wrapper.
    ```bash
    # In the root directory
    ./apps/Backend/gradlew -p apps/Backend bootRun
    ```
    The backend server will start on `http://localhost:8080`.

4.  **Run the Frontend Application:**
    The frontend is managed by Nx. Run the following command from the root directory:
    ```bash
    npx nx serve Frontend
    ```
    The frontend development server will be available at `http://localhost:4200`.

## Available Scripts

The following scripts are available in the root `package.json`:

-   `npm run openapi:fetch`
    Fetches the OpenAPI 3.0 specification from a running backend instance (at `http://localhost:8080/v3/api-docs`) and saves it locally.

-   `npm run openapi:generate`
    Generates the frontend API client service based on the fetched OpenAPI specification using `openapi-generator-cli`.

## Project Scope

### Key Features (MVP)
-   **User Accounts**: Secure user registration, login, and account deletion.
-   **List Management**: Full CRUD (Create, Read, Update, Delete) functionality for shopping lists.
-   **Product Management**: Add products with optional descriptions, and mark/unmark them as purchased.
-   **Real-time Collaboration**: Share lists with other registered users via a unique link and see all changes synchronized in real-time.
-   **Unified View**: See all personal and shared lists in a single "My Lists" view.

### Out of Scope for MVP
-   Sharing lists with unauthenticated (guest) users.
-   Creating shopping lists from recipes.
-   Import/Export functionality for lists.
-   Advanced user management on shared lists (e.g., revoking access).
-   Real-time indicators for other users currently viewing a list.
-   Offline mode.

## Project Status
**In Development**

This project is currently under active development. New features and improvements are being implemented.

## License
This project is distributed under the MIT License. See the `LICENSE` file for more information.
