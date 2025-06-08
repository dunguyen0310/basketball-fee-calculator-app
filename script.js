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
    // This now contains the correct API key you provided.
    const GEMINI_API_KEY = 'AIzaSyDv0UwGRn2oaGF8Yq0gKCVrJ9UL-gqMpW0';

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
    let teamMembers = [], adhocSessions = [], savedReports = [];

    // --- 3. SELECTING HTML ELEMENTS ---
    const monthlyFeeDisplay = document.getElementById('monthly-fee'),memberCountDisplay=document.getElementById("member-count"),memberListDiv=document.getElementById("member-list"),addMemberBtn=document.getElementById("add-member-btn"),addMemberModal=document.getElementById("add-member-modal"),closeModalBtn=addMemberModal.querySelector(".close-btn"),saveMemberBtn=document.getElementById("save-member-btn"),memberNameInputModal=document.getElementById("member-name-input-modal"),memberImageInput=document.getElementById("member-image-input"),adhocUniqueCountDisplay=document.getElementById("adhoc-unique-count"),adhocSessionCountDisplay=document.getElementById("adhoc-session-count"),adhocNameInput=document.getElementById("adhoc-name-input"),adhocDateInput=document.getElementById("adhoc-date-input"),addAdhocBtn=document.getElementById("add-adhoc-btn"),adhocListUl=document.getElementById("adhoc-list"),generateReportBtn=document.getElementById("generate-report-btn"),reportOutputDiv=document.getElementById("report-output"),saveReportWrapper=document.getElementById("save-report-wrapper"),reportNameInput=document.getElementById("report-name-input"),saveReportBtn=document.getElementById("save-report-btn"),savedReportsListUl=document.getElementById("saved-reports-list"),openRosterBtn=document.getElementById("open-roster-btn"),rosterModal=document.getElementById("roster-modal"),closeRosterModalBtn=rosterModal.querySelector(".close-btn"),rosterListUl=document.getElementById("roster-list"),shareFeeBtn=document.getElementById("share-fee-btn"),feeShareArea=document.getElementById("fee-share-area"),qrCodeImg=document.getElementById("qr-code-img"),saveAdhocBtn=document.getElementById("save-adhoc-btn"),clearAdhocBtn=document.getElementById("clear-adhoc-btn"),reportSummaryModal=document.getElementById("report-summary-modal"),closeSummaryModalBtn=reportSummaryModal.querySelector(".close-btn"),summaryReportName=document.getElementById("summary-report-name"),summaryContent=document.getElementById("summary-content"),cloneFromSummaryBtn=document.getElementById("clone-from-summary-btn"),generateInsightsBtn=document.getElementById("generate-insights-btn"),insightsOutput=document.getElementById("insights-output");

    // --- 4. RENDERING & CALCULATION FUNCTIONS ---
    const calculateAndDisplayFee = () => { /* ... unchanged ... */ };
    const renderMembers = () => { /* ... unchanged ... */ };
    const renderAdhocSessions = () => { /* ... unchanged ... */ };
    const renderSavedReportsList = () => { /* ... unchanged ... */ };
    const generateReport = () => { /* ... unchanged ... */ };
    async function uploadImage(file) { /* ... unchanged ... */ };
    const renderRosterModal = () => { /* ... unchanged ... */ };
    // --- 5. EVENT HANDLERS ---
    function handleRosterListClick(event) {
        if (event.target.tagName !== 'BUTTON') return;
        const memberId = event.target.closest('li').dataset.id;
        const memberToAdd = DEFAULT_ROSTER.find(m => m.id === memberId);
        if (memberToAdd) { push(teamMembersRef, memberToAdd); }
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
            push(teamMembersRef, newMember);
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
        if (memberToRemove && confirm(`Are you sure you want to remove ${memberToRemove.name}?`)) {
            remove(ref(database, `activeTeamMembers/${memberKey}`));
        }
    }
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
        if (confirm('Are you sure you want to clear the ENTIRE ad-hoc list for everyone?')) { remove(adhocSessionsRef); }
    };
    function handleSaveReport() {
        const reportName = reportNameInput.value.trim();
        if (!reportName) return alert('Please provide a name for the report.');
        const newReport = { name: reportName, period: new Date().toISOString(), members: teamMembers, adhoc: adhocSessions };
        push(savedReportsRef, newReport);
        alert(`Report "${reportName}" has been saved!`);
        saveReportWrapper.classList.add('hidden');
    };
    function handleCloneReport(reportKey) {
        const reportToClone = savedReports.find(r => r.key === reportKey);
        if (!reportToClone) return alert('Report not found.');
        if (!confirm(`This will replace all current members and ad-hoc players with data from "${reportToClone.name}". Continue?`)) { return; }
        
        remove(teamMembersRef);
        remove(adhocSessionsRef);

        const clonedMembers = Object.values(reportToClone.members || {});
        clonedMembers.forEach(member => {
            const newMember = { id: member.id, name: member.name, avatarUrl: member.avatarUrl };
            push(teamMembersRef, newMember);
        });

        const clonedAdhoc = Object.values(reportToClone.adhoc || {});
        clonedAdhoc.forEach(session => {
            const newSession = { name: session.name, date: session.date };
            push(adhocSessionsRef, newSession);
        });

        alert(`Report "${reportToClone.name}" has been cloned successfully.`);
        reportSummaryModal.style.display = 'none';
    };
    function handleViewReport(reportKey) {
        const report = savedReports.find(r => r.key === reportKey);
        if (!report) return;
        summaryReportName.textContent = report.name;
        
        const members = Object.values(report.members || {});
        const adhoc = Object.values(report.adhoc || {});
        
        const memberCount = members.length;
        const adhocSessionCount = adhoc.length;
        const uniqueAdhocCount = new Set(adhoc.map(s => s.name)).size;
        
        let summaryHtml = `<div class="report-summary-details"><p><strong>${memberCount}</strong> Team Members</p><p><strong>${uniqueAdhocCount}</strong> unique ad-hoc players (${adhocSessionCount} sessions)</p></div><hr>`;
        let membersHtml = '<h4>Team Members List</h4><ul>';
        if (members.length > 0) {
            members.forEach(m => { membersHtml += `<li>${m.name}</li>`; });
        } else { membersHtml += '<li>No members were in this report.</li>'; }
        membersHtml += '</ul>';
        let adhocHtml = '<h4>Ad-Hoc Sessions List</h4><ul>';
        if (adhoc.length > 0) {
            adhoc.forEach(s => {
                const dateObj = new Date(s.date.replace(/-/g, '/'));
                const formattedDate = dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
                adhocHtml += `<li>${s.name} on ${formattedDate}</li>`;
            });
        } else { adhocHtml += '<li>No ad-hoc sessions were in this report.</li>'; }
        adhocHtml += '</ul>';
        
        summaryContent.innerHTML = summaryHtml + membersHtml + adhocHtml;
        cloneFromSummaryBtn.dataset.id = report.key;
        reportSummaryModal.style.display = 'block';
    }
    function handleSavedReportsClick(event) {
        const target = event.target;
        if (target.hasAttribute('data-id')) {
            const reportKey = target.getAttribute('data-id');
            if (target.matches('.view-report-btn')) {
                handleViewReport(reportKey);
            } else if (target.matches('.delete-btn')) {
                if (confirm('Are you sure you want to delete this report forever?')) {
                    remove(ref(database, `savedReports/${reportKey}`));
                }
            }
        }
    }
    const handleShareFee=()=>{const e=shareFeeBtn.innerHTML;shareFeeBtn.innerHTML="Processing...",shareFeeBtn.disabled=!0,html2canvas(feeShareArea,{scale:2,useCORS:!0,backgroundColor:"#1e1e1e"}).then(t=>{const n=document.createElement("a");n.download=`mafia_cats_fee_${(new Date).toISOString().split("T")[0]}.png`,n.href=t.toDataURL("image/png"),n.click(),shareFeeBtn.innerHTML=e,shareFeeBtn.disabled=!1}).catch(t=>{console.error("oops, something went wrong!",t),alert("Could not generate image. Please try again."),shareFeeBtn.innerHTML=e,shareFeeBtn.disabled=!1})};
    const handleSaveActiveAdhoc=()=>{const e={particleCount:150,spread:90,startVelocity:50,origin:{y:1}};confetti({...e,origin:{x:0}}),confetti({...e,origin:{x:1}}),saveAdhocBtn.textContent="Saved! ✅",saveAdhocBtn.classList.add("saved"),saveAdhocBtn.disabled=!0,setTimeout(()=>{saveAdhocBtn.textContent="Confirm Save",saveAdhocBtn.classList.remove("saved"),saveAdhocBtn.disabled=!1},2500)};
    async function handleGenerateInsights() {
        if (!GEMINI_API_KEY || GEMINI_API_KEY.includes('PASTE_YOUR_NEW_API_KEY_HERE')) {
            return alert('Please add your Google Gemini API Key to the script.js file.');
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

            const prompt = `You are a helpful basketball team manager's assistant for the 'Bricklayer' team.
            Analyze the following monthly attendance data which was collected over ${processedData.totalReports} months. 
            Provide short, actionable insights in a fun, encouraging tone.
            - Identify the most consistent members (highest attendance).
            - Identify any members whose attendance is dropping.
            - Identify the most frequent ad-hoc guests and suggest if they should be invited to the main roster.
            - Keep the insights concise and use bullet points with emojis.
            Here is the data in JSON format: ${JSON.stringify(processedData)}`;
            
            // CORRECTED: Using the gemini-2.0-flash model as requested
            const apiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });

            if (!apiResponse.ok) {
                const errorData = await apiResponse.json();
                throw new Error(errorData.error.message || 'The AI API request failed.');
            }

            const responseData = await apiResponse.json();
            const aiText = responseData.candidates[0].content.parts[0].text;
            insightsOutput.textContent = aiText;

        } catch (error) {
            console.error('AI Insights Error:', error);
            insightsOutput.textContent = `Sorry, an error occurred: ${error.message}`;
        } finally {
            generateInsightsBtn.disabled = false;
            generateInsightsBtn.innerHTML = '✨ Generate Insights';
        }
    }

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
    addMemberBtn.addEventListener("click",()=>addMemberModal.style.display="block"),closeModalBtn.addEventListener("click",()=>addMemberModal.style.display="none"),window.addEventListener("click",e=>{e.target===addMemberModal&&(addMemberModal.style.display="none")});
    openRosterBtn.addEventListener("click",()=>{renderRosterModal(),rosterModal.style.display="block"}),closeRosterModalBtn.addEventListener("click",()=>rosterModal.style.display="none"),window.addEventListener("click",e=>{e.target===rosterModal&&(rosterModal.style.display="none")});
    closeSummaryModalBtn.addEventListener("click",()=>reportSummaryModal.style.display="none"),window.addEventListener("click",e=>{e.target===reportSummaryModal&&(reportSummaryModal.style.display="none")}),cloneFromSummaryBtn.addEventListener("click",e=>handleCloneReport(e.target.dataset.id));
    shareFeeBtn.addEventListener("click",handleShareFee),memberListDiv.addEventListener("click",handleRemoveMember),rosterListUl.addEventListener("click",handleRosterListClick),saveMemberBtn.addEventListener("click",handleAddMember),addAdhocBtn.addEventListener("click",handleAddAdhoc),adhocListUl.addEventListener("click",handleAdhocListClick),generateReportBtn.addEventListener("click",generateReport),saveReportBtn.addEventListener("click",handleSaveReport),savedReportsListUl.addEventListener("click",handleSavedReportsClick),saveAdhocBtn.addEventListener("click",()=>handleSaveActiveAdhoc(!1)),clearAdhocBtn.addEventListener("click",handleClearActiveAdhoc),generateInsightsBtn.addEventListener("click",handleGenerateInsights);
    
    // --- 8. INITIALIZATION ---
    adhocDateInput.value=(new Date).toISOString().split("T")[0],reportNameInput.value=`Report for ${new Date().toLocaleString("default",{month:"long",year:"numeric"})}`,qrCodeImg.src=qrCodeUrl;
});