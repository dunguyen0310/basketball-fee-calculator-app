// --- NEW: Import modern Firebase functions ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-app.js";
import { getDatabase, ref, onValue, push, remove } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-database.js";

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. FIREBASE CONFIGURATION ---
    // Your web app's Firebase configuration
    const firebaseConfig = {
        apiKey: "AIzaSyAz4_IQg5_P67QYJ30JNDlEISacUS3e3Lc",
        authDomain: "basketball-club-fee-manager.firebaseapp.com",
        databaseURL: "https://basketball-club-fee-manager-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "basketball-club-fee-manager",
        storageBucket: "basketball-club-fee-manager.appspot.com",
        messagingSenderId: "394781234199",
        appId: "1:394781234199:web:3d91f8b93df77bff7af852"
    };

    // Initialize Firebase and get a reference to the database service
    const app = initializeApp(firebaseConfig);
    const database = getDatabase(app);
    const adhocSessionsRef = ref(database, 'adhocSessions');


    // --- 2. CONFIGURATION & STATE ---
    const COURT_RENT = 4320000;
    const ADHOC_FEE_PER_SESSION = 70000;
    const REPORTS_STORAGE_KEY = 'basketballReports'; // For archived local reports
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

    // --- 4. RENDERING & CALCULATION FUNCTIONS ---
    const calculateAndDisplayFee = () => {
        const regularMemberCount = teamMembers.length;
        if (regularMemberCount === 0) {
            monthlyFeeDisplay.textContent = 'N/A - Add members';
            return;
        }
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
            memberContainer.innerHTML = `<img src="${member.avatarUrl}" alt="${member.name}" class="member-avatar" data-id="${member.id}"><span class="member-name">${member.name}</span>`;
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
            const textSpan = document.createElement('span');
            const nameStrong = document.createElement('strong');
            nameStrong.textContent = session.name;
            const dateObj = new Date(session.date.replace(/-/g, '/'));
            const formattedDate = dateObj.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
            textSpan.appendChild(nameStrong);
            textSpan.appendChild(document.createTextNode(` on ${formattedDate}`));
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.dataset.id = session.key;
            deleteBtn.innerHTML = '&times;';
            li.appendChild(textSpan);
            li.appendChild(deleteBtn);
            adhocListUl.appendChild(li);
        });
        const uniqueNames = new Set(adhocSessions.map(session => session.name));
        adhocUniqueCountDisplay.textContent = uniqueNames.size;
        adhocSessionCountDisplay.textContent = adhocSessions.length;
        calculateAndDisplayFee();
        saveReportWrapper.classList.add('hidden');
    };
    const generateReport = () => {
        reportOutputDiv.style.display = 'block';
        saveReportWrapper.classList.remove('hidden');
        let memberListHtml = '<ul>';
        if (teamMembers.length > 0) {
            teamMembers.forEach(member => { memberListHtml += `<li>${member.name}</li>`; });
        } else { memberListHtml += '<li>No active members this month.</li>'; }
        memberListHtml += '</ul>';
        let adhocListHtml = '<ul>';
        if (adhocSessions.length > 0) {
            const adhocByName = adhocSessions.reduce((acc, session) => {
                acc[session.name] = acc[session.name] || [];
                acc[session.name].push(session.date);
                return acc;
            }, {});
            for (const name in adhocByName) { adhocListHtml += `<li><strong>${name}</strong> played on: ${adhocByName[name].join(', ')}</li>`; }
        } else { adhocListHtml += '<li>No ad-hoc players this month.</li>'; }
        adhocListHtml += '</ul>';
        reportOutputDiv.innerHTML = `<h4>Monthly Summary</h4><p>Total monthly members paying fee: <strong>${teamMembers.length}</strong></p>${memberListHtml}<h4>Ad-Hoc Summary</h4><p>Total ad-hoc player sessions: <strong>${adhocSessions.length}</strong></p>${adhocListHtml}`;
    };

    // --- 5. API, STORAGE, & MODAL FUNCTIONS ---
    async function uploadImage(file) {
        if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
            alert("Cloudinary is not configured.");
            return null;
        }
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        try {
            const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, { method: 'POST', body: formData });
            if (!response.ok) throw new Error('Upload failed');
            const data = await response.json();
            return data.secure_url;
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Image upload failed. Please check your Cloudinary settings and try again.');
            return null;
        }
    }
    const getSavedReports = () => {
        const reportsJson = localStorage.getItem(REPORTS_STORAGE_KEY);
        return reportsJson ? JSON.parse(reportsJson) : [];
    };
    const saveReportsToStorage = (reports) => {
        localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(reports));
    };
    const renderSavedReportsList = () => {
        const reports = getSavedReports();
        savedReportsListUl.innerHTML = '';
        if (reports.length === 0) {
            savedReportsListUl.innerHTML = '<li>No reports saved yet.</li>';
            return;
        }
        reports.forEach(report => {
            const li = document.createElement('li');
            li.innerHTML = `<span>${report.name}</span><div class="saved-reports-actions"><button class="btn btn-small clone-btn" data-id="${report.id}">Clone to Current</button><button class="delete-btn" data-id="${report.id}">&times;</button></div>`;
            savedReportsListUl.appendChild(li);
        });
    };
    const renderRosterModal = () => {
        rosterListUl.innerHTML = '';
        const activeMemberIds = teamMembers.map(m => m.id);
        DEFAULT_ROSTER.forEach(member => {
            const li = document.createElement('li');
            li.dataset.id = member.id;
            li.innerHTML = `<div class="roster-member-info"><img src="${member.avatarUrl}" alt="${member.name}" class="roster-avatar"><span>${member.name}</span></div>`;
            if (activeMemberIds.includes(member.id)) {
                li.classList.add('added');
                li.innerHTML += `<span>Added</span>`;
            } else {
                li.innerHTML += `<button class="btn-small">Add</button>`;
            }
            rosterListUl.appendChild(li);
        });
    };
    
    // --- 6. EVENT HANDLERS ---
    function handleRosterListClick(event) {
        if (event.target.tagName !== 'BUTTON') return;
        const memberId = event.target.closest('li').dataset.id;
        const memberToAdd = DEFAULT_ROSTER.find(m => m.id === memberId);
        if (memberToAdd) {
            teamMembers.push({ ...memberToAdd });
            renderMembers();
            renderRosterModal();
        }
    }
    async function handleAddMember() {
        const name = memberNameInputModal.value.trim();
        const file = memberImageInput.files[0];
        if (!name) return alert('Please enter a name.');
        if (!file) return alert('Please select an image to upload.');
        saveMemberBtn.disabled = true;
        saveMemberBtn.textContent = 'Saving...';
        const imageUrl = await uploadImage(file);
        if (imageUrl) {
            const newMember = { id: `guest-${Date.now()}`, name: name, avatarUrl: imageUrl };
            teamMembers.push(newMember);
            renderMembers();
            memberNameInputModal.value = '';
            memberImageInput.value = '';
            addMemberModal.style.display = 'none';
        }
        saveMemberBtn.disabled = false;
        saveMemberBtn.textContent = 'Save Member';
    }
    function handleAddAdhoc() {
        const name = adhocNameInput.value.trim();
        const date = adhocDateInput.value;
        if (!name || !date) return alert('Please provide both a name and a date.');
        const newSession = { name: name, date: date };
        push(adhocSessionsRef, newSession);
        adhocNameInput.value = '';
    }
    function handleAdhocListClick(event) {
        if (event.target.classList.contains('delete-btn')) {
            const sessionKey = event.target.dataset.id;
            if (confirm('Are you sure you want to remove this session?')) {
                const sessionToRemoveRef = ref(database, `adhocSessions/${sessionKey}`);
                remove(sessionToRemoveRef);
            }
        }
    }
    function handleRemoveMember(event) {
        if (!event.target.matches('.member-avatar')) return;
        const memberId = event.target.dataset.id;
        const memberToRemove = teamMembers.find(m => m.id == memberId);
        if (!memberToRemove) return;
        if (confirm(`Are you sure you want to remove ${memberToRemove.name} from this month's list?`)) {
            teamMembers = teamMembers.filter(m => m.id != memberId);
            renderMembers();
        }
    }
    function handleSaveReport() {
        const reportName = reportNameInput.value.trim();
        if (!reportName) return alert('Please provide a name for the report.');
        const newReport = { id: Date.now(), name: reportName, period: new Date().toISOString(), members: teamMembers, adhoc: adhocSessions };
        const reports = getSavedReports();
        reports.push(newReport);
        saveReportsToStorage(reports);
        reportNameInput.value = `Report for ${new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleString('default', { month: 'long', year: 'numeric' })}`;
        renderSavedReportsList();
        alert(`Report "${reportName}" has been saved!`);
        saveReportWrapper.classList.add('hidden');
    };
    function handleCloneReport(reportId) {
        const reports = getSavedReports();
        const reportToClone = reports.find(r => r.id === reportId);
        if (!reportToClone) return alert('Report not found.');
        if (!confirm(`This will replace all current members and ad-hoc players with the data from "${reportToClone.name}". Continue?`)) {
            return;
        }
        teamMembers = reportToClone.members;
        remove(adhocSessionsRef).then(() => {
            if (reportToClone.adhoc && reportToClone.adhoc.length > 0) {
                reportToClone.adhoc.forEach(session => {
                    const newSession = { name: session.name, date: session.date };
                    push(adhocSessionsRef, newSession);
                });
            }
        });
        renderMembers();
        reportOutputDiv.style.display = 'none';
        saveReportWrapper.classList.add('hidden');
        alert(`Report "${reportToClone.name}" has been cloned.`);
    };
    function handleDeleteReport(reportId) {
        if (!confirm('Are you sure you want to delete this report?')) return;
        let reports = getSavedReports();
        reports = reports.filter(r => r.id !== reportId);
        saveReportsToStorage(reports);
        renderSavedReportsList();
    };
    function handleSavedReportsClick(event) {
        const target = event.target;
        if (target.hasAttribute('data-id')) {
            const reportId = parseInt(target.getAttribute('data-id'));
            if (target.matches('.clone-btn')) {
                handleCloneReport(reportId);
            } else if (target.matches('.delete-btn')) {
                handleDeleteReport(reportId);
            }
        }
    }
    const handleShareFee = () => {
        const buttonText = shareFeeBtn.innerHTML;
        shareFeeBtn.innerHTML = 'Processing...';
        shareFeeBtn.disabled = true;
        html2canvas(feeShareArea, { scale: 2, useCORS: true, backgroundColor: '#1e1e1e' }).then(canvas => {
            const link = document.createElement('a');
            link.download = `mafia_cats_fee_${new Date().toISOString().split('T')[0]}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            shareFeeBtn.innerHTML = buttonText;
            shareFeeBtn.disabled = false;
        }).catch(err => {
            console.error('oops, something went wrong!', err);
            alert('Could not generate image. Please try again.');
            shareFeeBtn.innerHTML = buttonText;
            shareFeeBtn.disabled = false;
        });
    };
    const handleSaveActiveAdhoc = () => {
        alert("Your data is saved to the cloud in real-time automatically!");
    };
    const handleClearActiveAdhoc = () => {
        if (confirm('Are you sure you want to clear the ENTIRE ad-hoc list for everyone? This cannot be undone.')) {
            remove(adhocSessionsRef);
            alert('Active ad-hoc list has been cleared from the cloud.');
        }
    };

    // --- 7. FIREBASE REAL-TIME LISTENER ---
    onValue(adhocSessionsRef, (snapshot) => {
        const data = snapshot.val();
        const sessionsArray = [];
        if (data) {
            for (let key in data) {
                sessionsArray.push({
                    key: key,
                    name: data[key].name,
                    date: data[key].date
                });
            }
        }
        adhocSessions = sessionsArray;
        renderAdhocSessions();
    });

    // --- 8. EVENT LISTENERS ---
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

    // --- 9. INITIALIZATION ---
    adhocDateInput.value = new Date().toISOString().split('T')[0];
    reportNameInput.value = `Report for ${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}`;
    qrCodeImg.src = qrCodeUrl;
    renderSavedReportsList();
    renderMembers();
});        