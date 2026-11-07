
// =====================================================
// HOSPITAL MANAGEMENT SYSTEM
// Complete JavaScript - Backend Integration
// =====================================================

const API_BASE_URL = "http://localhost:8081";

let allPatients = [];
let allDoctors = [];
let allAdminAppointments = [];
let selectedAppointmentId = null;


// =====================================================
// DOM CONTENT LOADED
// =====================================================

document.addEventListener("DOMContentLoaded", function () {

    console.log("Hospital Management System loaded successfully.");

    setupForms();
    setupLogin();
    setupAppointment();
    setupPasswordValidation();

    loadPatientDashboard();
    loadPatientAppointments();

    loadAdminDashboard();
    loadAdminStatistics();

    loadAllPatients();
    setupPatientSearch();
    setupPatientDetails();

    loadAllDoctors();
    setupDoctorSearch();
    setupDoctorDetails();

    loadAllAdminAppointments();
    setupAdminAppointmentManagement();

    setupLogout();
    setCurrentYear();

});


// =====================================================
// 1. FORM VALIDATION
// =====================================================

function setupForms() {

    const forms = document.querySelectorAll("form");

    forms.forEach(function (form) {

        if (
            form.id === "loginForm" ||
            form.id === "appointmentForm"
        ) return;

        form.addEventListener("submit", function (event) {

            const requiredFields =
                form.querySelectorAll("[required]");

            let valid = true;

            requiredFields.forEach(function (field) {

                if (field.value.trim() === "") {
                    valid = false;
                    field.style.borderColor = "red";
                } else {
                    field.style.borderColor = "";
                }

            });

            if (!valid) {
                event.preventDefault();
                alert("Please fill all required fields.");
            }

        });

    });

}


// =====================================================
// 2. PASSWORD VALIDATION
// =====================================================

function setupPasswordValidation() {

    const password = document.getElementById("password");
    const confirmPassword =
        document.getElementById("confirmPassword");

    if (password && confirmPassword) {

        confirmPassword.addEventListener("input", function () {

            confirmPassword.style.borderColor =
                password.value === confirmPassword.value
                    ? "green" : "red";

        });

    }

    const adminPassword =
        document.getElementById("adminPassword");

    const adminConfirmPassword =
        document.getElementById("adminConfirmPassword");

    if (adminPassword && adminConfirmPassword) {

        adminConfirmPassword.addEventListener("input", function () {

            adminConfirmPassword.style.borderColor =
                adminPassword.value === adminConfirmPassword.value
                    ? "green" : "red";

        });

    }

}


// =====================================================
// 3. LOGIN - PATIENT, DOCTOR AND ADMIN
// =====================================================

function setupLogin() {

    const loginForm = document.getElementById("loginForm");

    if (!loginForm) return;

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const username =
            document.getElementById("username").value.trim();

        const password =
            document.getElementById("password").value;

        const selectedRole =
            document.getElementById("role").value;

        if (!username || !password || !selectedRole) {
            alert("Please enter all login details.");
            return;
        }

        const loginButton =
            loginForm.querySelector('button[type="submit"]');

        if (loginButton) {
            loginButton.disabled = true;
            loginButton.textContent = "Logging in...";
        }

        const loginEndpoints = {
            patient: "/api/patients/login",
            doctor: "/api/doctors/login",
            admin: "/api/admins/login"
        };

        const dashboardPages = {
            patient: "patient-dashboard.html",
            doctor: "doctor-dashboard.html",
            admin: "admin-dashboard.html"
        };

        try {

            const response = await fetch(
                API_BASE_URL + loginEndpoints[selectedRole],
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        username: username,
                        password: password
                    })
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Invalid username or password."
                );
            }

            if (!result.token) {
                throw new Error("Login token was not received.");
            }

            sessionStorage.clear();

            sessionStorage.setItem("username", username);
            sessionStorage.setItem("userRole", selectedRole);
            sessionStorage.setItem("authToken", result.token);

            if (selectedRole === "patient") {
                sessionStorage.setItem("patientUsername", username);
            }

            if (selectedRole === "doctor") {
                sessionStorage.setItem("doctorUsername", username);
            }

            if (selectedRole === "admin") {
                sessionStorage.setItem("adminUsername", username);
            }

            alert(
                selectedRole.charAt(0).toUpperCase() +
                selectedRole.slice(1) +
                " login successful!"
            );

            window.location.assign(dashboardPages[selectedRole]);

        } catch (error) {

            console.error("Login Error:", error);
            alert(error.message || "Server connection failed.");

        } finally {

            if (loginButton) {
                loginButton.disabled = false;
                loginButton.textContent = "Login";
            }

        }

    });

}


