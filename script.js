// Configuration
const ADMIN_USERNAME = 'JeffDok';
const ADMIN_PASSWORD = 'administrateur';

// État de l'application
let isAdmin = false;
let events = [];
let editingEventId = null;

// Éléments DOM
const loginModal = document.getElementById('loginModal');
const eventModal = document.getElementById('eventModal');
const loginForm = document.getElementById('loginForm');
const eventForm = document.getElementById('eventForm');
const eventsList = document.getElementById('eventsList');
const addEventSection = document.getElementById('addEventSection');
const logoutContainer = document.getElementById('logoutContainer');

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    checkAdminSession();
    loadEvents();
    setupEventListeners();
});

// Écouteurs d'événements
function setupEventListeners() {
    // Bouton coeur (connexion admin)
    document.getElementById('adminBtn').addEventListener('click', () => {
        if (!isAdmin) {
            showLoginModal();
        }
    });

    // Formulaire de connexion
    loginForm.addEventListener('submit', handleLogin);
    document.getElementById('closeLoginBtn').addEventListener('click', hideLoginModal);

    // Bouton déconnexion
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);

    // Bouton ajouter événement
    document.getElementById('addEventBtn').addEventListener('click', () => {
        editingEventId = null;
        resetEventForm();
        document.getElementById('eventModalTitle').textContent = 'Nouvel événement';
        document.getElementById('eventSubmitText').textContent = "Créer l'événement";
        showEventModal();
    });

    // Formulaire d'événement
    eventForm.addEventListener('submit', handleEventSubmit);
    document.getElementById('closeEventBtn').addEventListener('click', hideEventModal);
    document.getElementById('cancelEventBtn').addEventListener('click', hideEventModal);

    // Fermer modal en cliquant à l'extérieur
    loginModal.addEventListener('click', (e) => {
        if (e.target === loginModal) hideLoginModal();
    });
    eventModal.addEventListener('click', (e) => {
        if (e.target === eventModal) hideEventModal();
    });
}

// Gestion de la session admin
function checkAdminSession() {
    isAdmin = sessionStorage.getItem('cuirQuebecAdmin') === 'true';
    updateAdminUI();
}

function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorElement = document.getElementById('loginError');

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        isAdmin = true;
        sessionStorage.setItem('cuirQuebecAdmin', 'true');
        updateAdminUI();
        hideLoginModal();
        loginForm.reset();
        errorElement.textContent = '';
    } else {
        errorElement.textContent = "Nom d'utilisateur ou mot de passe incorrect";
    }
}

function handleLogout() {
    isAdmin = false;
    sessionStorage.removeItem('cuirQuebecAdmin');
    updateAdminUI();
}

function updateAdminUI() {
    if (isAdmin) {
        addEventSection.style.display = 'flex';
        logoutContainer.style.display = 'flex';
        document.getElementById('noEventsSubtitle').textContent = 
            'Cliquez sur "Ajouter un événement" pour commencer';
    } else {
        addEventSection.style.display = 'none';
        logoutContainer.style.display = 'none';
        document.getElementById('noEventsSubtitle').textContent = '';
    }
    renderEvents();
}

// Gestion des événements
function loadEvents() {
    const storedEvents = localStorage.getItem('cuirQuebecEvents');
    if (storedEvents) {
        events = JSON.parse(storedEvents);
        events.sort((a, b) => {
            const dateA = new Date(a.date + ' ' + a.time);
            const dateB = new Date(b.date + ' ' + b.time);
            return dateA - dateB;
        });
    }
    renderEvents();
}

function saveEvents() {
    localStorage.setItem('cuirQuebecEvents', JSON.stringify(events));
}

function handleEventSubmit(e) {
    e.preventDefault();

    const eventData = {
        id: editingEventId || 'event_' + Date.now(),
        title: document.getElementById('eventTitle').value,
        date: document.getElementById('eventDate').value,
        time: document.getElementById('eventTime').value,
        location: document.getElementById('eventLocation').value,
        description: document.getElementById('eventDescription').value,
        registrationLink: document.getElementById('eventRegLink').value,
        minAge: document.getElementById('eventMinAge').value,
        dressCode: document.getElementById('eventDressCode').value
    };

    if (editingEventId) {
        // Modifier événement existant
        const index = events.findIndex(e => e.id === editingEventId);
        if (index !== -1) {
            events[index] = eventData;
        }
    } else {
        // Ajouter nouvel événement
        events.push(eventData);
    }

    saveEvents();
    loadEvents();
    hideEventModal();
}

