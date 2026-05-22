// ============================================
// ROOMINDER - MAIN APPLICATION SCRIPT
// ============================================

import { auth, db, googleProvider, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, signOut } from './firebase-config.js';
import { collection, addDoc, getDocs, deleteDoc, doc, getDoc, setDoc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const ADMIN_LOGIN_EMAILS = {
    admin: 'ernaldoquirojr@gmail.com',
    roomadmin: 'REPLACE_WITH_ROOMADMIN_EMAIL'
};

// ========== DATA STORE ==========
const app = {
    currentUser: null,
    isAdmin: false,
    users: [], 
    schedules: {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: []
    },
    reservationRequests: []
};

// ========== FIREBASE SESSION GUARD ==========

onAuthStateChanged(auth, (user) => {
    // Wait for DOM to be ready before manipulating elements
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => handleAuthStateChange(user));
    } else {
        handleAuthStateChange(user);
    }
});

async function handleAuthStateChange(user) {
    if (user) {
        app.currentUser = user;

        if (sessionStorage.getItem('roominderAdminSession') === 'true') {
            try {
                const adminSnapshot = await getDoc(doc(db, "admins", user.uid));

                if (adminSnapshot.exists()) {
                    app.isAdmin = true;
                    showAdminDashboard();
                    return;
                }
            } catch (error) {
                console.error("Admin session check failed:", error);
            }

            sessionStorage.removeItem('roominderAdminSession');
        }

        app.isAdmin = false; 
        if ($('#userNameDisplay').length) {
            $('#userNameDisplay').text(user.email.split('@')[0]); 
        }
        showUserDashboard();
    } else {
        app.currentUser = null;
        app.isAdmin = false;
        sessionStorage.removeItem('roominderAdminSession');
        $('#userDashboardScreen').hide();
        $('#adminDashboardScreen').hide();
        $('#authScreen').show();
    }
}

// ========== AUTHENTICATION ==========

function toggleAuthForm() {
    $('#loginFormDiv').toggle();
    $('#signupFormDiv').toggle();
    $('#formTitle').text($('#loginFormDiv').is(':visible') ? 'USER LOGIN' : 'CREATE ACCOUNT');
    $('#errorMessage').hide();
}

function toggleAdminForm() {
    switchAuthMode('admin');
}

function switchAuthMode(mode) {
    const isAdminMode = mode === 'admin';

    $('.auth-mode-btn').removeClass('active');
    $(`[data-auth-mode="${mode}"]`).addClass('active');

    $('#userAuthPanel').toggleClass('active', !isAdminMode).toggle(!isAdminMode);
    $('#adminFormDiv').toggleClass('active', isAdminMode).toggle(isAdminMode);

    if (isAdminMode) {
        $('#formTitle').text('ADMIN LOGIN');
    } else {
        $('#loginFormDiv').show();
        $('#signupFormDiv').hide();
        $('#formTitle').text('USER LOGIN');
    }

    $('#errorMessage').hide();
}

function showError(message) {
    $('#errorMessage').text(message).show();
    setTimeout(() => {
        $('#errorMessage').fadeOut();
    }, 4000);
}

function createEmptyScheduleMap() {
    return {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: []
    };
}

async function loadSchedulesFromFirestore() {
    const schedules = createEmptyScheduleMap();
    const querySnapshot = await getDocs(collection(db, "schedules"));

    querySnapshot.forEach((document) => {
        const schedule = { id: document.id, ...document.data() };
        const day = (schedule.day || '').toLowerCase();

        if (schedules[day]) {
            schedules[day].push(schedule);
        }
    });

    Object.keys(schedules).forEach((day) => {
        schedules[day].sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''));
    });

    app.schedules = schedules;
}

async function loadReservationRequestsFromFirestore() {
    const querySnapshot = await getDocs(collection(db, "reservationRequests"));
    app.reservationRequests = [];

    querySnapshot.forEach((document) => {
        app.reservationRequests.push({ id: document.id, ...document.data() });
    });

    app.reservationRequests.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
}

function getAdminEmailFromUsername(username) {
    const normalizedUsername = username.trim().toLowerCase();
    return ADMIN_LOGIN_EMAILS[normalizedUsername] || username;
}

