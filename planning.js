// Script pour le planning des séances - NephroSys

document.addEventListener('DOMContentLoaded', function() {
    // Données de test pour le planning (à remplacer par une API ou une base de données)
    const planningData = [
        { id: 'S-001', patient: 'Dupont Jean', date: '2023-06-01', heureDebut: '09:00', heureFin: '12:00', salle: 'Salle 1', statut: 'confirmé', traitement: 'Hémodialyse standard' },
        { id: 'S-002', patient: 'Martin Sophie', date: '2023-06-01', heureDebut: '14:30', heureFin: '17:30', salle: 'Salle 2', statut: 'confirmé', traitement: 'Hémodialyse standard' },
        { id: 'S-003', patient: 'Leroy Thomas', date: '2023-06-02', heureDebut: '10:15', heureFin: '13:15', salle: 'Salle 1', statut: 'confirmé', traitement: 'Hémodialyse standard' },
        { id: 'S-004', patient: 'Petit Robert', date: '2023-06-05', heureDebut: '08:30', heureFin: '11:30', salle: 'Salle 1', statut: 'confirmé', traitement: 'Hémodialyse standard' },
        { id: 'S-005', patient: 'Dubois Marie', date: '2023-06-05', heureDebut: '11:00', heureFin: '14:00', salle: 'Salle 2', statut: 'confirmé', traitement: 'Hémodialyse standard' },
        { id: 'S-006', patient: 'Moreau Paul', date: '2023-06-06', heureDebut: '15:45', heureFin: '18:45', salle: 'Salle 3', statut: 'en attente', traitement: 'Hémodialyse quotidienne' },
        { id: 'S-007', patient: 'Dupont Jean', date: '2023-06-07', heureDebut: '09:00', heureFin: '12:00', salle: 'Salle 1', statut: 'confirmé', traitement: 'Hémodialyse standard' },
        { id: 'S-008', patient: 'Martin Sophie', date: '2023-06-08', heureDebut: '14:30', heureFin: '17:30', salle: 'Salle 2', statut: 'confirmé', traitement: 'Hémodialyse standard' },
        { id: 'S-009', patient: 'Leroy Thomas', date: '2023-06-09', heureDebut: '10:15', heureFin: '13:15', salle: 'Salle 1', statut: 'confirmé', traitement: 'Hémodialyse standard' },
        { id: 'S-010', patient: 'Bernard Louis', date: '2023-06-14', heureDebut: '16:30', heureFin: '19:30', salle: 'Salle 3', statut: 'urgent', traitement: 'Hémodialyse d\'urgence' }
    ];
    
    // Liste des traitements disponibles
    const traitements = [
        'Hémodialyse standard',
        'Hémodialyse quotidienne',
        'Hémodialyse nocturne',
        'Hémodialyse d\'urgence',
        'Hémodiafiltration',
        'Dialyse péritonéale'
    ];
    
    // Variables globales
    let currentView = 'month';
    let currentDate = new Date();
    let filteredRoom = 'all';
    let filteredStaff = 'all';
    
    // Sauvegarder les données dans le localStorage si elles n'existent pas déjà
    if (!localStorage.getItem('nephrosys_planning')) {
        localStorage.setItem('nephrosys_planning', JSON.stringify(planningData));
    }
    
    // Récupérer les données du planning
    let sessions = JSON.parse(localStorage.getItem('nephrosys_planning')) || planningData;
    
    // Initialisation des éléments DOM
    initCalendarView();
    setupEventListeners();
    
    // Fonction pour initialiser la vue du calendrier
    function initCalendarView() {
        // Afficher le calendrier pour le mois en cours
        displayCalendarView(currentView);
        
        // Mettre à jour le titre du mois
        updateMonthTitle(currentDate.getMonth(), currentDate.getFullYear());
    }
    
    // Fonction pour mettre à jour le titre du mois
    function updateMonthTitle(month, year) {
        const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
        const monthTitle = document.querySelector('.current-month');
        
        if (monthTitle) {
            monthTitle.textContent = `${monthNames[month]} ${year}`;
        }
    }
    
    // Fonction pour configurer les écouteurs d'événements
    function setupEventListeners() {
        // Navigation dans le calendrier
        const prevBtn = document.querySelector('.prev-month');
        const nextBtn = document.querySelector('.next-month');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', navigatePrevious);
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', navigateNext);
        }
        
        // Changement de vue (jour, semaine, mois)
        const viewButtons = document.querySelectorAll('.view-btn');
        viewButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                currentView = this.getAttribute('data-view');
                displayCalendarView(currentView);
            });
        });
        
        // Bouton pour ajouter une nouvelle séance
        const addSessionBtns = document.querySelectorAll('.add-session-btn, .planning-controls button');
        addSessionBtns.forEach(btn => {
            btn.addEventListener('click', showNewSessionForm);
        });
        
        // Filtres de salle
        const roomFilterBtns = document.querySelectorAll('.room-filter button');
        roomFilterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                roomFilterBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                // Appliquer le filtre
                filteredRoom = this.textContent === 'Toutes les salles' ? 'all' : this.textContent;
                displayCalendarView(currentView);
            });
        });
        
        // Filtres de salle dans le menu déroulant
        const roomSelect = document.querySelector('.planning-controls select:first-of-type');
        if (roomSelect) {
            roomSelect.addEventListener('change', function() {
                filteredRoom = this.value === 'Toutes les salles' ? 'all' : this.value;
                displayCalendarView(currentView);
            });
        }
        
        // Filtres de soignant
        const staffSelect = document.querySelector('.planning-controls select:nth-of-type(2)');
        if (staffSelect) {
            staffSelect.addEventListener('change', function() {
                filteredStaff = this.value === 'Tous les soignants' ? 'all' : this.value;
                displayCalendarView(currentView);
            });
        }
    }
    
    // Fonction pour naviguer au mois/semaine/jour précédent
    function navigatePrevious() {
        switch(currentView) {
            case 'day':
                currentDate.setDate(currentDate.getDate() - 1);
                break;
            case 'week':
                currentDate.setDate(currentDate.getDate() - 7);
                break;
            case 'month':
            default:
                currentDate.setMonth(currentDate.getMonth() - 1);
                break;
        }
        
        updateMonthTitle(currentDate.getMonth(), currentDate.getFullYear());
        displayCalendarView(currentView);
    }
    
    // Fonction pour naviguer au mois/semaine/jour suivant
    function navigateNext() {
        switch(currentView) {
            case 'day':
                currentDate.setDate(currentDate.getDate() + 1);
                break;
            case 'week':
                currentDate.setDate(currentDate.getDate() + 7);
                break;
            case 'month':
            default:
                currentDate.setMonth(currentDate.getMonth() + 1);
                break;
        }
        
        updateMonthTitle(currentDate.getMonth(), currentDate.getFullYear());
        displayCalendarView(currentView);
    }
    
    // Fonction pour afficher la vue du calendrier selon le type (jour, semaine, mois)
    function displayCalendarView(viewType) {
        // Mettre à jour la classe de la vue active
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-view') === viewType) {
                btn.classList.add('active');
            }
        });
        
        switch(viewType) {
            case 'day':
                displayDayView(currentDate.getDate(), currentDate.getMonth(), currentDate.getFullYear());
                break;
            case 'week':
                displayWeekView(currentDate.getDate(), currentDate.getMonth(), currentDate.getFullYear());
                break;
            case 'month':
            default:
                displayMonthView(currentDate.getMonth(), currentDate.getFullYear());
                break;
        }
    }
    
    // Fonction pour afficher la vue mensuelle
    function displayMonthView(month, year) {
        const calendarGrid = document.querySelector('.calendar-grid');
        if (!calendarGrid) return;
        
        // Vider le calendrier
        calendarGrid.innerHTML = '';
        
        // Obtenir le premier jour du mois
        const firstDay = new Date(year, month, 1);
        
        // Obtenir le dernier jour du mois
        const lastDay = new Date(year, month + 1, 0);
        
        // Obtenir le jour de la semaine du premier jour (0 = dimanche, 1 = lundi, etc.)
        let firstDayOfWeek = firstDay.getDay() || 7; // Convertir 0 (dimanche) en 7
        firstDayOfWeek--; // Ajuster pour commencer par lundi (0)
        
        // Nombre total de jours à afficher (jours du mois + jours du mois précédent pour compléter la première semaine)
        const totalDays = lastDay.getDate() + firstDayOfWeek;
        
        // Nombre de semaines à afficher
        const totalWeeks = Math.ceil(totalDays / 7);
        
        // Date actuelle pour marquer le jour courant
        const today = new Date();
        const currentDay = today.getDate();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        
        // Obtenir le mois précédent pour afficher ses derniers jours
        const prevMonth = month === 0 ? 11 : month - 1;
        const prevMonthYear = month === 0 ? year - 1 : year;
        const prevMonthLastDay = new Date(prevMonthYear, prevMonth + 1, 0).getDate();
        
        // Créer les cellules du calendrier
        let dayCount = 1;
        let nextMonthDay = 1;
        
        for (let i = 0; i < totalWeeks * 7; i++) {
            const dayCell = document.createElement('div');
            dayCell.className = 'calendar-day';
            
            // Déterminer si le jour fait partie du mois actuel, précédent ou suivant
            if (i < firstDayOfWeek) {
                // Jours du mois précédent
                const prevMonthDate = prevMonthLastDay - (firstDayOfWeek - i - 1);
                dayCell.innerHTML = `<div class="day-header">${prevMonthDate}</div>`;
                dayCell.classList.add('other-month');
            } else if (i >= firstDayOfWeek && dayCount <= lastDay.getDate()) {
                // Jours du mois actuel
                dayCell.innerHTML = `<div class="day-header">${dayCount}</div>`;
                
                // Marquer le jour actuel
                if (dayCount === currentDay && month === currentMonth && year === currentYear) {
                    dayCell.classList.add('today');
                }
                
                // Ajouter les séances pour ce jour
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayCount).padStart(2, '0')}`;
                
                // Filtrer les séances selon les critères
                let daySessions = sessions.filter(session => session.date === dateStr);
                
                // Appliquer le filtre de salle
                if (filteredRoom !== 'all') {
                    daySessions = daySessions.filter(session => session.salle === filteredRoom);
                }
                
                // Appliquer le filtre de soignant (à implémenter avec les données réelles)
                if (filteredStaff !== 'all') {
                    // Exemple: daySessions = daySessions.filter(session => session.soignant === filteredStaff);
                }
                
                // Ajouter les séances à la cellule
                daySessions.forEach(session => {
                    const appointmentDiv = document.createElement('div');
                    appointmentDiv.className = `appointment ${session.statut === 'urgent' ? 'urgent' : ''}`;
                    appointmentDiv.textContent = `${session.patient} - ${session.heureDebut}`;
                    
                    // Ajouter un écouteur d'événement pour afficher les détails
                    appointmentDiv.addEventListener('click', () => {
                        showSessionDetails(session);
                    });
                    
                    dayCell.appendChild(appointmentDiv);
                });
                
                // Ajouter un écouteur d'événement pour ajouter une séance à ce jour
                dayCell.addEventListener('dblclick', () => {
                    showNewSessionForm(dateStr);
                });
                
                dayCount++;
            } else {
                // Jours du mois suivant
                dayCell.innerHTML = `<div class="day-header">${nextMonthDay}</div>`;
                dayCell.classList.add('other-month');
                nextMonthDay++;
            }
            
            calendarGrid.appendChild(dayCell);
        }
    }
    
    // Fonction pour afficher la vue journalière
    function displayDayView(day, month, year) {
        const calendarGrid = document.querySelector('.calendar-grid');
        if (!calendarGrid) return;
        
        // Vider le calendrier
        calendarGrid.innerHTML = '';
        
        // Créer l'en-tête pour la vue journalière
        const dayHeader = document.createElement('div');
        dayHeader.className = 'day-view-header';
        const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
        dayHeader.innerHTML = `<h3>${day} ${monthNames[month]} ${year}</h3>`;
        calendarGrid.appendChild(dayHeader);
        
        // Créer la grille horaire
        const timeGrid = document.createElement('div');
        timeGrid.className = 'time-grid';
        
        // Heures de la journée (de 8h à 18h)
        const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
        
        hours.forEach(hour => {
            const timeSlot = document.createElement('div');
            timeSlot.className = 'time-slot';
            
            const timeLabel = document.createElement('div');
            timeLabel.className = 'time-label';
            timeLabel.textContent = hour;
            
            const timeContent = document.createElement('div');
            timeContent.className = 'time-content';
            
            // Filtrer les séances pour cette heure et ce jour
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            let hourSessions = sessions.filter(session => {
                return session.date === dateStr && session.heureDebut <= hour && session.heureFin > hour;
            });
            
            // Appliquer le filtre de salle
            if (filteredRoom !== 'all') {
                hourSessions = hourSessions.filter(session => session.salle === filteredRoom);
            }
            
            // Appliquer le filtre de soignant (à implémenter avec les données réelles)
            if (filteredStaff !== 'all') {
                // Exemple: hourSessions = hourSessions.filter(session => session.soignant === filteredStaff);
            }
            
            // Ajouter les séances à ce créneau horaire
            hourSessions.forEach(session => {
                const sessionItem = document.createElement('div');
                sessionItem.className = `day-session-item ${session.statut}`;
                sessionItem.innerHTML = `
                    <span class="session-time">${session.heureDebut} - ${session.heureFin}</span>
                    <span class="session-patient">${session.patient}</span>
                    <span class="session-room">${session.salle}</span>
                    <span class="session-treatment">${session.traitement || 'Non spécifié'}</span>
                `;
                
                // Ajouter un écouteur d'événement pour afficher les détails
                sessionItem.addEventListener('click', () => {
                    showSessionDetails(session);
                });
                
                timeContent.appendChild(sessionItem);
            });
            
            // Ajouter un écouteur d'événement pour ajouter une séance à ce créneau
            timeContent.addEventListener('dblclick', () => {
                const newSessionTime = hour;
                showNewSessionForm(dateStr, newSessionTime);
            });
            
            timeSlot.appendChild(timeLabel);
            timeSlot.appendChild(timeContent);
            timeGrid.appendChild(timeSlot);
        });
        
        calendarGrid.appendChild(timeGrid);
    }
    
    // Fonction pour afficher la vue hebdomadaire
    function displayWeekView(day, month, year) {
        const calendarGrid = document.querySelector('.calendar-grid');
        if (!calendarGrid) return;
        
        // Vider le calendrier
        calendarGrid.innerHTML = '';
        
        // Obtenir le premier jour de la semaine (lundi)
        const date = new Date(year, month, day);
        const dayOfWeek = date.getDay() || 7; // Convertir 0 (dimanche) en 7
        const mondayDate = new Date(date);
        mondayDate.setDate(date.getDate() - dayOfWeek + 1);
        
        // Créer l'en-tête pour les jours de la semaine
        const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
        const weekHeader = document.createElement('div');
        weekHeader.className = 'week-header';
        
        // Ajouter une cellule vide pour l'en-tête des heures
        const emptyHeader = document.createElement('div');
        emptyHeader.className = 'week-header-cell empty';
        weekHeader.appendChild(emptyHeader);
        
        // Ajouter les en-têtes des jours
        for (let i = 0; i < 7; i++) {
            const dayDate = new Date(mondayDate);
            dayDate.setDate(mondayDate.getDate() + i);
            
            const dayHeader = document.createElement('div');
            dayHeader.className = 'week-header-cell';
            dayHeader.innerHTML = `
                <div class="week-day">${weekDays[i]}</div>
                <div class="week-date">${dayDate.getDate()}/${dayDate.getMonth() + 1}</div>
            `;
            weekHeader.appendChild(dayHeader);
        }
        
        calendarGrid.appendChild(weekHeader);
        
        // Créer la grille horaire
        const weekGrid = document.createElement('div');
        weekGrid.className = 'week-grid';
        
        // Heures de la journée (de 8h à 18h)
        const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
        
        hours.forEach(hour => {
            const hourRow = document.createElement('div');
            hourRow.className = 'week-row';
            
            // Ajouter le label de l'heure
            const hourLabel = document.createElement('div');
            hourLabel.className = 'week-hour-label';
            hourLabel.textContent = hour;
            hourRow.appendChild(hourLabel);
            
            // Ajouter les cellules pour chaque jour
            for (let i = 0; i < 7; i++) {
                const dayDate = new Date(mondayDate);
                dayDate.setDate(mondayDate.getDate() + i);
                
                const dayCell = document.createElement('div');
                dayCell.className = 'week-cell';
                
                // Formater la date pour la comparaison avec les séances
                const dateStr = `${dayDate.getFullYear()}-${String(dayDate.getMonth() + 1).padStart(2, '0')}-${String(dayDate.getDate()).padStart(2, '0')}`;
                
                // Filtrer les séances pour cette heure et ce jour
                let hourSessions = sessions.filter(session => {
                    return session.date === dateStr && session.heureDebut <= hour && session.heureFin > hour;
                });
                
                // Appliquer le filtre de salle
                if (filteredRoom !== 'all') {
                    hourSessions = hourSessions.filter(session => session.salle === filteredRoom);
                }
                
                // Appliquer le filtre de soignant (à implémenter avec les données réelles)
                if (filteredStaff !== 'all') {
                    // Exemple: hourSessions = hourSessions.filter(session => session.soignant === filteredStaff);
                }
                
                // Ajouter les séances à ce créneau horaire
                hourSessions.forEach(session => {
                    const sessionItem = document.createElement('div');
                    sessionItem.className = `week-session-item ${session.statut}`;
                    sessionItem.innerHTML = `
                        <span class="session-patient">${session.patient}</span>
                        <span class="session-room">${session.salle}</span>
                    `;
                    
                    // Ajouter un écouteur d'événement pour afficher les détails
                    sessionItem.addEventListener('click', () => {
                        showSessionDetails(session);
                    });
                    
                    dayCell.appendChild(sessionItem);
                });
                
                // Ajouter un écouteur d'événement pour ajouter une séance à ce créneau
                dayCell.addEventListener('dblclick', () => {
                    showNewSessionForm(dateStr, hour);
                });
                
                hourRow.appendChild(dayCell);
            }
            
            weekGrid.appendChild(hourRow);
        });
        
        calendarGrid.appendChild(weekGrid);
    }
    
    // Fonction pour afficher les détails d'une séance
    function showSessionDetails(session) {
        // Créer ou récupérer le modal des détails
        let modal = document.getElementById('session-details-modal');
        
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'session-details-modal';
            modal.className = 'modal';
            document.body.appendChild(modal);
        }
        
        // Formater la date pour l'affichage (JJ/MM/AAAA)
        const dateParts = session.date.split('-');
        const formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
        
        // Remplir le modal avec les détails
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Détails de la séance</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="session-details">
                        <p><strong>Patient:</strong> ${session.patient}</p>
                        <p><strong>Date:</strong> ${formattedDate}</p>
                        <p><strong>Horaire:</strong> ${session.heureDebut} - ${session.heureFin}</p>
                        <p><strong>Salle:</strong> ${session.salle}</p>
                        <p><strong>Statut:</strong> <span class="status-${session.statut}">${session.statut.charAt(0).toUpperCase() + session.statut.slice(1)}</span></p>
                        <p><strong>Traitement:</strong> ${session.traitement || 'Non spécifié'}</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="edit-session-btn primary-btn">Modifier</button>
                    <button class="delete-session-btn danger-btn">Supprimer</button>
                    <button class="close-btn secondary-btn">Fermer</button>
                </div>
            </div>
        `;
        
        // Ajouter des styles pour le modal s'ils n'existent pas déjà
        if (!document.getElementById('modal-styles')) {
            const styleElement = document.createElement('style');
            styleElement.id = 'modal-styles';
            styleElement.textContent = `
                .modal {
                    display: none;
                    position: fixed;
                    z-index: 1000;
                    left: 0;
                    top: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.5);
                }
                
                .modal-content {
                    background-color: white;
                    margin: 10% auto;
                    padding: 0;
                    width: 500px;
                    max-width: 90%;
                    border-radius: 8px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
                }
                
                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1rem 1.5rem;
                    background-color: #f0f5ff;
                    border-top-left-radius: 8px;
                    border-top-right-radius: 8px;
                    border-bottom: 1px solid #ddd;
                }
                
                .modal-header h3 {
                    margin: 0;
                    color: #2c73d2;
                }
                
                .close-modal {
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    cursor: pointer;
                    color: #666;
                }
                
                .modal-body {
                    padding: 1.5rem;
                }
                
                .modal-footer {
                    display: flex;
                    justify-content: flex-end;
                    gap: 1rem;
                    padding: 1rem 1.5rem;
                    border-top: 1px solid #ddd;
                }
                
                .primary-btn {
                    background-color: #2c73d2;
                    color: white;
                    border: none;
                    padding: 0.6rem 1.2rem;
                    border-radius: 4px;
                    cursor: pointer;
                }
                
                .secondary-btn {
                    background-color: #f0f0f0;
                    color: #333;
                    border: 1px solid #ddd;
                    padding: 0.6rem 1.2rem;
                    border-radius: 4px;
                    cursor: pointer;
                }
                
                .danger-btn {
                    background-color: #f44336;
                    color: white;
                    border: none;
                    padding: 0.6rem 1.2rem;
                    border-radius: 4px;
                    cursor: pointer;
                }
                
                .form-group {
                    margin-bottom: 1rem;
                }
                
                .form-group label {
                    display: block;
                    margin-bottom: 0.5rem;
                    font-weight: 500;
                }
                
                .form-group input, .form-group select {
                    width: 100%;
                    padding: 0.6rem;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    font-size: 1rem;
                }
                
                .status-confirmé {
                    color: #4caf50;
                }
                
                .status-en-attente {
                    color: #ff9800;
                }
                
                .status-urgent {
                    color: #f44336;
                }
                
                .status-annulé {
                    color: #9e9e9e;
                    text-decoration: line-through;
                }
            `;
            document.head.appendChild(styleElement);
        }
        
        // Afficher le modal
        modal.style.display = 'block';
        
        // Gérer la fermeture du modal
        const closeBtn = modal.querySelector('.close-modal');
        const closeModalBtn = modal.querySelector('.close-btn');
        
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }
        
        // Fermer le modal en cliquant en dehors
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
        
        // Gérer le bouton de modification
        const editBtn = modal.querySelector('.edit-session-btn');
        editBtn.addEventListener('click', () => {
            showEditSessionForm(session);
            modal.style.display = 'none';
        });
        
        // Gérer le bouton de suppression
        const deleteBtn = modal.querySelector('.delete-session-btn');
        deleteBtn.addEventListener('click', () => {
            if (confirm(`Êtes-vous sûr de vouloir supprimer la séance de ${session.patient} le ${formattedDate} ?`)) {
                // Supprimer la séance
                const updatedSessions = sessions.filter(s => s.id !== session.id);
                
                // Sauvegarder les modifications
                localStorage.setItem('nephrosys_planning', JSON.stringify(updatedSessions));
                sessions = updatedSessions;
                
                // Fermer le modal et rafraîchir le calendrier
                modal.style.display = 'none';
                displayCalendarView(currentView);
                
                // Afficher une notification
                alert('La séance a été supprimée avec succès.');
            }
        });
    }
    
    // Fonction pour afficher le formulaire d'ajout/modification d'une séance
    function showEditSessionForm(session = null) {
        // Créer ou récupérer le modal du formulaire
        let modal = document.getElementById('edit-session-modal');
        
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'edit-session-modal';
            modal.className = 'modal';
            document.body.appendChild(modal);
        }
        
        // Déterminer si c'est un ajout ou une modification
        const isEdit = session !== null;
        const title = isEdit ? 'Modifier la séance' : 'Ajouter une nouvelle séance';
        const buttonText = isEdit ? 'Mettre à jour' : 'Enregistrer';
        
        // Préparer les valeurs par défaut
        const defaultDate = new Date();
        const formattedDefaultDate = `${defaultDate.getFullYear()}-${String(defaultDate.getMonth() + 1).padStart(2, '0')}-${String(defaultDate.getDate()).padStart(2, '0')}`;
        
        // Remplir le modal avec le formulaire
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="session-form">
                        ${isEdit ? `<input type="hidden" id="session-id" value="${session.id}">` : ''}
                        <div class="form-group">
                            <label for="session-patient">Patient</label>
                            <select id="session-patient" required>
                                <option value="">Sélectionner un patient</option>
                                <option value="Dupont Jean" ${isEdit && session.patient === 'Dupont Jean' ? 'selected' : ''}>Dupont Jean</option>
                                <option value="Martin Sophie" ${isEdit && session.patient === 'Martin Sophie' ? 'selected' : ''}>Martin Sophie</option>
                                <option value="Petit Robert" ${isEdit && session.patient === 'Petit Robert' ? 'selected' : ''}>Petit Robert</option>
                                <option value="Dubois Marie" ${isEdit && session.patient === 'Dubois Marie' ? 'selected' : ''}>Dubois Marie</option>
                                <option value="Leroy Thomas" ${isEdit && session.patient === 'Leroy Thomas' ? 'selected' : ''}>Leroy Thomas</option>
                                <option value="Moreau Paul" ${isEdit && session.patient === 'Moreau Paul' ? 'selected' : ''}>Moreau Paul</option>
                                <option value="Bernard Louis" ${isEdit && session.patient === 'Bernard Louis' ? 'selected' : ''}>Bernard Louis</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="session-date">Date</label>
                            <input type="date" id="session-date" value="${isEdit ? session.date : formattedDefaultDate}" required>
                        </div>
                        <div class="form-group">
                            <label for="session-start">Heure de début</label>
                            <input type="time" id="session-start" value="${isEdit ? session.heureDebut : '09:00'}" required>
                        </div>
                        <div class="form-group">
                            <label for="session-end">Heure de fin</label>
                            <input type="time" id="session-end" value="${isEdit ? session.heureFin : '12:00'}" required>
                        </div>
                        <div class="form-group">
                            <label for="session-room">Salle</label>
                            <select id="session-room" required>
                                <option value="">Sélectionner une salle</option>
                                <option value="Salle 1" ${isEdit && session.salle === 'Salle 1' ? 'selected' : ''}>Salle 1</option>
                                <option value="Salle 2" ${isEdit && session.salle === 'Salle 2' ? 'selected' : ''}>Salle 2</option>
                                <option value="Salle 3" ${isEdit && session.salle === 'Salle 3' ? 'selected' : ''}>Salle 3</option>
                                <option value="Salle 4" ${isEdit && session.salle === 'Salle 4' ? 'selected' : ''}>Salle 4</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="session-status">Statut</label>
                            <select id="session-status" required>
                                <option value="confirmé" ${isEdit && session.statut === 'confirmé' ? 'selected' : ''}>Confirmé</option>
                                <option value="en attente" ${isEdit && session.statut === 'en attente' ? 'selected' : ''}>En attente</option>
                                <option value="urgent" ${isEdit && session.statut === 'urgent' ? 'selected' : ''}>Urgent</option>
                                <option value="annulé" ${isEdit && session.statut === 'annulé' ? 'selected' : ''}>Annulé</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="session-treatment">Traitement</label>
                            <select id="session-treatment" required>
                                <option value="">Sélectionner un traitement</option>
                                ${traitements.map(traitement => `<option value="${traitement}" ${isEdit && session.traitement === traitement ? 'selected' : ''}>${traitement}</option>`).join('')}
                            </select>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="save-session-btn primary-btn">${buttonText}</button>
                    <button class="cancel-btn secondary-btn">Annuler</button>
                </div>
            </div>
        `;
        
        // Afficher le modal
        modal.style.display = 'block';
        
        // Gérer la fermeture du modal
        const closeBtn = modal.querySelector('.close-modal');
        const cancelBtn = modal.querySelector('.cancel-btn');
        
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        cancelBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        // Fermer le modal en cliquant en dehors
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
        
        // Gérer l'enregistrement ou la mise à jour de la séance
        const saveBtn = modal.querySelector('.save-session-btn');
        saveBtn.addEventListener('click', () => {
            const patient = document.getElementById('session-patient').value;
            const date = document.getElementById('session-date').value;
            const heureDebut = document.getElementById('session-start').value;
            const heureFin = document.getElementById('session-end').value;
            const salle = document.getElementById('session-room').value;
            const statut = document.getElementById('session-status').value;
            const traitement = document.getElementById('session-treatment').value;
            
            // Validation simple
            if (!patient || !date || !heureDebut || !heureFin || !salle || !statut || !traitement) {
                alert('Veuillez remplir tous les champs obligatoires.');
                return;
            }
            
            if (isEdit) {
                // Mettre à jour la séance existante
                const sessionId = document.getElementById('session-id').value;
                const updatedSessions = sessions.map(s => {
                    if (s.id === sessionId) {
                        return {
                            ...s,
                            patient,
                            date,
                            heureDebut,
                            heureFin,
                            salle,
                            statut,
                            traitement
                        };
                    }
                    return s;
                });
                
                // Sauvegarder les modifications
                localStorage.setItem('nephrosys_planning', JSON.stringify(updatedSessions));
                sessions = updatedSessions;
                
                // Afficher une notification
                alert('La séance a été mise à jour avec succès.');
            } else {
                // Créer une nouvelle séance
                const newSession = {
                    id: `S-${Date.now()}`, // ID unique basé sur le timestamp
                    patient,
                    date,
                    heureDebut,
                    heureFin,
                    salle,
                    statut,
                    traitement
                };
                
                // Ajouter la séance aux données existantes
                const updatedSessions = [...sessions, newSession];
                
                // Sauvegarder les modifications
                localStorage.setItem('nephrosys_planning', JSON.stringify(updatedSessions));
                sessions = updatedSessions;
                
                // Afficher une notification
                alert('La séance a été ajoutée avec succès.');
            }
            
            // Fermer le modal et rafraîchir le calendrier
            modal.style.display = 'none';
            displayCalendarView(currentView);
        });
    }
    
    // Fonction pour afficher le formulaire d'ajout d'une séance avec date/heure préremplies
    function showNewSessionForm(dateStr, timeStr) {
        // Créer ou récupérer le modal du formulaire
        let modal = document.getElementById('edit-session-modal');
        
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'edit-session-modal';
            modal.className = 'modal';
            document.body.appendChild(modal);
        }
        
        // Préparer les valeurs par défaut
        let defaultDate = new Date();
        let defaultTime = '09:00';
        
        // Si une date est fournie, l'utiliser
        if (dateStr && typeof dateStr === 'string') {
            defaultDate = dateStr;
        } else {
            defaultDate = `${defaultDate.getFullYear()}-${String(defaultDate.getMonth() + 1).padStart(2, '0')}-${String(defaultDate.getDate()).padStart(2, '0')}`;
        }
        
        // Si une heure est fournie, l'utiliser
        if (timeStr && typeof timeStr === 'string') {
            defaultTime = timeStr;
        }
        
        // Calculer l'heure de fin (3 heures après l'heure de début par défaut)
        const defaultEndTime = calculateEndTime(defaultTime, 3);
        
        // Remplir le modal avec le formulaire
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Ajouter une nouvelle séance</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="session-form">
                        <div class="form-group">
                            <label for="session-patient">Patient</label>
                            <select id="session-patient" required>
                                <option value="">Sélectionner un patient</option>
                                <option value="Dupont Jean">Dupont Jean</option>
                                <option value="Martin Sophie">Martin Sophie</option>
                                <option value="Petit Robert">Petit Robert</option>
                                <option value="Dubois Marie">Dubois Marie</option>
                                <option value="Leroy Thomas">Leroy Thomas</option>
                                <option value="Moreau Paul">Moreau Paul</option>
                                <option value="Bernard Louis">Bernard Louis</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="session-date">Date</label>
                            <input type="date" id="session-date" value="${defaultDate}" required>
                        </div>
                        <div class="form-group">
                            <label for="session-start">Heure de début</label>
                            <input type="time" id="session-start" value="${defaultTime}" required>
                        </div>
                        <div class="form-group">
                            <label for="session-end">Heure de fin</label>
                            <input type="time" id="session-end" value="${defaultEndTime}" required>
                        </div>
                        <div class="form-group">
                            <label for="session-room">Salle</label>
                            <select id="session-room" required>
                                <option value="">Sélectionner une salle</option>
                                <option value="Salle 1">Salle 1</option>
                                <option value="Salle 2">Salle 2</option>
                                <option value="Salle 3">Salle 3</option>
                                <option value="Salle 4">Salle 4</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="session-status">Statut</label>
                            <select id="session-status" required>
                                <option value="confirmé" selected>Confirmé</option>
                                <option value="en attente">En attente</option>
                                <option value="urgent">Urgent</option>
                                <option value="annulé">Annulé</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="session-treatment">Traitement</label>
                            <select id="session-treatment" required>
                                <option value="">Sélectionner un traitement</option>
                                ${traitements.map(traitement => `<option value="${traitement}">${traitement}</option>`).join('')}
                            </select>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="save-session-btn primary-btn">Enregistrer</button>
                    <button class="cancel-btn secondary-btn">Annuler</button>
                </div>
            </div>
        `;
        
        // Afficher le modal
        modal.style.display = 'block';
        
        // Gérer la fermeture du modal
        const closeBtn = modal.querySelector('.close-modal');
        const cancelBtn = modal.querySelector('.cancel-btn');
        
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        cancelBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        // Fermer le modal en cliquant en dehors
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
        
        // Gérer l'enregistrement de la séance
        const saveBtn = modal.querySelector('.save-session-btn');
        saveBtn.addEventListener('click', () => {
            const patient = document.getElementById('session-patient').value;
            const date = document.getElementById('session-date').value;
            const heureDebut = document.getElementById('session-start').value;
            const heureFin = document.getElementById('session-end').value;
            const salle = document.getElementById('session-room').value;
            const statut = document.getElementById('session-status').value;
            const traitement = document.getElementById('session-treatment').value;
            
            // Validation simple
            if (!patient || !date || !heureDebut || !heureFin || !salle || !statut || !traitement) {
                alert('Veuillez remplir tous les champs obligatoires.');
                return;
            }
            
            // Créer une nouvelle séance
            const newSession = {
                id: `S-${Date.now()}`, // ID unique basé sur le timestamp
                patient,
                date,
                heureDebut,
                heureFin,
                salle,
                statut,
                traitement
            };
            
            // Ajouter la séance aux données existantes
            const updatedSessions = [...sessions, newSession];
            
            // Sauvegarder les modifications
            localStorage.setItem('nephrosys_planning', JSON.stringify(updatedSessions));
            sessions = updatedSessions;
            
            // Fermer le modal et rafraîchir le calendrier
            modal.style.display = 'none';
            displayCalendarView(currentView);
            
            // Afficher une notification
            alert('La séance a été ajoutée avec succès.');
        });
    }
    
    // Fonction utilitaire pour calculer l'heure de fin en fonction de l'heure de début et de la durée
    function calculateEndTime(startTime, durationHours) {
        const [hours, minutes] = startTime.split(':').map(Number);
        let endHours = hours + durationHours;
        
        // Gérer le passage au jour suivant
        if (endHours >= 24) {
            endHours -= 24;
        }
        
        return `${String(endHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }
});