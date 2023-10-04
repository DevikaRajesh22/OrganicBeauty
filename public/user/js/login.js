const registerForm=document.getElementById('registerForm');
const nameInput=document.getElementById('nameInput');
const emailInput=document.getElementById('emailInput');
const numberInput=document.getElementById('numberInput');
const spasswordInput=document.getElementById('spasswodInput');
const cpasswordInput=document.getElementById('cpasswordInput');
const registerButton=document.getElementById('registerButton');
const nameError=document.getElementById('nameError');
const emailError=document.getElementById('emailError');
const numberError=document.getElementById('numberError');
const passwordError=document.getElementById('passwordError');
const validationMessage=document.getElementById('validationMessage');

registerForm.addEventListener('submit',function(event){
    validationMessage.textContext='';

     // Validate name (min length, max length, special characters)
     if (!validateName(nameInput.value)) {
        nameError.textContent = 'Name is invalid';
        event.preventDefault();
    } else {
        nameError.textContent = '';
    }

     // Validate email (pattern)
     if (!validateEmail(emailInput.value)) {
        emailError.textContent = 'Please enter a valid email';
        event.preventDefault();
    } else {
        emailError.textContent = '';
    }

     // Validate number (datatype, 10 digits)
     if (!validateNumber(numberInput.value)) {
        numberError.textContent = 'Please enter a valid number with 10 digits';
        event.preventDefault();
    } else {
        numberError.textContent = '';
    }

     // Validate password and confirm password (mismatch, min length, max length)
     if (!validatePassword(spasswordInput.value, cpasswordInput.value)) {
        passwordError.textContent = 'Passwords do not match or are invalid';
        event.preventDefault();
    } else {
        passwordError.textContent = '';
    }
});

// Add event listener to password and confirm password input fields
spasswordInput.addEventListener('input', validatePasswordFields);
cpasswordInput.addEventListener('input', validatePasswordFields);

// Password and confirm password validation function
function validatePasswordFields() {
    const spassword = spasswordInput.value;
    const cpassword = cpasswordInput.value;

    if (spassword !== cpassword) {
        passwordError.textContent = 'Passwords do not match';
        submitButton.disabled = true;
    } else if (!validatePassword(spassword, cpassword)) {
        passwordError.textContent = 'Password is invalid';
        submitButton.disabled = true;
    } else {
        passwordError.textContent = '';
        submitButton.disabled = false;
    }
};

// Name validation function
function validateName(name) {
    // Implement your name validation logic here
    // Example: Check for minimum and maximum length, special characters, etc.
    return name.length >= 3 && name.length <= 50 && /^[A-Za-z\s]+$/.test(name);
}

// Email validation function
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Number validation function
function validateNumber(number) {
    // Implement your number validation logic here
    // Example: Check for 10 digits
    return /^\d{10}$/.test(number);
}

// Password validation function
function validatePassword(password,confirmPassword) {
    if(password===confirmPassword){
        return password.length >= 6 && password.length <= 20;
    }else{
        return false; 
    }
    
}