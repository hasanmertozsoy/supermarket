document.addEventListener('DOMContentLoaded', () => {
    const fontSizeSlider = document.getElementById('fontSizeSlider');
    const fontSizeValue = document.getElementById('fontSizeValue');
    const darkModeToggle = document.getElementById('darkModeToggle');
    const saveSettingsButton = document.getElementById('saveSettingsButton');
    const resetSettingsButton = document.getElementById('resetSettingsButton');
    const settingsMessage = document.getElementById('settingsMessage');
    
    const defaultSettings = {
        fontSize: 16,
        darkMode: false
    };
    
    loadStoredSettings();
    
    fontSizeSlider.addEventListener('input', () => {
        const value = fontSizeSlider.value;
        fontSizeValue.textContent = `${value}px`;
        document.documentElement.style.setProperty('--font-base-size', `${value}px`);
    });
    
    darkModeToggle.addEventListener('change', () => {
        toggleDarkMode(darkModeToggle.checked);
    });
    
    saveSettingsButton.addEventListener('click', saveSettings);
    
    resetSettingsButton.addEventListener('click', resetSettings);
    
    function loadStoredSettings() {
        const storedFontSize = localStorage.getItem('fontSize');
        const storedDarkMode = localStorage.getItem('darkMode') === 'true';
        
        if (storedFontSize) {
            fontSizeSlider.value = storedFontSize;
            fontSizeValue.textContent = `${storedFontSize}px`;
        }
        
        darkModeToggle.checked = storedDarkMode;
    }
    
    function toggleDarkMode(enabled) {
        if (enabled) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }
    
    function saveSettings() {
        const fontSize = fontSizeSlider.value;
        const isDarkMode = darkModeToggle.checked;
        
        localStorage.setItem('fontSize', fontSize);
        localStorage.setItem('darkMode', isDarkMode);
        
        showMessage(settingsMessage, 'Ayarlarınız başarıyla kaydedildi!', 'success');
    }
    
    function resetSettings() {
        if (confirm('Ayarları varsayılan değerlere sıfırlamak istediğinize emin misiniz?')) {
            fontSizeSlider.value = defaultSettings.fontSize;
            fontSizeValue.textContent = `${defaultSettings.fontSize}px`;
            darkModeToggle.checked = defaultSettings.darkMode;
            
            document.documentElement.style.setProperty('--font-base-size', `${defaultSettings.fontSize}px`);
            toggleDarkMode(defaultSettings.darkMode);
            
            localStorage.setItem('fontSize', defaultSettings.fontSize);
            localStorage.setItem('darkMode', defaultSettings.darkMode);
            
            showMessage(settingsMessage, 'Ayarlarınız varsayılan değerlere sıfırlandı!', 'success');
        }
    }
}); 