async function saveUserProfile(user, profile = {}) {
    const userRef = doc(db, "users", user.uid);
    const existingUser = await getDoc(userRef);

    if (existingUser.exists()) {
        return;
    }

    await setDoc(userRef, {
        uid: user.uid,
        fullName: profile.fullName || user.displayName || user.email.split('@')[0],
        email: user.email,
        gender: profile.gender || 'N/A',
        occupation: profile.occupation || 'N/A',
        role: 'user',
        authProvider: profile.authProvider || 'password',
        createdAt: serverTimestamp()
    });
}

async function openAdminDashboardForUser(user) {
    const adminSnapshot = await getDoc(doc(db, "admins", user.uid));

    if (!adminSnapshot.exists()) {
        await signOut(auth);
        showError('This account is not an admin');
        return false;
    }

    app.isAdmin = true;
    app.currentUser = user;
    sessionStorage.setItem('roominderAdminSession', 'true');
    showAdminDashboard();

    Swal.fire({
        icon: 'success',
        title: 'Admin Login Successful',
        text: 'Welcome, Admin!',
        confirmButtonColor: '#66ff33',
        timer: 1500
    });

    return true;
}

// ========== DOCUMENT READY - BIND ALL EVENT HANDLERS ==========

$(document).ready(function() {
    $('.auth-mode-btn').on('click', function() {
        switchAuthMode($(this).data('auth-mode'));
    });

    $('#loginBtn').on('click', async function() {
        const email = $('#loginEmail').val().trim();
        const password = $('#loginPassword').val().trim();

        if (!email || !password) {
            showError('Please fill in all fields');
            return;
        }

        try {
            await signInWithEmailAndPassword(auth, email, password);
            Swal.fire({
                icon: 'success',
                title: 'Login Successful',
                text: 'Welcome back!',
                confirmButtonColor: '#66ff33',
                timer: 1500
            });
        } catch (error) {
            showError('Invalid email or password: ' + error.message);
        }
    });

    $('#googleLoginBtn').on('click', async function() {
        try {
            const btn = $(this);
            btn.text('CONNECTING...').prop('disabled', true);
            const userCredential = await signInWithPopup(auth, googleProvider);

            await saveUserProfile(userCredential.user, {
                authProvider: 'google'
            });

            Swal.fire({
                icon: 'success',
                title: 'Login Successful',
                text: 'Welcome to ROOMINDER!',
                confirmButtonColor: '#66ff33',
                timer: 1500
            });
        } catch (error) {
            console.error("Google login error:", error);
            showError('Google login failed: ' + error.message);
        } finally {
            $(this).html('<img src="googleicon.jpg" alt="" class="google-mark">CONTINUE WITH GOOGLE').prop('disabled', false);
        }
    });

    $('#signupBtn').on('click', async function() {
        const fullName = $('#signupName').val().trim();
        const email = $('#signupEmail').val().trim();
        const password = $('#signupPassword').val().trim();
        const confirmPassword = $('#signupConfirmPassword').val().trim();
        const gender = $('#signupGender').val();
        const occupation = $('#signupOccupation').val().trim();

        if (!fullName || !email || !password || !confirmPassword || !gender || !occupation) {
            showError('Please fill in all required fields');
            return;
        }

        if (password !== confirmPassword) {
            showError('Passwords do not match');
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            await saveUserProfile(userCredential.user, {
                fullName: fullName,
                gender: gender,
                occupation: occupation,
                authProvider: 'password'
            });

            Swal.fire({
                icon: 'success',
                title: 'Account Created',
                text: 'Your account has been created successfully!',
                confirmButtonColor: '#66ff33',
                timer: 1500
            });
        } catch (error) {
            showError(error.message);
        }
    });

    $('#adminLoginBtn').on('click', async function() {
        const username = $('#adminUsername').val().trim();
        const password = $('#adminPassword').val().trim();

        if (!username || !password) {
            showError('Please fill in all fields');
            return;
        }

        try {
            const btn = $(this);
            btn.text('LOGGING IN...').prop('disabled', true);
            const email = getAdminEmailFromUsername(username);
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            await openAdminDashboardForUser(userCredential.user);
        } catch (error) {
            console.error("Admin login error:", error);
            showError('Admin login failed: ' + error.message);
        } finally {
            $(this).text('LOGIN').prop('disabled', false);
        }
    });

    $('#adminGoogleLoginBtn').on('click', async function() {
        try {
            const btn = $(this);
            btn.text('CONNECTING...').prop('disabled', true);
            const userCredential = await signInWithPopup(auth, googleProvider);
            await openAdminDashboardForUser(userCredential.user);
        } catch (error) {
            console.error("Admin Google login error:", error);
            showError('Admin Google login failed: ' + error.message);
        } finally {
            $(this).html('<img src="googleicon.jpg" alt="" class="google-mark"><span>CONTINUE AS ADMIN WITH GOOGLE</span>').prop('disabled', false);
        }
    });

}); // End of document.ready()

