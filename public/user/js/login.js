// Get the registration form elements
const registerForm = document.getElementById('registerForm');
const emailInput = document.getElementById('emailInput');
const passwordInput = document.getElementById('passwordInput');
const confirmPasswordInput = document.getElementById('confirmPasswordInput');
const phoneNumberInput = document.getElementById('phoneNumberInput');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');
const confirmPasswordError = document.getElementById('confirmPasswordError');
const phoneNumberError = document.getElementById('phoneNumberError');
const validationMessage = document.getElementById('validationMessage');

// Add a submit event listener to the registration form
registerForm.addEventListener('submit', function (event) {
    validationMessage.textContent = '';
    let hasError = false;

    // Validate email
    if (!validateEmail(emailInput.value)) {
        emailError.textContent = 'Please enter a valid email';
        hasError = true;
    } else {
        emailError.textContent = '';
    }

    // Validate password
    const password = passwordInput.value;
    if (!validatePassword(password)) {
        passwordError.textContent = 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one digit';
        hasError = true;
    } else {
        passwordError.textContent = '';
    }

    // Validate confirm password
    const confirmPassword = confirmPasswordInput.value;
    if (password !== confirmPassword) {
        confirmPasswordError.textContent = 'Passwords do not match';
        hasError = true;
    } else {
        confirmPasswordError.textContent = '';
    }

    // Validate phone number
    const phoneNumber = phoneNumberInput.value;
    if (!validatePhoneNumber(phoneNumber)) {
        phoneNumberError.textContent = 'Please enter a valid 10-digit phone number';
        hasError = true;
    } else {
        phoneNumberError.textContent = '';
    }

    if (hasError) {
        event.preventDefault();
    }
});

// Email validation function
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Password validation function
function validatePassword(password) {
    // Implement your password validation logic here
    // Example: Require at least one uppercase letter, one lowercase letter, one digit, and be at least 8 characters long
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasDigit = /\d/.test(password);

    return hasUpperCase && hasLowerCase && hasDigit && password.length >= 8;
}

// Phone number validation function
function validatePhoneNumber(phoneNumber) {
    // Implement your phone number validation logic here
    // Example: Check for 10 digits
    return /^\d{10}$/.test(phoneNumber);
}