// =====================================================
// 4. COMMON AUTHORIZATION HEADER
// =====================================================

function getAuthHeaders() {

    const token = sessionStorage.getItem("authToken");

    return {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
    };

}


// =====================================================
// 5. PATIENT DASHBOARD - LOAD PROFILE
// =====================================================

async function loadPatientDashboard() {

    const patientNameElement =
        document.getElementById("patientName");

    if (!patientNameElement) return;

    const username =
        sessionStorage.getItem("patientUsername");

    const token =
        sessionStorage.getItem("authToken");

    if (!username || !token) {
        alert("Please login first.");
        window.location.replace("login.html");
        return;
    }

    try {

        const response = await fetch(
            API_BASE_URL +
            "/api/patients/profile/" +
            encodeURIComponent(username),
            {
                headers: getAuthHeaders()
            }
        );

        if (!response.ok) {
            throw new Error("Unable to load patient profile.");
        }

        const patient = await response.json();

        patientNameElement.textContent =
            patient.patientName;

        const fields = {
            patientId: patient.id,
            profileName: patient.patientName,
            patientEmail: patient.email,
            patientPhone: patient.phone,
            patientBloodGroup: patient.bloodGroup,
            patientGender: patient.gender
        };

        Object.entries(fields).forEach(function ([id, value]) {

            const element = document.getElementById(id);

            if (element) {
                element.textContent = value ?? "-";
            }

        });

        console.log("Patient profile loaded successfully.");

    } catch (error) {

        console.error("Patient Profile Error:", error);

        alert("Unable to load patient details. Please login again.");

    }

}


// =====================================================
// 6. ADMIN DASHBOARD - LOAD PROFILE
// =====================================================

async function loadAdminDashboard() {

    const adminNameElement =
        document.getElementById("adminName");

    if (!adminNameElement) return;

    const username =
        sessionStorage.getItem("adminUsername");

    const token =
        sessionStorage.getItem("authToken");

    const role =
        sessionStorage.getItem("userRole");

    const designationElement =
        document.getElementById("adminDesignation");

    const messageElement =
        document.getElementById("adminMessage");

    if (!username || !token || role !== "admin") {

        alert("Please login as Admin first.");
        window.location.replace("login.html");
        return;

    }

    try {

        if (messageElement) {
            messageElement.textContent = "Loading admin details...";
        }

        const response = await fetch(
            API_BASE_URL +
            "/api/admins/profile/" +
            encodeURIComponent(username),
            {
                method: "GET",
                headers: getAuthHeaders()
            }
        );

        if (!response.ok) {
            throw new Error(
                "Unable to load Admin profile. HTTP " + response.status
            );
        }

        const admin = await response.json();

        adminNameElement.textContent =
            admin.adminName || username;

        if (designationElement) {
            designationElement.textContent =
                admin.designation || "Hospital Administrator";
        }

        if (messageElement) {
            messageElement.textContent =
                "Admin profile loaded successfully.";
        }

        console.log("Admin profile loaded successfully.", admin);

    } catch (error) {

        console.error("Admin Profile Error:", error);

        if (messageElement) {
            messageElement.textContent =
                "Unable to load Admin profile: " + error.message;
        }

    }

}


// =====================================================
// 7. ADMIN DASHBOARD - LIVE STATISTICS
// =====================================================

async function loadAdminStatistics() {

    const patientsElement =
        document.getElementById("totalPatients");

    if (!patientsElement) return;

    const doctorsElement =
        document.getElementById("totalDoctors");

    const appointmentsElement =
        document.getElementById("totalAppointments");

    const billsElement =
        document.getElementById("totalBills");

    const username =
        sessionStorage.getItem("adminUsername");

    const token =
        sessionStorage.getItem("authToken");

    const role =
        sessionStorage.getItem("userRole");

    if (!username || !token || role !== "admin") return;

    try {

        const response = await fetch(
            API_BASE_URL + "/api/admin/statistics",
            {
                method: "GET",
                headers: getAuthHeaders()
            }
        );

        if (!response.ok) {
            throw new Error(
                "Unable to load statistics. HTTP " + response.status
            );
        }

        const statistics = await response.json();

        patientsElement.textContent =
            statistics.totalPatients ?? 0;

        if (doctorsElement) {
            doctorsElement.textContent =
                statistics.totalDoctors ?? 0;
        }

        if (appointmentsElement) {
            appointmentsElement.textContent =
                statistics.totalAppointments ?? 0;
        }

        if (billsElement) {
            billsElement.textContent =
                statistics.totalBills ?? 0;
        }

        console.log("Admin statistics loaded successfully.", statistics);

    } catch (error) {

        console.error("Admin Statistics Error:", error);

        patientsElement.textContent = "Error";

        if (doctorsElement) doctorsElement.textContent = "Error";
        if (appointmentsElement) appointmentsElement.textContent = "Error";
        if (billsElement) billsElement.textContent = "Error";

    }

}


