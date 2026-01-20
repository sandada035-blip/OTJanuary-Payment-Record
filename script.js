// ១. ការប្រកាស Variable និងទាញទិន្នន័យពី LocalStorage
let students = JSON.parse(localStorage.getItem('schoolData')) || [];
const studentModalElement = document.getElementById('studentModal');
const modal = new bootstrap.Modal(studentModalElement);

// ២. បង្ហាញទិន្នន័យភ្លាមៗពេលបើកកម្មវិធី (បើធ្លាប់ Login រួច)
window.onload = () => {
    if (localStorage.getItem('isLoggedIn') === 'true') {
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        renderAll();
    }
};

// ៣. មុខងារ Login
function login() {
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;

    if (user === "admin" && pass === "123") {
        localStorage.setItem('isLoggedIn', 'true'); // រក្សាទុកស្ថានភាព Login
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        renderAll();
    } else {
        Swal.fire({
            icon: 'error',
            title: 'ចូលមិនបានទេ',
            text: 'ឈ្មោះអ្នកប្រើប្រាស់ ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវ!',
            confirmButtonText: 'ព្យាយាមម្តងទៀត'
        });
    }
}

// ៤. មុខងារ Logout
function logout() {
    localStorage.removeItem('isLoggedIn');
    location.reload();
}

// ៥. មុខងារគ្រប់គ្រងការបង្ហាញ Section (Dashboard / Students)
function showSection(section) {
    document.getElementById('dashboardSection').style.display = section === 'dashboard' ? 'block' : 'none';
    document.getElementById('studentSection').style.display = section === 'students' ? 'block' : 'none';
}

// ៦. មុខងារគណនាភាគរយ ៨០% និង ២០% ក្នុង Modal
function calculateSplit() {
    const fee = parseFloat(document.getElementById('addFee').value) || 0;
    document.getElementById('disp80').innerText = (fee * 0.8).toLocaleString() + " ៛";
    document.getElementById('disp20').innerText = (fee * 0.2).toLocaleString() + " ៛";
}

// ៧. មុខងារបើក Modal បន្ថែមសិស្ស
function openStudentModal() {
    document.getElementById('addStudentName').value = '';
    document.getElementById('addFee').value = '';
    document.getElementById('disp80').innerText = '0 ៛';
    document.getElementById('disp20').innerText = '0 ៛';
    modal.show();
}

// ៨. មុខងាររក្សាទុកសិស្សថ្មី
function submitStudent() {
    const name = document.getElementById('addStudentName').value;
    const gender = document.getElementById('addGender').value;
    const grade = document.getElementById('addGrade').value;
    const teacher = document.getElementById('addTeacherSelect').value;
    const fee = parseFloat(document.getElementById('addFee').value) || 0;

    if (!name || !fee) {
        return Swal.fire('បំពេញព័ត៌មាន', 'សូមបំពេញឈ្មោះ និងតម្លៃសិក្សា', 'warning');
    }

    students.push({ name, gender, grade, teacher, fee });
    saveData();
    modal.hide();
    renderAll();
    
    Swal.fire({
        icon: 'success',
        title: 'ជោគជ័យ',
        text: 'បានរក្សាទុកទិន្នន័យសិស្សរួចរាល់',
        timer: 1500,
        showConfirmButton: false
    });
}

// ៩. មុខងារលុបទិន្នន័យសិស្ស
function deleteStudent(index) {
    Swal.fire({
        title: 'លុបទិន្នន័យ?',
        text: "តើអ្នកចង់លុបទិន្នន័យសិស្សនេះមែនទេ?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'លុបចេញ',
        cancelButtonText: 'បោះបង់'
    }).then((result) => {
        if (result.isConfirmed) {
            students.splice(index, 1);
            saveData();
            renderAll();
        }
    });
}

// ១០. មុខងាររក្សាទុកទិន្នន័យចូល LocalStorage
function saveData() {
    localStorage.setItem('schoolData', JSON.stringify(students));
}

// ១១. មុខងារ Render បង្ហាញទិន្នន័យទាំងអស់
function renderAll() {
    renderStudents();
    renderTeachers();
    renderStats();
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
            teacherMap[s.teacher] = { name: s.teacher, gender: 'គ្រូបង្គោល', count: 0, total: 0 };
        }
        teacherMap[s.teacher].count++;
        teacherMap[s.teacher].total += s.fee;
    });

    const body = document.getElementById('teacherBody');
    if (!body) return;

    body.innerHTML = Object.values(teacherMap).map(t => `
        <tr>
            <td>${t.name}</td>
            <td>${t.gender}</td>
            <td>${t.count} នាក់</td>
            <td>${t.total.toLocaleString()} ៛</td>
            <td class="text-primary fw-bold">${(t.total * 0.8).toLocaleString()} ៛</td>
            <td class="text-danger fw-bold">${(t.total * 0.2).toLocaleString()} ៛</td>
        </tr>
    `).join('');
}

function renderStats() {
    const statsRow = document.getElementById('statsRow');
    if (!statsRow) return;

    const totalStudent = students.length;
    const totalIncome = students.reduce((sum, s) => sum + s.fee, 0);
    const schoolPart = totalIncome * 0.2;

    statsRow.innerHTML = `
        <div class="col-md-4">
            <div class="card p-3 shadow-sm border-0 bg-primary text-white text-center">
                <h6 class="mb-1">សិស្សសរុប</h6>
                <h3 class="fw-bold">${totalStudent} នាក់</h3>
            </div>
        </div>
        <div class="col-md-4">
            <div class="card p-3 shadow-sm border-0 bg-success text-white text-center">
                <h6 class="mb-1">ចំណូលសរុប</h6>
                <h3 class="fw-bold">${totalIncome.toLocaleString()} ៛</h3>
            </div>
        </div>
        <div class="col-md-4">
            <div class="card p-3 shadow-sm border-0 bg-warning text-dark text-center">
                <h6 class="mb-1">ចំណូលសាលា (20%)</h6>
                <h3 class="fw-bold">${schoolPart.toLocaleString()} ៛</h3>
            </div>
        </div>
    `;
}

// ១២. មុខងារស្វែងរក (Search Filter)
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
