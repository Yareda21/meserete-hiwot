document.addEventListener('DOMContentLoaded', () => {
    // --- 0. SETUP AND DOM ELEMENTS ---
    
    // Map to convert ID to Amharic name
    const classIdToNameMap = {
        'K1': 'ምድብ ቂርቆስ ፩', 'K2': 'ምድብ ቂርቆስ ፪', 'K3': 'ምድብ ቂርቆስ ፫',
        'S1': 'ምድብ ሳሙኤል ፩', 'S2': 'ምድብ ሳሙኤል ፪', 'E': 'ምድብ እስጢፋኖስ',
        'W1': 'ምድብ ቅዱስ ያሬድ ፩', 'W2': 'ምድብ ቅዱስ ያሬድ ፪',
        'BS': 'በሻሌ ትምህርት ቤት', 'SS': 'ሳፋሪ ትምህርት ቤት'
    };

    const classHeaderTitle = document.getElementById('class-header-title');
    const backToDashboardBtn = document.getElementById('backToDashboardBtn');
    const studentListBody = document.getElementById('student-list-body');
    const totalStudentsCount = document.getElementById('total-students-count');
    const paidStudentsCount = document.getElementById('paid-students-count');
    const paymentRate = document.getElementById('payment-rate');

    const monthModal = document.getElementById('month-modal');
    const btnSelectMonth = document.getElementById('btn-select-month');
    const closeBtnMonth = document.querySelector('.close-btn-month');
    const monthPicker = document.getElementById('month-picker');
    const btnSetMonth = document.getElementById('btn-set-month');
    const currentMonthDisplay = document.getElementById('current-month-display');

    const btnPrevMonth = document.getElementById('btn-prev-month');
    const btnNextMonth = document.getElementById('btn-next-month');
    
    const allPaymentsModal = document.getElementById('all-payments-modal');
    const closeBtnAllPayments = document.querySelector('.close-btn-all-payments');
    const btnShowAllPayments = document.getElementById('btn-show-all-payments');
    const allPaymentsSummaryContent = document.getElementById('all-payments-summary-content');
    const btnExportPayments = document.getElementById('btn-export-payments'); 

    // NEW LANGUAGE ELEMENTS
    const langToggleEn = document.getElementById('lang-en-pay');
    const langToggleAm = document.getElementById('lang-am-pay');
    // END NEW LANGUAGE ELEMENTS

    let selectedMonth = new Date().toISOString().slice(0, 7); 
    let classInfo = {};
    let currentStudents = [];
    
    // GLOBAL VARIABLES FOR PDF DATA STORAGE
    let allSummaryStudents = [];
    let allSummaryMonths = [];
    let studentPaymentSummaryMap = {};
    // END GLOBAL VARIABLES

    // --- 1. UTILITY FUNCTIONS ---

    const getClassInfoFromUrl = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const classId = urlParams.get('classId');
        return {
            id: classId,
            nameAm: classIdToNameMap[classId] || 'ያልታወቀ ምድብ',
            nameEn: classId 
        };
    };

    const loadStudents = (classId) => {
        const STUDENT_LIST_KEY = `${classId}_student_list`;
        let students = JSON.parse(localStorage.getItem(STUDENT_LIST_KEY)) || [];
        
        if (students.length === 0) {
             console.warn(`No students found for ${classId}. Using dummy data.`);
             students = [
                { id: "K1001", name: "አበበ ገብረ መድኅን", phone: "0911223344" },
                { id: "K1002", name: "ብርቱካን ንጉሤ", phone: "0925446688" },
                { id: "K1003", name: "ኃይሌ አስፋው", phone: "0930779911" }
             ];
             localStorage.setItem(STUDENT_LIST_KEY, JSON.stringify(students));
        }
        return students;
    };

    const formatMonthDisplay = (yyyyMm) => {
        const [year, month] = yyyyMm.split('-');
        const date = new Date(year, month - 1);
        return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    };
    
    const setMonthAndRender = (newMonthYyyyMm) => {
        selectedMonth = newMonthYyyyMm;
        updateMonthDisplay();
        
        currentStudents = loadStudents(classInfo.id); 
        
        const payments = loadPayments(classInfo.id, selectedMonth);
        renderStudents(currentStudents, payments);
    };

    // --- 2. PAYMENT DATA MANAGEMENT ---

    const getPaymentKey = (classId, month) => `payments_${classId}_${month}`;

    const loadPayments = (classId, month) => {
        return JSON.parse(localStorage.getItem(getPaymentKey(classId, month))) || {}; 
    };

    const savePayment = (classId, month, studentId, isPaid) => {
        const key = getPaymentKey(classId, month);
        let payments = loadPayments(classId, month);
        payments[studentId] = isPaid;
        localStorage.setItem(key, JSON.stringify(payments));
        updatePaymentSummary(currentStudents, payments);
    };

    // --- 3. RENDERING AND UPDATING UI (MONTHLY VIEW) (MODIFIED FOR LANGUAGE) ---

    // Table Header Translations
    const thTranslations = {
        '#': { en: '#', am: '#' },
        'ID': { en: 'ID', am: 'መለያ' },
        'Name': { en: 'Name', am: 'ስም' },
        'Phone': { en: 'Phone', am: 'ስልክ' },
        'Payment Status': { en: 'Payment Status', am: 'ክፍያ ሁኔታ' },
        'Action': { en: 'Action', am: 'እርምጃ' }
    };
    
    // Status and Action Text Translations
    const statusTranslations = {
        'Paid': { en: 'Paid', am: 'ከፍሏል' },
        'Unpaid': { en: 'Unpaid', am: 'አልከፈለም' },
        'Mark Unpaid': { en: 'Mark Unpaid', am: 'ክፍያ ተመለስ' },
        'Mark Paid': { en: 'Mark Paid', am: 'ክፍያ አስገባ' }
    };

    const renderStudents = (students, payments) => {
        studentListBody.innerHTML = '';
        let paidCount = 0;
        const currentLang = localStorage.getItem('paymentLang') || 'en';
        
        // Translate Table Headers on every render
        const headers = document.querySelectorAll('#payment-table thead th');
        const headerKeys = ['#', 'ID', 'Name', 'Phone', 'Payment Status', 'Action'];
        headers.forEach((th, index) => {
            if (headerKeys[index]) {
                th.textContent = thTranslations[headerKeys[index]][currentLang];
            }
        });


        students.forEach((student, index) => {
            const studentIdKey = student.id; 
            const isPaid = !!payments[studentIdKey]; 
            if (isPaid) paidCount++;
            
            const row = studentListBody.insertRow();
            
            const statusText = isPaid ? statusTranslations['Paid'][currentLang] : statusTranslations['Unpaid'][currentLang];
            const buttonText = isPaid ? statusTranslations['Mark Unpaid'][currentLang] : statusTranslations['Mark Paid'][currentLang];
            const statusIcon = isPaid ? ' <i class="fas fa-check-circle"></i>' : ' <i class="fas fa-times-circle"></i>';

            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${student.id || 'N/A'}</td>
                <td>${student.name}</td>
                <td>${student.phone || 'N/A'}</td>
                <td class="center-align">
                    <span class="payment-status-tag ${isPaid ? 'paid' : 'unpaid'}">
                        ${statusText + statusIcon}
                    </span>
                </td>
                <td class="center-align">
                    <button class="btn-toggle-payment" data-student-id="${student.id}" data-is-paid="${isPaid}">
                        ${buttonText}
                    </button>
                </td>
            `;

            row.querySelector('.btn-toggle-payment').addEventListener('click', (e) => {
                const studentId = e.currentTarget.dataset.studentId; 
                const currentStatus = e.currentTarget.dataset.isPaid === 'true';
                
                savePayment(classInfo.id, selectedMonth, studentId, !currentStatus); 
                
                const updatedPayments = loadPayments(classInfo.id, selectedMonth);
                renderStudents(currentStudents, updatedPayments);
            });
        });

        updatePaymentSummary(students, payments);
    };

    const updatePaymentSummary = (students, payments) => {
        const total = students.length;
        const paid = Object.values(payments).filter(status => status).length; 
        const rate = total > 0 ? ((paid / total) * 100).toFixed(1) : 0;

        totalStudentsCount.textContent = total;
        paidStudentsCount.textContent = paid;
        paymentRate.textContent = `${rate}%`;
    };

    const updateMonthDisplay = () => {
        currentMonthDisplay.textContent = formatMonthDisplay(selectedMonth);
    };

    // --- 4. NAVIGATION LOGIC (MONTHLY) ---

    const changeMonth = (offset) => {
        const [year, month] = selectedMonth.split('-').map(Number);
        const currentDate = new Date(year, month - 1, 1);
        currentDate.setMonth(currentDate.getMonth() + offset);

        const newYear = currentDate.getFullYear();
        const newMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
        const newMonthYyyyMm = `${newYear}-${newMonth}`;
        
        setMonthAndRender(newMonthYyyyMm);
    };

    btnPrevMonth.addEventListener('click', () => changeMonth(-1));
    btnNextMonth.addEventListener('click', () => changeMonth(1));


    // Month Modal Handlers
    btnSelectMonth.addEventListener('click', () => {
        monthPicker.value = selectedMonth; 
        monthModal.style.display = 'block';
    });

    closeBtnMonth.addEventListener('click', () => {
        monthModal.style.display = 'none';
    });

    btnSetMonth.addEventListener('click', () => {
        const newMonth = monthPicker.value;
        if (newMonth) {
            setMonthAndRender(newMonth); 
            monthModal.style.display = 'none';
        } else {
            alert('Please select a valid month.');
        }
    });
    
    // Back to Dashboard 
    if (backToDashboardBtn) {
        backToDashboardBtn.addEventListener('click', () => {
            window.location.href = 'dashboard.html';
        });
    }

    // --- 5. ALL PAYMENTS SUMMARY LOGIC (MODIFIED FOR LANGUAGE) ---
    
    const getAllPaymentMonths = (classId) => {
        const months = new Set();
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(`payments_${classId}_`)) {
                months.add(key.substring(key.length - 7));
            }
        }
        return Array.from(months).sort();
    };

    const showAllPaymentsSummary = () => {
        allSummaryStudents = loadStudents(classInfo.id); // Store globally
        allSummaryMonths = getAllPaymentMonths(classInfo.id); // Store globally

        if (allSummaryMonths.length === 0) {
            allPaymentsSummaryContent.innerHTML = `<p style="text-align: center; padding: 20px;">No payment records found for this class.</p>`;
            allPaymentsModal.style.display = 'block';
            return;
        }

        // Object to store student summary (Store globally)
        studentPaymentSummaryMap = {};
        allSummaryStudents.forEach(s => {
            studentPaymentSummaryMap[s.id] = { name: s.name, totalPaid: 0, payments: {} };
        });

        // 1. Populate payment status for all students across all months
        allSummaryMonths.forEach(month => {
            const payments = loadPayments(classInfo.id, month);
            allSummaryStudents.forEach(student => {
                const isPaid = !!payments[student.id];
                studentPaymentSummaryMap[student.id].payments[month] = isPaid;
                if (isPaid) {
                    studentPaymentSummaryMap[student.id].totalPaid++;
                }
            });
        });

        // 2. Render the table
        renderAllPaymentsSummary(allSummaryStudents, allSummaryMonths, studentPaymentSummaryMap);
        allPaymentsModal.style.display = 'block';
    };
    
    const renderAllPaymentsSummary = (students, months, summaryMap) => {
        const currentLang = localStorage.getItem('paymentLang') || 'en';
        const totalPaidText = currentLang === 'am' ? 'ጠቅላላ ክፍያ' : 'Total Paid';
        const rateText = currentLang === 'am' ? 'ተመን' : 'Rate';

        let tableHtml = `
            <table class="student-table" style="width: 100%;">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>${thTranslations['Name'][currentLang]}</th>
                        ${months.map(m => `<th>${formatMonthDisplay(m).substring(0, 3)}</th>`).join('')}
                        <th>${totalPaidText}</th>
                        <th>${rateText}</th>
                    </tr>
                </thead>
                <tbody>
        `;

        students.forEach((student, index) => {
            const studentData = summaryMap[student.id];
            const rate = months.length > 0 ? ((studentData.totalPaid / months.length) * 100).toFixed(0) : 0;
            
            tableHtml += `<tr>
                <td>${index + 1}</td>
                <td>${student.name}</td>
            `;

            months.forEach(month => {
                const isPaid = studentData.payments[month];
                const statusClass = isPaid ? 'paid' : 'unpaid';
                const statusIcon = isPaid ? '&#10003;' : '&#10007;'; // Check or X mark
                tableHtml += `<td class="center-align">
                    <span class="payment-status-tag ${statusClass}" style="padding: 2px 5px; font-size: 0.75rem;">${statusIcon}</span>
                </td>`;
            });

            tableHtml += `
                <td class="center-align">${studentData.totalPaid}/${months.length}</td>
                <td class="center-align" style="font-weight: 600;">${rate}%</td>
            </tr>`;
        });

        tableHtml += `</tbody></table>`;
        allPaymentsSummaryContent.innerHTML = tableHtml;
    };
    
    // NEW EVENT LISTENER: Activate the summary
    btnShowAllPayments.addEventListener('click', showAllPaymentsSummary);
    
    // Close modal listener
    closeBtnAllPayments.addEventListener('click', () => {
        allPaymentsModal.style.display = 'none';
    });
    
    // --- 6. PDF EXPORT LOGIC --- (No major changes needed, uses current data)

    const exportAllPaymentsToPdf = () => {
        // Check if PDF libraries are loaded
        if (typeof window.jsPDF === 'undefined' || typeof window.jspdf.plugin.autotable === 'undefined') {
            alert("PDF export requires the jsPDF and jspdf-autotable libraries to be linked in payment_management.html.");
            return;
        }
        
        // Ensure data is loaded (by clicking the summary button first)
        if (allSummaryMonths.length === 0) {
             alert("Please open the 'All Payments Summary' first to load the data before exporting.");
             return;
        }

        const currentLang = localStorage.getItem('paymentLang') || 'en';
        const doc = new window.jsPDF.jsPDF({ orientation: 'landscape' }); // Use landscape for wide monthly view
        const classId = classInfo.id;
        const className = classInfo.nameAm;
        
        // 1. Prepare Headers 
        const monthHeaders = allSummaryMonths.map(m => formatMonthDisplay(m).substring(0, 3));
        const finalHeaders = [
            thTranslations['#'][currentLang], 
            thTranslations['Name'][currentLang], 
            ...monthHeaders, 
            currentLang === 'am' ? 'ጠቅላላ ክፍያ' : 'Total Paid', 
            currentLang === 'am' ? 'ተመን' : 'Rate'
        ];
        
        // 2. Prepare Data Rows
        const data = allSummaryStudents.map((student, index) => {
            const studentData = studentPaymentSummaryMap[student.id]; 
            const row = [index + 1, student.name];
            
            // Add month status: '✓' (Check) or '✗' (X mark)
            allSummaryMonths.forEach(month => {
                const isPaid = studentData.payments[month];
                row.push(isPaid ? '✓' : '✗'); 
            });
            
            const rate = allSummaryMonths.length > 0 ? ((studentData.totalPaid / allSummaryMonths.length) * 100).toFixed(0) : 0;
            
            row.push(`${studentData.totalPaid}/${allSummaryMonths.length}`);
            row.push(`${rate}%`);
            
            return row;
        });

        // 3. Add Title and Table to PDF
        doc.setFontSize(16);
        doc.text(`Payment Summary Report: ${className} (${classId})`, 14, 20);
        
        doc.autoTable({
            head: [finalHeaders],
            body: data,
            startY: 25,
            styles: {
                font: 'helvetica', 
                fontSize: 8,
                cellPadding: 3,
                valign: 'middle',
            },
            headStyles: {
                fillColor: [26, 35, 126], // Sapphire color
                textColor: 255,
                fontStyle: 'bold',
                halign: 'center'
            },
            columnStyles: {
                // Center align all month columns (starting at index 2)
                ...allSummaryMonths.reduce((acc, _, index) => {
                    acc[index + 2] = { halign: 'center' };
                    return acc;
                }, {}),
                // Total Paid and Rate columns
                [2 + allSummaryMonths.length]: { halign: 'center', fontStyle: 'bold' },
                [2 + allSummaryMonths.length + 1]: { halign: 'center', fontStyle: 'bold' }
            },
            margin: { top: 25 }
        });

        // 4. Save the PDF
        doc.save(`Payment_Summary_Report_${classId}.pdf`);
    };

    // UPDATE EVENT LISTENER: Link the PDF function
    btnExportPayments.addEventListener('click', exportAllPaymentsToPdf);

    // --- 7. LANGUAGE TOGGLE LOGIC (NEW) ---

    // Configuration for all fixed text elements
    const paymentElementsToTranslate = {
        'backToDashboardBtn': { 
            en: 'Back to Dashboard', 
            am: 'ወደ ዳሽቦርድ ተመለስ',
            icon: '<i class="fas fa-arrow-left"></i> '
        },
        'label-payment-month': {
            en: 'Payment Month:', 
            am: 'የክፍያ ወር:', 
            selector: '.date-info-group .label'
        },
        'btn-prev-month': {
            en: 'Previous', 
            am: 'የቀደመ',
            icon: '<i class="fas fa-chevron-left"></i> ' 
        },
        'btn-next-month': {
            en: 'Next', 
            am: 'ቀጣይ',
            icon: ' <i class="fas fa-chevron-right"></i>' 
        },
        'btn-select-month': { 
            en: 'Select Month', 
            am: 'ወር ይምረጡ',
            icon: '<i class="fas fa-calendar-alt"></i> '
        },
        'btn-show-all-payments': { 
            en: 'All Payments', 
            am: 'ሁሉም ክፍያዎች',
            icon: ' <i class="fas fa-money-check-alt"></i>'
        },
        'h3-monthly-list': {
            en: 'Student Payment List (Monthly)',
            am: 'የተማሪዎች ክፍያ ዝርዝር (ወርሃዊ)',
            selector: '.student-table-card h3'
        },
        'h3-total-students': {
            en: 'Total Students', 
            am: 'ጠቅላላ ተማሪዎች',
            selector: '.analytics-card:nth-child(2) h3'
        },
        'h3-paid-students': {
            en: 'Students Paid (This Month)', 
            am: 'የከፈሉ ተማሪዎች (ይህ ወር)',
            selector: '.student-ranking-card h3'
        },
        'h3-payment-status': {
            en: 'Payment Status', 
            am: 'የክፍያ ሁኔታ',
            selector: '.analytics-card:last-child h3'
        },
        'modal-select-month-h2': {
            en: 'Select Payment Month', 
            am: 'የክፍያ ወር ይምረጡ',
            selector: '#month-modal h2'
        },
        'btn-set-month': { 
            en: 'Set Month', 
            am: 'ወር አዘጋጅ',
        },
        'modal-all-payments-h2': {
            en: 'All Payments Summary', 
            am: 'የሁሉም ክፍያዎች ማጠቃለያ',
            selector: '#all-payments-modal h2'
        },
        'btn-export-payments': {
            en: 'Export to PDF (Print)', 
            am: 'ወደ ፒዲኤፍ ላክ (ያትሙ)',
            icon: ' <i class="fas fa-money-check-alt"></i>'
        }
    };

    const applyLanguage = (lang) => {
        // 1. Translate fixed text elements
        for (const key in paymentElementsToTranslate) {
            const config = paymentElementsToTranslate[key];
            const element = config.selector ? document.querySelector(config.selector) : document.getElementById(key);
            
            if (element) {
                let translation = config[lang];
                
                if (config.icon) {
                    translation = config.icon.replace('<i class="fas fa-money-check-alt"></i>', '<i class="fas fa-file-export"></i>') + translation; // Use export icon for PDF
                }

                if (key === 'btn-export-payments') {
                     // Special handling for export button which has window.print()
                     element.innerHTML = paymentElementsToTranslate[key].icon.replace('<i class="fas fa-money-check-alt"></i>', '<i class="fas fa-file-export"></i>') + translation;
                } else if (config.icon) {
                    element.innerHTML = config.icon + translation;
                } else {
                    element.textContent = translation;
                }
            }
        }
        
        // 2. Handle the dynamic class header
        const headerElement = document.getElementById('class-header-title');
        if (headerElement) {
            if (lang === 'en') {
                headerElement.textContent = `Class Payments: ${classInfo.nameAm} (${classInfo.nameEn})`;
            } else {
                headerElement.textContent = `የክፍል ክፍያ: ${classInfo.nameAm} (${classInfo.nameEn})`;
            }
        }

        // 3. Update toggle button class and localStorage
        langToggleEn.classList.remove('active');
        langToggleAm.classList.remove('active');

        if (lang === 'en') {
            langToggleEn.classList.add('active');
            localStorage.setItem('paymentLang', 'en');
        } else {
            langToggleAm.classList.add('active');
            localStorage.setItem('paymentLang', 'am');
        }

        // 4. Re-render the student list to apply language to status tags and buttons
        const payments = loadPayments(classInfo.id, selectedMonth);
        renderStudents(currentStudents, payments);
    };

    // Event Listeners for the toggle
    if (langToggleEn) langToggleEn.addEventListener('click', () => applyLanguage('en'));
    if (langToggleAm) langToggleAm.addEventListener('click', () => applyLanguage('am'));


    // --- 8. INITIALIZATION ---

    const init = () => {
        classInfo = getClassInfoFromUrl();
        if (classInfo.id) {
            // Initial header setup before applying full translation
            classHeaderTitle.textContent = `Class Payments: ${classInfo.nameAm} (${classInfo.nameEn})`;
            document.title = `Class Payments | ${classInfo.nameEn}`;
        }
        
        // Load default or stored language
        const defaultLang = localStorage.getItem('paymentLang') || 'en';
        
        // Set the month and render the students (which calls renderStudents)
        setMonthAndRender(selectedMonth); 
        
        // Apply the initial language to all other elements
        applyLanguage(defaultLang);
    };

    init();
});