// =====================================================
// 8. PATIENT MANAGEMENT - LOAD ALL PATIENTS
// =====================================================

async function loadAllPatients() {

    const tableBody =
        document.getElementById("patientsTableBody");

    if (!tableBody) return;

    const messageElement =
        document.getElementById("patientListMessage");

    const username =
        sessionStorage.getItem("adminUsername");

    const token =
        sessionStorage.getItem("authToken");

    const role =
        sessionStorage.getItem("userRole");

    if (!username || !token || role !== "admin") {

        alert("Please login as Admin to view patients.");
        window.location.replace("login.html");
        return;

    }

    try {

        if (messageElement) {
            messageElement.textContent =
                "Loading registered patients...";
        }

        const response = await fetch(
            API_BASE_URL + "/api/patients",
            {
                method: "GET",
                headers: getAuthHeaders()
            }
        );

        if (!response.ok) {
            throw new Error(
                "Unable to load patients. HTTP " + response.status
            );
        }

        const patients = await response.json();

        if (!Array.isArray(patients)) {
            throw new Error("Invalid patient data received.");
        }

        allPatients = patients;

        displayPatients(allPatients);

        if (messageElement) {
            messageElement.textContent =
                "Total registered patients: " + allPatients.length;
        }

        console.log("Patient list loaded successfully.", allPatients);

    } catch (error) {

        console.error("Patient List Error:", error);

        if (messageElement) {
            messageElement.textContent =
                "Unable to load patients: " + error.message;
        }

    }

}


// =====================================================
// 9. DISPLAY PATIENTS IN TABLE
// =====================================================

function displayPatients(patients) {

    const tableBody =
        document.getElementById("patientsTableBody");

    if (!tableBody) return;

    tableBody.innerHTML = "";

    if (patients.length === 0) {

        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 7;
        cell.textContent = "No patients found.";
        cell.style.textAlign = "center";

        row.appendChild(cell);
        tableBody.appendChild(row);
        return;

    }

    patients.forEach(function (patient) {

        const row = document.createElement("tr");

        const values = [
            patient.id,
            patient.patientName,
            patient.gender,
            calculateAge(patient.dob),
            patient.phone,
            patient.bloodGroup
        ];

        values.forEach(function (value) {

            const cell = document.createElement("td");

            cell.textContent = value ?? "-";
            cell.style.padding = "10px";
            cell.style.border = "1px solid #ddd";

            row.appendChild(cell);

        });

        const actionCell = document.createElement("td");
        const viewButton = document.createElement("button");

        viewButton.type = "button";
        viewButton.textContent = "View";
        viewButton.className = "btn secondary-btn";

        viewButton.addEventListener("click", function () {
            viewPatientDetails(patient.id);
        });

        actionCell.appendChild(viewButton);
        row.appendChild(actionCell);
        tableBody.appendChild(row);

    });

}


// =====================================================
// 10. PATIENT SEARCH
// =====================================================

function setupPatientSearch() {

    const searchInput =
        document.getElementById("patientSearch");

    if (!searchInput) return;

    searchInput.addEventListener("input", function () {

        const searchValue =
            searchInput.value.trim().toLowerCase();

        const filteredPatients =
            allPatients.filter(function (patient) {

                const name =
                    (patient.patientName || "").toLowerCase();

                const phone =
                    (patient.phone || "").toLowerCase();

                const username =
                    (patient.username || "").toLowerCase();

                return name.includes(searchValue) ||
                    phone.includes(searchValue) ||
                    username.includes(searchValue);

            });

        displayPatients(filteredPatients);

        const messageElement =
            document.getElementById("patientListMessage");

        if (messageElement) {
            messageElement.textContent =
                "Patients found: " + filteredPatients.length;
        }

    });

}


// =====================================================
// 11. VIEW PATIENT DETAILS
// =====================================================

