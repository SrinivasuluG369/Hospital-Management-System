
// =====================================================
// MEDICAL RECORDS - BACKEND INTEGRATION
// =====================================================

const MEDICAL_RECORDS_API = "http://localhost:8081";

let allMedicalRecords = [];

document.addEventListener("DOMContentLoaded", function () {

    const recordsPage =
        document.getElementById("medicalRecordsTableBody");

    if (!recordsPage) return;

    setupMedicalRecordsPage();

});


// =====================================================
// 1. PAGE SETUP
// =====================================================

async function setupMedicalRecordsPage() {

    const role = sessionStorage.getItem("userRole");
    const token = sessionStorage.getItem("authToken");

    if (!role || !token) {
        alert("Please login first.");
        window.location.replace("login.html");
        return;
    }

    const addForm =
        document.getElementById("medicalRecordForm");

    // Only Doctor can add records
    if (addForm) {
        addForm.style.display =
            role === "doctor" ? "block" : "none";
    }

    if (role === "patient") {
        await loadPatientMedicalRecords();
    } else if (role === "doctor" || role === "admin") {
        await loadAllMedicalRecords();
    } else {
        alert("Invalid user role.");
        window.location.replace("login.html");
        return;
    }

    setupMedicalRecordForm();

}


// =====================================================
// 2. AUTHORIZATION HEADERS
// =====================================================

function getMedicalRecordHeaders() {

    return {
        "Content-Type": "application/json",
        "Authorization":
            "Bearer " + sessionStorage.getItem("authToken")
    };

}


// =====================================================
// 3. LOAD PATIENT'S OWN MEDICAL RECORDS
// =====================================================

async function loadPatientMedicalRecords() {

    const tableBody =
        document.getElementById("medicalRecordsTableBody");

    const message =
        document.getElementById("medicalRecordsListMessage");

    try {

        if (message) {
            message.textContent = "Loading your medical records...";
        }

        const username =
            sessionStorage.getItem("patientUsername");

        const profileResponse = await fetch(
            MEDICAL_RECORDS_API +
            "/api/patients/profile/" +
            encodeURIComponent(username),
            {
                headers: getMedicalRecordHeaders()
            }
        );

        if (!profileResponse.ok) {
            throw new Error("Unable to load patient profile.");
        }

        const patient = await profileResponse.json();

        const response = await fetch(
            MEDICAL_RECORDS_API +
            "/api/medical-records/patient/" +
            patient.id,
            {
                headers: getMedicalRecordHeaders()
            }
        );

        if (!response.ok) {
            throw new Error(
                "Unable to load medical records. HTTP " +
                response.status
            );
        }

        const records = await response.json();

        allMedicalRecords = records;

        displayMedicalRecords(records, false);

        if (message) {
            message.textContent =
                "Your medical records: " + records.length;
        }

    } catch (error) {

        console.error("Patient Medical Records Error:", error);

        if (message) {
            message.textContent = error.message;
        }

    }

}


// =====================================================
// 4. LOAD ALL MEDICAL RECORDS - DOCTOR / ADMIN
// =====================================================

async function loadAllMedicalRecords() {

    const message =
        document.getElementById("medicalRecordsListMessage");

    try {

        if (message) {
            message.textContent = "Loading medical records...";
        }

        const response = await fetch(
            MEDICAL_RECORDS_API + "/api/medical-records",
            {
                headers: getMedicalRecordHeaders()
            }
        );

        if (!response.ok) {
            throw new Error(
                "Unable to load records. HTTP " + response.status
            );
        }

        const records = await response.json();

        if (!Array.isArray(records)) {
            throw new Error("Invalid medical records received.");
        }

        allMedicalRecords = records;

        displayMedicalRecords(records, true);

        if (message) {
            message.textContent =
                "Total medical records: " + records.length;
        }

    } catch (error) {

        console.error("Medical Records Error:", error);

        if (message) {
            message.textContent = error.message;
        }

    }

}


// =====================================================
// 5. DISPLAY MEDICAL RECORDS
// =====================================================

