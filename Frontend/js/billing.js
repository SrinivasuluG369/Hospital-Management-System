
const BILLING_API = "http://localhost:8081";

document.addEventListener("DOMContentLoaded", function () {
    setupBillingPage();
});

function getBillingHeaders() {
    return {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + sessionStorage.getItem("authToken")
    };
}

async function setupBillingPage() {
    const role = sessionStorage.getItem("userRole");
    const token = sessionStorage.getItem("authToken");

    const formSection = document.getElementById("generateBillSection");
    const billsMessage = document.getElementById("billsMessage");

    if (!role || !token) {
        alert("Please login first.");
        window.location.replace("login.html");
        return;
    }

    if (formSection) {
        formSection.style.display = role === "admin" ? "block" : "none";
    }

    if (role === "admin") {
        await loadAllBills();
        setupGenerateBillForm();
    } else if (role === "patient") {
        await loadPatientBills();
    } else {
        if (billsMessage) {
            billsMessage.textContent =
                "Only Admin and Patient can access Billing.";
        }
    }

    setupBillingLogout();
}

// Load all bills for Admin
async function loadAllBills() {
    const message = document.getElementById("billsMessage");

    try {
        message.textContent = "Loading all bills...";

        const response = await fetch(
            BILLING_API + "/api/bills",
            {
                headers: getBillingHeaders()
            }
        );

        if (!response.ok) {
            throw new Error("Unable to load bills. HTTP " + response.status);
        }

        const bills = await response.json();

        displayBills(bills, true);

        message.textContent = "Total Bills: " + bills.length;

    } catch (error) {
        console.error("Load Bills Error:", error);
        message.textContent = error.message;
    }
}

// Load bills for logged-in Patient
async function loadPatientBills() {
    const message = document.getElementById("billsMessage");

    try {
        message.textContent = "Loading your bills...";

        const username = sessionStorage.getItem("patientUsername");

        if (!username) {
            throw new Error("Patient username not found. Please login again.");
        }

        const profileResponse = await fetch(
            BILLING_API + "/api/patients/profile/" +
            encodeURIComponent(username),
            {
                headers: getBillingHeaders()
            }
        );

        if (!profileResponse.ok) {
            throw new Error("Unable to load patient profile.");
        }

        const patient = await profileResponse.json();

        const response = await fetch(
            BILLING_API + "/api/bills/patient/" + patient.id,
            {
                headers: getBillingHeaders()
            }
        );

        if (!response.ok) {
            throw new Error("Unable to load your bills. HTTP " + response.status);
        }

        const bills = await response.json();

        displayBills(bills, false);

        message.textContent = "Your Total Bills: " + bills.length;

    } catch (error) {
        console.error("Patient Bills Error:", error);
        message.textContent = error.message;
    }
}

// Display bills in table
function displayBills(bills, isAdmin) {
    const tableBody = document.getElementById("billsTableBody");

    tableBody.innerHTML = "";

    if (!Array.isArray(bills) || bills.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 9;
        cell.textContent = "No bills found.";
        cell.style.textAlign = "center";

        row.appendChild(cell);
        tableBody.appendChild(row);
        return;
    }

    bills.forEach(function (bill) {
        const row = document.createElement("tr");

        const values = [
            bill.id,
            bill.patientId,
            bill.patientName,
            bill.billType,
            "₹" + Number(bill.amount).toFixed(2),
            bill.paymentMethod,
            bill.paymentStatus,
            bill.billDate
        ];

        values.forEach(function (value) {
            const cell = document.createElement("td");
            cell.textContent = value ?? "-";
            row.appendChild(cell);
        });

        const actionCell = document.createElement("td");

        if (isAdmin && bill.paymentStatus === "PENDING") {
            const paidButton = document.createElement("button");

            paidButton.type = "button";
            paidButton.textContent = "Mark Paid";
            paidButton.addEventListener("click", function () {
                updateBillStatus(bill.id, "PAID");
            });

            actionCell.appendChild(paidButton);

        } else if (isAdmin && bill.paymentStatus === "PAID") {
            actionCell.textContent = "Completed";
        } else {
            actionCell.textContent = "View Only";
        }

        row.appendChild(actionCell);
        tableBody.appendChild(row);
    });
}

// Generate Bill Form
function setupGenerateBillForm() {
    const form = document.getElementById("generateBillForm");

    if (!form || form.dataset.initialized === "true") {
        return;
    }

    form.dataset.initialized = "true";

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const patientId =
            document.getElementById("billPatientId").value.trim();

        const billType =
            document.getElementById("billType").value;

        const amount =
            document.getElementById("amount").value;

        const paymentMethod =
            document.getElementById("payment").value;

        const message =
            document.getElementById("billMessage");

        if (!patientId || !billType || !amount || !paymentMethod) {
            message.textContent = "Please fill all required fields.";
            return;
        }

        const submitButton =
            document.getElementById("generateBillButton");

        submitButton.disabled = true;
        submitButton.textContent = "Generating...";

        try {
            const response = await fetch(
                BILLING_API + "/api/bills/generate/" +
                encodeURIComponent(patientId),
                {
                    method: "POST",
                    headers: getBillingHeaders(),
                    body: JSON.stringify({
                        billType: billType,
                        amount: Number(amount),
                        paymentMethod: paymentMethod
                    })
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Unable to generate bill.");
            }

            message.textContent =
                "Bill generated successfully! Bill ID: " + result.billId;

            form.reset();

            await loadAllBills();

        } catch (error) {
            console.error("Generate Bill Error:", error);
            message.textContent = error.message;

        } finally {
            submitButton.disabled = false;
            submitButton.textContent = "Generate Bill";
        }
    });
}

// Update payment status
async function updateBillStatus(billId, status) {
    if (!confirm("Are you sure you want to mark this bill as PAID?")) {
        return;
    }

    try {
        const response = await fetch(
            BILLING_API + "/api/bills/" + billId + "/status",
            {
                method: "PUT",
                headers: getBillingHeaders(),
                body: JSON.stringify({
                    paymentStatus: status
                })
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Unable to update payment status.");
        }

        alert("Payment status updated successfully!");

        await loadAllBills();

    } catch (error) {
        console.error("Update Bill Error:", error);
        alert(error.message);
    }
}

// Logout
function setupBillingLogout() {
    const logoutButton = document.getElementById("billingLogout");

    if (!logoutButton) return;

    logoutButton.addEventListener("click", function (event) {
        event.preventDefault();

        sessionStorage.clear();

        window.location.replace("login.html");
    });
}