function setupPatientDetails() {

    const closeButton =
        document.getElementById("closePatientDetails");

    if (closeButton) {

        closeButton.addEventListener("click", function () {

            const detailsSection =
                document.getElementById("patientDetails");

            if (detailsSection) {
                detailsSection.style.display = "none";
            }

        });

    }

}


function viewPatientDetails(patientId) {

    const patient = allPatients.find(function (item) {
        return String(item.id) === String(patientId);
    });

    if (!patient) {
        alert("Patient details not found.");
        return;
    }

    const fields = {
        detailId: patient.id,
        detailName: patient.patientName,
        detailDob: patient.dob,
        detailGender: patient.gender,
        detailBloodGroup: patient.bloodGroup,
        detailPhone: patient.phone,
        detailEmail: patient.email,
        detailAddress: patient.address,
        detailEmergency: patient.emergency,
        detailUsername: patient.username
    };

    Object.entries(fields).forEach(function ([id, value]) {

        const element = document.getElementById(id);

        if (element) {
            element.textContent = value ?? "-";
        }

    });

    const detailsSection =
        document.getElementById("patientDetails");

    if (detailsSection) {

        detailsSection.style.display = "block";

        detailsSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }

}


// =====================================================
// 12. DOCTOR MANAGEMENT - LOAD ALL DOCTORS
// =====================================================

async function loadAllDoctors() {

    const tableBody =
        document.getElementById("doctorsTableBody");

    if (!tableBody) return;

    const messageElement =
        document.getElementById("doctorListMessage");

    const username =
        sessionStorage.getItem("adminUsername");

    const token =
        sessionStorage.getItem("authToken");

    const role =
        sessionStorage.getItem("userRole");

    if (!username || !token || role !== "admin") {

        alert("Please login as Admin to view doctors.");
        window.location.replace("login.html");
        return;

    }

    try {

        if (messageElement) {
            messageElement.textContent = "Loading doctors...";
        }

        const response = await fetch(
            API_BASE_URL + "/api/doctors",
            {
                method: "GET",
                headers: getAuthHeaders()
            }
        );

        if (!response.ok) {
            throw new Error(
                "Unable to load doctors. HTTP " + response.status
            );
        }

        const doctors = await response.json();

        if (!Array.isArray(doctors)) {
            throw new Error("Invalid doctor data received.");
        }

        allDoctors = doctors;

        displayDoctors(allDoctors);

        if (messageElement) {
            messageElement.textContent =
                "Total registered doctors: " + allDoctors.length;
        }

        console.log("Doctor list loaded successfully.", allDoctors);

    } catch (error) {

        console.error("Doctor List Error:", error);

        if (messageElement) {
            messageElement.textContent =
                "Unable to load doctors: " + error.message;
        }

    }

}


// =====================================================
// 13. DISPLAY DOCTORS IN TABLE
// =====================================================

function displayDoctors(doctors) {

    const tableBody =
        document.getElementById("doctorsTableBody");

    if (!tableBody) return;

    tableBody.innerHTML = "";

    if (doctors.length === 0) {

        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 7;
        cell.textContent = "No doctors found.";
        cell.style.textAlign = "center";

        row.appendChild(cell);
        tableBody.appendChild(row);
        return;

    }

    doctors.forEach(function (doctor) {

        const row = document.createElement("tr");

        const values = [
            doctor.id,
            doctor.doctorName,
            doctor.specialization,
            doctor.qualification,
            doctor.experience != null
                ? doctor.experience + " Years"
                : "-",
            doctor.doctorPhone
        ];

        values.forEach(function (value) {

            const cell = document.createElement("td");

            cell.textContent = value ?? "-";
            cell.style.padding = "10px";
            cell.style.border = "1px solid #ddd";

            row.appendChild(cell);

        });

        const actionCell = document.createElement("td");
        const viewButton = document.createElement("button");

        viewButton.type = "button";
        viewButton.textContent = "View";
        viewButton.className = "btn secondary-btn";

        viewButton.addEventListener("click", function () {
            viewDoctorDetails(doctor.id);
        });

        actionCell.appendChild(viewButton);
        row.appendChild(actionCell);
        tableBody.appendChild(row);

    });

}


// =====================================================
// 14. DOCTOR SEARCH
// =====================================================

