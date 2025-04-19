// Script pour la gestion biomédicale - NephroSys

document.addEventListener('DOMContentLoaded', function() {
    // Vérifier si l'utilisateur est connecté
    const isLoggedIn = checkLoginStatus();
    
    if (!isLoggedIn) {
        showLoginModal();
    }
    // Données de test pour les machines et intégrations (à remplacer par une API ou une base de données)
    const biomedicalData = {
        machines: [
            {
                id: 'MD-001',
                name: 'Fresenius 5008',
                location: 'Salle A1',
                status: 'online',
                lastUsed: 'Aujourd\'hui, 10:30',
                hoursUsed: 1245,
                nextMaintenance: '15/08/2023'
            },
            {
                id: 'MD-002',
                name: 'Nikkiso DBB-07',
                location: 'Salle A2',
                status: 'offline',
                lastUsed: 'Hier, 16:45',
                hoursUsed: 876,
                nextMaintenance: '05/08/2023'
            },
            {
                id: 'MD-003',
                name: 'B. Braun Dialog+',
                location: 'Salle B1',
                status: 'maintenance',
                lastUsed: '10/07/2023',
                hoursUsed: 1532,
                nextMaintenance: 'En cours'
            },
            {
                id: 'MD-004',
                name: 'Fresenius 4008S',
                location: 'Salle B2',
                status: 'online',
                lastUsed: 'Aujourd\'hui, 09:15',
                hoursUsed: 2145,
                nextMaintenance: '20/08/2023'
            }
        ],
        integrations: [
            {
                id: 'INT-001',
                name: 'Intégration HL7',
                status: 'active',
                lastExchange: 'Aujourd\'hui, 11:23',
                exchangeCount: 1245
            },
            {
                id: 'INT-002',
                name: 'Intégration FHIR',
                status: 'active',
                lastExchange: 'Aujourd\'hui, 10:45',
                exchangeCount: 876
            },
            {
                id: 'INT-003',
                name: 'Intégration DICOM',
                status: 'inactive',
                lastExchange: 'Jamais',
                exchangeCount: 0
            }
        ],
        logs: [
            {
                date: '15/07/2023 11:23',
                equipment: 'Fresenius 5008 (MD-001)',
                event: 'Connexion établie',
                level: 'info',
                user: 'Système'
            },
            {
                date: '15/07/2023 10:45',
                equipment: 'Nikkiso DBB-07 (MD-002)',
                event: 'Déconnexion',
                level: 'warning',
                user: 'Système'
            },
            {
                date: '15/07/2023 09:30',
                equipment: 'B. Braun Dialog+ (MD-003)',
                event: 'Début de maintenance',
                level: 'info',
                user: 'Tech. Martin'
            },
            {
                date: '14/07/2023 16:45',
                equipment: 'Fresenius 4008S (MD-004)',
                event: 'Alerte pression',
                level: 'error',
                user: 'Dr. Dupont'
            },
            {
                date: '14/07/2023 15:20',
                equipment: 'Fresenius 5008 (MD-001)',
                event: 'Fin de séance',
                level: 'info',
                user: 'Inf. Dubois'
            }
        ],
        maintenance: [
            {
                date: '15/07/2023',
                equipment: 'B. Braun Dialog+ (MD-003)',
                type: 'Maintenance complète',
                technician: 'Tech. Martin',
                status: 'En cours'
            },
            {
                date: '05/08/2023',
                equipment: 'Nikkiso DBB-07 (MD-002)',
                type: 'Vérification routine',
                technician: 'Tech. Bernard',
                status: 'Planifié'
            },
            {
                date: '15/08/2023',
                equipment: 'Fresenius 5008 (MD-001)',
                type: 'Calibration',
                technician: 'Tech. Martin',
                status: 'Planifié'
            },
            {
                date: '20/08/2023',
                equipment: 'Fresenius 4008S (MD-004)',
                type: 'Maintenance complète',
                technician: 'Tech. Bernard',
                status: 'Planifié'
            },
            {
                date: '10/07/2023',
                equipment: 'Fresenius 5008 (MD-001)',
                type: 'Vérification routine',
                technician: 'Tech. Martin',
                status: 'Terminé'
            }
        ]
    };

    // Gestionnaire pour les onglets
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Désactiver tous les onglets
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Activer l'onglet cliqué
            this.classList.add('active');
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // Gestionnaire pour le bouton "Ajouter un équipement"
    document.querySelector('.biomedical-actions .primary-btn').addEventListener('click', function() {
        showAddEquipmentModal();
    });

    // Gestionnaire pour le bouton "Actualiser"
    document.querySelector('.biomedical-actions button:nth-child(2)').addEventListener('click', function() {
        refreshData();
    });

    // Gestionnaire pour le bouton "Paramètres"
    document.querySelector('.biomedical-actions button:nth-child(3)').addEventListener('click', function() {
        showSettingsModal();
    });

    // Gestionnaires pour les boutons d'action des machines
    document.querySelectorAll('.machine-actions button').forEach(button => {
        button.addEventListener('click', function() {
            const machineCard = this.closest('.machine-card');
            const machineName = machineCard.querySelector('.machine-info h3').textContent;
            const machineId = machineCard.querySelector('.machine-info p').textContent.split('ID: ')[1].split(' |')[0];
            
            if (this.innerHTML.includes('Détails')) {
                showMachineDetails(machineId, machineName);
            } else if (this.innerHTML.includes('Historique')) {
                showMachineHistory(machineId, machineName);
            }
        });
    });

    // Gestionnaires pour les boutons d'action des intégrations
    document.querySelectorAll('.integration-actions button').forEach(button => {
        button.addEventListener('click', function() {
            const integrationCard = this.closest('.integration-card');
            const integrationName = integrationCard.querySelector('h3').textContent;
            
            if (this.innerHTML.includes('Configurer')) {
                configureIntegration(integrationName);
            } else if (this.innerHTML.includes('Historique')) {
                showIntegrationHistory(integrationName);
            } else if (this.innerHTML.includes('Activer')) {
                activateIntegration(integrationName);
            }
        });
    });

    // Gestionnaires pour les boutons d'action des logs
    document.querySelector('#logs .secondary-btn:nth-child(1)').addEventListener('click', function() {
        filterLogs();
    });

    document.querySelector('#logs .secondary-btn:nth-child(2)').addEventListener('click', function() {
        exportLogs();
    });

    // Gestionnaires pour les boutons d'action de maintenance
    document.querySelector('#maintenance .primary-btn').addEventListener('click', function() {
        scheduleMaintenance();
    });

    document.querySelector('#maintenance .secondary-btn').addEventListener('click', function() {
        printMaintenanceSchedule();
    });

    // Gestionnaires pour les boutons d'action des lignes de maintenance
    document.querySelectorAll('#maintenance .logs-table button').forEach(button => {
        button.addEventListener('click', function() {
            const row = this.closest('tr');
            const equipment = row.querySelector('td:nth-child(2)').textContent;
            const date = row.querySelector('td:nth-child(1)').textContent;
            
            if (this.innerHTML.includes('fa-eye')) {
                viewMaintenanceDetails(date, equipment);
            } else if (this.innerHTML.includes('fa-edit')) {
                editMaintenance(date, equipment);
            } else if (this.innerHTML.includes('fa-file-pdf')) {
                downloadMaintenanceReport(date, equipment);
            }
        });
    });

    // Fonction pour simuler la connexion aux machines de dialyse
    function connectToMachines() {
        console.log('Tentative de connexion aux machines de dialyse...');
        
        // Afficher un indicateur de connexion
        const connectionIndicator = document.createElement('div');
        connectionIndicator.className = 'connection-indicator';
        connectionIndicator.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connexion aux machines en cours...';
        connectionIndicator.style.position = 'fixed';
        connectionIndicator.style.top = '50%';
        connectionIndicator.style.left = '50%';
        connectionIndicator.style.transform = 'translate(-50%, -50%)';
        connectionIndicator.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        connectionIndicator.style.color = 'white';
        connectionIndicator.style.padding = '1rem 2rem';
        connectionIndicator.style.borderRadius = '4px';
        connectionIndicator.style.zIndex = '1000';
        
        document.body.appendChild(connectionIndicator);
        
        // Simuler un délai de connexion
        setTimeout(() => {
            // Vérifier si l'utilisateur est connecté
            if (!checkLoginStatus()) {
                connectionIndicator.remove();
                showLoginModal('Veuillez vous connecter pour accéder aux machines de dialyse');
                return;
            }
            
            console.log('Connexion établie avec les machines disponibles');
            connectionIndicator.remove();
            updateMachineStatus();
            
            // Afficher un message de succès
            const successMessage = document.createElement('div');
            successMessage.className = 'success-message';
            successMessage.innerHTML = '<i class="fas fa-check-circle"></i> Connexion aux machines établie';
            successMessage.style.position = 'fixed';
            successMessage.style.top = '1rem';
            successMessage.style.right = '1rem';
            successMessage.style.backgroundColor = '#4CAF50';
            successMessage.style.color = 'white';
            successMessage.style.padding = '0.5rem 1rem';
            successMessage.style.borderRadius = '4px';
            successMessage.style.zIndex = '1000';
            
            document.body.appendChild(successMessage);
            
            // Supprimer le message après 3 secondes
            setTimeout(() => {
                successMessage.remove();
            }, 3000);
        }, 1500);
    }

    // Fonction pour mettre à jour le statut des machines
    function updateMachineStatus() {
        const machineCards = document.querySelectorAll('.machine-card');
        
        machineCards.forEach((card, index) => {
            const statusIndicator = card.querySelector('.machine-status');
            const machine = biomedicalData.machines[index];
            
            // Mettre à jour l'indicateur de statut
            statusIndicator.className = 'machine-status';
            statusIndicator.classList.add(`status-${machine.status}`);
            
            // Mettre à jour les informations de la machine
            card.querySelector('.machine-info h3').textContent = machine.name;
            card.querySelector('.machine-info p').textContent = `ID: ${machine.id} | Salle: ${machine.location}`;
            
            // Mettre à jour les données de la machine
            const dataItems = card.querySelectorAll('.data-item');
            dataItems[0].querySelector('.data-value').textContent = machine.lastUsed;
            dataItems[1].querySelector('.data-value').textContent = `${machine.hoursUsed} h`;
            dataItems[2].querySelector('.data-value').textContent = machine.nextMaintenance;
        });
    }

    // Fonction pour simuler l'intégration HL7/FHIR
    function initializeIntegrations() {
        console.log('Initialisation des intégrations HL7/FHIR...');
        
        // Simuler un délai d'initialisation
        setTimeout(() => {
            console.log('Intégrations HL7/FHIR initialisées');
            updateIntegrationStatus();
        }, 1000);
    }

    // Fonction pour mettre à jour le statut des intégrations
    function updateIntegrationStatus() {
        const integrationCards = document.querySelectorAll('.integration-card');
        
        integrationCards.forEach((card, index) => {
            const integration = biomedicalData.integrations[index];
            const statusIndicator = card.querySelector('.integration-status');
            
            // Mettre à jour l'indicateur de statut
            statusIndicator.className = 'integration-status';
            statusIndicator.classList.add(`status-${integration.status}`);
            statusIndicator.textContent = integration.status === 'active' ? 'Actif' : 'Inactif';
            
            // Mettre à jour les informations de l'intégration
            const dataItems = card.querySelectorAll('.data-item');
            dataItems[0].querySelector('.data-value').textContent = integration.lastExchange;
            dataItems[1].querySelector('.data-value').textContent = integration.exchangeCount;
        });
    }

    // Fonction pour actualiser les données
    function refreshData() {
        console.log('Actualisation des données...');
        
        // Afficher un indicateur de chargement
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'loading-indicator';
        loadingIndicator.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Actualisation en cours...';
        loadingIndicator.style.position = 'fixed';
        loadingIndicator.style.top = '50%';
        loadingIndicator.style.left = '50%';
        loadingIndicator.style.transform = 'translate(-50%, -50%)';
        loadingIndicator.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        loadingIndicator.style.color = 'white';
        loadingIndicator.style.padding = '1rem 2rem';
        loadingIndicator.style.borderRadius = '4px';
        loadingIndicator.style.zIndex = '1000';
        
        document.body.appendChild(loadingIndicator);
        
        // Simuler un délai d'actualisation
        setTimeout(() => {
            // Mettre à jour les données
            connectToMachines();
            initializeIntegrations();
            updateLogs();
            updateMaintenanceSchedule();
            
            // Supprimer l'indicateur de chargement
            loadingIndicator.remove();
            
            // Afficher un message de succès
            const successMessage = document.createElement('div');
            successMessage.className = 'success-message';
            successMessage.innerHTML = '<i class="fas fa-check-circle"></i> Données actualisées avec succès';
            successMessage.style.position = 'fixed';
            successMessage.style.top = '1rem';
            successMessage.style.right = '1rem';
            successMessage.style.backgroundColor = '#4CAF50';
            successMessage.style.color = 'white';
            successMessage.style.padding = '0.5rem 1rem';
            successMessage.style.borderRadius = '4px';
            successMessage.style.zIndex = '1000';
            
            document.body.appendChild(successMessage);
            
            // Supprimer le message après 3 secondes
            setTimeout(() => {
                successMessage.remove();
            }, 3000);
        }, 2000);
    }

    // Fonction pour mettre à jour les logs
    function updateLogs() {
        const logsTable = document.querySelector('#logs .logs-table tbody');
        
        // Vider le tableau
        logsTable.innerHTML = '';
        
        // Ajouter les logs
        biomedicalData.logs.forEach(log => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${log.date}</td>
                <td>${log.equipment}</td>
                <td>${log.event}</td>
                <td><span class="log-level level-${log.level}">${log.level === 'info' ? 'Info' : log.level === 'warning' ? 'Avertissement' : 'Erreur'}</span></td>
                <td>${log.user}</td>
            `;
            
            logsTable.appendChild(row);
        });
    }

    // Fonction pour mettre à jour le calendrier de maintenance
    function updateMaintenanceSchedule() {
        const maintenanceTable = document.querySelector('#maintenance .logs-table tbody');
        
        // Vider le tableau
        maintenanceTable.innerHTML = '';
        
        // Ajouter les maintenances
        biomedicalData.maintenance.forEach(maintenance => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${maintenance.date}</td>
                <td>${maintenance.equipment}</td>
                <td>${maintenance.type}</td>
                <td>${maintenance.technician}</td>
                <td><span class="log-level ${maintenance.status === 'En cours' ? 'level-warning' : maintenance.status === 'Terminé' ? 'level-info' : 'level-info'}">${maintenance.status}</span></td>
                <td>
                    <button class="secondary-btn"><i class="fas fa-eye"></i></button>
                    <button class="secondary-btn"><i class="${maintenance.status === 'Terminé' ? 'fas fa-file-pdf' : 'fas fa-edit'}"></i></button>
                </td>
            `;
            
            maintenanceTable.appendChild(row);
        });
    }

    // Fonction pour afficher les détails d'une machine
    function showMachineDetails(machineId, machineName) {
        alert(`Affichage des détails de la machine ${machineName} (${machineId})`);
        // Ici, on pourrait ouvrir un modal avec les détails de la machine
    }

    // Fonction pour afficher l'historique d'une machine
    function showMachineHistory(machineId, machineName) {
        alert(`Affichage de l'historique de la machine ${machineName} (${machineId})`);
        // Ici, on pourrait ouvrir un modal avec l'historique de la machine
    }

    // Fonction pour configurer une intégration
    function configureIntegration(integrationName) {
        alert(`Configuration de l'intégration ${integrationName}`);
        // Ici, on pourrait ouvrir un modal pour configurer l'intégration
    }

    // Fonction pour afficher l'historique d'une intégration
    function showIntegrationHistory(integrationName) {
        alert(`Affichage de l'historique de l'intégration ${integrationName}`);
        // Ici, on pourrait ouvrir un modal avec l'historique de l'intégration
    }

    // Fonction pour activer une intégration
    function activateIntegration(integrationName) {
        alert(`Activation de l'intégration ${integrationName}`);
        // Ici, on activerait l'intégration et mettrait à jour l'interface
    }

    // Fonction pour filtrer les logs
    function filterLogs() {
        alert('Filtrage des logs');
        // Ici, on pourrait ouvrir un modal pour filtrer les logs
    }

    // Fonction pour exporter les logs
    function exportLogs() {
        alert('Export des logs');
        // Ici, on pourrait déclencher le téléchargement des logs
    }

    // Fonction pour planifier une maintenance
    function scheduleMaintenance() {
        alert('Planification d\'une maintenance');
        // Ici, on pourrait ouvrir un modal pour planifier une maintenance
    }

    // Fonction pour imprimer le calendrier de maintenance
    function printMaintenanceSchedule() {
        alert('Impression du calendrier de maintenance');
        // Ici, on pourrait ouvrir la boîte de dialogue d'impression
    }

    // Fonction pour voir les détails d'une maintenance
    function viewMaintenanceDetails(date, equipment) {
        alert(`Affichage des détails de la maintenance du ${date} pour ${equipment}`);
        // Ici, on pourrait ouvrir un modal avec les détails de la maintenance
    }

    // Fonction pour modifier une maintenance
    function editMaintenance(date, equipment) {
        alert(`Modification de la maintenance du ${date} pour ${equipment}`);
        // Ici, on pourrait ouvrir un modal pour modifier la maintenance
    }

    // Fonction pour télécharger un rapport de maintenance
    function downloadMaintenanceReport(date, equipment) {
        alert(`Téléchargement du rapport de maintenance du ${date} pour ${equipment}`);
        // Ici, on pourrait déclencher le téléchargement du rapport
    }

    // Fonction pour afficher le modal d'ajout d'équipement
    function showAddEquipmentModal() {
        alert('Ajout d\'un nouvel équipement');
        // Ici, on pourrait ouvrir un modal pour ajouter un équipement
    }

    // Fonction pour afficher le modal des paramètres
    function showSettingsModal() {
        alert('Paramètres biomédicaux');
        // Ici, on pourrait ouvrir un modal pour les paramètres
    }

    // Fonction pour vérifier si l'utilisateur est connecté
    function checkLoginStatus() {
        // Vérifier si un token d'authentification existe dans le localStorage
        const authToken = localStorage.getItem('nephrosys_auth_token');
        return !!authToken; // Convertir en booléen
    }
    
    // Fonction pour afficher le modal de connexion
    function showLoginModal(message = null) {
        // Créer le modal de connexion
        const loginModal = document.createElement('div');
        loginModal.className = 'login-modal';
        loginModal.style.position = 'fixed';
        loginModal.style.top = '0';
        loginModal.style.left = '0';
        loginModal.style.width = '100%';
        loginModal.style.height = '100%';
        loginModal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        loginModal.style.display = 'flex';
        loginModal.style.justifyContent = 'center';
        loginModal.style.alignItems = 'center';
        loginModal.style.zIndex = '2000';
        
        // Contenu du modal
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        modalContent.style.backgroundColor = 'white';
        modalContent.style.padding = '2rem';
        modalContent.style.borderRadius = '8px';
        modalContent.style.width = '400px';
        modalContent.style.maxWidth = '90%';
        modalContent.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
        
        // Titre du modal
        const modalTitle = document.createElement('h2');
        modalTitle.textContent = 'Connexion NephroSys';
        modalTitle.style.marginBottom = '1.5rem';
        modalTitle.style.color = '#2c3e50';
        
        // Message d'erreur ou d'information (si présent)
        let modalMessage = null;
        if (message) {
            modalMessage = document.createElement('div');
            modalMessage.className = 'login-message';
            modalMessage.textContent = message;
            modalMessage.style.padding = '0.5rem';
            modalMessage.style.marginBottom = '1rem';
            modalMessage.style.backgroundColor = '#f8d7da';
            modalMessage.style.color = '#721c24';
            modalMessage.style.borderRadius = '4px';
        }
        
        // Formulaire de connexion
        const loginForm = document.createElement('form');
        loginForm.id = 'login-form';
        
        // Champ utilisateur
        const usernameGroup = document.createElement('div');
        usernameGroup.style.marginBottom = '1rem';
        
        const usernameLabel = document.createElement('label');
        usernameLabel.setAttribute('for', 'username');
        usernameLabel.textContent = 'Nom d\'utilisateur:';
        usernameLabel.style.display = 'block';
        usernameLabel.style.marginBottom = '0.5rem';
        
        const usernameInput = document.createElement('input');
        usernameInput.type = 'text';
        usernameInput.id = 'username';
        usernameInput.name = 'username';
        usernameInput.required = true;
        usernameInput.style.width = '100%';
        usernameInput.style.padding = '0.5rem';
        usernameInput.style.borderRadius = '4px';
        usernameInput.style.border = '1px solid #ccc';
        
        usernameGroup.appendChild(usernameLabel);
        usernameGroup.appendChild(usernameInput);
        
        // Champ mot de passe
        const passwordGroup = document.createElement('div');
        passwordGroup.style.marginBottom = '1.5rem';
        
        const passwordLabel = document.createElement('label');
        passwordLabel.setAttribute('for', 'password');
        passwordLabel.textContent = 'Mot de passe:';
        passwordLabel.style.display = 'block';
        passwordLabel.style.marginBottom = '0.5rem';
        
        const passwordInput = document.createElement('input');
        passwordInput.type = 'password';
        passwordInput.id = 'password';
        passwordInput.name = 'password';
        passwordInput.required = true;
        passwordInput.style.width = '100%';
        passwordInput.style.padding = '0.5rem';
        passwordInput.style.borderRadius = '4px';
        passwordInput.style.border = '1px solid #ccc';
        
        passwordGroup.appendChild(passwordLabel);
        passwordGroup.appendChild(passwordInput);
        
        // Bouton de connexion
        const submitButton = document.createElement('button');
        submitButton.type = 'submit';
        submitButton.textContent = 'Se connecter';
        submitButton.style.backgroundColor = '#3498db';
        submitButton.style.color = 'white';
        submitButton.style.border = 'none';
        submitButton.style.padding = '0.75rem 1.5rem';
        submitButton.style.borderRadius = '4px';
        submitButton.style.cursor = 'pointer';
        submitButton.style.width = '100%';
        submitButton.style.fontWeight = 'bold';
        
        // Assembler le formulaire
        loginForm.appendChild(usernameGroup);
        loginForm.appendChild(passwordGroup);
        loginForm.appendChild(submitButton);
        
        // Assembler le contenu du modal
        modalContent.appendChild(modalTitle);
        if (modalMessage) modalContent.appendChild(modalMessage);
        modalContent.appendChild(loginForm);
        
        // Ajouter le contenu au modal
        loginModal.appendChild(modalContent);
        
        // Ajouter le modal au document
        document.body.appendChild(loginModal);
        
        // Focus sur le champ utilisateur
        usernameInput.focus();
        
        // Gestionnaire d'événement pour la soumission du formulaire
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = usernameInput.value.trim();
            const password = passwordInput.value.trim();
            
            // Vérification simple des identifiants (à remplacer par une API réelle)
            if (username === 'admin' && password === 'admin123') {
                // Simuler un token d'authentification
                const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNjE1MjM5MDIyfQ';
                localStorage.setItem('nephrosys_auth_token', fakeToken);
                localStorage.setItem('nephrosys_user', username);
                
                // Fermer le modal
                loginModal.remove();
                
                // Mettre à jour l'interface utilisateur
                updateUserInterface();
                
                // Initialiser les connexions
                connectToMachines();
                initializeIntegrations();
            } else {
                // Afficher un message d'erreur
                if (!modalMessage) {
                    modalMessage = document.createElement('div');
                    modalMessage.className = 'login-message';
                    modalMessage.style.padding = '0.5rem';
                    modalMessage.style.marginBottom = '1rem';
                    modalMessage.style.backgroundColor = '#f8d7da';
                    modalMessage.style.color = '#721c24';
                    modalMessage.style.borderRadius = '4px';
                    modalContent.insertBefore(modalMessage, loginForm);
                }
                
                modalMessage.textContent = 'Identifiants incorrects. Veuillez réessayer.';
                
                // Effacer le mot de passe
                passwordInput.value = '';
                passwordInput.focus();
            }
        });
    }
    
    // Fonction pour mettre à jour l'interface utilisateur après connexion
    function updateUserInterface() {
        // Mettre à jour le bouton de connexion dans le menu utilisateur
        const userMenu = document.querySelector('.user-menu');
        if (userMenu) {
            userMenu.innerHTML = '';
            
            const username = localStorage.getItem('nephrosys_user') || 'Utilisateur';
            
            const userDropdown = document.createElement('div');
            userDropdown.className = 'user-dropdown';
            
            const userButton = document.createElement('button');
            userButton.innerHTML = `<i class="fas fa-user"></i> ${username}`;
            
            const dropdownContent = document.createElement('div');
            dropdownContent.className = 'dropdown-content';
            dropdownContent.style.display = 'none';
            
            const profileLink = document.createElement('a');
            profileLink.href = '#';
            profileLink.textContent = 'Mon profil';
            
            const settingsLink = document.createElement('a');
            settingsLink.href = '#';
            settingsLink.textContent = 'Paramètres';
            
            const logoutLink = document.createElement('a');
            logoutLink.href = '#';
            logoutLink.textContent = 'Déconnexion';
            
            // Gestionnaire pour la déconnexion
            logoutLink.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Supprimer les données d'authentification
                localStorage.removeItem('nephrosys_auth_token');
                localStorage.removeItem('nephrosys_user');
                
                // Recharger la page
                window.location.reload();
            });
            
            // Assembler le dropdown
            dropdownContent.appendChild(profileLink);
            dropdownContent.appendChild(settingsLink);
            dropdownContent.appendChild(logoutLink);
            
            userDropdown.appendChild(userButton);
            userDropdown.appendChild(dropdownContent);
            
            userMenu.appendChild(userDropdown);
            
            // Gestionnaire pour afficher/masquer le dropdown
            userButton.addEventListener('click', function() {
                if (dropdownContent.style.display === 'none') {
                    dropdownContent.style.display = 'block';
                } else {
                    dropdownContent.style.display = 'none';
                }
            });
            
            // Fermer le dropdown en cliquant ailleurs
            document.addEventListener('click', function(e) {
                if (!userDropdown.contains(e.target)) {
                    dropdownContent.style.display = 'none';
                }
            });
        }
    }
    
    // Initialisation
    if (checkLoginStatus()) {
        updateUserInterface();
        connectToMachines();
        initializeIntegrations();
    }
});