function editEvent(eventId) {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    editingEventId = eventId;
    document.getElementById('eventTitle').value = event.title;
    document.getElementById('eventDate').value = event.date;
    document.getElementById('eventTime').value = event.time;
    document.getElementById('eventLocation').value = event.location;
    document.getElementById('eventDescription').value = event.description;
    document.getElementById('eventRegLink').value = event.registrationLink || '';
    document.getElementById('eventMinAge').value = event.minAge;
    document.getElementById('eventDressCode').value = event.dressCode;

    document.getElementById('eventModalTitle').textContent = "Modifier l'événement";
    document.getElementById('eventSubmitText').textContent = 'Mettre à jour';
    showEventModal();
}

function deleteEvent(eventId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
        events = events.filter(e => e.id !== eventId);
        saveEvents();
        renderEvents();
    }
}

function renderEvents() {
    if (events.length === 0) {
        eventsList.innerHTML = `
            <div class="no-events">
                <p class="no-events-title">Aucun événement pour le moment</p>
                <p class="no-events-subtitle">${isAdmin ? 'Cliquez sur "Ajouter un événement" pour commencer' : ''}</p>
            </div>
        `;
        return;
    }

    eventsList.innerHTML = events.map(event => {
        const formattedDate = formatDate(event.date);
        const adminButtons = isAdmin ? `
            <button class="btn-icon" onclick="editEvent('${event.id}')" aria-label="Modifier">
                ✏️
            </button>
            <button class="btn-icon delete" onclick="deleteEvent('${event.id}')" aria-label="Supprimer">
                🗑️
            </button>
        ` : '';

        const registrationButton = event.registrationLink ? `
            <a href="${event.registrationLink}" target="_blank" rel="noopener noreferrer" class="btn-primary">
                S'inscrire
            </a>
        ` : '';

        return `
            <article class="event-card">
                <div class="event-card-header">
                    <div class="stripe blue-dark"></div>
                    <div class="stripe blue-medium"></div>
                    <div class="stripe blue-light"></div>
                </div>
                <div class="event-card-body">
                    <h3>${escapeHtml(event.title)}</h3>
                    
                    <div class="event-details">
                        <div class="event-detail">
                            <span class="event-detail-icon">📅</span>
                            <div class="event-detail-content">
                                <strong>${formattedDate}</strong>
                                <span>${event.time}</span>
                            </div>
                        </div>
                        
                        <div class="event-detail">
                            <span class="event-detail-icon">📍</span>
                            <div class="event-detail-content">
                                <span>${escapeHtml(event.location)}</span>
                            </div>
                        </div>
                        
                        <div class="event-detail">
                            <span class="event-detail-icon">👥</span>
                            <div class="event-detail-content">
                                <span>Âge minimum: ${event.minAge} ans</span>
                            </div>
                        </div>
                    </div>

                    <p class="event-description">${escapeHtml(event.description)}</p>
                    
                    <div class="dress-code-box">
                        <strong>Dress Code</strong>
                        <p>${escapeHtml(event.dressCode)}</p>
                    </div>

                    <div class="event-actions">
                        ${registrationButton}
                        ${adminButtons}
                    </div>
                </div>
            </article>
        `;
    }).join('');
}

// Utilitaires
function formatDate(dateStr) {
    const date = new Date(dateStr);
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return date.toLocaleDateString('fr-FR', options);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function resetEventForm() {
    eventForm.reset();
}

// Modales
function showLoginModal() {
    loginModal.classList.add('active');
    document.getElementById('username').focus();
}

function hideLoginModal() {
    loginModal.classList.remove('active');
    loginForm.reset();
    document.getElementById('loginError').textContent = '';
}

function showEventModal() {
    eventModal.classList.add('active');
    document.getElementById('eventTitle').focus();
}

function hideEventModal() {
    eventModal.classList.remove('active');
    resetEventForm();
    editingEventId = null;
}