function setupDoctorSearch() {

    const searchInput =
        document.getElementById("doctorSearch");

    if (!searchInput) return;

    searchInput.addEventListener("input", function () {

        const searchValue =
            searchInput.value.trim().toLowerCase();

        const filteredDoctors =
            allDoctors.filter(function (doctor) {

                const name =
                    (doctor.doctorName || "").toLowerCase();

                const specialization =
                    (doctor.specialization || "").toLowerCase();

                const phone =
                    (doctor.doctorPhone || "").toLowerCase();

                const username =
                    (doctor.doctorUsername || "").toLowerCase();

                return name.includes(searchValue) ||
                    specialization.includes(searchValue) ||
                    phone.includes(searchValue) ||
                    username.includes(searchValue);

            });

        displayDoctors(filteredDoctors);

        const messageElement =
            document.getElementById("doctorListMessage");

        if (messageElement) {
            messageElement.textContent =
                "Doctors found: " + filteredDoctors.length;
        }

    });

}


// =====================================================
// 15. VIEW DOCTOR DETAILS
// =====================================================

function setupDoctorDetails() {

    const closeButton =
        document.getElementById("closeDoctorDetails");

    if (closeButton) {

        closeButton.addEventListener("click", function () {

            const detailsSection =
                document.getElementById("doctorDetails");

            if (detailsSection) {
                detailsSection.style.display = "none";
            }

        });

    }

}


function viewDoctorDetails(doctorId) {

    const doctor = allDoctors.find(function (item) {
        return String(item.id) === String(doctorId);
    });

    if (!doctor) {
        alert("Doctor details not found.");
        return;
    }

    const fields = {
        detailDoctorId: doctor.id,
        detailDoctorName: doctor.doctorName,
        detailSpecialization: doctor.specialization,
        detailQualification: doctor.qualification,
        detailExperience: doctor.experience != null
            ? doctor.experience + " Years"
            : "-",
        detailDepartment: doctor.department,
        detailDoctorPhone: doctor.doctorPhone,
        detailDoctorEmail: doctor.doctorEmail,
        detailDoctorUsername: doctor.doctorUsername
    };

    Object.entries(fields).forEach(function ([id, value]) {

        const element = document.getElementById(id);

        if (element) {
            element.textContent = value ?? "-";
        }

    });

    const detailsSection =
        document.getElementById("doctorDetails");

    if (detailsSection) {

        detailsSection.style.display = "block";

        detailsSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }

}


// =====================================================
// 16. CALCULATE PATIENT AGE
// =====================================================

function calculateAge(dob) {

    if (!dob) return "-";

    const birthDate = new Date(dob + "T00:00:00");

    if (Number.isNaN(birthDate.getTime())) {
        return "-";
    }

    const today = new Date();

    let age =
        today.getFullYear() - birthDate.getFullYear();

    const monthDifference =
        today.getMonth() - birthDate.getMonth();

    if (
        monthDifference < 0 ||
        (
            monthDifference === 0 &&
            today.getDate() < birthDate.getDate()
        )
    ) {
        age--;
    }

    return age >= 0 ? age : "-";

}


// =====================================================
// 17. APPOINTMENT BOOKING
// =====================================================

async function setupAppointment() {

    const appointmentForm =
        document.getElementById("appointmentForm");

    if (!appointmentForm) return;

    const patientInput =
        document.getElementById("patient");

    const doctorInput =
        document.getElementById("doctor");

    const dateInput =
        document.getElementById("appointmentDate");

    const timeInput =
        document.getElementById("appointmentTime");

    const reasonInput =
        document.getElementById("reason");

    const username =
        sessionStorage.getItem("patientUsername");

    const token =
        sessionStorage.getItem("authToken");

    const role =
        sessionStorage.getItem("userRole");

    if (!username || !token || role !== "patient") {

        alert("Please login as Patient first.");
        window.location.replace("login.html");
        return;

    }

    let patient;

    try {

        const response = await fetch(
            API_BASE_URL +
            "/api/patients/profile/" +
            encodeURIComponent(username),
            {
                headers: getAuthHeaders()
            }
        );

        if (!response.ok) {
            throw new Error("Patient profile not found.");
        }

        patient = await response.json();

        if (patientInput) {
            patientInput.value = patient.patientName;
        }

        if (dateInput) {
            dateInput.min = getLocalDate();
        }

        await loadAppointmentDoctors(doctorInput);

    } catch (error) {

        console.error("Appointment Setup Error:", error);

        alert(error.message || "Unable to load appointment details.");
        return;

    }

    appointmentForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        if (
            !doctorInput ||
            !doctorInput.value ||
            !dateInput.value ||
            !timeInput.value
        ) {
            alert("Please fill all required appointment details.");
            return;
        }

        if (dateInput.value < getLocalDate()) {
            alert("Please select a valid appointment date.");
            return;
        }

        const appointmentData = {
            doctor: doctorInput.value,
            appointmentDate: dateInput.value,
            appointmentTime: timeInput.value.length === 5
                ? timeInput.value + ":00"
                : timeInput.value,
            reason: reasonInput ? reasonInput.value : ""
        };

        const submitButton =
            appointmentForm.querySelector('button[type="submit"]');

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = "Booking...";
        }

        try {

            const response = await fetch(
                API_BASE_URL +
                "/api/appointments/book/" +
                patient.id,
                {
                    method: "POST",
                    headers: getAuthHeaders(),
                    body: JSON.stringify(appointmentData)
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Appointment booking failed."
                );
            }

            alert(
                "Appointment booked successfully!\n" +
                "Appointment ID: " + result.appointmentId +
                "\nStatus: " + result.status
            );

            appointmentForm.reset();

            if (patientInput) {
                patientInput.value = patient.patientName;
            }

            if (dateInput) {
                dateInput.min = getLocalDate();
            }

        } catch (error) {

            console.error("Appointment Booking Error:", error);

            alert(error.message || "Server connection failed.");

        } finally {

            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = "Book Appointment";
            }

        }

    });

}


