// Script pour la gestion des patients - NephroSys

document.addEventListener('DOMContentLoaded', function() {
    // Récupération des patients depuis le localStorage ou utilisation des données de test
    let patients = JSON.parse(localStorage.getItem('nephrosys_patients')) || [
        { id: 'P-001', nom: 'Dupont Jean', dateNaissance: '15/04/1965', typeDialyse: 'Hémodialyse', derniereSeance: '12/06/2023', 
          adresse: '15 rue des Lilas, 75001 Paris', telephone: '01 23 45 67 89', email: 'jean.dupont@email.com', 
          groupeSanguin: 'A+', allergies: 'Pénicilline', antecedents: 'Hypertension, Diabète type 2' },
        { id: 'P-002', nom: 'Martin Sophie', dateNaissance: '23/09/1972', typeDialyse: 'Dialyse péritonéale', derniereSeance: '14/06/2023',
          adresse: '8 avenue Victor Hugo, 69002 Lyon', telephone: '04 56 78 90 12', email: 'sophie.martin@email.com',
          groupeSanguin: 'O-', allergies: 'Aucune', antecedents: 'Insuffisance rénale chronique' },
        { id: 'P-003', nom: 'Petit Robert', dateNaissance: '07/12/1958', typeDialyse: 'Hémodialyse', derniereSeance: '10/06/2023',
          adresse: '25 boulevard Pasteur, 33000 Bordeaux', telephone: '05 12 34 56 78', email: 'robert.petit@email.com',
          groupeSanguin: 'B+', allergies: 'Sulfamides', antecedents: 'Insuffisance cardiaque' },
        { id: 'P-004', nom: 'Dubois Marie', dateNaissance: '30/05/1980', typeDialyse: 'Hémodialyse', derniereSeance: '13/06/2023',
          adresse: '42 rue de la Paix, 44000 Nantes', telephone: '02 34 56 78 90', email: 'marie.dubois@email.com',
          groupeSanguin: 'AB+', allergies: 'Iode', antecedents: 'Polykystose rénale' },
        { id: 'P-005', nom: 'Leroy Thomas', dateNaissance: '18/03/1975', typeDialyse: 'Dialyse péritonéale', derniereSeance: '11/06/2023',
          adresse: '3 place de la République, 13001 Marseille', telephone: '04 98 76 54 32', email: 'thomas.leroy@email.com',
          groupeSanguin: 'A-', allergies: 'Latex', antecedents: 'Glomérulonéphrite' }
    ];
    
    // Fonction pour sauvegarder les patients dans le localStorage
    function savePatients() {
        localStorage.setItem('nephrosys_patients', JSON.stringify(patients));
    }
    
    // Fonction pour afficher les notifications
    function showNotification(message, type = 'info') {
        // Création de l'élément de notification s'il n'existe pas déjà
        let notification = document.getElementById('notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'notification';
            document.body.appendChild(notification);
        }
        
        // Configuration du style de la notification
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span>${message}</span>
                <button class="close-notification">&times;</button>
            </div>
        `;
        
        // Affichage de la notification
        notification.style.display = 'block';
        
        // Fermeture automatique après 5 secondes
        setTimeout(() => {
            notification.style.display = 'none';
        }, 5000);
        
        // Fermeture manuelle
        const closeBtn = notification.querySelector('.close-notification');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                notification.style.display = 'none';
            });
        }
    }

    // Éléments du DOM
    const searchForm = document.querySelector('.search-form');
    const searchInput = document.querySelector('.search-form input');
    const addPatientBtn = document.querySelector('.add-patient button');
    const patientList = document.querySelector('.patient-list');
    const paginationContainer = document.querySelector('.pagination');

    // Initialisation
    displayPatients(patients);
    setupEventListeners();
    
    // Fonction pour mettre à jour les statistiques des patients
    function updatePatientStats(patientsList) {
        const statsCards = document.querySelectorAll('.stat-card');
        if (statsCards.length >= 2) {
            // Nombre total de patients actifs
            statsCards[0].querySelector('h3').textContent = patientsList.length;
            
            // Nouveaux patients ce mois
            const currentDate = new Date();
            const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            const newPatientsCount = patientsList.filter(patient => {
                const parts = patient.id.split('-');
                const patientNumber = parseInt(parts[1]);
                return patientNumber > patients.length - 5; // Simulation pour l'exemple
            }).length;
            statsCards[1].querySelector('h3').textContent = newPatientsCount;
        }
    }

    // Configuration des écouteurs d'événements
    function setupEventListeners() {
        // Recherche de patients
        if (searchForm) {
            searchForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const searchTerm = searchInput.value.toLowerCase().trim();
                if (searchTerm === '') {
                    displayPatients(patients);
                    return;
                }
                
                const filteredPatients = patients.filter(patient => 
                    patient.id.toLowerCase().includes(searchTerm) || 
                    patient.nom.toLowerCase().includes(searchTerm) ||
                    patient.dateNaissance.toLowerCase().includes(searchTerm) ||
                    patient.typeDialyse.toLowerCase().includes(searchTerm) ||
                    (patient.telephone && patient.telephone.toLowerCase().includes(searchTerm)) ||
                    (patient.email && patient.email.toLowerCase().includes(searchTerm)) ||
                    (patient.allergies && patient.allergies.toLowerCase().includes(searchTerm)) ||
                    (patient.antecedents && patient.antecedents.toLowerCase().includes(searchTerm)) ||
                    (patient.groupeSanguin && patient.groupeSanguin.toLowerCase().includes(searchTerm)) ||
                    (patient.adresse && patient.adresse.toLowerCase().includes(searchTerm))
                );
                
                displayPatients(filteredPatients);
                
                if (filteredPatients.length === 0) {
                    showNotification('Aucun patient ne correspond à votre recherche', 'info');
                } else if (filteredPatients.length === 1) {
                    showNotification(`1 patient trouvé`, 'success');
                } else {
                    showNotification(`${filteredPatients.length} patients trouvés`, 'success');
                }
            });}
            
            // Recherche en temps réel
            searchInput.addEventListener('input', function() {
                const searchTerm = searchInput.value.toLowerCase().trim();
                if (searchTerm === '') {
                    displayPatients(patients);
                    return;
                }
                
                if (searchTerm.length >= 2) { // Recherche à partir de 2 caractères
                    const filteredPatients = patients.filter(patient => 
                        patient.id.toLowerCase().includes(searchTerm) || 
                        patient.nom.toLowerCase().includes(searchTerm) ||
                        patient.dateNaissance.toLowerCase().includes(searchTerm) ||
                        patient.typeDialyse.toLowerCase().includes(searchTerm)
                    );
                    displayPatients(filteredPatients);
                }
            });
        }

        // Ajout d'un nouveau patient
        if (addPatientBtn) {
            addPatientBtn.addEventListener('click', function() {
                showPatientModal();
            });
        }

        // Délégation d'événements pour les boutons d'action des patients
        if (patientList) {
            patientList.addEventListener('click', function(e) {
                const target = e.target.closest('button');
                if (!target) return;

                const patientItem = target.closest('.patient-item');
                const patientId = patientItem.querySelector('div:first-child').textContent;
                const patient = patients.find(p => p.id === patientId);
                
                if (!patient) {
                    showNotification('Patient non trouvé', 'error');
                    return;
                }

                if (target.classList.contains('view-btn')) {
                    viewPatient(patient);
                } else if (target.classList.contains('edit-btn')) {
                    editPatient(patient);
                } else if (target.classList.contains('delete-btn')) {
                    deletePatient(patient);
                }
            });
        }
    }

    // Affichage de la liste des patients
    function displayPatients(patientsList) {
        // Conserver l'en-tête de la liste
        const header = patientList.querySelector('.patient-list-header');
        patientList.innerHTML = '';
        patientList.appendChild(header);
        
        // Mettre à jour les statistiques
        updatePatientStats(patientsList);

        if (patientsList.length === 0) {
            const noResults = document.createElement('div');
            noResults.className = 'patient-item';
            noResults.innerHTML = '<div colspan="6" style="text-align: center; grid-column: 1 / -1; padding: 2rem;">Aucun patient trouvé</div>';
            patientList.appendChild(noResults);
            return;
        }

        patientsList.forEach(patient => {
            const patientItem = document.createElement('div');
            patientItem.className = 'patient-item';
            patientItem.innerHTML = `
                <div>${patient.id}</div>
                <div>${patient.nom}</div>
                <div>${patient.dateNaissance}</div>
                <div>${patient.typeDialyse}</div>
                <div>${patient.derniereSeance}</div>
                <div class="patient-actions">
                    <button class="view-btn"><i class="fas fa-eye"></i></button>
                    <button class="edit-btn"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn"><i class="fas fa-trash"></i></button>
                </div>
            `;
            patientList.appendChild(patientItem);
        });
    }

    // Fonction pour générer un nouvel ID de patient
    function generatePatientId() {
        // Trouver le numéro le plus élevé et ajouter 1
        let maxNum = 0;
        patients.forEach(patient => {
            const num = parseInt(patient.id.split('-')[1]);
            if (num > maxNum) maxNum = num;
        });
        return 'P-' + (maxNum + 1).toString().padStart(3, '0');
    }
    
    // Fonction pour éditer un patient existant
    function editPatient(patient) {
        // Afficher le modal avec les informations du patient
        showPatientModal(patient);
    }
    
    // Fonction pour supprimer un patient
    function deletePatient(patient) {
        // Création d'une boîte de dialogue de confirmation
        const confirmDelete = confirm(`Êtes-vous sûr de vouloir supprimer le patient ${patient.nom} ?`);
        
        if (confirmDelete) {
            try {
                // Suppression du patient du tableau
                const index = patients.findIndex(p => p.id === patient.id);
                if (index !== -1) {
                    patients.splice(index, 1);
                    
                    // Sauvegarde dans le localStorage
                    savePatients();
                    
                    // Mise à jour de l'affichage
                    displayPatients(patients);
                    
                    // Notification de succès
                    showNotification(`Le patient ${patient.nom} a été supprimé avec succès`, 'success');
                }
            } catch (error) {
                console.error("Erreur lors de la suppression du patient:", error);
                showNotification(`Erreur lors de la suppression du patient: ${error.message}`, 'error');
            }
        }
    }
    
    // Affichage du modal pour ajouter/modifier un patient
    function showPatientModal(patient = null) {
        // Création du modal s'il n'existe pas déjà
        let modal = document.getElementById('patient-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'patient-modal';
            modal.className = 'modal';
            document.body.appendChild(modal);
        }

        const isEdit = patient !== null;
        const title = isEdit ? 'Modifier le patient' : 'Ajouter un nouveau patient';

        // Ajout de styles spécifiques pour le formulaire
        const style = document.createElement('style');
        style.textContent = `
            .form-group {
                margin-bottom: 1rem;
            }
            .form-group label {
                display: block;
                margin-bottom: 0.5rem;
                font-weight: 500;
            }
            .form-group input, .form-group select, .form-group textarea {
                width: 100%;
                padding: 0.8rem;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 1rem;
                transition: border-color 0.3s;
            }
            .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
                border-color: #2c73d2;
                outline: none;
                box-shadow: 0 0 0 2px rgba(44, 115, 210, 0.2);
            }
            .form-group small {
                display: block;
                margin-top: 0.25rem;
                color: #666;
            }
            .form-group.error input, .form-group.error select, .form-group.error textarea {
                border-color: #ff4d4d;
            }
            .form-group.error small {
                color: #ff4d4d;
            }
            .form-group.success input, .form-group.success select {
                border-color: #4CAF50;
            }
            .form-actions {
                display: flex;
                justify-content: flex-end;
                gap: 1rem;
                margin-top: 2rem;
            }
            .form-actions button {
                padding: 0.8rem 1.5rem;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-weight: 500;
                transition: background-color 0.3s;
            }
            .cancel-btn {
                background-color: #f0f0f0;
                color: #333;
            }
            .cancel-btn:hover {
                background-color: #e0e0e0;
            }
            .save-btn {
                background-color: #4CAF50;
                color: white;
            }
            .save-btn:hover {
                background-color: #3e8e41;
            }
            .modal-content {
                max-width: 600px;
                transition: transform 0.3s, opacity 0.3s;
                transform: translateY(-20px);
                opacity: 0;
            }
            .form-tabs {
                display: flex;
                margin-bottom: 1.5rem;
                border-bottom: 1px solid #ddd;
            }
            .form-tab {
                padding: 0.8rem 1.2rem;
                cursor: pointer;
                border-bottom: 2px solid transparent;
                transition: all 0.3s;
            }
            .form-tab.active {
                border-bottom-color: #2c73d2;
                color: #2c73d2;
                font-weight: 500;
            }
            .form-section {
                display: none;
            }
            .form-section.active {
                display: block;
                animation: fadeIn 0.3s;
            }
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
        `;
        document.head.appendChild(style);

        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${title}</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="patient-form">
                        <div class="form-tabs">
                            <div class="form-tab active" data-tab="info-base">Informations de base</div>
                            <div class="form-tab" data-tab="info-contact">Contact</div>
                            <div class="form-tab" data-tab="info-medical">Informations médicales</div>
                        </div>
                        
                        <div class="form-section active" id="info-base">
                            <div class="form-group">
                                <label for="patient-id">ID</label>
                                <input type="text" id="patient-id" ${isEdit ? 'readonly' : ''} value="${isEdit ? patient.id : generatePatientId()}">
                            </div>
                            <div class="form-group">
                                <label for="patient-nom">Nom complet</label>
                                <input type="text" id="patient-nom" required value="${isEdit ? patient.nom : ''}">
                                <small>Prénom et nom du patient</small>
                            </div>
                            <div class="form-group">
                                <label for="patient-date">Date de naissance</label>
                                <input type="text" id="patient-date" placeholder="JJ/MM/AAAA" pattern="\d{2}/\d{2}/\d{4}" required value="${isEdit ? patient.dateNaissance : ''}">
                                <small>Format: JJ/MM/AAAA</small>
                            </div>
                            <div class="form-group">
                                <label for="patient-type">Type de dialyse</label>
                                <select id="patient-type" required>
                                    <option value="Hémodialyse" ${isEdit && patient.typeDialyse === 'Hémodialyse' ? 'selected' : ''}>Hémodialyse</option>
                                    <option value="Dialyse péritonéale" ${isEdit && patient.typeDialyse === 'Dialyse péritonéale' ? 'selected' : ''}>Dialyse péritonéale</option>
                                    <option value="Hémofiltration" ${isEdit && patient.typeDialyse === 'Hémofiltration' ? 'selected' : ''}>Hémofiltration</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-section" id="info-contact">
                            <div class="form-group">
                                <label for="patient-adresse">Adresse</label>
                                <input type="text" id="patient-adresse" value="${isEdit ? patient.adresse : ''}">
                            </div>
                            <div class="form-group">
                                <label for="patient-telephone">Téléphone</label>
                                <input type="text" id="patient-telephone" pattern="\d{2}\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}" value="${isEdit ? patient.telephone : ''}">
                                <small>Format: 01 23 45 67 89</small>
                            </div>
                            <div class="form-group">
                                <label for="patient-email">Email</label>
                                <input type="email" id="patient-email" value="${isEdit ? patient.email : ''}">
                                <small>Exemple: patient@email.com</small>
                            </div>
                        </div>
                        
                        <div class="form-section" id="info-medical">
                            <div class="form-group">
                                <label for="patient-groupe">Groupe sanguin</label>
                                <select id="patient-groupe">
                                    <option value="">Sélectionner un groupe sanguin</option>
                                    <option value="A+" ${isEdit && patient.groupeSanguin === 'A+' ? 'selected' : ''}>A+</option>
                                    <option value="A-" ${isEdit && patient.groupeSanguin === 'A-' ? 'selected' : ''}>A-</option>
                                    <option value="B+" ${isEdit && patient.groupeSanguin === 'B+' ? 'selected' : ''}>B+</option>
                                    <option value="B-" ${isEdit && patient.groupeSanguin === 'B-' ? 'selected' : ''}>B-</option>
                                    <option value="AB+" ${isEdit && patient.groupeSanguin === 'AB+' ? 'selected' : ''}>AB+</option>
                                    <option value="AB-" ${isEdit && patient.groupeSanguin === 'AB-' ? 'selected' : ''}>AB-</option>
                                    <option value="O+" ${isEdit && patient.groupeSanguin === 'O+' ? 'selected' : ''}>O+</option>
                                    <option value="O-" ${isEdit && patient.groupeSanguin === 'O-' ? 'selected' : ''}>O-</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="patient-allergies">Allergies</label>
                                <input type="text" id="patient-allergies" value="${isEdit ? patient.allergies : ''}">
                                <small>Séparer les allergies par des virgules</small>
                            </div>
                            <div class="form-group">
                                <label for="patient-antecedents">Antécédents médicaux</label>
                                <textarea id="patient-antecedents" rows="4">${isEdit ? patient.antecedents : ''}</textarea>
                            </div>
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" class="cancel-btn">Annuler</button>
                            <button type="submit" class="save-btn">${isEdit ? 'Mettre à jour' : 'Ajouter'}</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        // Afficher le modal avec animation
        modal.style.display = 'block';
        setTimeout(() => {
            modal.querySelector('.modal-content').style.transform = 'translateY(0)';
            modal.querySelector('.modal-content').style.opacity = '1';
        }, 10);

        // Gestion des onglets du formulaire
        const formTabs = modal.querySelectorAll('.form-tab');
        formTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                // Désactiver tous les onglets et sections
                formTabs.forEach(t => t.classList.remove('active'));
                modal.querySelectorAll('.form-section').forEach(section => section.classList.remove('active'));
                
                // Activer l'onglet cliqué et sa section
                this.classList.add('active');
                const tabId = this.getAttribute('data-tab');
                document.getElementById(tabId).classList.add('active');
            });
        });

        // Validation en temps réel des champs
        const nomInput = document.getElementById('patient-nom');
        const dateInput = document.getElementById('patient-date');
        const telephoneInput = document.getElementById('patient-telephone');
        const emailInput = document.getElementById('patient-email');

        // Validation du nom
        nomInput.addEventListener('input', function() {
            const formGroup = this.closest('.form-group');
            if (this.value.trim().length < 3) {
                formGroup.classList.add('error');
                formGroup.classList.remove('success');
                formGroup.querySelector('small').textContent = 'Le nom doit contenir au moins 3 caractères';
            } else {
                formGroup.classList.remove('error');
                formGroup.classList.add('success');
                formGroup.querySelector('small').textContent = 'Prénom et nom du patient';
            }
        });

        // Validation de la date
        dateInput.addEventListener('input', function() {
            const formGroup = this.closest('.form-group');
            const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
            if (!dateRegex.test(this.value)) {
                formGroup.classList.add('error');
                formGroup.classList.remove('success');
                formGroup.querySelector('small').textContent = 'Format invalide. Utilisez JJ/MM/AAAA';
            } else {
                formGroup.classList.remove('error');
                formGroup.classList.add('success');
                formGroup.querySelector('small').textContent = 'Format: JJ/MM/AAAA';
            }
        });

        // Validation du téléphone
        if (telephoneInput) {
            telephoneInput.addEventListener('input', function() {
                const formGroup = this.closest('.form-group');
                if (this.value && !/^\d{2}\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}$/.test(this.value)) {
                    formGroup.classList.add('error');
                    formGroup.classList.remove('success');
                    formGroup.querySelector('small').textContent = 'Format invalide. Utilisez 01 23 45 67 89';
                } else {
                    formGroup.classList.remove('error');
                    if (this.value) formGroup.classList.add('success');
                    formGroup.querySelector('small').textContent = 'Format: 01 23 45 67 89';
                }
            });
        }

        // Validation de l'email
        if (emailInput) {
            emailInput.addEventListener('input', function() {
                const formGroup = this.closest('.form-group');
                if (this.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.value)) {
                    formGroup.classList.add('error');
                    formGroup.classList.remove('success');
                    formGroup.querySelector('small').textContent = 'Format d\'email invalide';
                } else {
                    formGroup.classList.remove('error');
                    if (this.value) formGroup.classList.add('success');
                    formGroup.querySelector('small').textContent = 'Exemple: patient@email.com';
                }
            });
        }

        // Gestion de la fermeture du modal
        const closeBtn = modal.querySelector('.close-modal');
        const cancelBtn = modal.querySelector('.cancel-btn');
        const form = modal.querySelector('#patient-form');

        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        cancelBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        // Fermer le modal si on clique en dehors
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });

        // Gestion de la soumission du formulaire
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Validation du formulaire
            const nom = document.getElementById('patient-nom').value.trim();
            const dateNaissance = document.getElementById('patient-date').value.trim();
            const email = document.getElementById('patient-email').value.trim();
            
            // Validation du nom
            if (nom.length < 3) {
                showNotification('Le nom doit contenir au moins 3 caractères', 'error');
                return;
            }
            
            // Validation de la date de naissance
            const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
            if (!dateRegex.test(dateNaissance)) {
                showNotification('Format de date invalide. Utilisez JJ/MM/AAAA', 'error');
                return;
            }
            
            // Validation de l'email si fourni
            if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                showNotification('Format d\'email invalide', 'error');
                return;
            }
            
            // Validation du téléphone si fourni
            const telephone = document.getElementById('patient-telephone').value.trim();
            if (telephone && !/^\d{2}\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}$/.test(telephone)) {
                showNotification('Format de téléphone invalide. Utilisez 01 23 45 67 89', 'error');
                return;
            }
            
            const newPatient = {
                id: document.getElementById('patient-id').value,
                nom: nom,
                dateNaissance: dateNaissance,
                typeDialyse: document.getElementById('patient-type').value,
                derniereSeance: isEdit ? patient.derniereSeance : new Date().toLocaleDateString('fr-FR'),
                adresse: document.getElementById('patient-adresse').value.trim(),
                telephone: telephone,
                email: email,
                groupeSanguin: document.getElementById('patient-groupe').value,
                allergies: document.getElementById('patient-allergies').value.trim(),
                antecedents: document.getElementById('patient-antecedents').value.trim()
            };

            try {
                if (isEdit) {
                    // Mise à jour du patient existant
                    const index = patients.findIndex(p => p.id === patient.id);
                    if (index !== -1) {
                        patients[index] = newPatient;
                        showNotification(`Le patient ${newPatient.nom} a été mis à jour avec succès`, 'success');
                    } else {
                        throw new Error("Patient non trouvé");
                    }
                } else {
                    // Ajout d'un nouveau patient
                    patients.push(newPatient);
                    showNotification(`Le patient ${newPatient.nom} a été ajouté avec succès`, 'success');
                }
                
                // Sauvegarder dans le localStorage
                savePatients();

                // Rafraîchir l'affichage et fermer le modal
                displayPatients(patients);
                modal.style.display = 'none';
            } catch (error) {
                console.error("Erreur lors de l'enregistrement du patient:", error);
                showNotification(`Erreur: ${error.message}`, 'error');
            }
            
            // Le modal est déjà fermé et les données sont sauvegardées dans le bloc try/catch précédent
        });
    }

    // Affichage des détails d'un patient
    function viewPatient(patient) {
        let modal = document.getElementById('view-patient-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'view-patient-modal';
            modal.className = 'modal';
            document.body.appendChild(modal);
        }

        // Formatage des données pour l'affichage
        const allergiesText = patient.allergies ? patient.allergies : 'Aucune allergie connue';
        const antecedentsText = patient.antecedents ? patient.antecedents : 'Aucun antécédent renseigné';
        const adresseText = patient.adresse ? patient.adresse : 'Non renseignée';
        const telephoneText = patient.telephone ? patient.telephone : 'Non renseigné';
        const emailText = patient.email ? patient.email : 'Non renseigné';
        const groupeSanguinText = patient.groupeSanguin ? patient.groupeSanguin : 'Non renseigné';

        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Détails du patient</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="patient-details">
                        <div class="patient-info">
                            <h3>${patient.nom} <span class="patient-id">(${patient.id})</span></h3>
                            <div class="info-grid">
                                <div class="info-group">
                                    <p><strong>Date de naissance:</strong> ${patient.dateNaissance}</p>
                                    <p><strong>Type de dialyse:</strong> ${patient.typeDialyse}</p>
                                    <p><strong>Dernière séance:</strong> ${patient.derniereSeance}</p>
                                    <p><strong>Groupe sanguin:</strong> ${groupeSanguinText}</p>
                                </div>
                                <div class="info-group">
                                    <p><strong>Adresse:</strong> ${adresseText}</p>
                                    <p><strong>Téléphone:</strong> ${telephoneText}</p>
                                    <p><strong>Email:</strong> ${emailText}</p>
                                </div>
                            </div>
                            <div class="medical-info">
                                <h4>Informations médicales</h4>
                                <p><strong>Allergies:</strong> ${allergiesText}</p>
                                <p><strong>Antécédents médicaux:</strong> ${antecedentsText}</p>
                            </div>
                        </div>
                        <div class="patient-actions-detail">
                            <button class="edit-patient-btn"><i class="fas fa-edit"></i> Modifier</button>
                            <button class="schedule-btn"><i class="fas fa-calendar-plus"></i> Planifier une séance</button>
                            <button class="medical-record-btn"><i class="fas fa-file-medical"></i> Dossier médical</button>
                            <button class="print-btn"><i class="fas fa-print"></i> Imprimer la fiche</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Ajouter des styles spécifiques pour la vue détaillée
        const style = document.createElement('style');
        style.textContent = `
            .info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 1rem;
                margin: 1rem 0;
            }
            .medical-info {
                margin-top: 1.5rem;
                padding-top: 1rem;
                border-top: 1px solid #eee;
            }
            .medical-info h4 {
                margin-bottom: 0.5rem;
                color: #2c73d2;
            }
            .patient-actions-detail {
                display: flex;
                flex-wrap: wrap;
                gap: 0.5rem;
                margin-top: 1.5rem;
                padding-top: 1rem;
                border-top: 1px solid #eee;
            }
            .patient-actions-detail button {
                padding: 0.5rem 1rem;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                transition: background-color 0.2s;
            }
            .edit-patient-btn {
                background-color: #ffa500;
                color: white;
            }
            .schedule-btn {
                background-color: #2c73d2;
                color: white;
            }
            .medical-record-btn {
                background-color: #4CAF50;
                color: white;
            }
            .print-btn {
                background-color: #6c757d;
                color: white;
            }
            .patient-actions-detail button:hover {
                opacity: 0.9;
            }
        `;
        document.head.appendChild(style);

        // Afficher le modal avec animation
        modal.style.display = 'block';
        setTimeout(() => {
            modal.querySelector('.modal-content').style.transform = 'translateY(0)';
            modal.querySelector('.modal-content').style.opacity = '1';
        }, 10);

        // Gestion de la fermeture du modal
        const closeBtn = modal.querySelector('.close-modal');
        closeBtn.addEventListener('click', () => {
            closePatientModal(modal);
        });

        // Fermer le modal si on clique en dehors
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                closePatientModal(modal);
            }
        });

        // Bouton de modification
        const editBtn = modal.querySelector('.edit-patient-btn');
        editBtn.addEventListener('click', () => {
            closePatientModal(modal);
            editPatient(patient);
        });

        // Bouton de planification
        const scheduleBtn = modal.querySelector('.schedule-btn');
        scheduleBtn.addEventListener('click', () => {
            showNotification(`Planification d'une séance pour ${patient.nom}`, 'info');
            // Redirection vers la page de planning avec l'ID du patient
            setTimeout(() => {
                window.location.href = `planning.html?patientId=${patient.id}&patientName=${encodeURIComponent(patient.nom)}`;
            }, 1500);
        });

        // Bouton de dossier médical
        const medicalBtn = modal.querySelector('.medical-record-btn');
        medicalBtn.addEventListener('click', () => {
            openMedicalRecord(patient);
        });

        // Bouton d'impression
        const printBtn = modal.querySelector('.print-btn');
        printBtn.addEventListener('click', () => {
            printPatientInfo(patient);
        });
    }

    // Fonction pour fermer le modal avec animation
    function closePatientModal(modal) {
        modal.querySelector('.modal-content').style.transform = 'translateY(-20px)';
        modal.querySelector('.modal-content').style.opacity = '0';
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }

    // Fonction pour imprimer les informations du patient
    function printPatientInfo(patient) {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Fiche Patient - ${patient.nom}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .header { text-align: center; margin-bottom: 20px; }
                    .patient-info { margin-bottom: 20px; }
                    .patient-info h2 { color: #2c73d2; }
                    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
                    .medical-info { margin-top: 20px; border-top: 1px solid #ccc; padding-top: 10px; }
                    .footer { margin-top: 30px; font-size: 12px; text-align: center; color: #666; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>NephroSys - Fiche Patient</h1>
                </div>
                <div class="patient-info">
                    <h2>${patient.nom} (${patient.id})</h2>
                    <div class="info-grid">
                        <div>
                            <p><strong>Date de naissance:</strong> ${patient.dateNaissance}</p>
                            <p><strong>Type de dialyse:</strong> ${patient.typeDialyse}</p>
                            <p><strong>Dernière séance:</strong> ${patient.derniereSeance}</p>
                            <p><strong>Groupe sanguin:</strong> ${patient.groupeSanguin || 'Non renseigné'}</p>
                        </div>
                        <div>
                            <p><strong>Adresse:</strong> ${patient.adresse || 'Non renseignée'}</p>
                            <p><strong>Téléphone:</strong> ${patient.telephone || 'Non renseigné'}</p>
                            <p><strong>Email:</strong> ${patient.email || 'Non renseigné'}</p>
                        </div>
                    </div>
                    <div class="medical-info">
                        <h3>Informations médicales</h3>
                        <p><strong>Allergies:</strong> ${patient.allergies || 'Aucune allergie connue'}</p>
                        <p><strong>Antécédents médicaux:</strong> ${patient.antecedents || 'Aucun antécédent renseigné'}</p>
                    </div>
                </div>
                <div class="footer">
                    <p>Document généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
                    <p>NephroSys - Système de gestion de centre de dialyse</p>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
        setTimeout(() => {
            printWindow.print();
        }, 500);
    }

    // Modification d'un patient
    function editPatient(patient) {
        showPatientModal(patient);
    }

    // Suppression d'un patient
    function deletePatient(patient) {
        // Création d'un modal de confirmation personnalisé
        let confirmModal = document.getElementById('confirm-delete-modal');
        if (!confirmModal) {
            confirmModal = document.createElement('div');
            confirmModal.id = 'confirm-delete-modal';
            confirmModal.className = 'modal';
            document.body.appendChild(confirmModal);
        }

        confirmModal.innerHTML = `
            <div class="modal-content" style="max-width: 400px;">
                <div class="modal-header">
                    <h2>Confirmation de suppression</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="confirm-message">
                        <i class="fas fa-exclamation-triangle" style="color: #ff4d4d; font-size: 2rem; margin-bottom: 1rem;"></i>
                        <p>Êtes-vous sûr de vouloir supprimer le patient <strong>${patient.nom}</strong> ?</p>
                        <p style="color: #666; margin-top: 0.5rem;">Cette action est irréversible.</p>
                    </div>
                    <div class="confirm-actions" style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem;">
                        <button class="cancel-btn" style="padding: 0.6rem 1.2rem; border: none; border-radius: 4px; cursor: pointer; background-color: #f0f0f0;">Annuler</button>
                        <button class="confirm-btn" style="padding: 0.6rem 1.2rem; border: none; border-radius: 4px; cursor: pointer; background-color: #ff4d4d; color: white;">Supprimer</button>
                    </div>
                </div>
            </div>
        `;

        // Afficher le modal avec animation
        confirmModal.style.display = 'block';
        setTimeout(() => {
            confirmModal.querySelector('.modal-content').style.transform = 'translateY(0)';
            confirmModal.querySelector('.modal-content').style.opacity = '1';
        }, 10);

        // Gestion de la fermeture du modal
        const closeBtn = confirmModal.querySelector('.close-modal');
        const cancelBtn = confirmModal.querySelector('.cancel-btn');
        const confirmBtn = confirmModal.querySelector('.confirm-btn');

        function closeConfirmModal() {
            confirmModal.querySelector('.modal-content').style.transform = 'translateY(-20px)';
            confirmModal.querySelector('.modal-content').style.opacity = '0';
            setTimeout(() => {
                confirmModal.style.display = 'none';
            }, 300);
        }

        closeBtn.addEventListener('click', closeConfirmModal);
        cancelBtn.addEventListener('click', closeConfirmModal);

        // Fermer le modal si on clique en dehors
        window.addEventListener('click', (e) => {
            if (e.target === confirmModal) {
                closeConfirmModal();
            }
        });

        // Action de suppression
        confirmBtn.addEventListener('click', () => {
            try {
                // Animation de suppression
                const patientItem = document.querySelector(`.patient-item div:first-child:contains('${patient.id}')`).closest('.patient-item');
                if (patientItem) {
                    patientItem.style.transition = 'all 0.3s';
                    patientItem.style.backgroundColor = '#ffebeb';
                    patientItem.style.opacity = '0';
                    patientItem.style.transform = 'translateX(20px)';
                }

                // Suppression du patient du tableau après un court délai pour l'animation
                setTimeout(() => {
                    const index = patients.findIndex(p => p.id === patient.id);
                    if (index !== -1) {
                        patients.splice(index, 1);
                        
                        // Sauvegarde dans le localStorage
                        savePatients();
                        
                        // Mise à jour de l'affichage
                        displayPatients(patients);
                        
                        // Notification de succès
                        showNotification(`Le patient ${patient.nom} a été supprimé avec succès`, 'success');
                    }
                }, 300);

                // Fermer le modal
                closeConfirmModal();
            } catch (error) {
                console.error("Erreur lors de la suppression du patient:", error);
                showNotification(`Erreur lors de la suppression du patient: ${error.message}`, 'error');
                closeConfirmModal();
            }
        });
    }
    
    // Affichage du dossier médical d'un patient
    function openMedicalRecord(patient) {
        // Redirection vers la page de suivi médical avec l'ID du patient
        window.location.href = `medical.html?patientId=${patient.id}&patientName=${encodeURIComponent(patient.nom)}`;
    }
    
    // Affichage d'une notification
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="close-notification">&times;</button>
        `;
        
        document.body.appendChild(notification);
        
        // Animation d'entrée
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Fermeture automatique après 5 secondes
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 5000);
        
        // Fermeture manuelle
        const closeBtn = notification.querySelector('.close-notification');
        closeBtn.addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        });
    }
});

// Ajout des styles CSS pour les modals et notifications
document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.textContent = `
        /* Styles pour les notifications */
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            padding: 1rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            z-index: 1100;
            max-width: 400px;
            transform: translateX(120%);
            transition: transform 0.3s ease;
        }
        
        .notification.show {
            transform: translateX(0);
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            gap: 0.8rem;
        }
        
        .notification.success {
            border-left: 4px solid #4CAF50;
        }
        
        .notification.success i {
            color: #4CAF50;
        }
        
        .notification.error {
            border-left: 4px solid #ff4d4d;
        }
        
        .notification.error i {
            color: #ff4d4d;
        }
        
        .notification.info {
            border-left: 4px solid #2c73d2;
        }
        
        .notification.info i {
            color: #2c73d2;
        }
        
        .close-notification {
            background: transparent;
            border: none;
            font-size: 1.2rem;
            cursor: pointer;
            color: #666;
            margin-left: 1rem;
        }
        
        .modal {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            overflow: auto;
        }
        
        .modal-content {
            background-color: white;
            margin: 5% auto;
            padding: 0;
            width: 70%;
            max-width: 800px;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
            animation: modalFadeIn 0.3s;
        }
        
        @keyframes modalFadeIn {
            from { opacity: 0; transform: translateY(-50px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem 1.5rem;
            background-color: #f0f5ff;
            border-bottom: 1px solid #ddd;
            border-top-left-radius: 8px;
            border-top-right-radius: 8px;
        }
        
        .modal-header h2 {
            margin: 0;
            color: #2c73d2;
        }
        
        .close-modal {
            background: transparent;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: #666;
        }
        
        .modal-body {
            padding: 1.5rem;
        }
        
        .form-group {
            margin-bottom: 1rem;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
        }
        
        .form-group input, .form-group select, .form-group textarea {
            width: 100%;
            padding: 0.8rem;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 1rem;
        }
        
        .form-group textarea {
            height: 100px;
            resize: vertical;
        }
        
        .form-actions {
            display: flex;
            justify-content: flex-end;
            gap: 1rem;
            margin-top: 1.5rem;
        }
        
        .form-actions button {
            padding: 0.8rem 1.5rem;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 500;
        }
        
        .cancel-btn {
            background-color: #f0f0f0;
            border: 1px solid #ddd;
            color: #666;
        }
        
        .save-btn {
            background-color: #4CAF50;
            border: none;
            color: white;
        }
        
        .patient-details {
            display: flex;
            flex-wrap: wrap;
            gap: 2rem;
        }
        
        .patient-info {
            flex: 1;
            min-width: 300px;
        }
        
        .patient-info h3 {
            color: #2c73d2;
            margin-bottom: 1rem;
        }
        
        .patient-id {
            color: #666;
            font-weight: normal;
            font-size: 0.9rem;
        }
        
        .patient-info p {
            margin-bottom: 0.8rem;
        }
        
        .patient-actions-detail {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            min-width: 200px;
        }
        
        .patient-actions-detail button {
            padding: 0.8rem 1rem;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            border: none;
        }
        
        .edit-patient-btn {
            background-color: #ffa500;
            color: white;
        }
        
        .schedule-btn {
            background-color: #2c73d2;
            color: white;
        }
        
        .medical-record-btn {
            background-color: #4CAF50;
            color: white;
        }
    `;
    document.head.appendChild(style);
});