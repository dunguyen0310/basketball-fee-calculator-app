import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-app.js";
import { getDatabase, ref, onValue, push, remove, set } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-database.js";

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. FIREBASE CONFIGURATION ---
    const firebaseConfig = {
        apiKey: "AIzaSyAz4_IQg5_P67QYJ30JNDlEISacUS3e3Lc",
        authDomain: "basketball-club-fee-manager.firebaseapp.com",
        databaseURL: "https://basketball-club-fee-manager-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "basketball-club-fee-manager",
        storageBucket: "basketball-club-fee-manager.appspot.com",
        messagingSenderId: "394781234199",
        appId: "1:394781234199:web:3d91f8b93df77bff7af852"
    };
    const app = initializeApp(firebaseConfig);
    const database = getDatabase(app);
    const adhocSessionsRef = ref(database, 'activeAdhocSessions');
    const teamMembersRef = ref(database, 'activeTeamMembers');
    const savedReportsRef = ref(database, 'savedReports');

    // --- 2. APP CONFIGURATION & STATE ---
    const COURT_RENT = 4320000;
    const ADHOC_FEE_PER_SESSION = 70000;
    const CLOUDINARY_CLOUD_NAME = "duukynapb";
    const CLOUDINARY_UPLOAD_PRESET = "mafia-cats-preset";
    const qrCodeUrl = 'https://res.cloudinary.com/duukynapb/image/upload/v1749306691/width_199_id97k5.jpg';
    const DEFAULT_ROSTER = [
        { id: 'def-01', name: 'Thường', avatarUrl: 'https://res.cloudinary.com/duukynapb/image/upload/v1749311917/ChatGPT_Image_Jun_7_2025_10_58_31_PM_awxfp1.png' },
        { id: 'def-02', name: 'Du', avatarUrl: 'https://res.cloudinary.com/duukynapb/image/upload/v1749313494/ChatGPT_Image_Jun_7_2025_11_24_37_PM_y0je5p.png' },
        { id: 'def-03', name: 'Tái', avatarUrl: 'https://i.pravatar.cc/80?u=Tai' },
        { id: 'def-04', name: 'Cừu', avatarUrl: 'https://res.cloudinary.com/duukynapb/image/upload/v1749311089/ae81ac0c-45a9-4a1e-beae-efa148405cda_zs48rx.png' },
        { id: 'def-05', name: 'Khoa', avatarUrl: 'https://i.pravatar.cc/80?u=Khoa' },
        { id: 'def-06', name: 'Tài', avatarUrl: 'https://i.pravatar.cc/80?u=Tai2' },
        { id: 'def-07', name: 'Nghi xù', avatarUrl: 'https://res.cloudinary.com/duukynapb/image/upload/v1749307248/245f8524-bf42-4549-a3f3-ecf220f8194b_clrune.png' },
        { id: 'def-08', name: 'Khang', avatarUrl: 'https://res.cloudinary.com/duukynapb/image/upload/v1749308100/ChatGPT_Image_Jun_7_2025_09_54_55_PM_ewxnci.png' },
        { id: 'def-09', name: 'Chim', avatarUrl: 'https://i.pravatar.cc/80?u=Chim' },
        { id: 'def-10', name: 'Nathan', avatarUrl: 'https://res.cloudinary.com/duukynapb/image/upload/v1749308572/ChatGPT_Image_Jun_7_2025_10_02_46_PM_kiy1y1.png' },
        { id: 'def-11', name: 'Vic', avatarUrl: 'https://res.cloudinary.com/duukynapb/image/upload/v1749310269/ChatGPT_Image_Jun_7_2025_10_30_51_PM_xhf5th.png' },
        { id: 'def-12', name: 'Beng', avatarUrl: 'https://res.cloudinary.com/duukynapb/image/upload/v1749307592/ChatGPT_Image_Jun_7_2025_09_46_19_PM_okpwjs.png' },
        { id: 'def-13', name: 'Minh CD', avatarUrl: 'https://i.pravatar.cc/80?u=MinhCD' },
        { id: 'def-14', name: 'Khải', avatarUrl: 'https://res.cloudinary.com/duukynapb/image/upload/v1749314999/ChatGPT_Image_Jun_7_2025_11_49_49_PM_qaezep.png' },
        { id: 'def-15', name: 'Bo', avatarUrl: 'https://i.pravatar.cc/80?u=Bo' },
        { id: 'def-16', name: 'An Mập', avatarUrl: 'https://i.pravatar.cc/80?u=AnMap' },
        { id: 'def-17', name: 'Hậu', avatarUrl: 'https://res.cloudinary.com/duukynapb/image/upload/v1749308451/ChatGPT_Image_Jun_7_2025_09_59_54_PM_oyhqsh.png' }
    ];
    let teamMembers = [];
    let adhocSessions = [];
    let savedReports = [];

    // --- 3. SELECTING HTML ELEMENTS ---
    const monthlyFeeDisplay = document.getElementById('monthly-fee');
    const memberCountDisplay = document.getElementById('member-count');
    const memberListDiv = document.getElementById('member-list');
    const addMemberBtn = document.getElementById('add-member-btn');
    const addMemberModal = document.getElementById('add-member-modal');
    const closeModalBtn = addMemberModal.querySelector('.close-btn');
    const saveMemberBtn = document.getElementById('save-member-btn');
    const memberNameInputModal = document.getElementById('member-name-input-modal');
    const memberImageInput = document.getElementById('member-image-input');
    const adhocUniqueCountDisplay = document.getElementById('adhoc-unique-count');
    const adhocSessionCountDisplay = document.getElementById('adhoc-session-count');
    const adhocNameInput = document.getElementById('adhoc-name-input');
    const adhocDateInput = document.getElementById('adhoc-date-input');
    const addAdhocBtn = document.getElementById('add-adhoc-btn');
    const adhocListUl = document.getElementById('adhoc-list');
    const generateReportBtn = document.getElementById('generate-report-btn');
    const reportOutputDiv = document.getElementById('report-output');
    const saveReportWrapper = document.getElementById('save-report-wrapper');
    const reportNameInput = document.getElementById('report-name-input');
    const saveReportBtn = document.getElementById('save-report-btn');
    const savedReportsListUl = document.getElementById('saved-reports-list');
    const openRosterBtn = document.getElementById('open-roster-btn');
    const rosterModal = document.getElementById('roster-modal');
    const closeRosterModalBtn = rosterModal.querySelector('.close-btn');
    const rosterListUl = document.getElementById('roster-list');
    const shareFeeBtn = document.getElementById('share-fee-btn');
    const feeShareArea = document.getElementById('fee-share-area');
    const qrCodeImg = document.getElementById('qr-code-img');
    const saveAdhocBtn = document.getElementById('save-adhoc-btn');
    const clearAdhocBtn = document.getElementById('clear-adhoc-btn');
    // New Modal Elements
    const reportSummaryModal = document.getElementById('report-summary-modal');
    const closeSummaryModalBtn = reportSummaryModal.querySelector('.close-btn');
    const summaryReportName = document.getElementById('summary-report-name');
    const summaryContent = document.getElementById('summary-content');
    const cloneFromSummaryBtn = document.getElementById('clone-from-summary-btn');

    // --- 4. RENDERING & CALCULATION FUNCTIONS ---
    const calculateAndDisplayFee = () => { /* ... Unchanged ... */ };
    const renderMembers = () => { /* ... Unchanged ... */ };
    const renderAdhocSessions = () => { /* ... Unchanged ... */ };
    
    /**
     * UPDATED: Renders the saved reports list with "View" and "Delete" buttons.
     */
    const renderSavedReportsList = () => {
        savedReportsListUl.innerHTML = '';
        if (savedReports.length === 0) {
            savedReportsListUl.innerHTML = '<li>No reports saved yet.</li>';
            return;
        }
        savedReports.forEach(report => {
            const li = document.createElement('li');
            li.innerHTML = `<span>${report.name}</span>
                          <div class="saved-reports-actions">
                              <button class="btn btn-small view-report-btn" data-id="${report.key}">View</button>
                              <button class="delete-btn" data-id="${report.key}">&times;</button>
                          </div>`;
            savedReportsListUl.appendChild(li);
        });
    };
    const generateReport = () => { /* ... Unchanged ... */ };
    async function uploadImage(file) { /* ... Unchanged ... */ };
    const renderRosterModal = () => { /* ... Unchanged ... */ };

    // --- 5. EVENT HANDLERS ---
    function handleRosterListClick(event) { /* ... Unchanged ... */ };
    async function handleAddMember() { /* ... Unchanged ... */ };
    function handleRemoveMember(event) { /* ... Unchanged ... */ };
    function handleAddAdhoc() { /* ... Unchanged ... */ };
    function handleAdhocListClick(event) { /* ... Unchanged ... */ };
    function handleClearActiveAdhoc() { /* ... Unchanged ... */ };
    function handleSaveReport() { /* ... Unchanged ... */ };
    const handleShareFee = () => { /* ... Unchanged ... */ };
    const handleSaveActiveAdhoc = () => { /* ... Unchanged ... */ };

    /**
     * NEW: Shows the report summary modal with details.
     */
    function handleViewReport(reportKey) {
        const report = savedReports.find(r => r.key === reportKey);
        if (!report) return;

        summaryReportName.textContent = report.name;

        const members = report.members || [];
        const adhoc = report.adhoc || [];

        let membersHtml = '<h4>Team Members</h4><ul>';
        if (members.length > 0) {
            members.forEach(m => { membersHtml += `<li>${m.name}</li>`; });
        } else {
            membersHtml += '<li>No members in this report.</li>';
        }
        membersHtml += '</ul>';

        let adhocHtml = '<h4>Ad-Hoc Sessions</h4><ul>';
        if (adhoc.length > 0) {
            adhoc.forEach(s => { adhocHtml += `<li>${s.name} on ${s.date}</li>`; });
        } else {
            adhocHtml += '<li>No ad-hoc sessions in this report.</li>';
        }
        adhocHtml += '</ul>';

        summaryContent.innerHTML = membersHtml + adhocHtml;
        cloneFromSummaryBtn.dataset.id = report.key; // Set the key on the clone button
        reportSummaryModal.style.display = 'block';
    }
    
    /**
     * UPDATED: Clones a report based on the key from the summary modal button.
     */
    function handleCloneReport(reportKey) {
        const reportToClone = savedReports.find(r => r.key === reportKey);
        if (!reportToClone) return alert('Report not found.');
        if (!confirm(`This will replace all current members and ad-hoc players with data from "${reportToClone.name}". Continue?`)) {
            return;
        }
        set(teamMembersRef, reportToClone.members || null);
        set(adhocSessionsRef, reportToClone.adhoc || null);
        alert(`Report "${reportToClone.name}" has been cloned.`);
        reportSummaryModal.style.display = 'none'; // Close the modal after cloning
    };

    /**
     * UPDATED: Handles "View" and "Delete" clicks in the past reports list.
     */
    function handleSavedReportsClick(event) {
        const target = event.target;
        if (target.hasAttribute('data-id')) {
            const reportKey = target.getAttribute('data-id');
            if (target.matches('.view-report-btn')) { // Changed from .clone-btn
                handleViewReport(reportKey);
            } else if (target.matches('.delete-btn')) {
                if (confirm('Are you sure you want to delete this report forever?')) {
                    remove(ref(database, `savedReports/${reportKey}`));
                }
            }
        }
    }
    // --- 6. FIREBASE REAL-TIME LISTENERS ---
    onValue(teamMembersRef, (snapshot) => {
        const data = snapshot.val();
        const membersArray = [];
        if (data) {
            for (let key in data) { membersArray.push({ key: key, ...data[key] }); }
        }
        teamMembers = membersArray;
        renderMembers();
    });
    onValue(adhocSessionsRef, (snapshot) => {
        const data = snapshot.val();
        const sessionsArray = [];
        if (data) {
            for (let key in data) { sessionsArray.push({ key: key, ...data[key] }); }
        }
        adhocSessions = sessionsArray;
        renderAdhocSessions();
    });
    onValue(savedReportsRef, (snapshot) => {
        const data = snapshot.val();
        const reportsArray = [];
        if (data) {
            for (let key in data) { reportsArray.push({ key: key, ...data[key] }); }
        }
        savedReports = reportsArray;
        renderSavedReportsList();
    });

    // --- 7. EVENT LISTENERS ---
    addMemberBtn.addEventListener('click', () => addMemberModal.style.display = 'block');
    closeModalBtn.addEventListener('click', () => addMemberModal.style.display = 'none');
    window.addEventListener('click', (e) => { if (e.target === addMemberModal) { addMemberModal.style.display = 'none'; } });

    openRosterBtn.addEventListener('click', () => {
        renderRosterModal();
        rosterModal.style.display = 'block';
    });
    closeRosterModalBtn.addEventListener('click', () => { rosterModal.style.display = 'none'; });
    window.addEventListener('click', (e) => { if (e.target === rosterModal) { rosterModal.style.display = 'none'; } });

    // Listeners for the new summary modal
    closeSummaryModalBtn.addEventListener('click', () => reportSummaryModal.style.display = 'none');
    window.addEventListener('click', (e) => { if (e.target === reportSummaryModal) { reportSummaryModal.style.display = 'none'; } });
    cloneFromSummaryBtn.addEventListener('click', (e) => handleCloneReport(e.target.dataset.id));

    // All other event listeners
    shareFeeBtn.addEventListener('click', handleShareFee);
    memberListDiv.addEventListener('click', handleRemoveMember);
    rosterListUl.addEventListener('click', handleRosterListClick);
    saveMemberBtn.addEventListener('click', handleAddMember);
    addAdhocBtn.addEventListener('click', handleAddAdhoc);
    adhocListUl.addEventListener('click', handleAdhocListClick);
    generateReportBtn.addEventListener('click', generateReport);
    saveReportBtn.addEventListener('click', handleSaveReport);
    savedReportsListUl.addEventListener('click', handleSavedReportsClick);
    saveAdhocBtn.addEventListener('click', handleSaveActiveAdhoc);
    clearAdhocBtn.addEventListener('click', handleClearActiveAdhoc);

    // --- 8. INITIALIZATION ---
    adhocDateInput.value = new Date().toISOString().split('T')[0];
    reportNameInput.value = `Report for ${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}`;
    qrCodeImg.src = qrCodeUrl;
});