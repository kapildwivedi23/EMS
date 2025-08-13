# 💼 Employee Management System (EMS)

The **Employee Management System (EMS)** is a robust, web-based platform built with the **MERN** stack, designed to simplify organizational workflows, enhance internal communication, and enforce secure, role-based access for both administrators and employees. With integrated **Socket.IO** for real-time messaging and **JWT-based authentication**, EMS offers an efficient and modern approach to employee and HR management.

---

## 📌 Project Summary

EMS is developed to streamline and automate:

- ✅ Seamless onboarding and administration of employee records  
- 🔐 Secure login for Admin and Employee roles  
- 💬 Real-time internal messaging using WebSockets  
- 🛡️ Role-based access control (RBAC)  
- 📱 Fully responsive UI with **Bootstarp CSS**  

---

## 🧩 Core Modules & Functionalities

### 👥 Authentication & Authorization

- Secure login using **JWT (JSON Web Token)**
- Separate login portals for **Admins** and **Employees**
- Route protection with Express middleware

---

### 🧑‍💼 Employee Management (CRUD Operations)

Admins can:

- Add, edit, or delete employee records  
- Assign departments and roles  
- View, search, and filter employee data  

---

### 💬 Real-Time Communication

- Powered by **Socket.IO** for persistent WebSocket connections  
- One-to-one chat between Admins and Employees  
- Real-time message delivery with history storage  
- Typing indicators and online status tracking  

---

### 📊 Admin Dashboard

- Visual insights and metrics:
  - Total employees  
  - Department-wise employee count  
  - Online users in real time  

---

### 🎨 User Interface & UX

- **Mobile-first** design for responsiveness  
- Clean, modern interface using **Bootstarp CSS**  
- Dynamic layout and navigation based on user role  

---

## 🛠️ Technology Stack

| Layer           | Technologies Used                                  |
|------------------|----------------------------------------------------|
| **Frontend**     | HTML, CSS, JavaScript |
| **Backend**      | Node.js, Express.js                                |
| **Database**     | MongoDB with Mongoose ORM                          |
| **Real-time**    | Socket.IO                                          |
| **Authentication** | JWT (JSON Web Token), Bcrypt                     |
| **Dev Tools**    | Postman, VS Code, Git, GitHub                      |

---

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/kapildwivedi23/EMS.git
cd EMS

# Install dependencies
npm install

# Set environment variables in a `.env` file
# Example:
# MONGO_URI=your_mongodb_connection_string
# JWT_SECRET=your_jwt_secret

# Run the server
npm start
