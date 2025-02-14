## MODEL LINK
Model structure of STUDENTS-ATTENDANCE
-[Model Structure (click to view)](https://app.eraser.io/workspace/Kgklu6aYzn46y9NzSI9E)

## Project Overview Students Attendance :

This project is an attendance management system designed for teachers and students. It allows teachers to create classes, collect student data, and track attendance efficiently. The system also provides a dashboard for viewing and downloading attendance records.

# Workflow for Backend

## 1. Authentication System
The system supports login for teachers and users (admins) to access the platform securely.
Teachers can manage their classes and student attendance after logging in.

## 2. Class Creation
Teachers can create a new class by entering:
Class Name (e.g., "MCA")
Batch Year (e.g., "2023-2026")

## 3. Student Data Collection
Once a class is created, the teacher generates a unique class link.
The link is shared with the Class Representative (CR), who fills in student details:
Student Name
Enrollment Number
Total Number of Students

## 4. Automatic Student Grid Creation
After student data is submitted, the system:
Fetches the total number of students for that class.
Generates a grid layout displaying all students.

## 5. Attendance Marking System
The teacher marks attendance in the grid:
Click on a student to mark them as Present.
Click again to mark them as Absent.
A toggle button or tab can be used for better user experience.

## 6. Attendance Count
The system automatically counts:
Total Present Students
Total Absent Students

## 7. Attendance Dashboard
The dashboard stores and displays attendance date-wise for each class.
It lists:
Present Student Roll Numbers
Absent Student Roll Numbers
## 8. Download Attendance Reports
Teachers can download attendance records for each date.
A download link is available in the dashboard for exporting data in formats like CSV or PDF.

## Project Structure

```plaintext
attendance-backend/
│── models/
│   ├── user.js
│   ├── class.js
│   ├── student.js
│   ├── attendance.js
│── routes/
│   ├── user.js
│   ├── classRoutes.js
│   ├── studentRoutes.js
│   ├── attendanceRoutes.js
│── controllers/
│   ├── user.js
│   ├── classController.js
│   ├── studentController.js
│   ├── attendanceController.js
│── middleware/
│   ├── authMiddleware.js
│── config/
│   ├── db.js
│── server.js
│── .env
│── package.json

```