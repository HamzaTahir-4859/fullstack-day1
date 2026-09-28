// =========================================================
// 1. VARIABLES, DATA TYPES & OBJECTS
// =========================================================

const userProfile = {
  name: "Hamza Tahir",
  role: "Full-Stack Developer Intern",
  bio: "Full-stack developer intern exploring core web technologies, Node.js, and modern UI engineering.",
  isAvailable: true
};

// Array of skills (Data structure manipulated with array methods)
let skills = ["HTML5", "CSS3 (Flexbox/Grid)", "JavaScript (ES6+)", "Node.js", "Git & GitHub"];

// Array of objects for table generation
const experienceList = [
  { role: "Full-Stack Intern", institution: "Kodex Technologies", status: "Active" },
  { role: "BS Computer Science", institution: "FCCU", status: "Completed" }
];

// =========================================================
// 2. DOM ELEMENT SELECTION
// =========================================================
const profileNameEl = document.getElementById("profileName");
const profileRoleEl = document.getElementById("profileRole");
const profileBioEl = document.getElementById("profileBio");
const skillsListEl = document.getElementById("skillsList");
const skillCountEl = document.getElementById("skillCount");
const newSkillInput = document.getElementById("newSkillInput");
const addSkillBtn = document.getElementById("addSkillBtn");
const experienceTableBody = document.getElementById("experienceTableBody");
const updateProfileForm = document.getElementById("updateProfileForm");
const formMessageEl = document.getElementById("formMessage");
const themeToggleBtn = document.getElementById("themeToggleBtn");

// =========================================================
// 3. FUNCTIONS & ARRAY METHODS
// =========================================================

// Function to render profile info to the DOM
function renderProfile() {
  profileNameEl.textContent = userProfile.name;
  profileRoleEl.textContent = userProfile.role;
  profileBioEl.textContent = userProfile.bio;
}

// Function using .forEach() and DOM manipulation to render skills
function renderSkills() {
  // Clear previous list
  skillsListEl.innerHTML = "";

  // Array Method: forEach loop to construct tags dynamically
  skills.forEach((skill, index) => {
    const li = document.createElement("li");
    li.className = "skill-tag";
    li.innerHTML = `
      <span>${skill}</span>
      <span class="remove-btn" onclick="removeSkill(${index})" title="Remove">&times;</span>
    `;
    skillsListEl.appendChild(li);
  });

  // Update skill counter
  skillCountEl.textContent = skills.length;
}

// Function to dynamically render experience table rows using a for...of loop
function renderExperience() {
  experienceTableBody.innerHTML = "";

  for (const item of experienceList) {
    const row = document.createElement("tr");

    // Condition to assign badge styling
    const statusClass = item.status.toLowerCase() === "active" ? "active" : "completed";

    row.innerHTML = `
      <td>${item.role}</td>
      <td>${item.institution}</td>
      <td><span class="status-pill ${statusClass}">${item.status}</span></td>
    `;
    experienceTableBody.appendChild(row);
  }
}

// Function to add a skill (conditions and array manipulation)
function addSkill() {
  const skillName = newSkillInput.value.trim();

  // Condition check: prevent empty or duplicate skills
  if (!skillName) {
    alert("Please enter a valid skill name.");
    return;
  }

  // Array Method: .some() to check if already exists
  const exists = skills.some(s => s.toLowerCase() === skillName.toLowerCase());
  if (exists) {
    alert("This skill is already listed!");
    return;
  }

  // Add to array and re-render
  skills.push(skillName);
  renderSkills();
  newSkillInput.value = "";
}

// Function to remove a skill using .splice()
function removeSkill(index) {
  skills.splice(index, 1);
  renderSkills();
}

// =========================================================
// 4. EVENTS & EVENT LISTENERS
// =========================================================

// Add skill via button click or Enter key
addSkillBtn.addEventListener("click", addSkill);
newSkillInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    addSkill();
  }
});

// Form submission event listener with input handling & validation
updateProfileForm.addEventListener("submit", (e) => {
  e.preventDefault(); // Stop page reload

  const newName = document.getElementById("fullName").value.trim();
  const newBio = document.getElementById("bio").value.trim();

  // Condition check
  if (newName && newBio) {
    // Update object values
    userProfile.name = newName;
    userProfile.bio = newBio;

    // Update DOM
    renderProfile();

    // Show temporary confirmation message
    formMessageEl.textContent = "Profile updated successfully!";
    formMessageEl.className = "form-message success";
    formMessageEl.style.display = "block";

    setTimeout(() => {
      formMessageEl.style.display = "none";
    }, 3000);
  }
});

// Dark/Light Mode Theme Toggle event
themeToggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  
  if (document.body.classList.contains("dark-mode")) {
    themeToggleBtn.textContent = "☀️ Light Mode";
  } else {
    themeToggleBtn.textContent = "🌙 Dark Mode";
  }
});

// =========================================================
// 5. INITIAL RUN
// =========================================================
renderProfile();
renderSkills();
renderExperience();s