# 💼 Employee Management System (EMS)

An end-to-end web application designed to streamline employee management, real-time internal communication, and role-based access. Built using the MERN stack with **Socket.IO integration** for live chat between employees and admins, this system supports modern HR operations like user authentication, employee record handling, and dashboard visualizations.

---

## 📌 Project Overview

The EMS platform facilitates:
- Easy onboarding and management of employees
- Secure login for both Admins and Employees
- Real-time communication with **Socket.IO-powered** chat
- Role-based access: Admin can manage users; Employees can communicate and access their own profiles
- Responsive and modern UI using **Tailwind CSS**

---

## 🧩 Modules & Features

### 👥 Authentication & Authorization
- JWT-based login system
- Separate login for **Admin** and **Employee**
- Protected routes using middleware

### 🧑‍💼 Employee Management (CRUD)
- Admin can:
  - Add/Edit/Delete employee records
  - Assign roles and departments
  - View employee list with search/filter options

### 💬 Real-Time Chat System
- Built with **Socket.IO**
- Employees can chat with other employees or Admin
- Instant message delivery (WebSocket)
- Customizable UI chat box

### 📊 Dashboard
- Admin dashboard with:
  - Total employees count
  - Department-wise employee stats
  - Online users (via WebSocket tracking)

### 🎨 UI/UX Design
- Mobile responsive
- Clean UI using **Tailwind CSS**
- Role-specific navigation bar

---

## 🛠️ Tech Stack

| Layer        | Technology                        |
|--------------|------------------------------------|
| Frontend     | HTML, CSS, JavaScript, Tailwind CSS, [Optional: React.js] |
| Backend      | Node.js, Express.js               |
| Database     | MongoDB + Mongoose                |
| Realtime     | Socket.IO                         |
| Auth         | JSON Web Tokens (JWT), Bcrypt     |
| Dev Tools    | Postman, VSCode, Git              |

---