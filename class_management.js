document.addEventListener('DOMContentLoaded', () => {

    // --- 0. URL PARSING AND DYNAMIC STUDENT GENERATION ---

    // Map to convert ID to Amharic name
    const classIdToNameMap = {
        'K1': 'ምድብ ቂርቆስ ፩', 'K2': 'ምድብ ቂርቆስ ፪', 'K3': 'ምድብ ቂርቆስ ፫',
        'S1': 'ምድብ ሳሙኤል ፩', 'S2': 'ምድብ ሳሙኤል ፪', 'E': 'ምድብ እስጢፋኖስ',
        'W1': 'ምድብ ቅዱስ ያሬድ ፩', 'W2': 'ምድብ ቅዱስ ያሬድ ፪',
        'BS': 'በሻሌ ትምህርት ቤት', 'SS': 'ሳፋሪ ትምህርት ቤት'
    };

    // Sample data for generating realistic-looking student names
    const sampleAmharicNames = [
        "አበበ ገብረ መድኅን", "ብርቱካን ንጉሤ", "ኃይሌ አስፋው",
        "ፅጌረዳ አበበ", "ሰለሞን ከበደ", "ፋሲካ ሞላ",
        "ኤፍሬም ታደሰ", "መልካም ደሳለኝ", "ራሄል ወርቁ",
        "ታምራት ኃይሉ"
    ];

    // Function to extract class info from URL parameters
    const getClassInfoFromUrl = () => {
        const urlParams = new URLSearchParams(window.location.search);

        let id = urlParams.get('classId');
        let name = urlParams.get('className');

        if (!id) {
            id = urlParams.get('class') || 'K1';
        }
        id = id.toUpperCase();

        if (!name) {
            name = classIdToNameMap[id] || 'ምድብ ቂርቆስ ፩';
        }

        const fullTitle = `${name} (${id})`;

        return { id, name, fullTitle };
    };

    const classInfo = getClassInfoFromUrl();

    // Function to generate student objects based on the Class ID
    const generateSampleStudents = (classId) => {
        const students = [];
        const count = 7; // Generate 7 sample students

        const prefix = classId;

        for (let i = 0; i < count; i++) {
            const studentId = `${prefix}${String(i + 1).padStart(3, '0')}`;
            const name = sampleAmharicNames[i % sampleAmharicNames.length];
            const phone = `09${String(Math.floor(Math.random() * 90000000) + 10000000)}`;

            students.push({ id: studentId, name: name, phone: phone });
        }
        return students;
    };

    // --- LOCAL STORAGE FUNCTIONS FOR STUDENT LIST (NEW/MODIFIED) ---
    
    // Key to store the main student list (must be unique per class)
    const STUDENT_LIST_KEY = `${classInfo.id}_student_list`;

    /**
     * Loads the student list from localStorage. If no data is found, 
     * it generates and saves sample students.
     * @returns {Array<Object>} The list of students.
     */
    const loadStudentList = () => {
        const data = localStorage.getItem(STUDENT_LIST_KEY);
        if (data) {
            return JSON.parse(data);
        }
        // No data found in localStorage, so generate samples and save them
        const initialStudents = generateSampleStudents(classInfo.id);
        saveStudentList(initialStudents); 
        return initialStudents;
    };

    /**
     * Saves the current list of students to localStorage.
     * @param {Array<Object>} students - The list of student objects.
     */
    const saveStudentList = (students) => {
        localStorage.setItem(STUDENT_LIST_KEY, JSON.stringify(students));
    };

    let currentStudents = loadStudentList(); // ⬅️ Initialize with loaded data

    // Function to render the students to the table
    const renderStudents = (students) => {
        const studentList = document.getElementById('student-list');
        if (!studentList) return;

        studentList.innerHTML = '';

        students.forEach(student => {
            const newRow = document.createElement('tr');
            newRow.setAttribute('data-student-id', student.id);

            newRow.innerHTML = `
                <td>${student.id}</td>
                <td><a href="#" class="student-name-link">${student.name}</a></td>
                <td>${student.phone}</td>
                <td><input type="checkbox"></td>
                <td class="action-cells">
                    <button class="btn-edit" data-id="${student.id}"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button class="btn-remove" data-id="${student.id}"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
            studentList.appendChild(newRow);
        });
    };

    // --- 1. CORE ELEMENT GETTERS (unchanged) ---
    const studentList = document.getElementById('student-list');
    const studentSearch = document.getElementById('student-search');
    const markAllPresentBtn = document.getElementById('btn-mark-all-present');
    const markAllAbsentBtn = document.getElementById('btn-mark-all-absent');

    // Daily View Elements
    const dailyAttendanceContainer = document.getElementById('daily-attendance-container');
    const dailyNavBar = document.getElementById('daily-nav-bar');
    const btnToggleDailySummary = document.getElementById('btn-toggle-daily-summary'); // New/Updated

    const calendarModal = document.getElementById('calendar-modal');
    const openModalBtn = document.getElementById('open-calendar-modal');
    const closeModalBtn = document.querySelector('#calendar-modal .close-btn-calendar');
    const gcDatePicker = document.getElementById('gc-date-picker');
    const btnSelectDate = document.getElementById('btn-select-date');

    const prevBtn = document.getElementById('prev-session');
    const nextBtn = document.getElementById('next-session');

    // Summary View Elements
    const summaryTableContainer = document.getElementById('summary-table-container');
    const summaryTable = document.getElementById('summary-table');
    const summaryDateRangeDisplay = document.getElementById('summary-date-range');
    const btnExportPdf = document.getElementById('btn-export-pdf');
    const btnSelectRange = document.getElementById('btn-select-range');
    const btnToggleSummaryDaily = document.getElementById('btn-toggle-summary-daily'); // New/Updated
    const btnViewAnalyticsFromSummary = document.getElementById('btn-view-analytics-from-summary'); // New

    const rangeModal = document.getElementById('range-modal');
    const closeRangeModalBtn = document.querySelector('#range-modal .close-btn-range');
    const startDatePicker = document.getElementById('start-date-picker');
    const endDatePicker = document.getElementById('end-date-picker');
    const btnShowSummary = document.getElementById('btn-show-summary');

    // Analytics View Elements (NEW)
    const analyticsContainer = document.getElementById('analytics-container');
    const btnToggleAnalyticsDaily = document.getElementById('btn-toggle-analytics-daily');
    const btnToggleAnalyticsSummary = document.getElementById('btn-toggle-analytics-summary');
    const btnRefreshAnalytics = document.getElementById('btn-refresh-analytics');
    const overallRateDisplay = document.getElementById('overall-rate');
    const topPresentList = document.getElementById('top-present-list');
    const topAbsentList = document.getElementById('top-absent-list');

    // Add/Edit Modals (Existing)
    const addStudentModal = document.getElementById('add-student-modal');
    const openAddStudentModalBtn = document.getElementById('open-add-student-modal');
    const closeAddStudentModalBtn = document.querySelector('#add-student-modal .close-btn-add-student');
    const addStudentForm = document.getElementById('add-student-form');

    const editStudentModal = document.getElementById('edit-student-modal');
    const closeEditStudentModalBtn = document.querySelector('#edit-student-modal .close-btn-edit-student');
    const editStudentForm = document.getElementById('edit-student-form');

    const currentDateGregorian = document.getElementById('current-date-gregorian');
    const langToggleEn = document.getElementById('lang-en-class');
    const langToggleAm = document.getElementById('lang-am-class');
    const backToDashboardBtn = document.getElementById('back-to-dashboard-btn');

    let selectedDate = new Date();
    let currentSummaryRange = { start: null, end: null }; // Stores the current range being displayed

    // --- TRANSLATION DATA (UPDATED with Analytics terms) ---
    const translationMap = {
        'class-header-title': {
            en: (className) => `Class Management: ${className} (${classInfo.id})`,
            am: (classNameAmharic) => `የክፍል አስተዳደር: ${classNameAmharic}`
        },
        'th-id': { en: 'Student ID', am: 'የተማሪ መለያ' },
        'th-name': { en: 'Student Name', am: 'የተማሪው ስም' },
        'th-phone': { en: 'Student Phone', am: 'ስልክ ቁጥር' },
        'th-attendance': { en: 'Attendance (Present/Absent)', am: 'ክትትል (የቀረ/የቀረ)' },
        'th-actions': { en: 'Actions', am: 'ድርጊቶች' },
        'open-calendar-modal': { en: '<i class="fa-solid fa-calendar-days"></i> Change Date', am: '<i class="fa-solid fa-calendar-days"></i> ቀን ቀይር' },
        'prev-session': { en: '<i class="fa-solid fa-chevron-left"></i> Previous', am: '<i class="fa-solid fa-chevron-left"></i> ወደኋላ' },
        'next-session': { en: 'Next <i class="fa-solid fa-chevron-right"></i>', am: 'ቀጣይ <i class="fa-solid fa-chevron-right"></i>' },
        'btn-mark-all-present': { en: 'Mark All Present', am: 'ሁሉንም የቀረ አስመዝግብ' },
        'btn-mark-all-absent': { en: 'Mark All Absent', am: 'ሁሉንም የቀረ ያስመዝግብ' },
        'open-add-student-modal': { en: '<i class="fa-solid fa-user-plus"></i> Add Student', am: '<i class="fa-solid fa-user-plus"></i> አዲስ ተማሪ ጨምር' },
        'modal-add-student-title': { en: 'Add New Student', am: 'አዲስ ተማሪ ጨምር' },
        'label-student-id': { en: 'Student ID', am: 'የተማሪ መለያ ቁጥር' },
        'label-student-name': { en: 'Student Name', am: 'የተማሪው ስም' },
        'label-student-phone': { en: 'Student Phone', am: 'ስልክ ቁጥር' },
        'btn-save-student': { en: 'Save Student', am: 'ተማሪ አስቀምጥ' },

        // View Toggle Buttons (Now have explicit IDs)
        'btn-toggle-daily-summary': { en: '<i class="fa-solid fa-list-ol"></i> View Attendance Summary', am: '<i class="fa-solid fa-list-ol"></i> የክትትል ማጠቃለያ እይ' },
        'btn-toggle-summary-daily': { en: '<i class="fa-solid fa-calendar-day"></i> View Daily Attendance', am: '<i class="fa-solid fa-calendar-day"></i> የቀን ክትትል እይ' },
        'btn-view-analytics-from-summary': { en: '<i class="fa-solid fa-chart-bar"></i> View Analytics', am: '<i class="fa-solid fa-chart-bar"></i> ትንታኔ እይ' },
        'btn-toggle-analytics-daily': { en: '<i class="fa-solid fa-calendar-day"></i> View Daily Attendance', am: '<i class="fa-solid fa-calendar-day"></i> የቀን ክትትል እይ' },
        'btn-toggle-analytics-summary': { en: '<i class="fa-solid fa-list-ol"></i> View Attendance Summary', am: '<i class="fa-solid fa-list-ol"></i> ማጠቃለያ እይ' },
        'btn-refresh-analytics': { en: '<i class="fa-solid fa-sync"></i> Recalculate', am: '<i class="fa-solid fa-sync"></i> እንደገና አስሉ' },

        // Summary & Analytics Actions
        'btn-select-range': { en: '<i class="fa-solid fa-calendar-alt"></i> Select Date Range', am: '<i class="fa-solid fa-calendar-alt"></i> የቀን ወሰን ምረጥ' },
        'btn-export-pdf': { en: '<i class="fa-solid fa-file-pdf"></i> Export PDF', am: '<i class="fa-solid fa-file-pdf"></i> PDF ላክ' },
        'h3-overall-rate': { en: 'Overall Class Attendance Rate', am: 'አጠቃላይ የክፍሉ የመገኘት ምጣኔ' },
        'h3-top-present': { en: 'Top 3 Most Present Students', am: 'በጣም የቀሩት ሦስት ተማሪዎች' },
        'h3-top-absent': { en: 'Top 3 Students Needing Intervention (Most Absent)', am: 'ብዙ የቀሩት ሦስት ተማሪዎች' },
        'h3-trend': { en: 'Attendance Trend Over Time (P% per Session)', am: 'የጊዜ ሂደት የመገኘት ዝንባሌ' },
    };

    let currentLanguage = 'en';

    // --- 2. LANGUAGE SWITCHING LOGIC (unchanged) ---
    function applyLanguage(lang) {
        currentLanguage = lang;

        const classNameAmharic = classInfo.name;

        const headerTitleElement = document.getElementById('class-header-title');
        if (headerTitleElement) {
            headerTitleElement.innerHTML = lang === 'en'
                ? translationMap['class-header-title'].en(classNameAmharic)
                : translationMap['class-header-title'].am(classNameAmharic);
        }

        for (const id in translationMap) {
            if (id !== 'class-header-title') {
                const element = document.getElementById(id);
                if (element) {
                    element.innerHTML = translationMap[id][lang];
                }
            }
        }

        if (langToggleEn && langToggleAm) {
            langToggleEn.classList.remove('active');
            langToggleAm.classList.remove('active');
            if (lang === 'en') {
                langToggleEn.classList.add('active');
            } else {
                langToggleAm.classList.add('active');
            }
        }
    }

    if (langToggleEn) {
        langToggleEn.addEventListener('click', () => applyLanguage('en'));
    }
    if (langToggleAm) {
        langToggleAm.addEventListener('click', () => applyLanguage('am'));
    }

    applyLanguage('en');

    // --- 3. DATE UTILITIES & DATA PERSISTENCE (unchanged, except for the load logic call) ---

    const formatDate = (date) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    };

    const formatToInputDate = (date) => {
        // Returns YYYY-MM-DD
        return date.toISOString().split('T')[0];
    };

    const getAttendanceKey = (date) => {
        // IMPORTANT: Use class ID in the key to separate attendance records per class
        return `${classInfo.id}_attendance_` + formatToInputDate(date);
    };

    const saveAttendance = (date) => {
        const attendanceData = {};
        // Save attendance for ALL students, regardless of filter visibility
        const rows = studentList.querySelectorAll('tr');
        rows.forEach(row => {
            const studentId = row.getAttribute('data-student-id');
            const checkbox = row.querySelector('input[type="checkbox"]');
            if (studentId && checkbox) {
                attendanceData[studentId] = checkbox.checked;
            }
        });
        localStorage.setItem(getAttendanceKey(date), JSON.stringify(attendanceData));
    };

    const resetAttendanceCheckboxes = () => {
        const checkboxes = studentList.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(cb => cb.checked = false);
    };

    const loadAttendance = (date) => {
        const attendanceData = localStorage.getItem(getAttendanceKey(date));
        const checkboxes = studentList.querySelectorAll('input[type="checkbox"]');

        if (attendanceData) {
            const data = JSON.parse(attendanceData);
            checkboxes.forEach(cb => {
                const row = cb.closest('tr');
                const studentId = row.getAttribute('data-student-id');
                cb.checked = data[studentId] === true;
            });
        } else {
            resetAttendanceCheckboxes();
        }
    };

    const updateDateDisplay = (date) => {
        if (currentDateGregorian) {
            currentDateGregorian.textContent = formatDate(date);
        }
        if (gcDatePicker) {
            gcDatePicker.value = formatToInputDate(date);
        }
        // Load attendance MUST happen AFTER rendering students
        loadAttendance(date);
    };

    // Helper to find all dates with attendance data for the current class
    const getAllAttendanceDates = (startDateStr, endDateStr) => {
        const dates = new Set();
        const classPrefix = `${classInfo.id}_attendance_`;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(classPrefix)) {
                const dateStr = key.substring(classPrefix.length);

                // Filter by date range if provided
                if (startDateStr && endDateStr) {
                    if (dateStr >= startDateStr && dateStr <= endDateStr) {
                         dates.add(dateStr);
                    }
                } else {
                     dates.add(dateStr);
                }
            }
        }
        // Sort dates chronologically (using string comparison for YYYY-MM-DD is safe)
        return Array.from(dates).sort();
    };

    // --- 4. DATE NAVIGATION & PERSISTENCE CONTROL (unchanged) ---
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;

    const changeDate = (newDate) => {
        // 1. Save attendance for the date we are leaving
        saveAttendance(selectedDate);

        // 2. Update the selected date
        selectedDate = newDate;

        // 3. Update display (which includes loading attendance for the new date)
        updateDateDisplay(selectedDate);
    }

    if (prevBtn) {
        prevBtn.onclick = () => {
            const newDate = new Date(selectedDate.getTime() - ONE_DAY_MS);
            changeDate(newDate);
        };
    }
    if (nextBtn) {
        nextBtn.onclick = () => {
            const newDate = new Date(selectedDate.getTime() + ONE_DAY_MS);
            changeDate(newDate);
        };
    }

    // Set up event listener for individual checkbox changes (saves attendance immediately)
    if (studentList) {
        studentList.addEventListener('change', (event) => {
            if (event.target.matches('input[type="checkbox"]')) {
                saveAttendance(selectedDate);
            }
        });
    }


    // --- 5. MODAL OPENERS & CLOSERS (unchanged) ---

    if (openAddStudentModalBtn && addStudentModal) {
        openAddStudentModalBtn.onclick = () => {
            addStudentModal.style.display = 'block';
        };
    }

    if (openModalBtn && calendarModal) {
        openModalBtn.onclick = () => {
            gcDatePicker.value = formatToInputDate(selectedDate);
            calendarModal.style.display = 'block';
        };
    }

    if (btnSelectDate) {
        btnSelectDate.onclick = () => {
            const dateValue = gcDatePicker.value;
            if (dateValue) {
                const [year, month, day] = dateValue.split('-').map(Number);
                const newDate = new Date(year, month - 1, day, 12);

                changeDate(newDate);
                calendarModal.style.display = 'none';
            }
        };
    }

    // Open Range Modal
    if (btnSelectRange && rangeModal) {
        btnSelectRange.onclick = () => {
            if (!currentSummaryRange.start || !currentSummaryRange.end) {
                const endDate = new Date();
                const startDate = new Date();
                startDate.setDate(endDate.getDate() - 6);

                startDatePicker.value = formatToInputDate(startDate);
                endDatePicker.value = formatToInputDate(endDate);
            } else {
                startDatePicker.value = formatToInputDate(currentSummaryRange.start);
                endDatePicker.value = formatToInputDate(currentSummaryRange.end);
            }

            rangeModal.style.display = 'block';
        }
    }

    const allModals = [calendarModal, addStudentModal, editStudentModal, rangeModal];

    if (closeModalBtn) {
        closeModalBtn.onclick = () => { if (calendarModal) calendarModal.style.display = 'none'; };
    }
    if (closeAddStudentModalBtn) {
        closeAddStudentModalBtn.onclick = () => { if (addStudentModal) addStudentModal.style.display = 'none'; };
    }
    if (closeEditStudentModalBtn) {
        closeEditStudentModalBtn.onclick = () => { if (editStudentModal) editStudentModal.style.display = 'none'; };
    }
    if (closeRangeModalBtn) {
        closeRangeModalBtn.onclick = () => { if (rangeModal) rangeModal.style.display = 'none'; };
    }

    window.onclick = (event) => {
        allModals.forEach(modal => {
            if (modal && event.target == modal) {
                modal.style.display = 'none';
            }
        });
    };

    // --- 6. MARK ALL BUTTONS & SEARCH (unchanged) ---

    // Function to get visible rows (not hidden by search)
    const getVisibleRows = () => {
        return studentList.querySelectorAll('tr:not([style*="display: none"])');
    };

    if (markAllPresentBtn && studentList) {
        markAllPresentBtn.onclick = () => {
            const visibleRows = getVisibleRows();
            visibleRows.forEach(row => {
                const checkbox = row.querySelector('input[type="checkbox"]');
                if (checkbox) checkbox.checked = true;
            });
            saveAttendance(selectedDate);
        };
    }

    if (markAllAbsentBtn && studentList) {
        markAllAbsentBtn.onclick = () => {
            const visibleRows = getVisibleRows();
            visibleRows.forEach(row => {
                const checkbox = row.querySelector('input[type="checkbox"]');
                if (checkbox) checkbox.checked = false;
            });
            saveAttendance(selectedDate);
        };
    }

    // Search Logic
    if (studentSearch && studentList) {
        studentSearch.addEventListener('keyup', (e) => {
            const searchText = e.target.value.toLowerCase().trim();
            const rows = studentList.querySelectorAll('tr');

            rows.forEach(row => {
                if (row.cells.length >= 2) {
                    const id = row.cells[0].textContent.toLowerCase();
                    const nameLink = row.cells[1].querySelector('.student-name-link');
                    const name = nameLink ? nameLink.textContent.toLowerCase() : '';

                    if (searchText === '') {
                        row.style.display = '';
                    }
                    else if (id.includes(searchText) || name.includes(searchText)) {
                        row.style.display = '';
                    } else {
                        row.style.display = 'none';
                    }
                }
            });
        });
    }

    // --- 7. ADD, EDIT, REMOVE STUDENT LOGIC (MODIFIED to update currentStudents and saveStudentList) ---
    if (addStudentForm && studentList) {
        addStudentForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const studentId = document.getElementById('new-student-id').value.trim();
            const studentName = document.getElementById('new-student-name').value.trim();
            const studentPhone = document.getElementById('new-student-phone').value.trim();

            if (studentId && studentName && studentPhone) {
                const newStudent = { id: studentId, name: studentName, phone: studentPhone };
                
                // Add to the in-memory array
                currentStudents.push(newStudent);
                // Save the updated list to LocalStorage
                saveStudentList(currentStudents); 

                // Re-render the table to include the new student and maintain the current sort/filter
                renderStudents(currentStudents); 
                
                addStudentForm.reset();
                if (addStudentModal) addStudentModal.style.display = 'none';

                saveAttendance(selectedDate); // Save attendance in case a new student gets marked today

                alert(`Student "${studentName}" (ID: ${studentId}) added successfully!`);
            } else {
                alert("Please fill in all student details.");
            }
        });
    }

    if (studentList) {
        studentList.addEventListener('click', (event) => {
            const target = event.target.closest('button');
            if (!target) return;

            const studentId = target.getAttribute('data-id');
            const row = studentList.querySelector(`tr[data-student-id="${studentId}"]`);
            if (!row) return;

            if (target.classList.contains('btn-remove')) {
                if (confirm(`Are you sure you want to remove student ID ${studentId}?`)) {
                    // Remove from the in-memory array
                    currentStudents = currentStudents.filter(s => s.id !== studentId);
                    // Save the updated list to LocalStorage
                    saveStudentList(currentStudents);
                    
                    row.remove();
                    alert(`Student ID ${studentId} removed.`);
                    
                    // Note: Removing a student will not remove their past attendance records.
                }
            } else if (target.classList.contains('btn-edit')) {
                const cells = row.querySelectorAll('td');
                const nameElement = cells[1].querySelector('.student-name-link');
                const name = nameElement ? nameElement.textContent.trim() : 'N/A';
                const phone = cells[2].textContent;

                document.getElementById('edit-original-id').value = studentId;
                document.getElementById('edit-student-id').value = studentId;
                document.getElementById('edit-student-name').value = name;
                document.getElementById('edit-student-phone').value = phone;

                if (editStudentModal) editStudentModal.style.display = 'block';
            }
        });
    }

    if (editStudentForm) {
        editStudentForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const originalId = document.getElementById('edit-original-id').value.trim();
            const newId = document.getElementById('edit-student-id').value.trim();
            const newName = document.getElementById('edit-student-name').value.trim();
            const newPhone = document.getElementById('edit-student-phone').value.trim();

            const row = studentList.querySelector(`tr[data-student-id="${originalId}"]`);

            if (row && newId && newName && newPhone) {
                // Update the in-memory array
                const studentToUpdate = currentStudents.find(s => s.id === originalId);
                if (studentToUpdate) {
                    studentToUpdate.id = newId;
                    studentToUpdate.name = newName;
                    studentToUpdate.phone = newPhone;
                }
                // Save the updated list to LocalStorage
                saveStudentList(currentStudents); 

                // Update the visible row elements
                row.setAttribute('data-student-id', newId);
                const cells = row.querySelectorAll('td');
                cells[0].textContent = newId;
                cells[1].querySelector('.student-name-link').textContent = newName;
                cells[2].textContent = newPhone;

                row.querySelector('.btn-edit').setAttribute('data-id', newId);
                row.querySelector('.btn-remove').setAttribute('data-id', newId);

                if (editStudentModal) editStudentModal.style.display = 'none';
                alert(`Student ID ${originalId} successfully updated to ${newId}.`);
            } else {
                alert("Error updating student. Please check inputs.");
            }
        });
    }

    // --- 8. VIEW SWITCHING LOGIC (Daily <-> Summary <-> Analytics) (unchanged) ---

    // Function to hide all main content views
    const hideAllViews = () => {
        dailyAttendanceContainer.style.display = 'none';
        dailyNavBar.style.display = 'none';
        summaryTableContainer.style.display = 'none';
        analyticsContainer.style.display = 'none';
    };

    const toggleToDailyView = () => {
        // Save attendance before leaving the daily view
        saveAttendance(selectedDate);
        hideAllViews();
        dailyAttendanceContainer.style.display = 'block';
        dailyNavBar.style.display = 'flex';
        // Reload attendance for the current day
        loadAttendance(selectedDate);
        // Clear search filter when switching back to daily view
        studentSearch.value = '';
        studentSearch.dispatchEvent(new Event('keyup'));
    };

    // Function to switch to the Summary Table view
    const toggleToSummaryView = (startDate = null, endDate = null) => {
        hideAllViews();
        summaryTableContainer.style.display = 'block';
        renderSummaryTable(startDate, endDate); // This function handles the actual data rendering
    };

    // Function to switch to the Analytics view
    const toggleToAnalyticsView = () => {
        hideAllViews();
        analyticsContainer.style.display = 'block';
        calculateAnalytics(); // This function handles the data calculation and rendering
    };

    // Event Listeners for View Switching

    // From Daily View to Summary View (Initial switch)
    if (btnToggleDailySummary) {
        btnToggleDailySummary.onclick = () => toggleToSummaryView(null, null);
    }

    // From Summary View to Daily View
    if (btnToggleSummaryDaily) {
        btnToggleSummaryDaily.onclick = toggleToDailyView;
    }

    // From Summary View to Analytics View
    if (btnViewAnalyticsFromSummary) {
        btnViewAnalyticsFromSummary.onclick = toggleToAnalyticsView;
    }

    // From Analytics View to Daily View
    if (btnToggleAnalyticsDaily) {
        btnToggleAnalyticsDaily.onclick = toggleToDailyView;
    }

    // From Analytics View to Summary View (re-renders the last used range)
    if (btnToggleAnalyticsSummary) {
        btnToggleAnalyticsSummary.onclick = () => toggleToSummaryView(currentSummaryRange.start, currentSummaryRange.end);
    }

    // --- 9. ATTENDANCE SUMMARY VIEW & PDF EXPORT (MODIFIED to use currentStudents) ---

    // Function to render the summary table for a given range
    const renderSummaryTable = (startDate, endDate) => {
        // Store the range globally
        currentSummaryRange.start = startDate;
        currentSummaryRange.end = endDate;

        const startDateStr = startDate ? formatToInputDate(startDate) : null;
        const endDateStr = endDate ? formatToInputDate(endDate) : null;

        // Get the recorded dates within the specified range (or all dates)
        const recordedDates = getAllAttendanceDates(startDateStr, endDateStr);

        // Clear the existing table
        summaryTable.innerHTML = '';

        if (recordedDates.length === 0) {
            summaryTable.innerHTML = '<thead><tr><th>No attendance records found for this date range.</th></tr></thead>';
            return;
        }

        // --- 1. PREPARE HEADERS ---
        const displayDates = recordedDates.map(d => {
            const parts = d.split('-');
            return `${parts[1]}/${parts[2]}`; // MM/DD
        });

        let headerRow = '<tr><th class="sticky-col">ID</th><th class="sticky-col">Name</th>';
        displayDates.forEach(d => {
            headerRow += `<th>${d}</th>`;
        });
        headerRow += '<th class="total-absences">Absences</th></tr>';
        summaryTable.innerHTML = `<thead>${headerRow}</thead><tbody></tbody>`;
        const summaryTableBody = summaryTable.querySelector('tbody');

        // --- 2. PREPARE BODY DATA ---
        // Use the in-memory/localStorage-loaded student list
        const studentsToSummarize = currentStudents;

        studentsToSummarize.forEach(student => {
            const studentId = student.id;
            const studentName = student.name;

            let rowHtml = `<tr data-student-id="${studentId}"><td class="sticky-col">${studentId}</td><td class="sticky-col">${studentName}</td>`;
            let absenceCount = 0;

            recordedDates.forEach(dateStr => {
                const key = `${classInfo.id}_attendance_` + dateStr;
                const attendanceData = localStorage.getItem(key);
                let status = '<span class="status-no-record">-</span>';

                if (attendanceData) {
                    const data = JSON.parse(attendanceData);

                    if (data.hasOwnProperty(studentId)) {
                        const isPresent = data[studentId] === true;
                        status = isPresent ? '<span class="status-present">P</span>' : '<span class="status-absent">A</span>';
                        if (!isPresent) {
                            absenceCount++;
                        }
                    }
                }

                rowHtml += `<td class="attendance-status-cell">${status}</td>`;
            });

            rowHtml += `<td class="total-absences">${absenceCount}</td></tr>`;

            summaryTableBody.insertAdjacentHTML('beforeend', rowHtml);
        });

        // Update the date range display
        let rangeText = '(All Recorded Dates)';
        if (startDate && endDate) {
            const startDisplay = formatDate(startDate);
            const endDisplay = formatDate(endDate);
            rangeText = `(${startDisplay} - ${endDisplay})`;
        }
        summaryDateRangeDisplay.textContent = rangeText;
    };

    // Event listener for the "Show Summary" button inside the range modal (unchanged)
    if (btnShowSummary) {
        btnShowSummary.onclick = () => {
            const startValue = startDatePicker.value;
            const endValue = endDatePicker.value;

            if (!startValue || !endValue) {
                alert("Please select both a start and end date.");
                return;
            }

            const [startY, startM, startD] = startValue.split('-').map(Number);
            const [endY, endM, endD] = endValue.split('-').map(Number);

            const startDate = new Date(startY, startM - 1, startD, 12);
            const endDate = new Date(endY, endM - 1, endD, 12);

            if (startDate > endDate) {
                alert("The start date cannot be after the end date.");
                return;
            }

            rangeModal.style.display = 'none';
            toggleToSummaryView(startDate, endDate);
        };
    }

    // --- 10. ATTENDANCE ANALYTICS LOGIC (MODIFIED to use currentStudents) ---

    const calculateAnalytics = () => {
        if (!analyticsContainer || !overallRateDisplay || !topPresentList || !topAbsentList) return;

        const recordedDates = getAllAttendanceDates(null, null); // Get all dates
        const studentsForAnalytics = currentStudents;

        if (recordedDates.length === 0 || studentsForAnalytics.length === 0) {
            overallRateDisplay.textContent = '0%';
            topPresentList.innerHTML = '<li>No attendance data recorded yet.</li>';
            topAbsentList.innerHTML = '<li>No attendance data recorded yet.</li>';
            document.getElementById('attendance-trend-placeholder').textContent = "No data to calculate analytics.";
            return;
        }

        let totalSessions = recordedDates.length;
        let totalPossibleAttendance = totalSessions * studentsForAnalytics.length;
        let totalPresentCount = 0;

        const studentMetrics = [];

        studentsForAnalytics.forEach(student => {
            const studentId = student.id;
            const studentName = student.name;

            let presentCount = 0;

            recordedDates.forEach(dateStr => {
                const key = `${classInfo.id}_attendance_` + dateStr;
                const attendanceData = localStorage.getItem(key);

                if (attendanceData) {
                    const data = JSON.parse(attendanceData);
                    if (data.hasOwnProperty(studentId) && data[studentId] === true) {
                        presentCount++;
                    }
                }
            });

            totalPresentCount += presentCount;
            const absentCount = totalSessions - presentCount;

            studentMetrics.push({
                id: studentId,
                name: studentName,
                present: presentCount,
                absent: absentCount
            });
        });

        // 1. Overall Class Attendance Rate
        const overallRate = totalPossibleAttendance > 0
            ? Math.round((totalPresentCount / totalPossibleAttendance) * 100)
            : 0;
        overallRateDisplay.textContent = `${overallRate}%`;

        // 2. Ranking
        // Sort by present count (descending)
        const topPresent = [...studentMetrics].sort((a, b) => b.present - a.present).slice(0, 3);

        // Sort by absent count (descending)
        const topAbsent = [...studentMetrics].sort((a, b) => b.absent - a.absent).slice(0, 3);

        // 3. Render Top Present
        topPresentList.innerHTML = topPresent.map(s =>
            `<li>${s.name} <span class="ranking-count">${s.present} P</span></li>`
        ).join('');

        // 4. Render Top Absent
        topAbsentList.innerHTML = topAbsent.map(s =>
            `<li>${s.name} <span class="ranking-count">${s.absent} A</span></li>`
        ).join('');

        // 5. Trend Chart Placeholder Update
        document.getElementById('attendance-trend-placeholder').textContent =
            `Attendance data analyzed for ${recordedDates.length} sessions. A real chart would show the percentage present for each of those sessions here.`;
    };

    // Recalculate Button (unchanged)
    if (btnRefreshAnalytics) {
        btnRefreshAnalytics.onclick = calculateAnalytics;
    }


    // --- 11. PDF EXPORT FEATURE (Using current summary data) (MODIFIED to use currentStudents) ---
    if (btnExportPdf) {
        btnExportPdf.onclick = () => {
            if (typeof window.jspdf === 'undefined' || typeof window.jspdf.jsPDF === 'undefined') {
                alert("PDF Export Library (jsPDF) not loaded. Please ensure the CDN links are correct in your HTML <head>.");
                return;
            }

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF('landscape');

            const classTitle = classInfo.fullTitle;
            const startDateStr = currentSummaryRange.start ? formatToInputDate(currentSummaryRange.start) : null;
            const endDateStr = currentSummaryRange.end ? formatToInputDate(currentSummaryRange.end) : null;
            const recordedDates = getAllAttendanceDates(startDateStr, endDateStr);

            if (recordedDates.length === 0) {
                 alert("No attendance records found for the current range. Please select a different range.");
                 return;
            }

            // --- 1. SET UP HEADER ---
            doc.setFontSize(16);
            doc.text(`Comprehensive Attendance Report for ${classTitle}`, 10, 15);
            doc.setFontSize(10);

            let rangeText = 'All Recorded Dates';
            if (currentSummaryRange.start && currentSummaryRange.end) {
                 rangeText = `${formatDate(currentSummaryRange.start)} - ${formatDate(currentSummaryRange.end)}`;
            }
            doc.text(`Date Range: ${rangeText}`, 10, 20);
            doc.text(`Report Generated: ${formatDate(new Date())}`, 10, 25);


            // --- 2. PREPARE TABLE DATA ---
            const displayDates = recordedDates.map(d => {
                 const parts = d.split('-');
                 return `${parts[1]}/${parts[2]}`;
            });

            const head = [['ID', 'Name', ...displayDates, 'Absences']];
            const body = [];

            const studentsToExport = currentStudents;

            studentsToExport.forEach(student => {
                const studentId = student.id;
                const studentName = student.name;

                const studentData = [studentId, studentName];
                let absenceCount = 0;

                recordedDates.forEach(dateStr => {
                    const key = `${classInfo.id}_attendance_` + dateStr;
                    const attendanceData = localStorage.getItem(key);
                    let status = '-';

                    if (attendanceData) {
                        const data = JSON.parse(attendanceData);

                        if (data.hasOwnProperty(studentId)) {
                            status = data[studentId] === true ? 'P' : 'A';
                        }
                    }

                    studentData.push(status);

                    if (status === 'A') {
                        absenceCount++;
                    }
                });

                studentData.push(absenceCount);
                body.push(studentData);
            });

            // --- 3. GENERATE PDF ---
            try {
                doc.autoTable({
                    head: head,
                    body: body,
                    startY: 30,
                    theme: 'grid',
                    styles: { fontSize: 8, cellPadding: 1, overflow: 'linebreak' },
                    headStyles: { fillColor: [26, 35, 126], textColor: 255, fontStyle: 'bold' },
                    columnStyles: {
                        0: { cellWidth: 20 },
                        1: { cellWidth: 40 },

                        // Attendance status columns
                        ...displayDates.reduce((acc, _, index) => {
                            acc[index + 2] = { halign: 'center', cellWidth: 'auto' };
                            return acc;
                        }, {}),
                        // Absences column
                        [2 + displayDates.length]: { halign: 'center', fontStyle: 'bold', cellWidth: 20 }
                    }
                });
            } catch(e) {
                console.error("PDF table plugin error:", e);
                alert("PDF table formatting failed. Please ensure the 'jspdf-autotable' plugin is linked correctly.");
                return;
            }

            doc.save(`Attendance_Summary_Report_${classInfo.id}_${startDateStr || 'All'}-${endDateStr || 'All'}.pdf`);
        };
    }

    // --- 12. GLOBAL NAVIGATION (unchanged) ---
    if (backToDashboardBtn) {
        backToDashboardBtn.addEventListener('click', () => {
            saveAttendance(selectedDate);
            window.location.href = 'dashboard.html';
        });
    }

    // --- 13. INITIALIZATION (MODIFIED) ---
    // 1. Render the students loaded from localStorage (or generated samples)
    renderStudents(currentStudents);

    // 2. Load the date display and attendance records for the newly rendered students
    updateDateDisplay(selectedDate);
});