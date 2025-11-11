// Toggle password visibility
function togglePassword(passwordId, toggleId) {
  const passwordInput = document.getElementById(passwordId);
  const toggleIcon = document.getElementById(toggleId);
  
  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    toggleIcon.classList.remove('fa-eye');
    toggleIcon.classList.add('fa-eye-slash');
  } else {
    passwordInput.type = 'password';
    toggleIcon.classList.remove('fa-eye-slash');
    toggleIcon.classList.add('fa-eye');
  }
}

// Show popup notification
function showPopup(message, type = 'error') {
  const popup = document.createElement('div');
  popup.className = `popup ${type}`;
  popup.textContent = message;
  document.body.appendChild(popup);
  
  setTimeout(() => popup.classList.add('show'), 10);
  
  setTimeout(() => {
    popup.classList.remove('show');
    setTimeout(() => popup.remove(), 400);
  }, 3000);
}