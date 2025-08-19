# Project Structure Documentation

## Project: online-voting-system-backend

This document describes the structure and purpose of the main components in the `online-voting-system-backend` codebase.

---

## Root Directory

- **app.js**  
  Main entry point of the application. Initializes the Express server, connects middleware, and loads routes.

- **package.json**  
  Contains project metadata, scripts, and dependency definitions.

- **.gitignore / .gitattributes**  
  Git configuration files to manage version control behavior.

---

## Typical Source Structure

> *Note: The following folders are commonly found in Node.js/Express/Mongoose projects. Adjust based on your actual directory structure.*

```
online-voting-system-backend/
│
├── app.js
├── package.json
├── .gitignore
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── utils/
```

### Folder Descriptions

- **src/config/**  
  Configuration files (e.g., database connection, environment variables).

- **src/controllers/**  
  Route handler logic (business logic for API endpoints).

- **src/middlewares/**  
  Custom Express middleware for request processing, authentication, etc.

- **src/models/**  
  Mongoose models defining database schemas.

- **src/routes/**  
  Express route definitions and API endpoint organization.

- **src/services/**  
  Business logic and reusable service functions.

- **src/utils/**  
  Utility/helper functions used throughout the codebase.

---

## Dependencies

Key dependencies as defined in `package.json`:

- **express**: Web framework for Node.js.
- **mongoose**: MongoDB object modeling tool.
- **bcrypt**: Password hashing.
- **body-parser**: Middleware for parsing request bodies.
- **dotenv**: Loads environment variables from `.env`.
- **express-session**: Session management.
- **multer**: File upload handling.
- **nodemailer**: Email sending.
- **nodemon**: Development tool for auto-restarting the server.

---

## Scripts

- **dev**: Runs the app in development mode using `nodemon`.
- **test**: Placeholder for running tests.

---

## Repository

- **GitHub**: [https://github.com/FestuMiles/online-voting-system-backend](https://github.com/FestuMiles/online-voting-system-backend)

---