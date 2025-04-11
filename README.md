bantu
# Cloud-Native Food Ordering & Delivery System

A cloud-native food ordering and delivery platform built using microservices architecture, designed for scalability, security, and performance. Developed as part of **SE3020 – Distributed Systems** (Year 3, Semester 1, 2025).

## Features

- **User Roles**:
  - **Customers**: Browse restaurants, add items to cart, place orders, track deliveries.
  - **Restaurant Admins**: Manage menus, update availability, handle orders.
  - **Delivery Personnel**: Accept and fulfill delivery assignments.
  - **Admin**: Manage user accounts, verify restaurants, oversee transactions.

- **Core Services**:
  - **Web/Mobile Interface**: Responsive UI built with React (asynchronous client).
  - **Restaurant Management**: CRUD operations for menus, order availability.
  - **Order Management**: Place, modify, and track orders.
  - **Delivery Management**: Auto-assign drivers, real-time tracking.
  - **Payment Integration**: Secure payments via PayHere/Stripe (sandbox).
  - **Notifications**: SMS/email confirmations using third-party services.

## Technology Stack

- **Backend**: 
  - Microservices with **Node.js/Express** (RESTful APIs).
  - **MySQL**
- **Orchestration**: 
  - **Docker** for containerization.
  - **Kubernetes** for deployment and scaling.
- **Frontend**: 
  - **React.js** (asynchronous web client).
- **Authentication**: 
  - **JWT** with **OAuth2** for role-based access.
- **Third-Party Integrations**: 
  - **Stripe** (sandbox).

## Installation & Deployment

### Prerequisites
- Docker v20.10+
- Kubernetes (minikube v1.25+ for local testing)
- Node.js v16+

### Steps
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-group-id/food-delivery-system.git
   cd food-delivery-system
