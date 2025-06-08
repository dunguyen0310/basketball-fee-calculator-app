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
    const calculateAndDisplayFee=()=>{const e=teamMembers.length;if(0===e)return void(monthlyFeeDisplay.textContent="N/A - Add members");const t=adhocSessions.length*ADHOC_FEE_PER_SESSION,n=COURT_RENT-t,o=n/e,a=Math.max(0,o);monthlyFeeDisplay.textContent=`${a.toLocaleString("en-US",{maximumFractionDigits:0})} VND`},renderMembers=()=>{memberListDiv.innerHTML="",teamMembers.forEach(e=>{const t=document.createElement("div");t.className="member-avatar-container";const n=document.createElement("img");n.src=e.avatarUrl,n.alt=e.name,n.className="member-avatar",n.dataset.id=e.key;const o=document.createElement("span");o.className="member-name",o.textContent=e.name,t.appendChild(n),t.appendChild(o),memberListDiv.appendChild(t)}),memberCountDisplay.textContent=teamMembers.length,calculateAndDisplayFee(),saveReportWrapper.classList.add("hidden")},renderAdhocSessions=()=>{adhocListUl.innerHTML="",adhocSessions.forEach(e=>{const t=document.createElement("li"),n=document.createElement("span"),o=document.createElement("strong");o.textContent=e.name;const a=(new Date(e.date.replace(/-/g,"/"))).toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"});n.appendChild(o),n.appendChild(document.createTextNode(` on ${a}`));const s=document.createElement("button");s.className="delete-btn",s.dataset.id=e.key,s.innerHTML="&times;",t.appendChild(n),t.appendChild(s),adhocListUl.appendChild(t)});const e=new Set(adhocSessions.map(e=>e.name));adhocUniqueCountDisplay.textContent=e.size,adhocSessionCountDisplay.textContent=adhocSessions.length,calculateAndDisplayFee(),saveReportWrapper.classList.add("hidden")},renderSavedReportsList=()=>{savedReportsListUl.innerHTML="",0===savedReports.length?savedReportsListUl.innerHTML="<li>No reports saved yet.</li>":savedReports.forEach(e=>{const t=document.createElement("li");t.innerHTML=`<span>${e.name}</span><div class="saved-reports-actions"><button class="btn btn-small view-report-btn" data-id="${e.key}">View</button><button class="delete-btn" data-id="${e.key}">&times;</button></div>`,savedReportsListUl.appendChild(t)})};
    const generateReport=()=>{reportOutputDiv.style.display="block",saveReportWrapper.classList.remove("hidden");let e="<ul>";teamMembers.length>0?teamMembers.forEach(t=>{e+=`<li>${t.name}</li>`}):e+="<li>No active members this month.</li>",e+="</ul>";let t="<ul>";if(adhocSessions.length>0){const n=adhocSessions.reduce((e,t)=>(e[t.name]=e[t.name]||[],e[t.name].push(t.date),e),{});for(const o in n)t+=`<li><strong>${o}</strong> played on: ${n[o].join(", ")}</li>`}else t+="<li>No ad-hoc players this month.</li>";t+="</ul>",reportOutputDiv.innerHTML=`<h4>Monthly Summary</h4><p>Total monthly members paying fee: <strong>${teamMembers.length}</strong></p>${e}<h4>Ad-Hoc Summary</h4><p>Total ad-hoc player sessions: <strong>${adhocSessions.length}</strong></p>${t}`};
    async function uploadImage(e){if(!CLOUDINARY_CLOUD_NAME||!CLOUDINARY_UPLOAD_PRESET)return alert("Cloudinary is not configured."),null;const t=new FormData;t.append("file",e),t.append("upload_preset",CLOUDINARY_UPLOAD_PRESET);try{const n=await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,{method:"POST",body:t});if(!n.ok)throw new Error("Upload failed");return(await n.json()).secure_url}catch(o){return console.error("Error uploading image:",o),alert("Image upload failed. Please check your Cloudinary settings and try again."),null}}
    const renderRosterModal=()=>{rosterListUl.innerHTML="";const e=teamMembers.map(e=>e.id);DEFAULT_ROSTER.forEach(t=>{const n=document.createElement("li");n.dataset.id=t.id;const o=document.createElement("div");o.className="roster-member-info";const a=document.createElement("img");a.src=t.avatarUrl,a.alt=t.name,a.className="roster-avatar";const s=document.createElement("span");s.textContent=t.name,o.appendChild(a),o.appendChild(s),n.appendChild(o),e.includes(t.id)?(n.classList.add("added"),n.innerHTML+="<span>Added</span>"):n.innerHTML+='<button class="btn-small">Add</button>',rosterListUl.appendChild(n)})};

    // --- 5. EVENT HANDLERS ---
    function handleRosterListClick(e){if("BUTTON"!==e.target.tagName)return;const t=e.target.closest("li").dataset.id,n=DEFAULT_ROSTER.find(e=>e.id===t);n&&push(teamMembersRef,n)}
    async function handleAddMember(){const e=memberNameInputModal.value.trim(),t=memberImageInput.files[0];if(!e||!t)return void alert("Please provide a name and image.");saveMemberBtn.disabled=!0,saveMemberBtn.textContent="Saving...";const n=await uploadImage(t);n&&(push(teamMembersRef,{id:`guest-${Date.now()}`,name:e,avatarUrl:n}),addMemberModal.style.display="none"),saveMemberBtn.disabled=!1,saveMemberBtn.textContent="Save Member",memberNameInputModal.value="",memberImageInput.value=""}
    function handleRemoveMember(e){if(!e.target.matches(".member-avatar"))return;const t=e.target.dataset.id,n=teamMembers.find(e=>e.key===t);n&&confirm(`Are you sure you want to remove ${n.name}?`)&&remove(ref(database,`activeTeamMembers/${t}`))}
    function handleAddAdhoc(){const e=adhocNameInput.value.trim(),t=adhocDateInput.value;e&&t?(push(adhocSessionsRef,{name:e,date:t}),adhocNameInput.value=""):alert("Please provide both a name and a date.")}
    function handleAdhocListClick(e){if(e.target.classList.contains("delete-btn")){const t=e.target.dataset.id;confirm("Are you sure you want to remove this session?")&&remove(ref(database,`activeAdhocSessions/${t}`))}}
    function handleClearActiveAdhoc(){confirm("Are you sure you want to clear the ENTIRE ad-hoc list for everyone?")&&remove(adhocSessionsRef)}
    function handleSaveReport(){const e=reportNameInput.value.trim();if(!e)return void alert("Please provide a name for the report.");const t={name:e,period:(new Date).toISOString(),members:teamMembers,adhoc:adhocSessions};push(savedReportsRef,t),alert(`Report "${e}" has been saved!`),saveReportWrapper.classList.add("hidden")}
    function handleCloneReport(e){const t=savedReports.find(t=>t.key===e);if(t&&confirm(`This will replace all current members and ad-hoc players with data from "${t.name}". Continue?`)){remove(teamMembersRef),remove(adhocSessionsRef);const n=Object.values(t.members||{});n.forEach(e=>{push(teamMembersRef,{id:e.id,name:e.name,avatarUrl:e.avatarUrl})});const o=Object.values(t.adhoc||{});o.forEach(e=>{push(adhocSessionsRef,{name:e.name,date:e.date})}),alert(`Report "${t.name}" has been cloned successfully.`),reportSummaryModal.style.display="none"}else t||alert("Report not found.")}
    function handleViewReport(e){const t=savedReports.find(t=>t.key===e);if(!t)return;summaryReportName.textContent=t.name;const n=Object.values(t.members||{}),o=Object.values(t.adhoc||{}),a=n.length,s=o.length,r=new Set(o.map(e=>e.name)).size;let d=`<div class="report-summary-details"><p><strong>${a}</strong> Team Members</p><p><strong>${r}</strong> unique ad-hoc players (${s} sessions)</p></div><hr>`,l="<h4>Team Members List</h4><ul>";n.length>0?n.forEach(e=>{l+=`<li>${e.name}</li>`}):l+="<li>No members in this report.</li>",l+="</ul>";let c="<h4>Ad-Hoc Sessions List</h4><ul>";o.length>0?o.forEach(e=>{const t=(new Date(e.date.replace(/-/g,"/"))).toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"});c+=`<li>${e.name} on ${t}</li>`}):c+="<li>No ad-hoc sessions were in this report.</li>",c+="</ul>",summaryContent.innerHTML=d+l+c,cloneFromSummaryBtn.dataset.id=t.key,reportSummaryModal.style.display="block"}
    function handleSavedReportsClick(e){const t=e.target;if(t.hasAttribute("data-id")){const n=t.getAttribute("data-id");t.matches(".view-report-btn")?handleViewReport(n):t.matches(".delete-btn")&&confirm("Are you sure you want to delete this report forever?")&&remove(ref(database,`savedReports/${n}`))}}
    const handleShareFee=()=>{const e=shareFeeBtn.innerHTML;shareFeeBtn.innerHTML="Processing...",shareFeeBtn.disabled=!0,html2canvas(feeShareArea,{scale:2,useCORS:!0,backgroundColor:"#1e1e1e"}).then(t=>{const n=document.createElement("a");n.download=`mafia_cats_fee_${(new Date).toISOString().split("T")[0]}.png`,n.href=t.toDataURL("image/png"),n.click(),shareFeeBtn.innerHTML=e,shareFeeBtn.disabled=!1}).catch(t=>{console.error("oops, something went wrong!",t),alert("Could not generate image. Please try again."),shareFeeBtn.innerHTML=e,shareFeeBtn.disabled=!1})};
    const handleSaveActiveAdhoc=()=>{const e={particleCount:150,spread:90,startVelocity:50,origin:{y:1}};confetti({...e,origin:{x:0}}),confetti({...e,origin:{x:1}}),saveAdhocBtn.textContent="Saved! ✅",saveAdhocBtn.classList.add("saved"),saveAdhocBtn.disabled=!0,setTimeout(()=>{saveAdhocBtn.textContent="Confirm Save",saveAdhocBtn.classList.remove("saved"),saveAdhocBtn.disabled=!1},2500)};
    async function handleGenerateInsights(){
        if(!GEMINI_API_KEY || "YOUR_API_KEY_HERE"===GEMINI_API_KEY) return alert("Please add your Google Gemini API Key to the script.js file.");
        generateInsightsBtn.disabled=!0,generateInsightsBtn.innerHTML="🧠 Analyzing...",insightsOutput.classList.remove("hidden"),insightsOutput.textContent="Please wait while the AI analyzes your team data...";
        try{
            const e={totalReports:savedReports.length,memberAttendance:{},guestAttendance:{}};
            const t=DEFAULT_ROSTER.map(e=>e.id);
            savedReports.forEach(n=>{
                const o=Object.values(n.members||{}),a=Object.values(n.adhoc||{});
                o.forEach(n=>{t.includes(n.id)&&(e.memberAttendance[n.name]=(e.memberAttendance[n.name]||0)+1)}),
                a.forEach(t=>{e.guestAttendance[t.name]=(e.guestAttendance[t.name]||0)+1})
            });
            const n=`You are a helpful basketball team manager's assistant for the 'Bricklayer' team.
            Analyze the following monthly attendance data which was collected over ${e.totalReports} months. 
            Provide short, actionable insights in a fun, encouraging tone.
            - Identify the most consistent members (highest attendance).
            - Identify any members whose attendance is dropping.
            - Identify the most frequent ad-hoc guests and suggest if they should be invited to the main roster.
            - Keep the insights concise and use bullet points with emojis.
            Here is the data in JSON format: ${JSON.stringify(e)}`;
            const o=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:n}]}]})});
            if(!o.ok){if(429===o.status)throw new Error("Too many requests. Please wait a minute before trying again.");throw new Error("The AI API request failed.")}
            const a=(await o.json()).candidates[0].content.parts[0].text;
            insightsOutput.textContent=a
        } catch(s) {
            console.error("AI Insights Error:",s),insightsOutput.textContent=`Sorry, an error occurred: ${s.message}`
        } finally {
            generateInsightsBtn.disabled=!1,generateInsightsBtn.innerHTML="✨ Generate Insights"
        }
    }

    // --- 6. FIREBASE REAL-TIME LISTENERS ---
    onValue(teamMembersRef,e=>{const t=[];e.val()&&Object.keys(e.val()).forEach(n=>{t.push({key:n,...e.val()[n]})}),teamMembers=t,renderMembers()});
    onValue(adhocSessionsRef,e=>{const t=[];e.val()&&Object.keys(e.val()).forEach(n=>{t.push({key:n,...e.val()[n]})}),adhocSessions=t,renderAdhocSessions()});
    onValue(savedReportsRef,e=>{const t=[];e.val()&&Object.keys(e.val()).forEach(n=>{t.push({key:n,...e.val()[n]})}),savedReports=t,renderSavedReportsList()});

    // --- 7. EVENT LISTENERS ---
    addMemberBtn.addEventListener("click",()=>addMemberModal.style.display="block"),closeModalBtn.addEventListener("click",()=>addMemberModal.style.display="none"),window.addEventListener("click",e=>{e.target===addMemberModal&&(addMemberModal.style.display="none")}),openRosterBtn.addEventListener("click",()=>{renderRosterModal(),rosterModal.style.display="block"}),closeRosterModalBtn.addEventListener("click",()=>rosterModal.style.display="none"),window.addEventListener("click",e=>{e.target===rosterModal&&(rosterModal.style.display="none")}),closeSummaryModalBtn.addEventListener("click",()=>reportSummaryModal.style.display="none"),window.addEventListener("click",e=>{e.target===reportSummaryModal&&(reportSummaryModal.style.display="none")}),cloneFromSummaryBtn.addEventListener("click",e=>handleCloneReport(e.target.dataset.id)),shareFeeBtn.addEventListener("click",handleShareFee),memberListDiv.addEventListener("click",handleRemoveMember),rosterListUl.addEventListener("click",handleRosterListClick),saveMemberBtn.addEventListener("click",handleAddMember),addAdhocBtn.addEventListener("click",handleAddAdhoc),adhocListUl.addEventListener("click",handleAdhocListClick),generateReportBtn.addEventListener("click",generateReport),saveReportBtn.addEventListener("click",handleSaveReport),savedReportsListUl.addEventListener("click",handleSavedReportsClick),saveAdhocBtn.addEventListener("click",()=>handleSaveActiveAdhoc(!1)),clearAdhocBtn.addEventListener("click",handleClearActiveAdhoc),generateInsightsBtn.addEventListener("click",handleGenerateInsights);
    
    // --- 8. INITIALIZATION ---
    adhocDateInput.value=(new Date).toISOString().split("T")[0],reportNameInput.value=`Report for ${new Date().toLocaleString("default",{month:"long",year:"numeric"})}`,qrCodeImg.src=qrCodeUrl;
});