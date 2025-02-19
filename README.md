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
Course Name (e.g, 'FLAT')
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
## API-ENDPOINTS

# user-routes

## register routes
- `POST /api/signup`: Register a new user

### response 

```
{
    "statusCode": 200,
    "data": {
        "_id": "67af9237c12584904408abb9",
        "fullname": "sp sahu",
        "username": "sps3456",
        "email": "satya200prakash@gmail.com",
        "role": "teacher",
        "createdAt": "2025-02-14T18:57:59.239Z",
        "updatedAt": "2025-02-14T18:57:59.239Z",
        "__v": 0
    },
    "message": "User registered Successfully",
    "success": true
}

```
## login routes

- `POST /api/auth/login`: Login a user

### response

```
{
    "statusCode": 200,
    "data": {
        "user": {
            "_id": "67af50de0934d26ea2058152",
            "fullname": "satya prakash sahu",
            "username": "satya2456",
            "email": "satya256prakash@gmail.com",
            "role": "teacher",
            "createdAt": "2025-02-14T14:19:10.582Z",
            "updatedAt": "2025-02-14T18:51:51.015Z",
            "__v": 0
        },
        "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2N2FmNTBkZTA5MzRkMjZlYTIwNTgxNTIiLCJlbWFpbCI6InNhdHlhMjU2cHJha2FzaEBnbWFpbC5jb20iLCJ1c2VybmFtZSI6InNhdHlhMjQ1NiIsImZ1bGxuYW1lIjoic2F0eWEgcHJha2FzaCBzYWh1IiwiaWF0IjoxNzM5NTU5MTExLCJleHAiOjE3Mzk5OTExMTF9.-cfUsCVe3Odt3v7CCV-gVmlhLh3QGO67VD3fV2-u5NM",
        "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2N2FmNTBkZTA5MzRkMjZlYTIwNTgxNTIiLCJpYXQiOjE3Mzk1NTkxMTEsImV4cCI6MTc0MDQyMzExMX0.xI_QmT5Uv9MsjjiuePB2Art-3qMEzZRwKGHQHmURxcc"
    },
    "message": "User Logged in Successfully",
    "success": true
}

```
## logout routes
- `PATCH /api/users/auth/logout`: logout user

### response

```
{
    "statusCode": 200,
    "data": "User Logged Out",
    "message": "Success",
    "success": true
}

```
## change-password routes
- `PATCH /api/users/auth/change-passowrd`: change the current password with new passowrd

### response

```
{
    "statusCode": 200,
    "data": {},
    "message": "Password changed Successfully",
    "success": true
}

```
## forget-password routes
- `PATCH /api/users/auth/forget-passowrd`: forget password, if you have email or username

### response

```
{
    "statusCode": 200,
    "data": {},
    "message": "User changed Password Successfully with the help of forgetPassord",
    "success": true
}

```
# class-routes

## create-class routes
- `POST /api/users/auth/create-class`: create a new class by teacher and generate a link 

### response

```
{
    "statusCode": 200,
    "data": {
        "className": "MCA",
        "courseName": "FLAT",
        "yearBatch": "2023-2026",
        "teacherId": "67af9237c12584904408abb9",
        "classToken": "995cc67763c45ef3369c",
        "link": "http://localhost:4000/class/form/995cc67763c45ef3369c",
        "_id": "67b24988de690010e2b92af2",
        "createdAt": "2025-02-16T20:24:40.279Z",
        "updatedAt": "2025-02-16T20:24:40.279Z",
        "__v": 0
    },
    "message": "Class created Successfully",
    "success": true
}

```
## update-class routes
- `POST /api/users/auth/update/class/:classId`: udate or change the details about class

### response

```
{
    "statusCode": 200,
    "data": {
        "_id": "67b24215bde45abaef290ffa",
        "className": "MCA",
        "courseName": "OS",//here update the courseName
        "yearBatch": "2023-2026",
        "teacherId": "67af9237c12584904408abb9",
        "classToken": "995cc67763c45ef3369c",
        "link": "http://localhost:4000/class/form/995cc67763c45ef3369c",
        "createdAt": "2025-02-16T20:24:40.279Z",
        "updatedAt": "2025-02-16T20:24:40.279Z",
        "__v": 0
    },
    "message": "Class Updated Successfully",
    "success": true
}

```
## delete-class routes
- `POST /api/users/auth/delete/class/:classId`: delete the class 

### response

```
{
    "statusCode": 200,
    "data": {},
    "message": "Class Deleted Successfully",
    "success": true
}

```
# student-routes

## add-student-routes
- `POST /api/users/auth/add/students`: add the student details like name, enrollmentno, classId

### postman-body -> where data comes

```
{
    "classToken": "kjkjf68lhc3hufd8970yhtfdc",
    "students": [
        {"Name": "Ramkrushnaa Nanda", "EnrollmentNo": "23MCA001"},
        {"Name": "Ashok Mohanta", "EnrollmentNo": "23MCA002"},
        {"Name": "Mohit Mallick", "EnrollmentNo": "23MCA003"},
        {"Name": "Abhinandan Sahu", "EnrollmentNo": "23MCA004"}
    ]
}

```
### response

