# DevPulse – Internal Tech Issue & Feature Tracker

A collaborative backend platform for software teams to report bugs, suggest features, and coordinate resolutions.

## Live URL

```
https://devpulssecondassignment.vercel.app/
```

---

## Features

- User registration and login with JWT authentication
- Role-based access control (contributor & maintainer)
- Create, view, update, and delete issues
- Filter issues by type and status
- Sort issues by newest or oldest
- Secure password hashing with bcrypt
- Modular architecture with TypeScript

---

## 🛠️ Tech Stack

 Technology      Usage                          

 Node.js         Runtime environment            
 TypeScript      Type-safe development          
 Express.js      Web framework                  
 PostgreSQL      Relational database            
 Raw SQL (pg)    Direct database queries        
 bcrypt          Password hashing               
 jsonwebtoken    JWT generation & verification  
 dotenv          Environment variable management
 cors            Cross-origin resource sharing  

---

## Setup Steps

### 1. Clone the repository

```bash
git clone https://github.com/irfanrumman/l2_assignment_2.git
cd l2_assignment_2
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root directory:

```env
PORT=5000
CONNECTION_STRING=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRESINTIME=1d
```

### 4. Run the server

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

---

## 🌐 API Endpoints

### Authentication

| Method | Endpoint           | Access  | Description              |
|--------|--------------------|---------|--------------------------|
| POST   | /api/auth/signup   | Public  | Register a new user      |
| POST   | /api/auth/login    | Public  | Login and receive JWT    |

### Issues

| Method | Endpoint          | Access                        | Description              |
|--------|-------------------|-------------------------------|--------------------------|
| POST   | /api/issues       | Authenticated                 | Create a new issue       |
| GET    | /api/issues       | Public                        | Get all issues           |
| GET    | /api/issues/:id   | Public                        | Get a single issue       |
| PATCH  | /api/issues/:id   | Maintainer / Contributor(own) | Update an issue          |
| DELETE | /api/issues/:id   | Maintainer only               | Delete an issue          |

### Query Parameters for GET /api/issues

| Param  | Values                          | Default |
|--------|---------------------------------|---------|
| sort   | newest, oldest                  | newest  |
| type   | bug, feature_request            | (none)  |
| status | open, in_progress, resolved     | (none)  |

---

## 🗄️ Database Schema

### Table: users

| Column     | Type         | Description                                 |
|------------|--------------|---------------------------------------------|
| id         | SERIAL       | Auto-incrementing primary key               |
| name       | VARCHAR(20)  | Full name of the user                       |
| email      | VARCHAR(20)  | Unique email address                        |
| password   | TEXT         | Bcrypt hashed password                      |
| role       | VARCHAR(20)  | contributor or maintainer (default: contributor) |
| created_at | TIMESTAMP    | Auto-generated on insert                    |
| updated_at | TIMESTAMP    | Auto-updated on update                      |

### Table: issues

| Column      | Type         | Description                                        |
|-------------|--------------|----------------------------------------------------|
| id          | SERIAL       | Auto-incrementing primary key                      |
| title       | VARCHAR(150) | Short headline of the issue                        |
| description | TEXT         | Detailed explanation (minimum 20 characters)       |
| type        | VARCHAR(255) | bug or feature_request                             |
| status      | VARCHAR(255) | open, in_progress, resolved (default: open)        |
| reporter_id | INT          | ID of the user who created the issue               |
| created_at  | TIMESTAMP    | Auto-generated on insert                           |
| updated_at  | TIMESTAMP    | Auto-updated on update                             |

---

## 👤 Author

**Md Irfan Uddin**