// =====================================================
// 18. LOAD DOCTORS INTO APPOINTMENT DROPDOWN
// =====================================================

async function loadAppointmentDoctors(doctorInput) {

    if (!doctorInput) return;

    doctorInput.innerHTML =
        '<option value="">Loading doctors...</option>';

    try {

        const response = await fetch(
            API_BASE_URL + "/api/doctors",
            {
                method: "GET",
                headers: getAuthHeaders()
            }
        );

        if (!response.ok) {
            throw new Error(
                "Unable to load doctors. HTTP " + response.status
            );
        }

        const doctors = await response.json();

        doctorInput.innerHTML =
            '<option value="">Select Doctor</option>';

        if (!Array.isArray(doctors) || doctors.length === 0) {

            doctorInput.innerHTML =
                '<option value="">No doctors available</option>';

            return;

        }

        doctors.forEach(function (doctor) {

            const option = document.createElement("option");

            option.value =
                doctor.doctorName + " - " + doctor.specialization;

            option.textContent =
                doctor.doctorName + " - " + doctor.specialization;

            doctorInput.appendChild(option);

        });

        console.log(
            "Appointment doctors loaded successfully.",
            doctors
        );

    } catch (error) {

        console.error("Appointment Doctors Error:", error);

        doctorInput.innerHTML =
            '<option value="">Unable to load doctors</option>';

        throw error;

    }

}


// =====================================================
// 19. LOAD PATIENT APPOINTMENTS
// =====================================================

async function loadPatientAppointments() {

    const appointmentTable =
        document.getElementById("appointmentTable");

    if (!appointmentTable) return;

    const messageElement =
        document.getElementById("appointmentMessage");

    const tableBody =
        document.getElementById("appointmentTableBody");

    const username =
        sessionStorage.getItem("patientUsername");

    const token =
        sessionStorage.getItem("authToken");

    if (!username || !token) return;

    try {

        if (messageElement) {
            messageElement.textContent = "Loading appointments...";
        }

        const profileResponse = await fetch(
            API_BASE_URL +
            "/api/patients/profile/" +
            encodeURIComponent(username),
            {
                headers: getAuthHeaders()
            }
        );

        if (!profileResponse.ok) {
            throw new Error("Unable to load patient profile.");
        }

        const patient = await profileResponse.json();

        const response = await fetch(
            API_BASE_URL +
            "/api/appointments/patient/" +
            patient.id,
            {
                headers: getAuthHeaders()
            }
        );

        if (!response.ok) {
            throw new Error("Unable to load appointments.");
        }

        const appointments = await response.json();

        if (tableBody) {
            tableBody.innerHTML = "";
        }

        if (
            !Array.isArray(appointments) ||
            appointments.length === 0
        ) {

            if (messageElement) {
                messageElement.textContent = "No appointments found.";
            }

            appointmentTable.style.display = "none";
            return;

        }

        appointments.forEach(function (appointment) {

            const row = document.createElement("tr");

            const values = [
                appointment.id,
                appointment.doctor,
                appointment.appointmentDate,
                appointment.appointmentTime,
                appointment.reason || "-",
                appointment.status
            ];

            values.forEach(function (value) {

                const cell = document.createElement("td");

                cell.textContent = value ?? "-";
                cell.style.padding = "12px";
                cell.style.border = "1px solid #ddd";

                row.appendChild(cell);

            });

            if (tableBody) {
                tableBody.appendChild(row);
            }

        });

        appointmentTable.style.display = "table";

        if (messageElement) {
            messageElement.textContent = "Your appointments:";
        }

        console.log("Patient appointments loaded successfully.");

    } catch (error) {

        console.error("Appointment Loading Error:", error);

        if (messageElement) {
            messageElement.textContent =
                "Unable to load appointments. Please try again.";
        }

    }

}


