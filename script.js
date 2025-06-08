// --- Import modern Firebase functions ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-app.js";
import { getDatabase, ref, onValue, push, remove, set } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-database.js";

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. FIREBASE & AI CONFIGURATION ---
    const firebaseConfig = {
        apiKey: "AIzaSyAz4_IQg5_P67QYJ30JNDlEISacUS3e3Lc",
        authDomain: "basketball-club-fee-manager.firebaseapp.com",
        databaseURL: "https://basketball-club-fee-manager-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "basketball-club-fee-manager",
        storageBucket: "basketball-club-fee-manager.appspot.com",
        messagingSenderId: "394781234199",
        appId: "1:394781234199:web:3d91f8b93df77bff7af852"
    };
    
    // ACTION: Paste your NEW and SECRET Gemini API Key here
    const GEMINI_API_KEY = 'AIzaSyAKr2bhx3vLMeokawXRB2-cw2QmRTBcY9Q';

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
        { id: 'def-03', name: 'Tái', avatarUrl: 'https://res.cloudinary.com/duukynapb/image/upload/v1749354635/ChatGPT_Image_Jun_8_2025_10_50_27_AM_jxikzy.png' },
        { id: 'def-04', name: 'Cừu', avatarUrl: 'https://res.cloudinary.com/duukynapb/image/upload/v1749311089/ae81ac0c-45a9-4a1e-beae-efa148405cda_zs48rx.png' },
        { id: 'def-05', name: 'Khoa', avatarUrl: 'https://res.cloudinary.com/duukynapb/image/upload/v1749354227/ChatGPT_Image_Jun_8_2025_10_43_35_AM_lwagzq.png' },
        { id: 'def-06', name: 'Tài', avatarUrl: 'https://res.cloudinary.com/duukynapb/image/upload/v1749353179/ChatGPT_Image_Jun_8_2025_10_26_10_AM_xjbe5m.png' },
        { id: 'def-07', name: 'Nghi xù', avatarUrl: 'https://res.cloudinary.com/duukynapb/image/upload/v1749307248/245f8524-bf42-4549-a3f3-ecf220f8194b_clrune.png' },
        { id: 'def-08', name: 'Khang', avatarUrl: 'https://res.cloudinary.com/duukynapb/image/upload/v1749308100/ChatGPT_Image_Jun_7_2025_09_54_55_PM_ewxnci.png' },
        { id: 'def-09', name: 'Chim', avatarUrl: 'https://res.cloudinary.com/duukynapb/image/upload/v1749355974/ChatGPT_Image_Jun_8_2025_11_12_44_AM_qkbzjk.png' },
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
    const reportSummaryModal = document.getElementById('report-summary-modal');
    const closeSummaryModalBtn = reportSummaryModal.querySelector('.close-btn');
    const summaryReportName = document.getElementById('summary-report-name');
    const summaryContent = document.getElementById('summary-content');
    const cloneFromSummaryBtn = document.getElementById('clone-from-summary-btn');
    const generateInsightsBtn = document.getElementById('generate-insights-btn');
    const insightsOutput = document.getElementById('insights-output');

    // --- 4. RENDERING & CALCULATION FUNCTIONS ---
    const calculateAndDisplayFee = () => { /* ... unchanged ... */ };
    const renderMembers = () => { /* ... unchanged ... */ };
    const renderAdhocSessions = () => { /* ... unchanged ... */ };
    const renderSavedReportsList = () => { /* ... unchanged ... */ };
    const generateReport = () => { /* ... unchanged ... */ };
    async function uploadImage(file) { /* ... unchanged ... */ };
    const renderRosterModal = () => { /* ... unchanged ... */ };
    // --- 5. EVENT HANDLERS ---
    async function handleGenerateInsights() {
        if (!GEMINI_API_KEY || GEMINI_API_KEY === 'PASTE_YOUR_NEW_API_KEY_HERE') {
            alert('Please add your Google Gemini API Key to the script.js file.');
            return;
        }
        generateInsightsBtn.disabled = true;
        generateInsightsBtn.innerHTML = '🧠 Analyzing...';
        insightsOutput.classList.remove('hidden');
        insightsOutput.textContent = 'Please wait while the AI analyzes your team data...';
        try {
            const processedData = {
                totalReports: savedReports.length,
                memberAttendance: {},
                guestAttendance: {}
            };
            const rosterMemberIds = DEFAULT_ROSTER.map(m => m.id);
            savedReports.forEach(report => {
                const members = Object.values(report.members || {});
                const adhoc = Object.values(report.adhoc || {});
                members.forEach(member => {
                    if (rosterMemberIds.includes(member.id)) {
                        processedData.memberAttendance[member.name] = (processedData.memberAttendance[member.name] || 0) + 1;
                    }
                });
                adhoc.forEach(session => {
                    processedData.guestAttendance[session.name] = (processedData.guestAttendance[session.name] || 0) + 1;
                });
            });
            const prompt = `You are a helpful basketball team manager's assistant for the 'Bricklayer' team. Analyze the following monthly attendance data which was collected over ${processedData.totalReports} months. Provide short, actionable insights in a fun, encouraging tone. - Identify the most consistent members (highest attendance). - Identify any members whose attendance is dropping. - Identify the most frequent ad-hoc guests and suggest if they should be invited to the main roster. - Keep the insights concise and use bullet points with emojis. Here is the data in JSON format: ${JSON.stringify(processedData)}`;
            const apiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });
            if (!apiResponse.ok) { throw new Error('The AI API request failed.'); }
            const responseData = await apiResponse.json();
            const aiText = responseData.candidates[0].content.parts[0].text;
            insightsOutput.textContent = aiText;
        } catch (error) {
            console.error('AI Insights Error:', error);
            insightsOutput.textContent = 'Sorry, an error occurred while generating insights. Please check the console for details.';
        } finally {
            generateInsightsBtn.disabled = false;
            generateInsightsBtn.innerHTML = '✨ Generate Insights';
        }
    }
    function handleRosterListClick(event) { /* ... unchanged ... */ };
    async function handleAddMember() { /* ... unchanged ... */ };
    function handleRemoveMember(event) { /* ... unchanged ... */ };
    function handleAddAdhoc() { /* ... unchanged ... */ };
    function handleAdhocListClick(event) { /* ... unchanged ... */ };
    function handleClearActiveAdhoc() { /* ... unchanged ... */ };
    function handleSaveReport() { /* ... unchanged ... */ };
    function handleCloneReport(reportKey) { /* ... unchanged ... */ };
    function handleViewReport(reportKey) { /* ... unchanged ... */ };
    function handleSavedReportsClick(event) { /* ... unchanged ... */ };
    const handleShareFee = () => { /* ... unchanged ... */ };
    const handleSaveActiveAdhoc = () => { /* ... unchanged ... */ };
    // --- 6. FIREBASE REAL-TIME LISTENERS ---
    onValue(teamMembersRef, (snapshot) => {
        const data = snapshot.val();
        const membersArray = [];
        if (data) { for (let key in data) { membersArray.push({ key: key, ...data[key] }); } }
        teamMembers = membersArray;
        renderMembers();
    });
    onValue(adhocSessionsRef, (snapshot) => {
        const data = snapshot.val();
        const sessionsArray = [];
        if (data) { for (let key in data) { sessionsArray.push({ key: key, ...data[key] }); } }
        adhocSessions = sessionsArray;
        renderAdhocSessions();
    });
    onValue(savedReportsRef, (snapshot) => {
        const data = snapshot.val();
        const reportsArray = [];
        if (data) { for (let key in data) { reportsArray.push({ key: key, ...data[key] }); } }
        savedReports = reportsArray;
        renderSavedReportsList();
    });

    // --- 7. EVENT LISTENERS ---
    generateInsightsBtn.addEventListener('click', handleGenerateInsights);
    addMemberBtn.addEventListener('click', () => addMemberModal.style.display = 'block');
    closeModalBtn.addEventListener('click', () => addMemberModal.style.display = 'none');
    window.addEventListener('click', (e) => { if (e.target === addMemberModal) { addMemberModal.style.display = 'none'; } });
    openRosterBtn.addEventListener('click', () => {
        renderRosterModal();
        rosterModal.style.display = 'block';
    });
    closeRosterModalBtn.addEventListener('click', () => { rosterModal.style.display = 'none'; });
    window.addEventListener('click', (e) => { if (e.target === rosterModal) { rosterModal.style.display = 'none'; } });
    closeSummaryModalBtn.addEventListener('click', () => reportSummaryModal.style.display = 'none');
    window.addEventListener('click', (e) => { if (e.target === reportSummaryModal) { reportSummaryModal.style.display = 'none'; } });
    cloneFromSummaryBtn.addEventListener('click', (e) => handleCloneReport(e.target.dataset.id));
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