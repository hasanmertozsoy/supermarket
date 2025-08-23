document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginFormElement');
    const registerForm = document.getElementById('registerFormElement');
    
    const showRegisterFormLink = document.getElementById('showRegisterForm');
    const showLoginFormLink = document.getElementById('showLoginForm');
    
    const loginFormContainer = document.getElementById('loginForm');
    const registerFormContainer = document.getElementById('registerForm');
    
    const loginMessage = document.getElementById('loginMessage');
    const registerMessage = document.getElementById('registerMessage');
    
    const API_URL = 'http://localhost:3000/api';
    
    showRegisterFormLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginFormContainer.style.display = 'none';
        registerFormContainer.style.display = 'block';
    });
    
    showLoginFormLink.addEventListener('click', (e) => {
        e.preventDefault();
        registerFormContainer.style.display = 'none';
        loginFormContainer.style.display = 'block';
    });
    
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            const result = await response.json();
            
            if (result.success) {
                showMessage(loginMessage, 'Giriş başarılı! Yönlendiriliyorsunuz...', 'success');
                
                localStorage.setItem('currentUser', JSON.stringify(result.user));
                
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            } else {
                showMessage(loginMessage, result.message || 'Giriş başarısız!', 'error');
            }
        } catch (error) {
            showMessage(loginMessage, 'Giriş sırasında bir hata oluştu.', 'error');
            console.error('Login error:', error);
        }
    });
    
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
        
        if (password !== passwordConfirm) {
            showMessage(registerMessage, 'Şifreler eşleşmiyor!', 'error');
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, password })
            });
            
            const result = await response.json();
            
            if (result.success) {
                showMessage(registerMessage, 'Kayıt işlemi başarılı! Yönlendiriliyorsunuz...', 'success');
                
                localStorage.setItem('currentUser', JSON.stringify(result.user));
                
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            } else {
                showMessage(registerMessage, result.message || 'Kayıt işlemi başarısız!', 'error');
            }
        } catch (error) {
            showMessage(registerMessage, 'Kayıt sırasında bir hata oluştu.', 'error');
            console.error('Register error:', error);
        }
    });
}); 