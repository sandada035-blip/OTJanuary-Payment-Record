// ១. ទាញទិន្នន័យពី LocalStorage
let students = JSON.parse(localStorage.getItem('schoolData')) || [];

// ២. ពិនិត្យស្ថានភាព Login ភ្លាមៗពេលបើក Web
window.onload = () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        renderAll();
    }
};

// ៣. មុខងារ Login
function login() {
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value.trim();

    if (user === "admin" && pass === "123") {
        localStorage.setItem('isLoggedIn', 'true'); // រក្សាទុកស្ថានភាព Login
        
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
            text: 'សូមប្រើប្រាស់ admin និង 123',
            confirmButtonColor: '#0d6efd'
        });
    }
}

// ៤. មុខងារ Logout
function logout() {
    localStorage.removeItem('isLoggedIn');
    location.reload();
}

// ៥. មុខងារប្តូរ Section (Dashboard / Students)
function showSection(section) {
    document.getElementById('dashboardSection').style.display = section === 'dashboard' ? 'block' : 'none';
    document.getElementById('studentSection').style.display = section === 'students' ? 'block' : 'none';
}

// ៦. មុខងារស្វែងរក (Filter) - ដើរទាំងក្នុងតារាងគ្រូ និងសិស្ស
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

// ៧. មុខងារបង្ហាញទិន្នន័យលើអេក្រង់
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

// ៨. មុខងារលុបសិស្ស
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
