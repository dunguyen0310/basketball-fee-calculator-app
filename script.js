// --- NEW: Import modern Firebase functions ---
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
    // NEW: Create references for all three data paths
    const adhocSessionsRef = ref(database, 'activeAdhocSessions');
    const teamMembersRef = ref(database, 'activeTeamMembers');
    const savedReportsRef = ref(database, 'savedReports');


    // --- 2. CONFIGURATION & STATE ---
    const COURT_RENT = 4320000;
    const ADHOC_FEE_PER_SESSION = 70000;
    const CLOUDINARY_CLOUD_NAME = "duukynapb";
    const CLOUDINARY_UPLOAD_PRESET = "mafia-cats-preset";
    const qrCodeUrl = 'https://res.cloudinary.com/duukynapb/image/upload/v1749306691/width_199_id97k5.jpg';

    // Your personalized roster is preserved
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
    // (No changes here, all your selectors are correct)
    const monthlyFeeDisplay = document.getElementById('monthly-fee');
    const memberCountDisplay = document.getElementById('member-count');
    const memberListDiv = document.getElementById('member-list');
    // ... all other selectors
    const clearAdhocBtn = document.getElementById('clear-adhoc-btn');

    // --- 4. RENDERING & CALCULATION FUNCTIONS ---
    // (These are updated to be simpler as they now just render the state)
    const calculateAndDisplayFee = () => {
        const regularMemberCount = teamMembers.length;
        if (regularMemberCount === 0) { monthlyFeeDisplay.textContent = 'N/A - Add members'; return; }
        const totalAdhocContribution = adhocSessions.length * ADHOC_FEE_PER_SESSION;
        const remainingRent = COURT_RENT - totalAdhocContribution;
        const feePerMember = remainingRent / regularMemberCount;
        const finalFee = Math.max(0, feePerMember);
        monthlyFeeDisplay.textContent = `${finalFee.toLocaleString('en-US', { maximumFractionDigits: 0 })} VND`;
    };
    const renderMembers = () => {
        memberListDiv.innerHTML = '';
        teamMembers.forEach(member => {
            const memberContainer = document.createElement('div');
            memberContainer.className = 'member-avatar-container';
            memberContainer.innerHTML = `<img src="${member.avatarUrl}" alt="${member.name}" class="member-avatar" data-id="${member.key}"><span class="member-name">${member.name}</span>`;
            memberListDiv.appendChild(memberContainer);
        });
        memberCountDisplay.textContent = teamMembers.length;
        calculateAndDisplayFee();
        saveReportWrapper.classList.add('hidden');
    };
    const renderAdhocSessions = () => {
        adhocListUl.innerHTML = '';
        adhocSessions.forEach(session => {
            const li = document.createElement('li');
            const dateObj = new Date(session.date.replace(/-/g, '/'));
            const formattedDate = dateObj.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
            li.innerHTML = `<span><strong>${session.name}</strong> on ${formattedDate}</span><button class="delete-btn" data-id="${session.key}">&times;</button>`;
            adhocListUl.appendChild(li);
        });
        const uniqueNames = new Set(adhocSessions.map(session => session.name));
        adhocUniqueCountDisplay.textContent = uniqueNames.size;
        adhocSessionCountDisplay.textContent = adhocSessions.length;
        calculateAndDisplayFee();
        saveReportWrapper.classList.add('hidden');
    };
    const renderSavedReportsList = () => {
        savedReportsListUl.innerHTML = '';
        if (savedReports.length === 0) {
            savedReportsListUl.innerHTML = '<li>No reports saved yet.</li>';
            return;
        }
        savedReports.forEach(report => {
            const li = document.createElement('li');
            li.innerHTML = `<span>${report.name}</span><div class="saved-reports-actions"><button class="btn btn-small clone-btn" data-id="${report.key}">Clone to Current</button><button class="delete-btn" data-id="${report.key}">&times;</button></div>`;
            savedReportsListUl.appendChild(li);
        });
    };
    const generateReport = () => { /* ... Function is unchanged ... */ };
    async function uploadImage(file) { /* ... Function is unchanged ... */ };
    const renderRosterModal = () => { /* ... Function is unchanged ... */ };

    // --- 5. EVENT HANDLERS (Now talk to Firebase) ---
    
    // Member Handlers
    function handleRosterListClick(event) {
        if (event.target.tagName !== 'BUTTON') return;
        const memberId = event.target.closest('li').dataset.id;
        const memberToAdd = DEFAULT_ROSTER.find(m => m.id === memberId);
        if (memberToAdd) {
            // Push the new member to the Firebase database
            push(teamMembersRef, memberToAdd);
        }
    }
    async function handleAddMember() {
        const name = memberNameInputModal.value.trim();
        const file = memberImageInput.files[0];
        if (!name || !file) return alert('Please provide a name and image.');
        saveMemberBtn.disabled = true;
        saveMemberBtn.textContent = 'Saving...';
        const imageUrl = await uploadImage(file);
        if (imageUrl) {
            const newMember = { id: `guest-${Date.now()}`, name: name, avatarUrl: imageUrl };
            push(teamMembersRef, newMember); // Add guest member to Firebase
            addMemberModal.style.display = 'none';
        }
        saveMemberBtn.disabled = false;
        saveMemberBtn.textContent = 'Save Member';
        memberNameInputModal.value = '';
        memberImageInput.value = '';
    }
    function handleRemoveMember(event) {
        if (!event.target.matches('.member-avatar')) return;
        const memberKey = event.target.dataset.id;
        const memberToRemove = teamMembers.find(m => m.key === memberKey);
        if (confirm(`Are you sure you want to remove ${memberToRemove.name}?`)) {
            remove(ref(database, `activeTeamMembers/${memberKey}`));
        }
    }

    // Ad-Hoc Handlers
    function handleAddAdhoc() {
        const name = adhocNameInput.value.trim();
        const date = adhocDateInput.value;
        if (!name || !date) return alert('Please provide both a name and a date.');
        push(adhocSessionsRef, { name, date });
        adhocNameInput.value = '';
    }
    function handleAdhocListClick(event) {
        if (event.target.classList.contains('delete-btn')) {
            const sessionKey = event.target.dataset.id;
            if (confirm('Are you sure you want to remove this session?')) {
                remove(ref(database, `activeAdhocSessions/${sessionKey}`));
            }
        }
    }
    function handleClearActiveAdhoc() {
        if (confirm('Are you sure you want to clear the ENTIRE ad-hoc list for everyone?')) {
            remove(adhocSessionsRef);
        }
    };
    
    // Saved Report Handlers
    function handleSaveReport() {
        const reportName = reportNameInput.value.trim();
        if (!reportName) return alert('Please provide a name for the report.');
        const newReport = {
            name: reportName,
            period: new Date().toISOString(),
            members: teamMembers,
            adhoc: adhocSessions
        };
        push(savedReportsRef, newReport); // Save the report to Firebase
        alert(`Report "${reportName}" has been saved!`);
        saveReportWrapper.classList.add('hidden');
    };
    function handleCloneReport(reportKey) {
        const reportToClone = savedReports.find(r => r.key === reportKey);
        if (!reportToClone) return alert('Report not found.');
        if (!confirm(`This will replace all current members and ad-hoc players with data from "${reportToClone.name}". Continue?`)) {
            return;
        }
        // Set the active data to the cloned data in Firebase
        set(teamMembersRef, reportToClone.members || null);
        set(adhocSessionsRef, reportToClone.adhoc || null);
        alert(`Report "${reportToClone.name}" has been cloned.`);
    };
    function handleDeleteReport(reportKey) {
        if (confirm('Are you sure you want to delete this report forever?')) {
            remove(ref(database, `savedReports/${reportKey}`));
        }
    };
    function handleSavedReportsClick(event) {
        const target = event.target;
        if (target.hasAttribute('data-id')) {
            const reportKey = target.getAttribute('data-id');
            if (target.matches('.clone-btn')) {
                handleCloneReport(reportKey);
            } else if (target.matches('.delete-btn')) {
                handleDeleteReport(reportKey);
            }
        }
    }
