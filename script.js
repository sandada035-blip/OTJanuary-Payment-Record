// --- ១. ការកំណត់អថេរសកល (Global Variables) ---
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzIjImp2Ds_T96-bnLwhoH9Zm4asoJxOaOeqr1EOk9zq-Pqv6NwwcS3miCHc60xUgJo/exec";
let allStudents = [];
let currentUserRole = "User";
let isEditMode = false;
let originalName = "";
const studentModal = new bootstrap.Modal(document.getElementById('studentModal'));

// --- ២. មុខងារ LOGIN & LOGOUT ---
async function login() {
    const u = document.getElementById('username').value.trim();
    const p = document.getElementById('password').value.trim();
    
    if(!u || !p) return Swal.fire('តម្រូវការ', 'សូមបញ្ចូលឈ្មោះអ្នកប្រើប្រាស់ និងពាក្យសម្ងាត់', 'warning');
    
    Swal.fire({title: 'កំពុងផ្ទៀងផ្ទាត់...', didOpen: () => Swal.showLoading(), allowOutsideClick: false});
    
    const res = await callAPI('checkLogin', u, p); 
    
    if(res && res.success) {
        currentUserRole = res.role;
        // លាក់ Login និងបង្ហាញ Main App
        const loginSec = document.getElementById('loginSection');
        loginSec.classList.remove('d-flex');
        loginSec.classList.add('d-none');
        document.getElementById('mainApp').style.display = 'block';
        
        applyPermissions();
        showSection('dashboard');
        
        Swal.fire({
            icon: 'success',
            title: 'ជោគជ័យ!',
            text: 'អ្នកបានចូលប្រើប្រាស់ដោយជោគជ័យ!',
            timer: 2000,
            showConfirmButton: false
        });
    } else {
        Swal.fire('បរាជ័យ', 'សូមបញ្ចូលឈ្មោះអ្នកប្រើប្រាស់ឬពាក្យម្តងទៀត!', 'error');
    }
}

function logout() {
    Swal.fire({
        title: 'តើអ្នកចង់ចាកចេញមែនទេ?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'បាទ ចាកចេញ',
        cancelButtonText: 'បោះបង់'
    }).then((result) => {
        if (result.isConfirmed) {
            location.reload(); // Reload ដើម្បីសម្អាត Session
        }
    });
}

function applyPermissions() {
    const adminElements = document.querySelectorAll('.admin-only');
    adminElements.forEach(el => {
        el.style.setProperty('display', currentUserRole === 'Admin' ? 'inline-block' : 'none', 'important');
    });
}

// --- ៣. មុខងារ NAVIGATION & SEARCH ---
function showSection(id) {
    document.getElementById('dashboardSection').style.display = id === 'dashboard' ? 'block' : 'none';
    document.getElementById('studentSection').style.display = id === 'students' ? 'block' : 'none';
    if(id === 'dashboard') loadDashboard();
    if(id === 'students') loadStudents();
}

function filterTeachers() {
    let filter = document.getElementById("searchTeacher").value.toLowerCase();
    let tr = document.getElementById("teacherTable").getElementsByTagName("tr");
    for (let i = 1; i < tr.length; i++) {
        let td = tr[i].getElementsByTagName("td")[0];
        if (td) {
            tr[i].style.display = td.textContent.toLowerCase().includes(filter) ? "" : "none";
        }
    }
}

function filterStudents() {
    let filter = document.getElementById("searchStudent").value.toLowerCase();
    let tr = document.getElementById("studentTable").getElementsByTagName("tr");
    for (let i = 1; i < tr.length; i++) {
        let tdName = tr[i].getElementsByTagName("td")[0];
        let tdTeacher = tr[i].getElementsByTagName("td")[3];
        if (tdName) {
            let match = tdName.textContent.toLowerCase().includes(filter) || 
                        tdTeacher.textContent.toLowerCase().includes(filter);
            tr[i].style.display = match ? "" : "none";
        }
    }
}

// --- ៤. API CORE & DATA LOADING ---
async function callAPI(funcName, ...args) {
    const url = `${WEB_APP_URL}?func=${funcName}&args=${encodeURIComponent(JSON.stringify(args))}`;
    try {
        const response = await fetch(url);
        return await response.json();
    } catch (e) { 
        console.error("API Error:", e);
        return null; 
    }
}

