# 🏥 Hospital Management System

A web-based Hospital Management System developed using **Java, Spring Boot, MySQL, HTML, CSS, and JavaScript**. The application helps manage hospital activities such as patient registration, doctor management, appointments, medical records, billing, and administration.

## 📌 Project Overview

The Hospital Management System is designed to simplify hospital operations by providing separate functionalities for patients, doctors, and administrators. It integrates a frontend interface with a Spring Boot backend and a MySQL database.

## ✨ Key Features

- **Patient Management** – Patient registration and profile management.
- **Doctor Management** – Doctor registration and information management.
- **Appointment Management** – Appointment booking and management.
- **Admin Dashboard** – Centralized administration and statistics.
- **Medical Records** – Access and manage patient medical records.
- **Billing Management** – Manage hospital billing information.
- **Authentication** – Login functionality and role-based access.
- **Responsive Interface** – User-friendly web interface.

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| Java | Backend programming |
| Spring Boot | Backend framework |
| Spring Data JPA | Database interaction |
| Spring Security | Application security |
| MySQL | Database |
| HTML5 | Web page structure |
| CSS3 | Styling and layout |
| JavaScript | Frontend functionality |
| Maven | Project build management |
| Git & GitHub | Version control |

## 📂 Project Structure

```text
Hospital-Management-System/
│
├── Backend/
│   └── hospital-management/
│       ├── src/
│       │   ├── main/
│       │   │   ├── java/
│       │   │   │   └── com/hospital_management/
│       │   │   │       ├── controller/
│       │   │   │       ├── entity/
│       │   │   │       ├── repository/
│       │   │   │       ├── security/
│       │   │   │       ├── service/
│       │   │   │       └── HospitalManagementApplication.java
│       │   │   └── resources/
│       │   │       └── application.properties
│       │   └── test/
│       └── pom.xml
│
└── Frontend/
    ├── css/
    ├── js/
    ├── images/
    ├── index.html
    ├── login.html
    ├── patient-register.html
    ├── doctor-register.html
    └── admin-dashboard.html
```

## ⚙️ Requirements

Before running the project, install:

- JDK 25 (or a compatible Java version)
- MySQL Server
- MySQL Workbench
- Spring Tool Suite (STS) or IntelliJ IDEA
- Visual Studio Code
- Git

## 🗄️ Database Configuration

1. Start MySQL Server.
2. Open MySQL Workbench.
3. Create the database configured in the backend application.
4. Open `Backend/hospital-management/src/main/resources/application.properties`.
5. Configure the database URL, username, and password.

Example configuration:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/hospital_db
spring.datasource.username=root
spring.datasource.password=${DB_PASSWORD}
```

Replace `hospital_db` with the database name configured in your application. Set the `DB_PASSWORD` environment variable to your local MySQL password. Never upload actual database passwords to GitHub.

## ▶️ How to Run the Project

### 1. Clone the Repository

```bash
git clone https://github.com/SrinivasuluG369/Hospital-Management-System.git
```

### 2. Run the Backend

Navigate to the backend project directory:

```bash
cd Hospital-Management-System/Backend/hospital-management
```

Run using Maven Wrapper:

```bash
mvnw.cmd spring-boot:run
```

The backend starts on the configured Spring Boot server port.

### 3. Run the Frontend

1. Open the `Frontend` folder in Visual Studio Code.
2. Open `index.html`.
3. Run the page using the Live Server extension.
4. Use the application through your browser.

**Note:** Configure the frontend API base URL to match the running backend server.

## 🎯 Project Objective

The main objective of this project is to develop a centralized hospital management application that simplifies patient, doctor, appointment, medical record, and billing operations while providing practical experience in Java full-stack development.

## 🚀 Future Enhancements

- Online payment integration.
- Email and SMS notifications.
- Advanced reporting and analytics.
- Improved appointment scheduling.
- Cloud deployment.

## 👨‍💻 Developer

**Srinivasulu Gurram**

- GitHub: [SrinivasuluG369](https://github.com/SrinivasuluG369)
- Project Repository: [Hospital Management System](https://github.com/SrinivasuluG369/Hospital-Management-System)

---

⭐ If you find this project useful, feel free to explore the repository!
