// ១. ទាញទិន្នន័យពី LocalStorage
let students = JSON.parse(localStorage.getItem('schoolData')) || [];
const modal = new bootstrap.Modal(document.getElementById('studentModal'));

// ២. ឆែកមើលស្ថានភាព Login ភ្លាមៗពេលបើក Web
window.onload = () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        renderAll();
    }
};

// ៣. មុខងារ Login (Fix: បន្ថែមការរក្សាទុកស្ថានភាព Login)
function login() {
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value.trim();

    // ឆែកឈ្មោះ admin និងលេខសម្ងាត់ 123
    if (user === "admin" && pass === "123") {
        localStorage.setItem('isLoggedIn', 'true'); // រក្សាទុកស្ថានភាពថាបានចូលរួច
        
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        
        renderAll();
        
        Swal.fire({
            icon: 'success',
            title: 'ចូលប្រព័ន្ធជោគជ័យ',
            timer: 1000,
            showConfirmButton: false
        });
    } else {
        Swal.fire({
            icon: 'error',
            title: 'ឈ្មោះ ឬលេខសម្ងាត់មិនត្រឹមត្រូវ',
            text: 'សូមព្យាយាមម្ដងទៀត! (admin / 123)',
            confirmButtonColor: '#0d6efd'
        });
    }
}

// ៤. មុខងារ Logout
function logout() {
    localStorage.removeItem('isLoggedIn'); // លុបស្ថានភាព Login ចេញ
    location.reload(); // បញ្ជូនទៅទំព័រដើមវិញ
}

// ៥. មុខងារ Search Filter (ស្វែងរកឈ្មោះគ្រូ និង សិស្ស)
function filterTable(tableId, colIndex) {
    const input = event.target;
    const filter = input.value.toLowerCase();
    const table = document.getElementById(tableId);
    const tr = table.getElementsByTagName("tr");

    for (let i = 1; i < tr.length; i++) {
        const td = tr[i].getElementsByTagName("td")[colIndex];
        if (td) {
            const txtValue = td.textContent || td.innerText;
            tr[i].style.display = txtValue.toLowerCase().indexOf(filter) > -1 ? "" : "none";
        }
    }
}

// ៦. មុខងារបង្ហាញ Section (Dashboard / Students)
function showSection(section) {
    document.getElementById('dashboardSection').style.display = section === 'dashboard' ? 'block' : 'none';
    document.getElementById('studentSection').style.display = section === 'students' ? 'block' : 'none';
}

// ៧. មុខងារគណនាប្រាក់ ៨០% និង ២០%
function calculateSplit() {
    const fee = parseFloat(document.getElementById('addFee').value) || 0;
    document.getElementById('disp80').innerText = (fee * 0.8).toLocaleString() + " ៛";
    document.getElementById('disp20').innerText = (fee * 0.2).toLocaleString() + " ៛";
}

// ៨. មុខងារបន្ថែមសិស្ស
function openStudentModal() {
    document.getElementById('addStudentName').value = '';
    document.getElementById('addFee').value = '';
    document.getElementById('disp80').innerText = '0 ៛';
    document.getElementById('disp20').innerText = '0 ៛';
    modal.show();
}

function submitStudent() {
    const name = document.getElementById('addStudentName').value.trim();
    const gender = document.getElementById('addGender').value;
    const grade = document.getElementById('addGrade').value;
    const teacher = document.getElementById('addTeacherSelect').value;
    const fee = parseFloat(document.getElementById('addFee').value) || 0;

    if (!name || fee <= 0) {
        return Swal.fire('បំពេញព័ត៌មាន', 'សូមបញ្ចូលឈ្មោះសិស្ស និងតម្លៃសិក្សាឱ្យបានត្រឹមត្រូវ', 'warning');
    }

    students.push({ name, gender, grade, teacher, fee });
    localStorage.setItem('schoolData', JSON.stringify(students)); // រក្សាទុកទិន្នន័យ
    
    modal.hide();
    renderAll();
    
    Swal.fire({
        icon: 'success',
        title: 'រក្សាទុកបានជោគជ័យ',
        timer: 1500,
        showConfirmButton: false
    });
}

// ៩. មុខងារបង្ហាញទិន្នន័យលើតារាង
function renderAll() {
    renderStats();
    renderStudents();
    renderTeachers();
}

function renderStudents() {
    const body = document.getElementById('studentBody');
    if (!body) return;
    body.innerHTML = students.map((s, index) => `
        <tr>
            <td>${s.name}</td>
            <td>${s.gender === 'Male' ? 'ប្រុស' : 'ស្រី'}</td>
            <td>${s.grade}</td>
            <td>${s.teacher}</td>
            <td>${s.fee.toLocaleString()} ៛</td>
            <td>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteStudent(${index})">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function renderTeachers() {
    const teacherMap = {};
    students.forEach(s => {
        if (!teacherMap[s.teacher]) {
            teacherMap[s.teacher] = { name: s.teacher, count: 0, total: 0 };
        }
        teacherMap[s.teacher].count++;
        teacherMap[s.teacher].total += s.fee;
    });

    const body = document.getElementById('teacherBody');
    if (!body) return;
    body.innerHTML = Object.values(teacherMap).map(t => `
        <tr>
            <td>${t.name}</td>
            <td>គ្រូបង្គោល</td>
            <td>${t.count} នាក់</td>
            <td>${t.total.toLocaleString()} ៛</td>
            <td class="text-primary fw-bold">${(t.total * 0.8).toLocaleString()} ៛</td>
            <td class="text-danger fw-bold">${(t.total * 0.2).toLocaleString()} ៛</td>
        </tr>
    `).join('');
}

function renderStats() {
    const totalStudent = students.length;
    const totalIncome = students.reduce((sum, s) => sum + s.fee, 0);
    const schoolPart = totalIncome * 0.2;

    const statsRow = document.getElementById('statsRow');
    if (statsRow) {
        statsRow.innerHTML = `
            <div class="col-md-4"><div class="card p-3 shadow-sm border-0 bg-primary text-white text-center"><h6>សិស្សសរុប</h6><h3>${totalStudent} នាក់</h3></div></div>
            <div class="col-md-4"><div class="card p-3 shadow-sm border-0 bg-success text-white text-center"><h6>ចំណូលសរុប</h6><h3>${totalIncome.toLocaleString()} ៛</h3></div></div>
            <div class="col-md-4"><div class="card p-3 shadow-sm border-0 bg-warning text-dark text-center"><h6>សាលា (20%)</h6><h3>${schoolPart.toLocaleString()} ៛</h3></div></div>
        `;
    }
}

function deleteStudent(index) {
    Swal.fire({
        title: 'លុបទិន្នន័យសិស្ស?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'លុប',
        cancelButtonText: 'បោះបង់'
    }).then((result) => {
        if (result.isConfirmed) {
            students.splice(index, 1);
            localStorage.setItem('schoolData', JSON.stringify(students));
            renderAll();
        }
    });
}
