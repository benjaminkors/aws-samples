let currentUserEmail = null;

async function createUser() {
    const email = document.getElementById("create-email").value;
    const username = document.getElementById("create-username").value;
    const password = document.getElementById("create-password").value;
    const name = document.getElementById("create-name").value;
    const role = document.getElementById("create-role").value;

    if (!email || !username || !password || !name || !role) {
        alert("All fields are required!");
        return;
    }

    try {
        if (currentUserEmail) {
            await updateUser(currentUserEmail, username, password, name, role);
            currentUserEmail = null; // Reset after update
        } else {
            const response = await fetch("https://6ryq7pdk54.execute-api.us-east-1.amazonaws.com/default/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    username,
                    password,
                    name,
                    role,
                }),
            });
            const result = await response.json();
            alert(result.message);
            fetchUsers(); // Refresh the user table after creation
            resetForm(); // Reset the form after creating
        }
    } catch (error) {
        alert("Error creating user: " + error.message);
    }
}

async function fetchUsers() {
    try {
        const response = await fetch("https://6ryq7pdk54.execute-api.us-east-1.amazonaws.com/default/users");
        const users = await response.json();
        const tableBody = document.getElementById("user-table-body");
        tableBody.innerHTML = "";

        users.forEach((user) => {
            const row = tableBody.insertRow();
            row.insertCell(0).textContent = user.email;
            row.insertCell(1).textContent = user.name;
            row.insertCell(2).textContent = user.username;
            row.insertCell(3).textContent = user.password;
            row.insertCell(4).textContent = user.role;
            const actionsCell = row.insertCell(5);

            const updateButton = document.createElement("button");
            updateButton.className = "btn btn-primary me-2";
            updateButton.textContent = "Update";
            updateButton.onclick = function() {
                populateUpdateFields(
                    user.email,
                    user.username,
                    user.password,
                    user.name,
                    user.role,
                );
            };
            actionsCell.appendChild(updateButton);

            const deleteButton = document.createElement("button");
            deleteButton.className = "btn btn-danger";
            deleteButton.textContent = "Delete";
            deleteButton.onclick = function() {
                deleteUser(user.email);
            };
            actionsCell.appendChild(deleteButton);
        });
    } catch (error) {
        alert("Error fetching users: " + error.message);
    }
}

function populateUpdateFields(email, username, password, name, role) {
    document.getElementById("create-email").value = email;
    document.getElementById("create-name").value = name;
    document.getElementById("create-username").value = username;
    document.getElementById("create-password").value = password;
    document.getElementById("create-role").value = role;
    currentUserEmail = email;
}

async function updateUser(email, newUsername, newPassword, newName, newRole) {
    try {
        const response = await fetch(`https://6ryq7pdk54.execute-api.us-east-1.amazonaws.com/default/users/${email}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                newName,
                newUsername,
                newPassword,
                newRole,
            }),
        });
        const result = await response.json();
        alert(result.message);
        fetchUsers(); // Refresh the user table after update
        resetForm(); // Reset the form after updating
    } catch (error) {
        alert("Error updating user: " + error.message);
    }
}

async function deleteUser(email) {
    try {
        const response = await fetch(`https://6ryq7pdk54.execute-api.us-east-1.amazonaws.com/default/users/${email}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        });
        const result = await response.json();
        alert(result.message);
        fetchUsers(); // Refresh the user table after deletion
    } catch (error) {
        alert("Error deleting user: " + error.message);
    }
}

function resetForm() {
    document.getElementById("create-email").value = "";
    document.getElementById("create-name").value = "";
    document.getElementById("create-username").value = "";
    document.getElementById("create-password").value = "";
    document.getElementById("create-role").value = "";
    currentUserEmail = null;
}

// Fetch users on initial load
window.onload = fetchUsers;