async function loadDashboard() {
    const res = await callAPI('getTeacherData');
    if(!res) return;
    
    let studentCount = 0, totalFee = 0;
    res.rows.forEach(r => {
        studentCount += parseInt(r[2]) || 0;
        let feeNum = parseInt(r[3].toString().replace(/[^0-9]/g, '')) || 0;
        totalFee += feeNum;
    });

    document.getElementById('statsRow').innerHTML = `
        <div class="col-6 col-md-3"><div class="stat-card"><small class="text-muted">គ្រូសរុប</small><div class="h4 mb-0">${res.rows.length}</div></div></div>
        <div class="col-6 col-md-3"><div class="stat-card" style="border-left-color:#10b981"><small class="text-muted">សិស្សសរុប</small><div class="h4 mb-0">${studentCount}</div></div></div>
        <div class="col-12 col-md-6"><div class="stat-card" style="border-left-color:#f59e0b"><small class="text-muted">ចំណូលសរុប</small><div class="h4 mb-0 text-success">${totalFee.toLocaleString()} ៛</div></div></div>
    `;

    document.getElementById('teacherBody').innerHTML = res.rows.map(r => `
        <tr>
            <td class="fw-bold">${r[0]}</td>
            <td>${r[1]}</td>
            <td>${r[2]}</td>
            <td class="fw-bold text-primary">${r[3]}</td>
            <td class="text-success">${r[4]}</td>
            <td class="text-danger">${r[5]}</td>
        </tr>
    `).join('');
}

async function loadStudents() {
    const loading = document.getElementById('studentLoading');
    if(loading) loading.classList.remove('d-none');
    const res = await callAPI('getStudentData');
    if(loading) loading.classList.add('d-none');
    if(!res) return;
    
    allStudents = res.rows;
    renderStudentTable(res.rows);
}

function renderStudentTable(rows) {
    document.getElementById('studentBody').innerHTML = rows.map((r, i) => `
        <tr>
            <td class="fw-bold text-primary">${r[0]}</td>
            <td class="d-none d-md-table-cell">${r[1]}</td>
            <td class="d-none d-md-table-cell">${r[2]}</td>
            <td>${r[3]}</td>
            <td class="text-success small fw-bold">${r[4]}</td>
            <td>
                <div class="btn-group">
                    <button class="btn btn-sm btn-outline-info" title="វិក្កយបត្រ" onclick="printReceipt(${i})"><i class="bi bi-printer"></i></button>
                    ${currentUserRole === 'Admin' ? `
                        <button class="btn btn-sm btn-outline-warning" onclick="editStudent(${i})"><i class="bi bi-pencil"></i></button>
                        <button class="btn btn-sm btn-outline-danger" onclick="confirmDelete(${i})"><i class="bi bi-trash"></i></button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `).join('');
}

// --- ៥. CRUD OPERATIONS ---
function calculateSplitPreview() {
    const val = parseInt(document.getElementById('addFee').value) || 0;
    document.getElementById('disp80').innerText = (val * 0.8).toLocaleString() + " ៛";
    document.getElementById('disp20').innerText = (val * 0.2).toLocaleString() + " ៛";
}

function openStudentModal() {
    isEditMode = false;
    document.getElementById('modalTitle').innerText = "បញ្ចូលសិស្សថ្មី";
    document.getElementById('addStudentName').value = "";
    document.getElementById('addFee').value = "";
    document.getElementById('disp80').innerText = "0 ៛";
    document.getElementById('disp20').innerText = "0 ៛";
    studentModal.show();
}

function editStudent(index) {
    isEditMode = true;
    const r = allStudents[index];
    originalName = r[0];
    document.getElementById('modalTitle').innerText = "កែប្រែព័ត៌មាន";
    document.getElementById('addStudentName').value = r[0];
    document.getElementById('addGender').value = r[1];
    document.getElementById('addGrade').value = r[2];
    document.getElementById('addTeacherSelect').value = r[3];
    document.getElementById('addFee').value = r[4].replace(/[^0-9]/g, '');
    calculateSplitPreview();
    studentModal.show();
}

async function submitStudent() {
    const name = document.getElementById('addStudentName').value.trim();
    const teacher = document.getElementById('addTeacherSelect').value;
    const fee = document.getElementById('addFee').value || 0;

    if(!name || !teacher) return Swal.fire('Error', 'សូមបំពេញឈ្មោះសិស្ស និងជ្រើសរើសគ្រូ', 'error');
    
    const form = {
        studentName: name, 
        gender: document.getElementById('addGender').value,
        grade: document.getElementById('addGrade').value, 
        teacherName: teacher,
        schoolFee: parseInt(fee).toLocaleString() + " ៛",
        teacherFeeVal: (fee * 0.8).toLocaleString() + " ៛",
        schoolFeeVal: (fee * 0.2).toLocaleString() + " ៛",
        paymentDate: new Date().toISOString().split('T')[0]
    };

    Swal.fire({title: 'កំពុងរក្សាទុក...', didOpen: () => Swal.showLoading(), allowOutsideClick: false});
    const res = isEditMode ? await callAPI('updateStudentData', originalName, form) : await callAPI('saveStudentToTeacherSheet', form);
    
    if(res && res.success) {
        Swal.fire('ជោគជ័យ', res.message, 'success');
        studentModal.hide();
        loadStudents();
    } else {
        Swal.fire('Error', res ? res.message : 'រក្សាទុកមិនបានសម្រេច', 'error');
    }
}

function confirmDelete(index) {
    const name = allStudents[index][0];
    const teacher = allStudents[index][3];
    Swal.fire({
        title: 'លុបទិន្នន័យ?',
        text: `តើអ្នកចង់លុបសិស្ស ${name}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'បាទ លុបវា!'
    }).then(async (result) => {
        if (result.isConfirmed) {
            Swal.fire({title: 'កំពុងលុប...', didOpen: () => Swal.showLoading()});
            const res = await callAPI('deleteStudentData', name, teacher);
            if(res && res.success) {
                Swal.fire('Deleted!', res.message, 'success');
                loadStudents();
            }
        }
    });
}

