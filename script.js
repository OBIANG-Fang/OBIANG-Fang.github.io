// Script principal pour le site NephroSys

document.addEventListener('DOMContentLoaded', function() {
    // Animation pour les cartes de fonctionnalités
    const featureCards = document.querySelectorAll('.feature-card');
    
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(-5px)';
        });
    });

    // Gestion du bouton de connexion
    const loginButton = document.querySelector('.user-menu button');
    
    if (loginButton) {
        loginButton.addEventListener('click', function() {
            alert('Fonctionnalité de connexion à implémenter');
            // Ici, on pourrait rediriger vers une page de connexion ou afficher un modal
        });
    }

    // Gestion du bouton CTA (Call to Action)
    const ctaButton = document.querySelector('.cta-button');
    
    if (ctaButton) {
        ctaButton.addEventListener('click', function() {
            alert('Merci de votre intérêt pour NephroSys! Un conseiller vous contactera prochainement.');
            // Ici, on pourrait afficher un formulaire de contact ou rediriger vers une page de contact
        });
    }

    // Navigation responsive
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Vérifier si la page existe
            const href = this.getAttribute('href');
            const existingPages = ['index.html', 'patients.html', 'planning.html', 'medical.html', 'pharmacie.html'];
            
            // Si la page n'existe pas encore, empêcher la navigation
            if (!existingPages.includes(href) && !this.classList.contains('external-link')) {
                e.preventDefault();
                alert('Cette page est en cours de développement.');
            }
        });
    });

    // Fonction pour afficher un message de bienvenue
    function showWelcomeMessage() {
        const now = new Date();
        const hour = now.getHours();
        let greeting;

        if (hour < 12) {
            greeting = 'Bonjour';
        } else if (hour < 18) {
            greeting = 'Bon après-midi';
        } else {
            greeting = 'Bonsoir';
        }

        console.log(`${greeting} et bienvenue sur NephroSys, votre solution complète pour la gestion de centres de dialyse.`);
    }

    // Afficher le message de bienvenue dans la console
    showWelcomeMessage();
});