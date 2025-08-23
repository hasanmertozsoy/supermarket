const API_URL = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', () => {
    applyStoredSettings();
    
    checkUserStatus();
    
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', logout);
    }
});

function applyStoredSettings() {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (darkMode) {
        document.body.classList.add('dark-mode');
    }
    
    const fontSize = localStorage.getItem('fontSize');
    if (fontSize) {
        document.documentElement.style.setProperty('--font-base-size', `${fontSize}px`);
    }
}

function checkUserStatus() {
    
    const authButton = document.querySelector('.auth-button');
    const logoutButton = document.getElementById('logoutButton');
    const userName = document.getElementById('userName');
    
    const userJson = localStorage.getItem('currentUser');
    let currentUser = null;
    
    if (userJson) {
        try {
            currentUser = JSON.parse(userJson);
            
            if (userName) {
                userName.textContent = currentUser.name;
            }
            
            if (authButton) authButton.style.display = 'none';
            if (logoutButton) logoutButton.style.display = 'inline-block';
            
            return currentUser;
        } catch (error) {
            console.error("Kullanıcı bilgisi çözme hatası:", error);
        }
    }
    
    if (userName) {
        userName.textContent = 'Ziyaretçi';
    }
    
    if (authButton) authButton.style.display = 'inline-block';
    if (logoutButton) logoutButton.style.display = 'none';
    
    return null;
}

function logout() {
    localStorage.removeItem('currentUser');
    alert("Çıkış yapıldı!");
    window.location.reload();
}

function showMessage(element, message, type) {
    element.textContent = message;
    element.className = 'auth-message';
    element.classList.add(type);
    
    setTimeout(() => {
        element.textContent = '';
        element.className = 'auth-message';
    }, 3000);
}

function normalizeTurkishChars(text) {
    if (typeof text !== 'string') return '';
    
    const charMap = {
        'İ': 'I', 'ı': 'i', 'Ş': 'S', 'ş': 's', 
        'Ğ': 'G', 'ğ': 'g', 'Ü': 'U', 'ü': 'u', 
        'Ö': 'O', 'ö': 'o', 'Ç': 'C', 'ç': 'c'
    };
    
    return text.replace(/[İıŞşĞğÜüÖöÇç]/g, match => charMap[match] || match);
} 