// =====================================================
// 20. LOGOUT
// =====================================================

function setupLogout() {

    const logoutLink =
        document.getElementById("adminLogout");

    if (logoutLink) {

        logoutLink.addEventListener("click", function (event) {

            event.preventDefault();
            logout();

        });

    }

}


function logout() {

    const result = confirm("Are you sure you want to logout?");

    if (result) {
        sessionStorage.clear();
        window.location.replace("login.html");
    }

}


// =====================================================
// 21. GET LOCAL DATE
// =====================================================

function getLocalDate() {

    const today = new Date();

    return today.getFullYear() + "-" +
        String(today.getMonth() + 1).padStart(2, "0") + "-" +
        String(today.getDate()).padStart(2, "0");

}


// =====================================================
// 22. PHONE NUMBER VALIDATION
// =====================================================

function validatePhone(phone) {

    const phonePattern = /^[0-9]{10}$/;

    return phonePattern.test(phone);

}


// =====================================================
// 23. EMAIL VALIDATION
// =====================================================

function validateEmail(email) {

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailPattern.test(email);

}


// =====================================================
// 24. SHOW / HIDE PASSWORD
// =====================================================

function togglePassword(inputId) {

    const input = document.getElementById(inputId);

    if (!input) return;

    input.type =
        input.type === "password" ? "text" : "password";

}


// =====================================================
// 25. DELETE CONFIRMATION
// =====================================================

function confirmDelete() {

    return confirm(
        "Are you sure you want to delete this record?"
    );

}


// =====================================================
// 26. CURRENT YEAR
// =====================================================

function setCurrentYear() {

    const yearElements =
        document.querySelectorAll(".current-year");

    const year = new Date().getFullYear();

    yearElements.forEach(function (element) {
        element.textContent = year;
    });

}


// =====================================================
// 27. ADMIN APPOINTMENTS - LOAD ALL APPOINTMENTS
// =====================================================

async function loadAllAdminAppointments() {

    const tableBody =
        document.getElementById("adminAppointmentsTableBody");

    if (!tableBody) return;

    const message =
        document.getElementById("adminAppointmentMessage");

    const username =
        sessionStorage.getItem("adminUsername");

    const token =
        sessionStorage.getItem("authToken");

    const role =
        sessionStorage.getItem("userRole");

    if (!username || !token || role !== "admin") {

        alert("Please login as Admin to view appointments.");
        window.location.replace("login.html");
        return;

    }

    try {

        if (message) {
            message.textContent = "Loading appointments...";
        }

        const response = await fetch(
            API_BASE_URL + "/api/appointments",
            {
                method: "GET",
                headers: getAuthHeaders()
            }
        );

        if (!response.ok) {
            throw new Error(
                "Unable to load appointments. HTTP " + response.status
            );
        }

        const appointments = await response.json();

        if (!Array.isArray(appointments)) {
            throw new Error("Invalid appointment data received.");
        }

        allAdminAppointments = appointments;

        displayAdminAppointments(allAdminAppointments);

        if (message) {
            message.textContent =
                "Total appointments: " + allAdminAppointments.length;
        }

        console.log(
            "Admin appointments loaded successfully.",
            allAdminAppointments
        );

    } catch (error) {

        console.error("Admin Appointment Error:", error);

        if (message) {
            message.textContent =
                "Unable to load appointments: " + error.message;
        }

    }

}


// =====================================================
// 28. DISPLAY ADMIN APPOINTMENTS
// =====================================================

