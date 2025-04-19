// Système d'authentification pour NephroSys

document.addEventListener('DOMContentLoaded', function() {
    // Référence aux éléments du DOM pour la connexion
    const userMenu = document.querySelector('.user-menu');
    const loginButton = userMenu ? userMenu.querySelector('button') : null;
    
    // État de l'utilisateur
    let currentUser = null;
    
    // Vérifier si l'utilisateur est déjà connecté (via localStorage)
    function checkLoginStatus() {
        const savedUser = localStorage.getItem('nephrosysUser');
        if (savedUser) {
            try {
                currentUser = JSON.parse(savedUser);
                updateUIForLoggedInUser();
            } catch (e) {
                console.error('Erreur lors de la récupération des données utilisateur:', e);
                localStorage.removeItem('nephrosysUser');
            }
        }
    }
    
    // Mettre à jour l'interface pour un utilisateur connecté
    function updateUIForLoggedInUser() {
        if (!userMenu) return;
        
        // Supprimer le bouton de connexion
        if (loginButton) {
            loginButton.remove();
        }
        
        // Créer le menu déroulant utilisateur
        const userDropdown = document.createElement('div');
        userDropdown.className = 'user-dropdown';
        
        const dropdownButton = document.createElement('button');
        dropdownButton.innerHTML = `<i class="fas fa-user-circle"></i> ${currentUser.name}`;
        
        const dropdownContent = document.createElement('div');
        dropdownContent.className = 'dropdown-content';
        dropdownContent.style.display = 'none';
        
        // Ajouter les liens du menu déroulant
        const profileLink = document.createElement('a');
        profileLink.href = '#';
        profileLink.innerHTML = '<i class="fas fa-id-card"></i> Mon profil';
        
        const settingsLink = document.createElement('a');
        settingsLink.href = '#';
        settingsLink.innerHTML = '<i class="fas fa-cog"></i> Paramètres';
        
        const logoutLink = document.createElement('a');
        logoutLink.href = '#';
        logoutLink.innerHTML = '<i class="fas fa-sign-out-alt"></i> Déconnexion';
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
        
        // Assembler le menu déroulant
        dropdownContent.appendChild(profileLink);
        dropdownContent.appendChild(settingsLink);
        dropdownContent.appendChild(logoutLink);
        
        userDropdown.appendChild(dropdownButton);
        userDropdown.appendChild(dropdownContent);
        
        // Ajouter le menu déroulant à l'interface
        userMenu.appendChild(userDropdown);
        
        // Gérer l'affichage du menu déroulant
        dropdownButton.addEventListener('click', function() {
            dropdownContent.style.display = dropdownContent.style.display === 'none' ? 'block' : 'none';
        });
        
        // Fermer le menu déroulant en cliquant ailleurs
        document.addEventListener('click', function(event) {
            if (!userDropdown.contains(event.target)) {
                dropdownContent.style.display = 'none';
            }
        });
        
        // Afficher un message de bienvenue
        showSuccessMessage(`Bienvenue, ${currentUser.name}!`);
    }
    
    // Fonction de déconnexion
    function logout() {
        localStorage.removeItem('nephrosysUser');
        currentUser = null;
        showSuccessMessage('Vous avez été déconnecté avec succès.');
        
        // Recharger la page pour réinitialiser l'interface
        setTimeout(() => {
            window.location.reload();
        }, 1500);
    }
    
    // Créer et afficher le modal de connexion
    function showLoginModal() {
        // Créer le modal
        const loginModal = document.createElement('div');
        loginModal.className = 'login-modal';
        
        // Contenu du modal
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        
        // Titre du modal
        const modalTitle = document.createElement('h2');
        modalTitle.textContent = 'Connexion à NephroSys';
        
        // Message d'erreur/succès (initialement caché)
        const loginMessage = document.createElement('div');
        loginMessage.className = 'login-message';
        loginMessage.style.display = 'none';
        
        // Formulaire de connexion
        const loginForm = document.createElement('form');
        loginForm.id = 'login-form';
        
        // Champ d'identifiant
        const usernameDiv = document.createElement('div');
        const usernameLabel = document.createElement('label');
        usernameLabel.setAttribute('for', 'username');
        usernameLabel.textContent = 'Identifiant';
        
        const usernameInput = document.createElement('input');
        usernameInput.type = 'text';
        usernameInput.id = 'username';
        usernameInput.name = 'username';
        usernameInput.required = true;
        
        usernameDiv.appendChild(usernameLabel);
        usernameDiv.appendChild(usernameInput);
        
        // Champ de mot de passe
        const passwordDiv = document.createElement('div');
        const passwordLabel = document.createElement('label');
        passwordLabel.setAttribute('for', 'password');
        passwordLabel.textContent = 'Mot de passe';
        
        const passwordInput = document.createElement('input');
        passwordInput.type = 'password';
        passwordInput.id = 'password';
        passwordInput.name = 'password';
        passwordInput.required = true;
        
        passwordDiv.appendChild(passwordLabel);
        passwordDiv.appendChild(passwordInput);
        
        // Bouton de connexion
        const submitButton = document.createElement('button');
        submitButton.type = 'submit';
        submitButton.textContent = 'Se connecter';
        
        // Assembler le formulaire
        loginForm.appendChild(usernameDiv);
        loginForm.appendChild(passwordDiv);
        loginForm.appendChild(submitButton);
        
        // Assembler le modal
        modalContent.appendChild(modalTitle);
        modalContent.appendChild(loginMessage);
        modalContent.appendChild(loginForm);
        loginModal.appendChild(modalContent);
        
        // Ajouter le modal au document
        document.body.appendChild(loginModal);
        
        // Fermer le modal en cliquant en dehors
        loginModal.addEventListener('click', function(event) {
            if (event.target === loginModal) {
                loginModal.remove();
            }
        });
        
        // Gérer la soumission du formulaire
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            // Récupérer les valeurs du formulaire
            const username = usernameInput.value.trim();
            const password = passwordInput.value.trim();
            
            // Vérifier les identifiants (à remplacer par une vérification côté serveur)
            if (authenticateUser(username, password)) {
                // Afficher un message de succès
                loginMessage.textContent = 'Connexion réussie!';
                loginMessage.className = 'login-message success';
                loginMessage.style.display = 'block';
                
                // Fermer le modal après un délai
                setTimeout(() => {
                    loginModal.remove();
                    updateUIForLoggedInUser();
                }, 1500);
            } else {
                // Afficher un message d'erreur
                loginMessage.textContent = 'Identifiant ou mot de passe incorrect.';
                loginMessage.className = 'login-message error';
                loginMessage.style.display = 'block';
            }
        });
    }
    
    // Fonction d'authentification (à remplacer par une vérification côté serveur)
    function authenticateUser(username, password) {
        // Pour la démonstration, accepter des identifiants prédéfinis
        const validCredentials = [
            { username: 'admin', password: 'admin123', name: 'Administrateur' },
            { username: 'medecin', password: 'med123', name: 'Dr. Martin' },
            { username: 'infirmier', password: 'inf123', name: 'Infirmier Dupont' }
        ];
        
        const user = validCredentials.find(u => u.username === username && u.password === password);
        
        if (user) {
            // Stocker les informations utilisateur (sans le mot de passe)
            const userInfo = {
                username: user.username,
                name: user.name,
                role: user.username // Utiliser le nom d'utilisateur comme rôle pour simplifier
            };
            
            localStorage.setItem('nephrosysUser', JSON.stringify(userInfo));
            currentUser = userInfo;
            return true;
        }
        
        return false;
    }
    
    // Afficher un message de succès temporaire
    function showSuccessMessage(message) {
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.textContent = message;
        
        document.body.appendChild(successMessage);
        
        // Supprimer le message après l'animation
        setTimeout(() => {
            successMessage.remove();
        }, 4000); // 4 secondes (3s d'animation + 1s de délai)
    }
    
    // Afficher un indicateur de connexion
    function showConnectionIndicator(message) {
        const indicator = document.createElement('div');
        indicator.className = 'connection-indicator';
        indicator.textContent = message || 'Connexion en cours...';
        
        document.body.appendChild(indicator);
        
        return indicator;
    }
    
    // Initialiser la fonctionnalité de connexion
    function initLogin() {
        // Vérifier si l'utilisateur est déjà connecté
        checkLoginStatus();
        
        // Ajouter l'événement de clic au bouton de connexion
        if (loginButton) {
            loginButton.addEventListener('click', function() {
                showLoginModal();
            });
        }
    }
    
    // Initialiser la fonctionnalité de connexion
    initLogin();
});