```
{
    "statusCode": 200,
    "data": [
        {
            "Name": "Ramkrushnaa Nanda",
            "EnrollmentNo": "23MCA001",
            "class": "67b24215bde45abaef290ffa",
            "_id": "67b392ed0afafc0bb",
            "__v": 0,
            "createdAt": "2025-02-17T19:50:05.557Z",
            "updatedAt": "2025-02-17T19:50:05.557Z"
        },
        {
            "Name": "Ashok Mohanta",
            "EnrollmentNo": "23MCA002",
            "class": "67b24215bde45abaef290ffa",
            "_id": "67b392ed0afafc0bb",
            "__v": 0,
            "createdAt": "2025-02-17T19:50:05.558Z",
            "updatedAt": "2025-02-17T19:50:05.558Z"
        },
        {
            "Name": "Mohit Mallick",
            "EnrollmentNo": "23MCA003",
            "class": "67b24215bde45abaef290ffa",
            "_id": "67b392ed0afafc0bb",
            "__v": 0,
            "createdAt": "2025-02-17T19:50:05.558Z",
            "updatedAt": "2025-02-17T19:50:05.558Z"
        },
        {
            "Name": "Abhinandan Sahu",
            "EnrollmentNo": "23MCA004",
            "class": "67b24215bde45abaef290ffa",
            "_id": "67b392ed0afafc0bb",
            "__v": 0,
            "createdAt": "2025-02-17T19:50:05.558Z",
            "updatedAt": "2025-02-17T19:50:05.558Z"
        }
    ],
    "message": "Students added Successfully",
    "success": true
}

```
## get-student-details routes
- `POST /api/users/auth/get/student/details/:classId`: Getting all the students information like name,enrollmentno as a document and getting totalStudents

### response

```
{
    "statusCode": 200,
    "data": {
        "_id": "67b395f40afafc0bb7b65a5a",
        "students": [
            {
                "Name": "Abhishek Kumar",
                "EnrollmentNo": "23MCA004",
                "createdAt": "2025-02-17T20:04:03.953Z"
            },
            {
                "Name": "Satya Prakash Sahu",
                "EnrollmentNo": "23MCA0010",
                "createdAt": "2025-02-17T20:04:03.955Z"
            },
            {
                "Name": "Tonmoy Bhowmick",
                "EnrollmentNo": "23MCA013",
                "createdAt": "2025-02-17T20:04:03.955Z"
            },
            {
                "Name": "Rajneesh Sing",
                "EnrollmentNo": "23MCA024",
                "createdAt": "2025-02-17T20:04:03.955Z"
            },
            {
                "Name": "Gulsan Sing",
                "EnrollmentNo": "23MCA028",
                "createdAt": "2025-02-17T20:04:03.955Z"
            }
        ],
        "totalStudents": 5
    },
    "message": "Student details Fetched Successfully",
    "success": true
}

```
## mark-attendance routes
- `POST /api/users/auth/mark/attendance/:studenId`: mark the status either Prsent or Absent

### response

```
{
    "statusCode": 200,
    "data": "Present",
    "message": "Attendance marked sucessfully",
    "success": true
}

```
## get-class-attendance-by-date
- `GET /api/users/auth/get/class/attendance/byDate/:classId`: get class status involves name,enrollmentno,attendace has includes date,prsent or absent

### response

```
{
    "statusCode": 200,
    "data": {
        "_id": "67b395f40afafc0bb7b65a5a",
        "students": [
            {
                "Name": "Abhishek Kumar",
                "EnrollmentNo": "23MCA004",
                "attendance": [
                    {
                        "date": "2025-02-19T14:52:34.430Z",
                        "status": "Present",
                        "_id": "67b5f0329e211ef739594348"
                    }
                ],
                "presentOnDate": 1,
                "absentOnDate": 0
            },
            {
                "Name": "Satya Prakash Sahu",
                "EnrollmentNo": "23MCA0010",
                "attendance": [
                    {
                        "date": "2025-02-19T14:54:39.741Z",
                        "status": "Absent",
                        "_id": "67b5f0af9e211ef739594354"
                    }
                ],
                "presentOnDate": 0,
                "absentOnDate": 1
            },
            {
                "Name": "Tonmoy Bhowmick",
                "EnrollmentNo": "23MCA013",
                "attendance": [
                    {
                        "date": "2025-02-19T14:55:31.054Z",
                        "status": "Absent",
                        "_id": "67b5f0e39e211ef739594359"
                    }
                ],
                "presentOnDate": 0,
                "absentOnDate": 1
            },
            {
                "Name": "Rajneesh Sing",
                "EnrollmentNo": "23MCA024",
                "attendance": [
                    {
                        "date": "2025-02-19T14:56:43.405Z",
                        "status": "Absent",
                        "_id": "67b5f12b9e211ef73959435d"
                    }
                ],
                "presentOnDate": 0,
                "absentOnDate": 1
            },
            {
                "Name": "Gulsan Sing",
                "EnrollmentNo": "23MCA028",
                "attendance": [
                    {
                        "date": "2025-02-19T14:57:29.584Z",
                        "status": "Present",
                        "_id": "67b5f159fe8b11949527c707"
                    }
                ],
                "presentOnDate": 1,
                "absentOnDate": 0
            }
        ],
        "totalClassPresentOnDate": 2,
        "totalClassAbsentOnDate": 3
    },
    "message": "Student attendance details for 2025-02-19) fetched successfully",
    "success": true
}
`
```