async function logout() {
    try {
        await signOut(auth); 
        if(app.isAdmin) {
            app.isAdmin = false;
            location.reload(); 
        }
    } catch (error) {
        console.error("Error logging out", error);
    }
}

// ========== SCREEN TRANSITIONS ==========

async function showUserDashboard() {
    $('#authScreen').hide();
    $('#adminDashboardScreen').hide();
    $('#userDashboardScreen').show();
    await initializeUserDashboard();
}

async function showAdminDashboard() {
    $('#authScreen').hide();
    $('#userDashboardScreen').hide();
    $('#adminDashboardScreen').show();
    await initializeAdminDashboard();
}

// ========== USER DASHBOARD INITIALIZATION ==========

async function initializeUserDashboard() {
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    $('#todayDate').text(today.toLocaleDateString('en-US', options));

    try {
        await loadSchedulesFromFirestore();
        loadTodayRooms();
        populateDateDropdown();
        populateWeeklySchedules();
        await populateRoomInventory();
        setupUserDashboardListeners();
    } catch (error) {
        console.error("Error initializing user dashboard:", error);
        Swal.fire({ icon: 'error', title: 'Dashboard Failed To Load', text: error.message });
    }
}

function loadTodayRooms() {
    const today = new Date();
    const dayName = today.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const daySchedules = app.schedules[dayName] || [];

    const tbody = $('#roomsTableBody');

    if ($.fn.DataTable.isDataTable('#roomsTable')) {
        $('#roomsTable').DataTable().clear().destroy();
    }

    tbody.empty();

    daySchedules.forEach(room => {
        const statusClass = room.status === 'Vacant' ? 'status-vacant' : 'status-occupied';
        tbody.append(`
            <tr>
                <td style="font-weight:600; font-size:1.1rem;">${room.rooms}</td>
                <td>${room.start_time}</td>
                <td>${room.end_time}</td>
                <td class="${statusClass}">${room.status}</td>
            </tr>
        `);
    });

    $('#roomsTable').DataTable({
        pageLength: 5,
        lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "All"]],
        language: {
            search: "",
            searchPlaceholder: "Search...",
            emptyTable: "No schedules for today"
        }
    });
}

function populateDateDropdown() {
    const dateSelect = $('#dateSelect');
    const weekDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    dateSelect.empty().append('<option value="">-- Choose Date --</option>'); 

    for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

        if (weekDays.includes(dayName)) {
            const dateStr = date.toISOString().split('T')[0];
            const displayDate = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', weekday: 'long' });
            dateSelect.append(`<option value="${dateStr}">${displayDate}</option>`);
        }
    }
}

function populateWeeklySchedules() {
    const container = $('#weeklySchedulesContainer');
    container.empty();

    const weekDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

    weekDays.forEach(day => {
        const schedules = app.schedules[day] || [];
        const dayCapitalized = day.charAt(0).toUpperCase() + day.slice(1);

        let html = `<h4 style="margin-top: 25px; text-transform: capitalize;">${dayCapitalized}</h4>
                    <div class="table-responsive">
                        <table class="table table-custom" id="${day}Table">
                            <thead>
                                <tr>
                                    <th>Room</th>
                                    <th>Start Time</th>
                                    <th>End Time</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>`;

        if (schedules.length > 0) {
            schedules.forEach(schedule => {
                const statusClass = schedule.status === 'Vacant' ? 'status-vacant' : 'status-occupied';
                html += `<tr>
                            <td style="font-weight:600; font-size:1.1rem;">${schedule.rooms}</td>
                            <td>${schedule.start_time}</td>
                            <td>${schedule.end_time}</td>
                            <td class="${statusClass}">${schedule.status}</td>
                        </tr>`;
            });
        }

        html += '</tbody></table></div>';
        container.append(html);

        if (!$.fn.DataTable.isDataTable(`#${day}Table`)) {
            $(`#${day}Table`).DataTable({
                pageLength: 5,
                lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "All"]],
                language: {
                    search: "",
                    searchPlaceholder: "Search...",
                    emptyTable: "No schedules"
                }
            });
        }
    });
}

