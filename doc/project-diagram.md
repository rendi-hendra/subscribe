# Project Architecture Diagram

## Overview
This diagram shows the main layers and components of the `subscribe` project.

```mermaid
flowchart TD
  Client[Client / API Consumer]
  subgraph API[Express API]
    App[app.js]
    Swagger[/api/docs\nSwagger UI]
    Health[/health]
    Users[/api/users]
    Auth[/api/users/login]
    Subscriptions[/api/subscriptions]
    Payments[/api/payments]
    Members[/api/members]
    ErrorHandler[errorHandler.js]
    AuthMiddleware[authMiddleware.js]
    ValidateMiddleware[validateRequest.js]
  end

  subgraph Controllers[Controllers]
    UserController[userController.js]
    AuthController[authController.js]
    SubscriptionController[subscriptionController.js]
    PaymentController[paymentController.js]
    PaymentNotificationController[paymentNotificationController.js]
    MemberController[memberController.js]
  end

  subgraph Data[Persistence]
    DataSource[data-source.js\nTypeORM DataSource]
    UserEntity[User entity]
    SubscriptionEntity[Subscription entity]
    PaymentEntity[Payment entity]
    MemberEntity[Member entity]
  end

  Client -->|HTTP requests| App
  App --> Users
  App --> Auth
  App --> Subscriptions
  App --> Payments
  App --> Members
  App --> Swagger
  App --> Health
  App --> ErrorHandler

  Users --> UserController
  Auth --> AuthController
  Subscriptions --> SubscriptionController
  Payments --> PaymentController
  Payments --> PaymentNotificationController
  Members --> MemberController

  Users -->|validate| ValidateMiddleware
  Auth -->|validate| ValidateMiddleware
  Subscriptions -->|validate| ValidateMiddleware
  Payments -->|validate| ValidateMiddleware
  Members -->|validate| ValidateMiddleware

  Users -->|protect| AuthMiddleware
  Subscriptions -->|protect| AuthMiddleware
  Payments -->|protect| AuthMiddleware
  Members -->|protect| AuthMiddleware

  UserController --> DataSource
  AuthController --> DataSource
  SubscriptionController --> DataSource
  PaymentController --> DataSource
  PaymentNotificationController --> DataSource
  MemberController --> DataSource

  DataSource --> UserEntity
  DataSource --> SubscriptionEntity
  DataSource --> PaymentEntity
  DataSource --> MemberEntity

  classDef api fill:#f2f6ff,stroke:#1f78b4;
  classDef controller fill:#fef2f0,stroke:#e34a33;
  classDef persistence fill:#f0fff0,stroke:#33a02c;
  class App,Swagger,Health,Users,Auth,Subscriptions,Payments,Members,ErrorHandler,AuthMiddleware,ValidateMiddleware api;
  class UserController,AuthController,SubscriptionController,PaymentController,PaymentNotificationController,MemberController controller;
  class DataSource,UserEntity,SubscriptionEntity,PaymentEntity,MemberEntity persistence;
```

## Key Components

- `src/app.js` - main Express app, route registration, Swagger docs, health check, global error handler
- `src/routes/*.js` - route definitions and middleware attachment
- `src/controllers/*.js` - business logic for users, auth, subscriptions, payments, notifications, and members
- `src/middleware/*.js` - authentication, request validation, and centralized error handling
- `data-source.js` - TypeORM database connection and repository setup
- `src/entities/*` - entity metadata for User, Subscription, Payment, and Member
- `doc/swagger.json` - OpenAPI documentation served at `/api/docs`

## Business Flow Highlights

1. User registration and login
2. Subscription creation by authenticated users
3. Payment creation and Midtrans notification handling
4. Member creation/updating when payment is settled
5. Protected access to subscriptions and members via JWT auth
