document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Theme management
  const themeToggle = document.getElementById("theme-toggle");
  const themeDropdown = document.getElementById("theme-dropdown");
  const themeIcon = document.querySelector(".theme-icon");
  const themeText = document.querySelector(".theme-text");

  let currentTheme = localStorage.getItem("theme") || "system";
  setTheme(currentTheme);

  if (themeToggle) {
    themeToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      themeDropdown.classList.toggle("hidden");
    });
  }
  document.addEventListener("click", () => {
    if (themeDropdown) themeDropdown.classList.add("hidden");
  });
  if (themeDropdown) {
    themeDropdown.addEventListener("click", (e) => {
      if (e.target.hasAttribute("data-theme")) {
        const selectedTheme = e.target.getAttribute("data-theme");
        setTheme(selectedTheme);
        themeDropdown.classList.add("hidden");
      }
    });
  }
  if (window.matchMedia) {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
      if (currentTheme === "system") setTheme("system");
    });
  }

  function setTheme(theme) {
    currentTheme = theme;
    localStorage.setItem("theme", theme);
    document.documentElement.removeAttribute("data-theme");
    let actualTheme = theme;
    if (theme === "system") {
      actualTheme = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    if (actualTheme === "light") {
      document.documentElement.setAttribute("data-theme", "light");
    }
    updateThemeToggle(theme, actualTheme);
  }

  function updateThemeToggle(selectedTheme, actualTheme) {
    const themeConfig = {
      light: { icon: "☀️", text: "Light" },
      dark: { icon: "🌙", text: "Dark" },
      system: { icon: actualTheme === "dark" ? "🌙" : "☀️", text: "System" }
    };
    const config = themeConfig[selectedTheme];
    if (themeIcon && themeText) {
      themeIcon.textContent = config.icon;
      themeText.textContent = config.text;
    }
  }

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      // Show loading state
      activitiesList.innerHTML = '<div class="loading" style="margin: 20px auto;"></div><p style="text-align: center; margin-top: 10px;">Loading activities...</p>';
      
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";
      // Clear existing options except the first one
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        const participantsList = details.participants.length > 0 
          ? `<ul class="participants-list">${details.participants.map(email => 
              `<li>
                <span class="participant-email">${email}</span>
                <button class="delete-participant" onclick="removeParticipant('${name}', '${email}')" title="Remove participant">
                  Delete
                </button>
              </li>`
            ).join('')}</ul>`
          : '<p class="no-participants">No participants yet</p>';

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants-section">
            <p><strong>Current Participants:</strong></p>
            ${participantsList}
          </div>
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        
        // Refresh activities to show updated participant list
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Function to remove a participant from an activity
  async function removeParticipant(activityName, email) {
    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activityName)}/participants/${encodeURIComponent(email)}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        
        // Refresh activities to show updated participant list
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "Failed to remove participant";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to remove participant. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error removing participant:", error);
    }
  }

  // Make removeParticipant globally accessible
  window.removeParticipant = removeParticipant;

  // Initialize app
  fetchActivities();
});
