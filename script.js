let students = JSON.parse(localStorage.getItem('schoolData')) || [];
const modal = new bootstrap.Modal(document.getElementById('studentModal'));

// បង្ហាញទិន្នន័យពេល Load កម្មវិធី
window.onload = () => {
    if(localStorage.getItem('isLoggedIn') === 'true') {
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        renderAll();
    }
};

function login() {
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    if(user === "admin" && pass === "123") {
        localStorage.setItem('isLoggedIn', 'true');
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        renderAll();
    } else {
        Swal.fire('Error', 'ឈ្មោះ ឬលេខសម្ងាត់ខុស!', 'error');
    }
}

function logout() {
    localStorage.removeItem('isLoggedIn');
    location.reload();
}

function calculateSplit() {
    const fee = document.getElementById('addFee').value || 0;
    document.getElementById('disp80').innerText = (fee * 0.8).toLocaleString() + " ៛";
    document.getElementById('disp20').innerText = (fee * 0.2).toLocaleString() + " ៛";
}

function openStudentModal() {
    document.getElementById('addStudentName').value = '';
    document.getElementById('addFee').value = '';
    modal.show();
}

function submitStudent() {
    const name = document.getElementById('addStudentName').value;
    const gender = document.getElementById('addGender').value;
    const grade = document.getElementById('addGrade').value;
    const teacher = document.getElementById('addTeacherSelect').value;
    const fee = parseFloat(document.getElementById('addFee').value) || 0;

    if(!name || !fee) return Swal.fire('បំពេញព័ត៌មាន', 'សូមបំពេញឈ្មោះ និងតម្លៃ', 'warning');

    students.push({ name, gender, grade, teacher, fee });
    saveData();
    modal.hide();
    renderAll();
}

function saveData() {
    localStorage.setItem('schoolData', JSON.stringify(students));
}

function renderAll() {
    renderStudents();
    renderTeachers();
    renderStats();
}

function renderStudents() {
    const body = document.getElementById('studentBody');
    body.innerHTML = students.map((s, index) => `
        <tr>
            <td>${s.name}</td>
            <td>${s.gender === 'Male' ? 'ប្រុស' : 'ស្រី'}</td>
            <td>${s.grade}</td>
            <td>${s.teacher}</td>
            <td>${s.fee.toLocaleString()} ៛</td>
            <td><button class="btn btn-sm btn-danger" onclick="deleteStudent(${index})"><i class="bi bi-trash"></i></button></td>
        </tr>
    `).join('');
}

function renderTeachers() {
    const teacherMap = {};
    students.forEach(s => {
        if(!teacherMap[s.teacher]) teacherMap[s.teacher] = { name: s.teacher, count: 0, total: 0 };
        teacherMap[s.teacher].count++;
        teacherMap[s.teacher].total += s.fee;
    });

    const body = document.getElementById('teacherBody');
    body.innerHTML = Object.values(teacherMap).map(t => `
        <tr>
            <td>${t.name}</td>
            <td>គ្រូបង្គោល</td>
            <td>${t.count} នាក់</td>
            <td>${t.total.toLocaleString()} ៛</td>
            <td class="text-primary">${(t.total * 0.8).toLocaleString()} ៛</td>
            <td class="text-danger">${(t.total * 0.2).toLocaleString()} ៛</td>
        </tr>
    `).join('');
}

function renderStats() {
    const totalStudent = students.length;
    const totalIncome = students.reduce((sum, s) => sum + s.fee, 0);
    const schoolPart = totalIncome * 0.2;

    document.getElementById('statsRow').innerHTML = `
        <div class="col-md-4"><div class="card p-3 shadow-sm border-0 bg-primary text-white"><h6>សិស្សសរុប</h6><h3>${totalStudent} នាក់</h3></div></div>
        <div class="col-md-4"><div class="card p-3 shadow-sm border-0 bg-success text-white"><h6>ចំណូលសរុប</h6><h3>${totalIncome.toLocaleString()} ៛</h3></div></div>
        <div class="col-md-4"><div class="card p-3 shadow-sm border-0 bg-warning text-white"><h6>ចំណូលសាលា (20%)</h6><h3>${schoolPart.toLocaleString()} ៛</h3></div></div>
    `;
}

function deleteStudent(index) {
    Swal.fire({
        title: 'លុបទិន្នន័យ?',
        text: "តើអ្នកចង់លុបទិន្នន័យសិស្សនេះមែនទេ?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'លុប'
    }).then((result) => {
        if (result.isConfirmed) {
            students.splice(index, 1);
            saveData();
            renderAll();
        }
    });
}

// មុខងារ Search Filter
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

function showSection(section) {
    document.getElementById('dashboardSection').style.display = section === 'dashboard' ? 'block' : 'none';
    document.getElementById('studentSection').style.display = section === 'students' ? 'block' : 'none';
}
