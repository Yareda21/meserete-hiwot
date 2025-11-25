document.addEventListener('DOMContentLoaded', () => {
    // Get the English and Amharic toggle buttons on the dashboard header
    const langToggleEn = document.getElementById('lang-en-dash');
    const langToggleAm = document.getElementById('lang-am-dash');

    // Translation Data for Dashboard elements (matching the IDs in dashboard.html)
    const elementsToTranslate = {
        'dash-h2-en': { 
            en: 'Dashboard: Class Selection', 
            am: 'የዳሽቦርድ ገፅ: የክፍል ምርጫ' 
        },
        'dash-p-en': { 
            en: 'Select a class to manage attendance (የተማሪዎች ክትትል ምድብ ይምረጡ)', 
            am: 'የተማሪዎች ክትትል ምድብ ይምረጡ' 
        },
        'h3-infants': { 
            en: 'ሕፃናት ክፍል (Infants Division)', 
            am: 'ሕፃናት ክፍል' 
        },
        'h3-juniors': { 
            en: 'ማዕከላዊያን ክፍል (Juniors Division)', 
            am: 'ማዕከላዊያን ክፍል' 
        },
        'h3-youth': { 
            en: 'ወጣት ክፍል (Youth Division)', 
            am: 'ወጣት ክፍል' 
        },
        'h3-campus': { 
            en: 'ግቢ ጉባኤ (Campus Ministry)', 
            am: 'ግቢ ጉባኤ' 
        }
    };

    function applyLanguage(lang) {
        // Loop through all elements that need translation
        for (const id in elementsToTranslate) {
            const element = document.getElementById(id);
            if (element) {
                // Special handling for the main instruction paragraph
                if (id === 'dash-p-en' && lang === 'am') {
                    element.textContent = elementsToTranslate[id]['am'];
                } else if (id === 'dash-p-en' && lang === 'en') {
                    element.textContent = elementsToTranslate[id]['en'];
                } 
                // Division headers
                else if (id.startsWith('h3-')) {
                    element.textContent = elementsToTranslate[id][lang];
                } 
                // The main title (dash-h2-en)
                else {
                    element.textContent = elementsToTranslate[id][lang];
                }
            }
        }

        // Update active class for visual feedback
        langToggleEn.classList.remove('active');
        langToggleAm.classList.remove('active');

        if (lang === 'en') {
            langToggleEn.classList.add('active');
        } else {
            langToggleAm.classList.add('active');
        }
    }

    // Event listeners to trigger the language change
    langToggleEn.addEventListener('click', () => applyLanguage('en'));
    langToggleAm.addEventListener('click', () => applyLanguage('am'));

    // Set English as default language on page load
    applyLanguage('en');
});