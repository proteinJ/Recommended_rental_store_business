document.addEventListener('DOMContentLoaded', function() {
    const button = document.getElementById('login-button');
    if (button) {
        button.addEventListener('click', function() {
            window.location.href = '/accounts/login';
        });
    }
});