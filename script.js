document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    // ... existing code ...

    // --- 0. CENTRAL USER DEFINITIONS (MODIFIED) ---
    const users = [
        // Owner/All Control - Full CRUD access to all classes
        {
            username: "mhssa",
            password: "mhssa",
            role: "owner",
            allowedDivisions: "all",
        },
        // Global Admin - Read-only access to all classes
        {
            // NOTE: Changed username to 'mhssadmin' to be unique and used previous password
            username: "mhssadmin",
            password: "mhssadmin",
            role: "admin",
            allowedDivisions: "all",
        },
        // Division Admins ('class-admin')
        {
            // NOTE: Using a unique username for this division
            username: "kirkos",
            password: "kirkos3",
            role: "class-admin",
            allowedDivisions: "infants", // ሕፃናት ክፍል: infants-division
        },
        {
            // NOTE: Using a unique username for this division
            username: "samuel",
            password: "samuel3",
            role: "class-admin",
            allowedDivisions: "juniors", // ማዕከላዊያን ክፍል: juniors-division
        },
        {
            // NOTE: Using a unique username for this division
            username: "yared",
            password: "yared2",
            role: "class-admin",
            allowedDivisions: "youth", // ወጣት ክፍል: youth-division
        },
        {
            // NOTE: Using a unique username for this division
            username: "gebi",
            password: "gebi2",
            role: "class-admin",
            allowedDivisions: "campus", // ግቢ ጉባኤ: campus-division
        },
    ];

    // --- 1. LOGIN SIMULATION (MODIFIED to use the array) ---
    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim();

        // Use Array.prototype.find() to search for a matching user object
        const authenticatedUser = users.find(
            (user) => user.username === username && user.password === password
        );

        // Authentication check
        if (authenticatedUser) {
            console.log("Authentication successful. Redirecting to dashboard.");

            // Save the user's role and allowed divisions to sessionStorage
            sessionStorage.setItem("userRole", authenticatedUser.role);
            sessionStorage.setItem(
                "allowedDivisions",
                authenticatedUser.allowedDivisions
            ); // Crucial for filtering

            // FIX: Redirect the browser to the dashboard page
            window.location.href = "dashboard.html";
        } else {
            alert("Login Failed. Invalid Username or Password.");
        }
    });

    // --- 2. LANGUAGE SWITCHING ---
    const elementsToTranslate = {
        "system-name": {
            en: "M.H. Sunday School Attendance Control",
            am: "የመሠረተ ሕይወት ሰንበት ት/ቤት የተማሪዎች ክትትል",
        },
        "form-header-h2": {
            en: "Login to Your Account",
            am: "ወደ ገጽዎ ይግቡ",
        },
        "label-username": {
            en: "Username",
            am: "የተጠቃሚ ስም",
        },
        "label-password": {
            en: "Password",
            am: "መለያ ቃል",
        },
        "label-remember": {
            en: "Remember me",
            am: "አስታውሰኝ",
        },
        "button-login": {
            en: "LOGIN",
            am: "ይግቡ",
        },
    };

    function applyLanguage(lang) {
        // Update labels and text
        document.querySelector(".system-name").textContent =
            elementsToTranslate["system-name"][lang];
        document.querySelector(".form-header h2").textContent =
            elementsToTranslate["form-header-h2"][lang];
        document.querySelector('label[for="username"]').textContent =
            elementsToTranslate["label-username"][lang];
        document.querySelector('label[for="password"]').textContent =
            elementsToTranslate["label-password"][lang];
        document.querySelector('label[for="remember"]').textContent =
            elementsToTranslate["label-remember"][lang];
        document.getElementById("button-login").textContent =
            elementsToTranslate["button-login"][lang];

        // Update active class for styling
        langToggleEn.classList.remove("active");
        langToggleAm.classList.remove("active");

        if (lang === "en") {
            langToggleEn.classList.add("active");
            document.querySelector(".amharic-name").style.display = "block";
        } else {
            langToggleAm.classList.add("active");
            document.querySelector(".amharic-name").style.display = "none";
        }
    }

    // Event listeners for language toggle
    langToggleEn.addEventListener("click", () => applyLanguage("en"));
    langToggleAm.addEventListener("click", () => applyLanguage("am"));

    // Initialize with English as default
    applyLanguage("en");
});