function displayMedicalRecords(records, canDelete) {

    const tableBody =
        document.getElementById("medicalRecordsTableBody");

    if (!tableBody) return;

    tableBody.innerHTML = "";

    if (!records || records.length === 0) {

        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 8;
        cell.textContent = "No medical records found.";
        cell.style.textAlign = "center";

        row.appendChild(cell);
        tableBody.appendChild(row);

        return;
    }

    records.forEach(function (record) {

        const row = document.createElement("tr");

        const values = [
            record.id,
            record.patientId,
            record.patientName,
            record.doctorName,
            record.diagnosis,
            record.treatment,
            record.recordDate
        ];

        values.forEach(function (value) {

            const cell = document.createElement("td");

            cell.textContent = value ?? "-";
            cell.style.padding = "10px";
            cell.style.border = "1px solid #ddd";

            row.appendChild(cell);

        });

        const actionCell = document.createElement("td");

        if (canDelete) {

            const deleteButton =
                document.createElement("button");

            deleteButton.type = "button";
            deleteButton.textContent = "Delete";
            deleteButton.className = "btn";
            deleteButton.style.backgroundColor = "#dc3545";
            deleteButton.style.color = "white";

            deleteButton.addEventListener("click", function () {
                deleteMedicalRecord(record.id);
            });

            actionCell.appendChild(deleteButton);

        } else {

            actionCell.textContent = "No action";

        }

        row.appendChild(actionCell);
        tableBody.appendChild(row);

    });

}


// =====================================================
// 6. ADD MEDICAL RECORD - DOCTOR ONLY
// =====================================================

function setupMedicalRecordForm() {

    const form =
        document.getElementById("medicalRecordForm");

    if (!form) return;

    if (form.dataset.initialized === "true") return;

    form.dataset.initialized = "true";

    form.addEventListener("submit", async function (event) {

        event.preventDefault();

        const role = sessionStorage.getItem("userRole");

        if (role !== "doctor") {
            alert("Only doctors can add medical records.");
            return;
        }

        const patientId =
            document.getElementById("recordPatientId").value.trim();

        const doctorName =
            document.getElementById("recordDoctorName").value.trim();

        const diagnosis =
            document.getElementById("recordDiagnosis").value.trim();

        const treatment =
            document.getElementById("recordTreatment").value.trim();

        const message =
            document.getElementById("medicalRecordMessage");

        if (!patientId || !doctorName || !diagnosis || !treatment) {

            if (message) {
                message.textContent =
                    "Please fill all required fields.";
            }

            return;
        }

        if (!/^[0-9]+$/.test(patientId)) {

            if (message) {
                message.textContent =
                    "Please enter a valid Patient ID.";
            }

            return;
        }

        const submitButton =
            form.querySelector('button[type="submit"]');

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = "Saving...";
        }

        try {

            const response = await fetch(
                MEDICAL_RECORDS_API +
                "/api/medical-records/patient/" +
                encodeURIComponent(patientId),
                {
                    method: "POST",
                    headers: getMedicalRecordHeaders(),
                    body: JSON.stringify({
                        doctorName: doctorName,
                        diagnosis: diagnosis,
                        treatment: treatment
                    })
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Unable to save medical record."
                );
            }

            if (message) {
                message.textContent =
                    "Medical record added successfully! Record ID: " +
                    (result.recordId ?? "");
            }

            form.reset();

            await loadAllMedicalRecords();

        } catch (error) {

            console.error("Add Medical Record Error:", error);

            if (message) {
                message.textContent = error.message;
            }

        } finally {

            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = "Add Medical Record";
            }

        }

    });

}


// =====================================================
// 7. DELETE MEDICAL RECORD - DOCTOR / ADMIN
// =====================================================

async function deleteMedicalRecord(recordId) {

    const role = sessionStorage.getItem("userRole");

    if (role !== "doctor" && role !== "admin") {
        alert("You are not authorized to delete records.");
        return;
    }

    if (!confirm(
        "Are you sure you want to delete this medical record?"
    )) {
        return;
    }

    try {

        const response = await fetch(
            MEDICAL_RECORDS_API +
            "/api/medical-records/" +
            recordId,
            {
                method: "DELETE",
                headers: getMedicalRecordHeaders()
            }
        );

        if (!response.ok) {
            throw new Error(
                "Unable to delete record. HTTP " + response.status
            );
        }

        alert("Medical record deleted successfully!");

        await loadAllMedicalRecords();

    } catch (error) {

        console.error("Delete Medical Record Error:", error);

        alert(error.message);

    }

}