// FETCH LIVE ROOMS FOR USER INVENTORY
async function populateRoomInventory() {
    const tbody = $('#roomInventoryTableBody');

    if ($.fn.DataTable.isDataTable('#roomInventoryTable')) {
        $('#roomInventoryTable').DataTable().clear().destroy();
    }

    tbody.empty();

    try {
        const querySnapshot = await getDocs(collection(db, "rooms"));
        tbody.empty(); 

        if (!querySnapshot.empty) {
            querySnapshot.forEach((document) => {
                const room = document.data();
                const statusClass = room.status === 'Vacant' ? 'status-vacant' : 'status-occupied';
                
                tbody.append(`
                    <tr>
                        <td style="font-weight:600;">${room.rooms}</td>
                        <td>${room.type || 'N/A'}</td>
                        <td class="${statusClass}">${room.status}</td>
                    </tr>
                `);
            });
        }

        $('#roomInventoryTable').DataTable({
            pageLength: 5,
            lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "All"]],
            language: {
                search: "",
                searchPlaceholder: "Search...",
                emptyTable: "No rooms available"
            }
        });
    } catch (error) {
        console.error("Error loading inventory:", error);
        Swal.fire({ icon: 'error', title: 'Inventory Failed To Load', text: error.message });
    }
}

function setupUserDashboardListeners() {
    $('#dateSelect').off('change').on('change', function() {
        const selectedDate = $(this).val();
        const $timeSlotSelect = $('#timeSlotSelect');

        if (!selectedDate) {
            $timeSlotSelect.prop('disabled', true).html('<option value="">-- First select a date --</option>');
            return;
        }

        const date = new Date(selectedDate + 'T00:00:00');
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        const daySlots = app.schedules[dayName] || [];

        $timeSlotSelect.empty();

        if (daySlots.length === 0) {
            $timeSlotSelect.append('<option value="">-- No time slots available --</option>');
            $timeSlotSelect.prop('disabled', true);
            return;
        }

        $timeSlotSelect.append('<option value="">-- Choose Room & Time --</option>');

        daySlots.forEach(slot => {
            const slotData = JSON.stringify({
                scheduleId: slot.id,
                room: slot.rooms,
                start: slot.start_time,
                end: slot.end_time,
                status: slot.status
            });
            const statusLabel = slot.status === 'Vacant' ? '✓ Available' : '✗ Occupied';
            const isDisabled = slot.status !== 'Vacant';

            $timeSlotSelect.append(
                `<option value='${slotData}' ${isDisabled ? 'disabled' : ''}>
                    ${slot.rooms} | ${slot.start_time} - ${slot.end_time} ${statusLabel}
                </option>`
            );
        });

        $timeSlotSelect.prop('disabled', false);
    });

    $('#sendRequestBtn').off('click').on('click', async function() {
        const selectedDate = $('#dateSelect').val();
        const timeSlotData = $('#timeSlotSelect').val();
        const purpose = $('#bookingPurpose').val().trim();

        if (!selectedDate || !timeSlotData || !purpose) {
            Swal.fire({ icon: 'warning', title: 'Missing Info', text: 'Please fill all fields.', confirmButtonColor: '#66ff33' });
            return;
        }

        const slotInfo = JSON.parse(timeSlotData);

        const newRequest = {
            user_uid: app.currentUser.uid,
            user_name: app.currentUser ? app.currentUser.email : 'Unknown',
            room: slotInfo.room,
            date: selectedDate,
            schedule_id: slotInfo.scheduleId,
            start_time: slotInfo.start,
            end_time: slotInfo.end,
            purpose: purpose,
            status: 'pending',
            created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
        };

        try {
            const btn = $(this);
            btn.text('SENDING...').prop('disabled', true);
            await addDoc(collection(db, "reservationRequests"), {
                ...newRequest,
                createdAt: serverTimestamp()
            });

            Swal.fire({
                icon: 'success',
                title: 'Request Sent!',
                html: `<p style="color: #ccc;">Your reservation request has been submitted successfully.</p>`,
                confirmButtonColor: '#66ff33'
            }).then(() => {
                $('#dateSelect').val('');
                $('#timeSlotSelect').prop('disabled', true).html('<option value="">-- First select a date --</option>');
                $('#bookingPurpose').val('');
            });
        } catch (error) {
            console.error("Error sending reservation request:", error);
            Swal.fire({ icon: 'error', title: 'Request Failed', text: error.message });
        } finally {
            $(this).text('SEND RESERVATION REQUEST').prop('disabled', false);
        }
    });
}