// --- ៦. PRINT REPORTS ---
function printReport() {
    const printWindow = window.open('', '', 'height=900,width=1100');
    let totalStudents = allStudents.length;
    let totalFemale = allStudents.filter(s => s[1] === 'ស្រី' || s[1] === 'Female').length;
    let totalFee = 0;
    
    let tableRows = allStudents.map(r => {
        let feeNum = parseInt(r[4].toString().replace(/[^0-9]/g, '')) || 0;
        totalFee += feeNum;
        let payDate = r[7] ? r[7] : new Date().toLocaleDateString('km-KH');
        return `
            <tr>
                <td style="border: 1px solid black; padding: 6px;">${r[0]}</td>
                <td style="border: 1px solid black; padding: 6px; text-align: center;">${r[1]}</td>
                <td style="border: 1px solid black; padding: 6px; text-align: center;">${r[2]}</td>
                <td style="border: 1px solid black; padding: 6px;">${r[3]}</td>
                <td style="border: 1px solid black; padding: 6px; text-align: right;">${feeNum.toLocaleString()} ៛</td>
                <td style="border: 1px solid black; padding: 6px; text-align: right; color: blue;">${(feeNum * 0.8).toLocaleString()} ៛</td>
                <td style="border: 1px solid black; padding: 6px; text-align: right; color: red;">${(feeNum * 0.2).toLocaleString()} ៛</td>
                <td style="border: 1px solid black; padding: 6px; text-align: center;">${payDate}</td>
            </tr>`;
    }).join('');

    const reportHTML = `
        <html>
        <head>
            <title>Report</title>
            <style>
                body { font-family: 'Khmer OS Siemreap', sans-serif; padding: 20px; }
                .header-wrapper { display: flex; justify-content: space-between; margin-bottom: 20px; }
                .report-title { font-family: 'Khmer OS Muol Light'; text-align: center; font-size: 18px; text-decoration: underline; margin-bottom: 20px; }
                .stats-container { display: flex; gap: 10px; margin-bottom: 20px; }
                .stat-card { border: 1px solid black; padding: 8px; text-align: center; flex: 1; border-radius: 4px; font-weight: bold; }
                table { width: 100%; border-collapse: collapse; font-size: 12px; }
                th { border: 1px solid black; background: #eee; padding: 8px; }
                .footer { margin-top: 40px; display: flex; justify-content: space-between; padding: 0 50px; }
            </style>
        </head>
        <body>
            <div class="header-wrapper">
                <div style="text-align:center"><img src="https://blogger.googleusercontent.com/img/a/AVvXsEi33gP-LjadWAMAbW6z8mKj7NUYkZeslEJ4sVFw7WK3o9fQ-JTQFMWEe06xxew4lj7WKpfuk8fadTm5kXo3GSW9jNaQHE8SrCs8_bUFDV8y4TOJ1Zhbu0YKVnWIgL7sTPuEPMrmrtuNqwDPWKHOvy6PStAaSrCz-GpLfsQNyq-BAElq9EI3etjnYsft0Pvo" width="60"><br><small>សាលាបឋមសិក្សាសម្តេចព្រះរាជអគ្គមហេសី</small></div>
                <div style="text-align:center; font-family:'Khmer OS Muol Light'">ព្រះរាជាណាចក្រកម្ពុជា<br>ជាតិ សាសនា ព្រះមហាក្សត្រ</div>
            </div>
            <div class="report-title">របាយការណ៍លម្អិតសិស្សរៀនបំប៉នបន្ថែម</div>
            <div class="stats-container">
                <div class="stat-card">សិស្សសរុប: ${totalStudents}</div>
                <div class="stat-card">សរុបស្រី: ${totalFemale}</div>
                <div class="stat-card">ទឹកប្រាក់សរុប: ${totalFee.toLocaleString()} ៛</div>
                <div class="stat-card">គ្រូ(80%): ${(totalFee * 0.8).toLocaleString()} ៛</div>
            </div>
            <table>
                <thead><tr><th>ឈ្មោះសិស្ស</th><th>ភេទ</th><th>ថ្នាក់</th><th>គ្រូ</th><th>តម្លៃសិក្សា</th><th>គ្រូ(80%)</th><th>សាលា(20%)</th><th>ថ្ងៃបង់ប្រាក់</th></tr></thead>
                <tbody>${tableRows}</tbody>
            </table>
            <div style="text-align:right; margin-top:20px;">ថ្ងៃទី........ខែ........ឆ្នាំ២០២៦</div>
            <div class="footer">
                <div style="text-align:center"><b>នាយកសាលា</b><br><br><br>..........................</div>
                <div style="text-align:center"><b>អ្នកចេញវិក្កយបត្រ</b><br><br><br><b>ហម ម៉ាលីនដា</b></div>
            </div>
            <script>window.onload = function(){ window.print(); window.close(); }</script>
        </body></html>`;
    printWindow.document.write(reportHTML);
    printWindow.document.close();
}

