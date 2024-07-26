# Restaurant Management System

Our restaurant management system is designed with a modern microservices architecture and deployed using Docker Swarm. Each microservice is written in Node.js with the Express.js framework. The system includes several key microservices:

- **API Gateway**: Acts as the entry point for all client requests, routing them to the appropriate microservices.
- **Catalog Service**: Manages the restaurant's menu, including categories and items.
- **Kitchen Service**: Handles orders and kitchen operations.
- **Mail Service**: Manages email notifications and communications.
- **Order Service**: Processes and tracks customer orders.
- **Payment Service**: Handles payment processing and transactions.
- **Table Service**: Manages table reservations and seating arrangements.
- **User Service**: Manages user authentication, authorization, and profiles.
- **Waiter Service**: Facilitates communication between waitstaff and the kitchen.

This architecture allows for scalable, flexible, and efficient management of restaurant operations, ensuring smooth and reliable service.