function switchUserTab(tabName) {
    $('.tab-panel').removeClass('active');
    $('#' + tabName + 'Panel').addClass('active');
    $('.nav-btn').removeClass('active-tab');
    $('.nav-btn[data-tab="' + tabName + '"]').addClass('active-tab');
}

// ========== ADMIN DASHBOARD INITIALIZATION ==========

async function initializeAdminDashboard() {
    try {
        await loadSchedulesFromFirestore();
        await loadReservationRequestsFromFirestore();
        loadAdminUsers();
        loadAdminRequests();
        loadAdminSchedules($('#scheduleDay').val() || 'monday');
        loadAdminRooms();
        setupAdminDashboardListeners();
    } catch (error) {
        console.error("Error initializing admin dashboard:", error);
        Swal.fire({ icon: 'error', title: 'Admin Dashboard Failed To Load', text: error.message });
    }
}

async function loadAdminUsers() {
    const tbody = $('#usersTableBody');

    if ($.fn.DataTable.isDataTable('#usersTable')) {
        $('#usersTable').DataTable().clear().destroy();
    }

    tbody.empty();

    try {
        const querySnapshot = await getDocs(collection(db, "users"));

        querySnapshot.forEach((document) => {
            const user = document.data();
            const joinedDate = user.createdAt && user.createdAt.toDate
                ? user.createdAt.toDate().toLocaleDateString()
                : 'N/A';

            tbody.append(`
                <tr>
                    <td>${user.fullName || 'N/A'}</td>
                    <td>${user.email || 'N/A'}</td>
                    <td>${user.occupation || 'N/A'}</td>
                    <td>${joinedDate}</td>
                </tr>
            `);
        });
    } catch (error) {
        console.error("Error loading users:", error);
        Swal.fire({ icon: 'error', title: 'Users Failed To Load', text: error.message });
    }

    $('#usersTable').DataTable({
        pageLength: 10,
        lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "All"]],
        language: {
            search: "",
            searchPlaceholder: "Search...",
            emptyTable: "No users found"
        }
    });
}

function loadAdminRequests() {
    const pendingRequests = app.reservationRequests.filter(r => r.status === 'pending');
    const tbody = $('#requestsTableBody');

    if ($.fn.DataTable.isDataTable('#requestsTable')) {
        $('#requestsTable').DataTable().clear().destroy();
    }

    tbody.empty();

    $('#pendingBadge').text(pendingRequests.length);

    if (pendingRequests.length > 0) {
        pendingRequests.forEach(req => {
            tbody.append(`
                <tr>
                    <td>${req.user_name}</td>
                    <td>${req.room}</td>
                    <td>${req.date}</td>
                    <td>${req.start_time} - ${req.end_time}</td>
                    <td>${req.purpose}</td>
                    <td>${req.created_at}</td>
                    <td>
                        <button class="btn btn-primary btn-sm" onclick="approveRequest('${req.id}')">Approve</button>
                        <button class="btn btn-danger btn-sm" onclick="rejectRequest('${req.id}')">Reject</button>
                    </td>
                </tr>
            `);
        });
    }

    $('#requestsTable').DataTable({ 
        pageLength: 10, 
        lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "All"]],
        language: {
            search: "",
            searchPlaceholder: "Search...",
            emptyTable: "No pending requests"
        }
    });
}

function loadAdminSchedules(day) {
    const schedules = app.schedules[day] || [];
    const tbody = $('#scheduleTableBody');

    if ($.fn.DataTable.isDataTable('#scheduleTable')) {
        $('#scheduleTable').DataTable().clear().destroy();
    }

    tbody.empty();

    if (schedules.length > 0) {
        schedules.forEach(schedule => {
            const statusClass = schedule.status === 'Vacant' ? 'status-vacant' : 'status-occupied';
            tbody.append(`
                <tr>
                    <td>${schedule.rooms}</td>
                    <td>${schedule.start_time}</td>
                    <td>${schedule.end_time}</td>
                    <td class="${statusClass}">${schedule.status}</td>
                    <td>
                        <button class="btn btn-warning btn-sm" onclick="editSchedule('${schedule.id}')">Edit</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteSchedule('${schedule.id}', '${day}')">Delete</button>
                    </td>
                </tr>
            `);
        });
    }

    $('#scheduleTable').DataTable({ 
        pageLength: 10, 
        lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "All"]],
        language: {
            search: "",
            searchPlaceholder: "Search...",
            emptyTable: "No schedules for this day"
        }
    });
}

