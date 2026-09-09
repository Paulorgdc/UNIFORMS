window.approveAppointment = function(id) {
    let appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    const index = appointments.findIndex(app => app.id === id);
    if (index !== -1) {
        appointments[index].status = 'approved';
        localStorage.setItem('appointments', JSON.stringify(appointments));
        alert('Agendamento aprovado com sucesso!');
        renderApprovalList();
        const calendarContainer = document.getElementById('calendar-container');
        if (calendarContainer) renderCalendar(calendarContainer);
    }
};

window.rejectAppointment = function(id) {
    let appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    const index = appointments.findIndex(app => app.id === id);
    if (index !== -1) {
        appointments[index].status = 'rejected';
        localStorage.setItem('appointments', JSON.stringify(appointments));
        alert('Agendamento rejeitado.');
        renderApprovalList();
        const calendarContainer = document.getElementById('calendar-container');
        if (calendarContainer) renderCalendar(calendarContainer);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const loggedInUser = localStorage.getItem('loggedInUser'); // 'professor' or 'coordenador'
    const path = window.location.pathname;

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value.trim().toLowerCase();
            const password = document.getElementById('password').value;

            if ((username === 'professor' || username === 'coordenador') && password === '123') {
                localStorage.setItem('loggedInUser', username);
                window.location.href = 'dashboard.html';
            } else {
                alert('Usuário ou senha inválidos.');
            }
        });
    }

    const isLoginPage = path.endsWith('index.html') || path.endsWith('/') || path === '';
    if (!loggedInUser && !isLoginPage) {
        window.location.href = 'index.html';
    }

    const userNameDisplay = document.getElementById('loggedInUserName');
    if (userNameDisplay && loggedInUser) {
        userNameDisplay.textContent = loggedInUser.charAt(0).toUpperCase() + loggedInUser.slice(1);
    }

    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('loggedInUser');
            window.location.href = 'index.html';
        });
    }

    const sidebar = document.querySelector('.sidebar');
    if (sidebar && loggedInUser) {
        const roomLink = sidebar.querySelector('a[href="room-scheduling.html"]');
        const equipmentLink = sidebar.querySelector('a[href="equipment-scheduling.html"]');
        const approvalLink = sidebar.querySelector('a[href="approvals.html"]');

        if (loggedInUser === 'professor') {
            if (approvalLink) approvalLink.style.display = 'none';
        } else if (loggedInUser === 'coordenador') {
            if (roomLink) roomLink.style.display = 'none';
            if (equipmentLink) equipmentLink.style.display = 'none';
        }
    }

    const schedulingForm = document.getElementById('schedulingForm');
    if (schedulingForm) {
        schedulingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const type = schedulingForm.dataset.type;
            const item = document.getElementById('itemSelect').value;
            const date = document.getElementById('scheduleDate').value;
            const startTime = document.getElementById('startTime').value;
            const endTime = document.getElementById('endTime').value;

            if (!item || !date || !startTime || !endTime) {
                alert('Preencha todos os campos.');
                return;
            }

            const newAppointment = {
                id: Date.now(),
                type: type,
                item: item,
                date: date,
                startTime: startTime,
                endTime: endTime,
                user: loggedInUser,
                status: 'pending'
            };

            let appointments = JSON.parse(localStorage.getItem('appointments')) || [];
            appointments.push(newAppointment);
            localStorage.setItem('appointments', JSON.stringify(appointments));

            alert('Solicitação enviada para aprovação com sucesso!');
            schedulingForm.reset();
            renderAppointmentsList(type);
        });
    }

    const calendarContainer = document.getElementById('calendar-container');
    if (calendarContainer) renderCalendar(calendarContainer);

    if (path.includes('room-scheduling.html')) renderAppointmentsList('room');
    if (path.includes('equipment-scheduling.html')) renderAppointmentsList('equipment');
    if (path.includes('approvals.html')) renderApprovalList();
});

function renderCalendar(container) {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    
    let calendarHtml = `<div class="calendar-header"><h3>${monthNames[currentMonth]} ${currentYear}</h3></div><div class="calendar-grid">`;
    ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].forEach(d => {
        calendarHtml += `<div class="calendar-day calendar-header-day" style="font-weight:bold">${d}</div>`;
    });

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();

    for (let i = 0; i < firstDay; i++) calendarHtml += `<div class="calendar-day"></div>`;

    const appointments = JSON.parse(localStorage.getItem('appointments')) || [];

    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        const dayAppointments = appointments.filter(app => app.date === dateStr);
        let eventsHtml = '';
        
        dayAppointments.forEach(app => {
            if (app.status === 'pending') {
                eventsHtml += `<div style="background: rgba(245, 158, 11, 0.9); color: #fff; font-size: 0.7rem; padding: 4px; border-radius: 4px; margin-top: 4px; text-align: center;">⏳ Pendente</div>`;
            } else if (app.status === 'approved') {
                eventsHtml += `<div style="background: rgba(16, 185, 129, 0.9); color: #fff; font-size: 0.7rem; padding: 4px; border-radius: 4px; margin-top: 4px; text-align: center;">✅ Aprovado</div>`;
            } else if (app.status === 'rejected') {
                eventsHtml += `<div style="background: rgba(239, 68, 68, 0.9); color: #fff; font-size: 0.7rem; padding: 4px; border-radius: 4px; margin-top: 4px; text-align: center;">❌ Rejeitado</div>`;
            }
        });

        calendarHtml += `
            <div class="calendar-day ${dayAppointments.length > 0 ? 'has-event' : ''}">
                <div class="day-number">${day}</div>
                ${eventsHtml}
            </div>`;
    }
    container.innerHTML = calendarHtml + `</div>`;
}

function renderAppointmentsList(type) {
    const listContainer = document.getElementById('appointmentsList');
    if (!listContainer) return;

    const appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    const myAppointments = appointments.filter(app => app.type === type && app.user === localStorage.getItem('loggedInUser'));

    listContainer.innerHTML = myAppointments.length === 0 ? '<p>Nenhum agendamento.</p>' : 
        '<ul class="list-group">' + myAppointments.map(app => `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <div><strong>${app.item}</strong> - ${app.date.split('-').reverse().join('/')}</div>
                <span class="badge bg-${app.status === 'approved' ? 'success' : (app.status === 'rejected' ? 'danger' : 'warning text-dark')}">
                    ${app.status === 'approved' ? 'Aprovado' : (app.status === 'rejected' ? 'Rejeitado' : 'Pendente')}
                </span>
            </li>`).join('') + '</ul>';
}

function renderApprovalList() {
    const listContainer = document.getElementById('approvalList');
    if (!listContainer) return;

    const appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    const pendingAppointments = appointments.filter(app => app.status === 'pending');

    listContainer.innerHTML = pendingAppointments.length === 0 ? '<p>Sem pendências no momento.</p>' : 
        '<ul class="list-group">' + pendingAppointments.map(app => `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                    <strong>${app.item}</strong> (Por: <span class="text-capitalize">${app.user}</span>)<br>
                    <span class="text-secondary">${app.date.split('-').reverse().join('/')} das ${app.startTime} às ${app.endTime}</span>
                </div>
                <div>
                    <button class="btn btn-success btn-sm me-2" onclick="approveAppointment(${app.id})">Aprovar</button>
                    <button class="btn btn-danger btn-sm" onclick="rejectAppointment(${app.id})">Rejeitar</button>
                </div>
            </li>`).join('') + '</ul>';
}