function displayAdminAppointments(appointments) {

    const tableBody =
        document.getElementById("adminAppointmentsTableBody");

    if (!tableBody) return;

    tableBody.innerHTML = "";

    if (appointments.length === 0) {

        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 8;
        cell.textContent = "No appointments found.";
        cell.style.textAlign = "center";

        row.appendChild(cell);
        tableBody.appendChild(row);
        return;

    }

    appointments.forEach(function (appointment) {

        const row = document.createElement("tr");

        const values = [
            appointment.id,
            appointment.patientName,
            appointment.doctor,
            appointment.appointmentDate,
            appointment.appointmentTime,
            appointment.reason || "-",
            appointment.status
        ];

        values.forEach(function (value) {

            const cell = document.createElement("td");

            cell.textContent = value ?? "-";
            cell.style.padding = "10px";
            cell.style.border = "1px solid #ddd";

            row.appendChild(cell);

        });

        const actionCell = document.createElement("td");

        if (appointment.status === "PENDING") {

            const approveButton = document.createElement("button");

            approveButton.type = "button";
            approveButton.textContent = "Approve";
            approveButton.className = "btn";
            approveButton.style.margin = "3px";
            approveButton.style.backgroundColor = "#198754";
            approveButton.style.color = "white";

            approveButton.addEventListener("click", function () {
                updateAppointmentStatusDirect(
                    appointment.id,
                    "APPROVED"
                );
            });

            const rejectButton = document.createElement("button");

            rejectButton.type = "button";
            rejectButton.textContent = "Reject";
            rejectButton.className = "btn";
            rejectButton.style.margin = "3px";
            rejectButton.style.backgroundColor = "#dc3545";
            rejectButton.style.color = "white";

            rejectButton.addEventListener("click", function () {
                updateAppointmentStatusDirect(
                    appointment.id,
                    "REJECTED"
                );
            });

            actionCell.appendChild(approveButton);
            actionCell.appendChild(rejectButton);

        } else {

            actionCell.textContent = "No action required";

        }

        row.appendChild(actionCell);
        tableBody.appendChild(row);

    });

}


// =====================================================
// 29. ADMIN APPOINTMENT SEARCH
// =====================================================

function setupAdminAppointmentManagement() {

    const searchInput =
        document.getElementById("appointmentSearch");

    if (!searchInput) return;

    searchInput.addEventListener("input", function () {

        const searchValue =
            searchInput.value.trim().toLowerCase();

        const filteredAppointments =
            allAdminAppointments.filter(function (appointment) {

                const patientName =
                    (appointment.patientName || "").toLowerCase();

                const doctor =
                    (appointment.doctor || "").toLowerCase();

                const status =
                    (appointment.status || "").toLowerCase();

                const reason =
                    (appointment.reason || "").toLowerCase();

                return patientName.includes(searchValue) ||
                    doctor.includes(searchValue) ||
                    status.includes(searchValue) ||
                    reason.includes(searchValue);

            });

        displayAdminAppointments(filteredAppointments);

        const message =
            document.getElementById("adminAppointmentMessage");

        if (message) {
            message.textContent =
                "Appointments found: " + filteredAppointments.length;
        }

    });

}


// =====================================================
// 30. UPDATE APPOINTMENT STATUS - APPROVE / REJECT
// =====================================================

async function updateAppointmentStatusDirect(
    appointmentId,
    status
) {

    const confirmed = confirm(
        "Are you sure you want to " +
        status.toLowerCase() +
        " this appointment?"
    );

    if (!confirmed) return;

    try {

        const response = await fetch(
            API_BASE_URL +
            "/api/appointments/" +
            appointmentId +
            "/status",
            {
                method: "PUT",
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    status: status
                })
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.message || "Appointment status update failed."
            );
        }

        alert(
            "Appointment " +
            status.toLowerCase() +
            " successfully!"
        );

        await loadAllAdminAppointments();

        await loadAdminStatistics();

    } catch (error) {

        console.error("Appointment Status Error:", error);

        alert(error.message || "Unable to update appointment status.");

    }

}


// =====================================================
// 31. VIEW ADMIN APPOINTMENT DETAILS
// =====================================================

function viewAdminAppointment(appointmentId) {

    const appointment =
        allAdminAppointments.find(function (item) {
            return String(item.id) === String(appointmentId);
        });

    if (!appointment) {
        alert("Appointment details not found.");
        return;
    }

    selectedAppointmentId = appointment.id;

    const fields = {
        detailAppointmentId: appointment.id,
        detailAppointmentPatient: appointment.patientName,
        detailAppointmentDoctor: appointment.doctor,
        detailAppointmentDate: appointment.appointmentDate,
        detailAppointmentTime: appointment.appointmentTime,
        detailAppointmentReason: appointment.reason,
        detailAppointmentStatus: appointment.status
    };

    Object.entries(fields).forEach(function ([id, value]) {

        const element = document.getElementById(id);

        if (element) {
            element.textContent = value ?? "-";
        }

    });

    const details =
        document.getElementById("adminAppointmentDetails");

    if (details) {

        details.style.display = "block";

        details.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }

}