// FETCH LIVE ROOMS FOR ADMIN DASHBOARD
async function loadAdminRooms() {
    const tbody = $('#roomsManagementTableBody');

    if ($.fn.DataTable.isDataTable('#roomsManagementTable')) {
        $('#roomsManagementTable').DataTable().clear().destroy();
    }

    tbody.empty();

    try {
        const querySnapshot = await getDocs(collection(db, "rooms"));
        tbody.empty(); 

        if (!querySnapshot.empty) {
            querySnapshot.forEach((document) => {
                const room = document.data();
                const roomId = document.id; 
                const statusClass = room.status === 'Vacant' ? 'status-vacant' : 'status-occupied';
                
                tbody.append(`
                    <tr>
                        <td>${room.rooms}</td>
                        <td>${room.type}</td>
                        <td class="${statusClass}">${room.status}</td>
                        <td>
                            <button class="btn btn-warning btn-sm" onclick="editRoom('${roomId}')">Edit</button>
                            <button class="btn btn-danger btn-sm" onclick="deleteRoom('${roomId}')">Delete</button>
                        </td>
                    </tr>
                `);
            });
        }

        $('#roomsManagementTable').DataTable({ 
            pageLength: 10, 
            lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "All"]],
            language: {
                search: "",
                searchPlaceholder: "Search...",
                emptyTable: "No rooms found in database"
            }
        });
        
    } catch (error) {
        console.error("Error fetching rooms: ", error);
        Swal.fire({ icon: 'error', title: 'Rooms Failed To Load', text: error.message });
    }
}

function setupAdminDashboardListeners() {
    $('#scheduleDay').off('change').on('change', function() { loadAdminSchedules($(this).val()); });

    $('#addScheduleBtn').off('click').on('click', async function() {
        const day = $('#scheduleDay').val();
        const room = $('#scheduleRoom').val().trim();
        const start = $('#scheduleStart').val();
        const end = $('#scheduleEnd').val();
        const status = $('#scheduleStatus').val();

        if (!day || !room || !start || !end || !status) {
            Swal.fire({ icon: 'warning', title: 'Missing Fields', text: 'Please fill in all schedule fields', confirmButtonColor: '#66ff33' });
            return;
        }

        if (start >= end) {
            Swal.fire({ icon: 'warning', title: 'Invalid Time', text: 'End time must be later than start time', confirmButtonColor: '#66ff33' });
            return;
        }

        try {
            const btn = $(this);
            btn.text('ADDING...').prop('disabled', true);

            await addDoc(collection(db, "schedules"), {
                day: day,
                rooms: room,
                start_time: start,
                end_time: end,
                status: status,
                createdAt: serverTimestamp()
            });

            await loadSchedulesFromFirestore();
            loadAdminSchedules(day);
            Swal.fire({ icon: 'success', title: 'Schedule Added', confirmButtonColor: '#66ff33' });

            $('#scheduleRoom').val('');
            $('#scheduleStart').val('');
            $('#scheduleEnd').val('');
            $('#scheduleStatus').val('Vacant');
        } catch (error) {
            console.error("Error adding schedule:", error);
            Swal.fire({ icon: 'error', title: 'Schedule Failed To Add', text: error.message });
        } finally {
            $(this).text('ADD SCHEDULE').prop('disabled', false);
        }
    });

    // ADD ROOM LIVE TO FIRESTORE
    $('#addRoomBtn').off('click').on('click', async function() {
        const name = $('#newRoomName').val().trim();
        const type = $('#newRoomType').val().trim();
        const status = $('#newRoomStatus').val();

        if (!name || !type) {
            Swal.fire({ icon: 'warning', title: 'Missing Fields', text: 'Please fill in all fields', confirmButtonColor: '#66ff33' });
            return;
        }

        try {
            const btn = $(this);
            btn.text('ADDING...').prop('disabled', true);

            await addDoc(collection(db, "rooms"), {
                rooms: name,
                type: type,
                status: status,
                createdAt: new Date().toISOString()
            });

            Swal.fire({ icon: 'success', title: 'Room Added', confirmButtonColor: '#66ff33' });
            
            $('#newRoomName').val('');
            $('#newRoomType').val('');
            loadAdminRooms(); 
            
        } catch (error) {
            console.error("Error adding document: ", error);
            Swal.fire({ icon: 'error', title: 'Error', text: error.message });
        } finally {
            $(this).text('ADD ROOM').prop('disabled', false);
        }
    });
}