function printReceipt(index) {
    const s = allStudents[index];
    const printWindow = window.open('', '', 'height=600,width=800');
    const receiptHTML = `
        <html>
        <head>
            <style>
                body { font-family: 'Khmer OS Siemreap'; padding: 20px; text-align: center; }
                .receipt-box { border: 2px solid #333; padding: 20px; width: 350px; margin: auto; border-radius: 8px; }
                .header { font-weight: bold; font-size: 18px; margin-bottom: 10px; }
                .details { text-align: left; font-size: 14px; line-height: 2; }
            </style>
        </head>
        <body>
            <div class="receipt-box">
                <div class="header">វិក្កយបត្របង់ប្រាក់</div>
                <div class="details">
                    ឈ្មោះសិស្ស: <b>${s[0]}</b><br>
                    ភេទ: <b>${s[1]}</b><br>
                    ថ្នាក់សិក្សា: <b>${s[2]}</b><br>
                    គ្រូបង្រៀន: <b>${s[3]}</b><br>
                    តម្លៃសិក្សា: <b>${s[4]}</b><br>
                    កាលបរិច្ឆេទ: ${new Date().toLocaleDateString('km-KH')}
                </div>
                <hr>
                <div style="font-size: 12px;">សូមអរគុណ!</div>
            </div>
            <script>window.onload = function(){ window.print(); window.close(); }</script>
        </body></html>`;
    printWindow.document.write(receiptHTML);
    printWindow.document.close();
}
