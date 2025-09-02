OralVis Healthcare System

Project Description:
OralVis Healthcare System is a full-stack web application designed to streamline the process of managing dental scans and patient reports. It provides a secure platform with two distinct user roles: Technician and Dentist.

Technicians can securely upload patient dental scans, while Dentists can view these scans and generate professional PDF reports. The application is built with a clear separation of concerns, ensuring a robust and scalable architecture.

Features:
Technician Dashboard:
Secure Authentication: Log in with a unique technician account.
Scan Upload: Upload dental scan images with patient details (Name, ID, Scan Type, and Region).
Secure File Storage: All images are securely uploaded to a Cloudinary cloud storage bucket.

Dentist Dashboard:
Secure Authentication: Log in with a unique dentist account.
View Scans: Browse a list of all patient scans uploaded by technicians.
PDF Report Generation: Generate and download a comprehensive PDF report for any patient scan, which includes all patient details and the dental image.

Technology Stack:
Frontend:
React: A powerful JavaScript library for building user interfaces.
Axios: A promise-based HTTP client for making API requests.

Backend:
Node.js: A JavaScript runtime environment for building the server-side logic.
Express.js: A fast, minimalist web framework for Node.js.
SQLite3: A lightweight, serverless database used for storing user and scan data.
JWT (JSON Web Tokens): For secure, role-based user authentication.
Cloudinary: A cloud-based image and video management service for storing and serving scan images.
PDFKit: A library for creating PDF documents on the server.
Bcrypt: A library for hashing passwords securely.

Getting Started
Prerequisites
You will need the following installed on your machine:

Node.js (v18 or higher)

npm

1. Backend Setup
Navigate to the oralvis-project/oralvis-backend directory in your terminal.

Install the required backend dependencies:

npm install

Create a .env file in the root directory (oralvis-project) with your Cloudinary and JWT credentials:

CLOUDINARY_CLOUD_NAME=your_actual_cloud_name
CLOUDINARY_API_KEY=your_actual_api_key
CLOUDINARY_API_SECRET=your_actual_api_secret
JWT_SECRET_KEY=your_strong_secret_key_here

Start the backend server:

node index.js

The server will run on http://localhost:3000.

2. Frontend Setup
Open a new terminal and navigate to the oralvis-project/oralvis-frontend directory.

Install the required frontend dependencies:

npm install

Start the React development server:

npm run dev

The application will open in your browser, typically at http://localhost:5173.

3. User Credentials
Use the following pre-configured credentials for testing:

Technician:
Email: tech@oralvis.com
Password: password123

Dentist:
Email: dentist@oralvis.com
Password: password123

Password: password123