// Other Handlers
const handleShareFee = () => { /* ... Unchanged ... */ };
const handleSaveActiveAdhoc = () => {
    alert("Your data is saved to the cloud in real-time automatically!");
};

// --- 6. FIREBASE REAL-TIME LISTENERS ---
onValue(teamMembersRef, (snapshot) => {
    const data = snapshot.val();
    const membersArray = [];
    if (data) {
        for (let key in data) {
            membersArray.push({ key: key, ...data[key] });
        }
    }
    teamMembers = membersArray;
    renderMembers();
});

onValue(adhocSessionsRef, (snapshot) => {
    const data = snapshot.val();
    const sessionsArray = [];
    if (data) {
        for (let key in data) {
            sessionsArray.push({ key: key, ...data[key] });
        }
    }
    adhocSessions = sessionsArray;
    renderAdhocSessions();
});

onValue(savedReportsRef, (snapshot) => {
    const data = snapshot.val();
    const reportsArray = [];
    if (data) {
        for (let key in data) {
            reportsArray.push({ key: key, ...data[key] });
        }
    }
    savedReports = reportsArray;
    renderSavedReportsList();
});

// --- 7. EVENT LISTENERS ---
addMemberBtn.addEventListener('click', () => addMemberModal.style.display = 'block');
closeModalBtn.addEventListener('click', () => addMemberModal.style.display = 'none');
window.addEventListener('click', (e) => { if (e.target === addMemberModal) addMemberModal.style.display = 'none'; });

openRosterBtn.addEventListener('click', () => {
    renderRosterModal();
    rosterModal.style.display = 'block';
});
closeRosterModalBtn.addEventListener('click', () => rosterModal.style.display = 'none');
window.addEventListener('click', (e) => { if (e.target === rosterModal) rosterModal.style.display = 'none'; });

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
// No need to load data here, the Firebase 'onValue' listeners do it automatically.
});