function switchAdminTab(tabName) {
    $('.tab-content').removeClass('active');
    $('#' + tabName + 'Panel').addClass('active');
    $('.nav-link').removeClass('active-tab');
    $('.nav-link[data-tab="' + tabName + '"]').addClass('active-tab');
}

async function approveRequest(requestId) {
    const request = app.reservationRequests.find(r => r.id === requestId);
    if (!request) return;

    try {
        await updateDoc(doc(db, "reservationRequests", requestId), { status: 'approved' });

        if (request.schedule_id) {
            await updateDoc(doc(db, "schedules", request.schedule_id), { status: 'Occupied' });
            await loadSchedulesFromFirestore();
            loadAdminSchedules($('#scheduleDay').val() || 'monday');
        }

        await loadReservationRequestsFromFirestore();
        Swal.fire({ icon: 'success', title: 'Approved', confirmButtonColor: '#66ff33' }).then(() => loadAdminRequests());
    } catch (error) {
        console.error("Error approving request:", error);
        Swal.fire({ icon: 'error', title: 'Approval Failed', text: error.message });
    }
}

async function rejectRequest(requestId) {
    const request = app.reservationRequests.find(r => r.id === requestId);
    if (!request) return;

    try {
        await updateDoc(doc(db, "reservationRequests", requestId), { status: 'rejected' });
        await loadReservationRequestsFromFirestore();
        Swal.fire({ icon: 'success', title: 'Rejected', confirmButtonColor: '#66ff33' }).then(() => loadAdminRequests());
    } catch (error) {
        console.error("Error rejecting request:", error);
        Swal.fire({ icon: 'error', title: 'Rejection Failed', text: error.message });
    }
}

// DELETE LIVE ROOM FROM FIRESTORE
async function deleteRoom(roomId) {
    Swal.fire({
        title: 'Delete Room?',
        text: 'Are you sure? This action cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ff4d4d',
        cancelButtonColor: '#444',
        confirmButtonText: 'Yes, Delete'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                await deleteDoc(doc(db, "rooms", roomId));
                Swal.fire({ icon: 'success', title: 'Room Deleted', confirmButtonColor: '#66ff33' });
                loadAdminRooms(); 
                
            } catch (error) {
                console.error("Error deleting room: ", error);
                Swal.fire({ icon: 'error', title: 'Error', text: error.message });
            }
        }
    });
}

async function deleteSchedule(scheduleId, day) {
    Swal.fire({
        title: 'Delete Schedule?',
        text: 'This will remove the time slot from reservations.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ff4d4d',
        cancelButtonColor: '#444',
        confirmButtonText: 'Yes, Delete'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                await deleteDoc(doc(db, "schedules", scheduleId));
                await loadSchedulesFromFirestore();
                loadAdminSchedules(day);
                Swal.fire({ icon: 'success', title: 'Schedule Deleted', confirmButtonColor: '#66ff33' });
            } catch (error) {
                console.error("Error deleting schedule:", error);
                Swal.fire({ icon: 'error', title: 'Delete Failed', text: error.message });
            }
        }
    });
}

function editSchedule(scheduleId) { Swal.fire({ icon: 'info', title: 'Edit Mode Coming Soon' }); }
function editRoom(roomId) { Swal.fire({ icon: 'info', title: 'Edit Mode Coming Soon' }); }

// ============================================
// EXPORTING FUNCTIONS FOR HTML ONCLICK HANDLERS
// ============================================

window.toggleAuthForm = toggleAuthForm;
window.toggleAdminForm = toggleAdminForm;
window.logout = logout;
window.switchUserTab = switchUserTab;
window.switchAdminTab = switchAdminTab;
window.approveRequest = approveRequest;
window.rejectRequest = rejectRequest;
window.editRoom = editRoom;
window.deleteRoom = deleteRoom;
window.editSchedule = editSchedule;
window.deleteSchedule = deleteSchedule;
