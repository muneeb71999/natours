import "@babel/polyfill";
import { login, logout } from "./login";
import { mapBox } from "./mapbox";
import { updatePassword, updateUserData } from "./updateSettings";
import { signup } from "./signup";
import { bookTour } from "./stripe";
import forgotPassword from "./fogotPassword";
import resetPassword from "./resetPassword";

const map = document.getElementById("map");
const logoutBtn = document.querySelector(".nav__el--logout");
const bookTourBtn = document.getElementById("book-tour");
const loginForm = document.querySelector(".login-form");
const signupForm = document.querySelector(".signup-form");
const forgotPasswordForm = document.querySelector(".forgotPassword-form");
const resetPasswordForm = document.querySelector(".resetPassword-form");
const updateUserDataForm = document.querySelector(".form-user-data");
const updateUserPasswordForm = document.querySelector(
  ".update-user-password-form"
);

// Utility Functions
function renderLoader(element) {
  const btn = document.getElementById(element);
  btn.setAttribute("disabled", "true");
  document.getElementById(element).innerHTML = `<div class='loader'></div>`;
  btn.classList.add("disabled-btn");
  btn.classList.add("btn--login");
}

function removeLoader(element, innerHTML) {
  const btn = document.getElementById(element);
  document.getElementById(element).innerHTML = innerHTML;
  btn.removeAttribute("disabled");
  btn.classList.remove("disabled-btn");
  btn.classList.remove("btn--login");
}

// Login Form Data
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    // const loginBtn = document.getElementById("login-btn");
    // loginBtn.setAttribute("disabled", "true");
    // document.getElementById(
    //   "login-btn"
    // ).innerHTML = `<div class='loader'></div>`;
    // loginBtn.classList.add("disabled-btn");
    // loginBtn.classList.add("btn--login");
    renderLoader("login-btn");
    await login(email, password);
    removeLoader("login-btn", "login");
    // document.getElementById("login-btn").innerHTML = "Login";
    // loginBtn.removeAttribute("disabled");
    // loginBtn.classList.remove("disabled-btn");
    // loginBtn.classList.remove("btn--login");
  });
}

// Signup logic
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const passwordConfirm = document.getElementById("passwordConfirm").value;
    renderLoader("btn--signup");

    await signup(name, email, password, passwordConfirm);

    removeLoader("btn--signup", "Signup");
  });
}

// User Data Update form
if (updateUserDataForm) {
  const photo = document.getElementById("photo");
  updateUserDataForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const name = document.getElementById("name").value;
    const form = updateUserDataForm;

    document.querySelector(".btn-update-user-data").textContent =
      "Updating Data....";

    await updateUserData(name, email, photo, form);

    document.querySelector(".btn-update-user-data").textContent =
      "Save Settings";
  });

  const userImage = document.querySelector(".form__user-photo");

  photo.addEventListener("change", (e) => {
    userImage.src = window.URL.createObjectURL(e.target.files[0]);
    userImage.onload = function () {
      URL.revokeObjectURL(userImage.src); // clear the memory on reload
    };
  });
}

// User Password Update Form
if (updateUserPasswordForm) {
  updateUserPasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const oldPassword = document.getElementById("password-current").value;
    const password = document.getElementById("password").value;
    const passwordConfirm = document.getElementById("password-confirm").value;
    document.querySelector(".btn-update-password").textContent =
      "Updating.....";

    await updatePassword(oldPassword, password, passwordConfirm);

    document.getElementById("password-current").value = "";
    document.getElementById("password").value = "";
    document.getElementById("password-confirm").value = "";
    document.querySelector(".btn-update-password").textContent =
      "Save Password";
  });
}

// User forgot password form
if (forgotPasswordForm) {
  forgotPasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    renderLoader("forgotPassword-btn");
    await forgotPassword(email);
    email.textContent = "";
    removeLoader("forgotPassword-btn", "Send Reset Token");
  });
}

// User reset Password form
if (resetPasswordForm) {
  resetPasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const password = document.getElementById("password").value;
    const passwordConfirm = document.getElementById("passwordConfirm").value;
    const token = location.href.replace("/reset-password/", "");
    renderLoader("resetPassword-btn");
    await resetPassword(password, passwordConfirm, token);
    removeLoader("resetPassword-btn", "Reset my password");
    password.textContent = "";
    passwordConfirm.textContent = "";
  });
}

// Logout Btn Logic
if (logoutBtn) {
  logoutBtn.addEventListener("click", function (e) {
    e.preventDefault();
    logout();
  });
}

// Tours Map logic
if (map) {
  const locations = JSON.parse(map.dataset.locations);
  mapBox(locations);
}

// Book a tour
if (bookTourBtn) {
  bookTourBtn.addEventListener("click", async (e) => {
    const { tourId } = e.target.dataset;
    bookTourBtn.textContent = "Processing.....";
    await bookTour(tourId);
  });
}
