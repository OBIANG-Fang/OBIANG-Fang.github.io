// Script pour la gestion des statistiques et rapports - NephroSys

document.addEventListener('DOMContentLoaded', function() {
    // Initialiser les graphiques après le chargement de Chart.js
    loadChartJS().then(() => {
        renderAllCharts();
    }).catch(error => {
        console.error('Erreur lors du chargement de Chart.js:', error);
        // Afficher un message d'erreur dans les conteneurs de graphiques
        document.querySelectorAll('.chart-container').forEach(container => {
            container.innerHTML = `<div class="chart-placeholder">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Impossible de charger les graphiques. Veuillez réessayer.</p>
            </div>`;
        });
    });
    // Données de test pour les graphiques (à remplacer par une API ou une base de données)
    const statisticsData = {
        sessions: {
            monthly: [45, 52, 49, 60, 55, 58, 42, 47, 53, 58, 51, 49],
            weekdays: [42, 58, 56, 60, 45, 15, 10]
        },
        patients: {
            ageGroups: [15, 28, 35, 18, 4],
            gender: [65, 35],
            newMonthly: [4, 6, 3, 5, 7, 2, 4, 3, 5, 6, 4, 3]
        },
        incidents: {
            monthly: [5, 3, 7, 4, 6, 8, 5, 4, 6, 3, 5, 4],
            categories: [25, 15, 30, 20, 10],
            severity: [45, 35, 20]
        },
        consumption: {
            categories: [40, 25, 20, 15],
            monthlyCosts: [4500, 4800, 4200, 5100, 4700, 5300, 4900, 5000, 5200, 4800, 5100, 5400]
        }
    };
    
    // Charger Chart.js depuis CDN
    function loadChartJS() {
        return new Promise((resolve, reject) => {
            if (window.Chart) {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // Initialisation des filtres avec la date du jour
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    document.getElementById('date-from').valueAsDate = firstDayOfMonth;
    document.getElementById('date-to').valueAsDate = today;

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
            
            // Redessiner les graphiques de l'onglet actif pour s'assurer qu'ils s'affichent correctement
            renderChartsForActiveTab(tabId);
        });
    });

    // Gestionnaire pour le bouton "Nouveau rapport"
    document.querySelector('.stats-actions .primary-btn').addEventListener('click', function() {
        alert('Fonctionnalité de création de rapport à implémenter');
        // Ici, on pourrait ouvrir un modal pour créer un nouveau rapport
    });

    // Gestionnaire pour le bouton "Exporter"
    document.querySelector('.stats-actions button:nth-child(2)').addEventListener('click', function() {
        alert('Fonctionnalité d\'export à implémenter');
        // Ici, on pourrait proposer différents formats d'export (CSV, PDF, etc.)
    });

    // Gestionnaire pour le bouton "Imprimer"
    document.querySelector('.stats-actions button:nth-child(3)').addEventListener('click', function() {
        window.print();
    });

    // Gestionnaire pour le bouton "Filtrer"
    document.querySelector('.stats-filters .primary-btn').addEventListener('click', function() {
        filterReports();
        // Redessiner les graphiques avec les nouvelles dates
        renderAllCharts();
    });

    // Gestionnaires pour les boutons d'action des rapports
    document.querySelectorAll('.report-actions button').forEach(button => {
        button.addEventListener('click', function() {
            const action = this.classList[0];
            const reportItem = this.closest('.report-item');
            const reportName = reportItem.querySelector('div:first-child').textContent;
            
            switch(action) {
                case 'view-btn':
                    viewReport(reportName);
                    break;
                case 'download-btn':
                    downloadReport(reportName);
                    break;
                case 'delete-btn':
                    deleteReport(reportName);
                    break;
            }
        });
    });

    // Gestionnaires pour les boutons d'action des graphiques
    document.querySelectorAll('.chart-actions button').forEach(button => {
        button.addEventListener('click', function() {
            const chartCard = this.closest('.chart-card');
            const chartTitle = chartCard.querySelector('.chart-title').textContent;
            const actionIcon = this.querySelector('i').classList[1];
            const chartContainer = chartCard.querySelector('.chart-container');
            
            if (actionIcon === 'fa-expand') {
                expandChart(chartTitle, chartContainer);
            } else if (actionIcon === 'fa-download') {
                downloadChart(chartTitle, chartContainer);
            }
        });
    });

    // Fonctions pour les actions sur les rapports
    function viewReport(reportName) {
        alert(`Visualisation du rapport: ${reportName}`);
        // Ici, on pourrait ouvrir un modal avec le contenu du rapport
    }

    function downloadReport(reportName) {
        alert(`Téléchargement du rapport: ${reportName}`);
        // Ici, on pourrait déclencher le téléchargement du rapport
    }

    function deleteReport(reportName, reportItem) {
        if (!reportItem) {
            // Si reportItem n'est pas défini, trouver l'élément dans le DOM
            const reportItems = document.querySelectorAll('.report-item');
            reportItems.forEach(item => {
                const itemName = item.querySelector('div:first-child').textContent;
                if (itemName === reportName) {
                    reportItem = item;
                }
            });
            
            if (!reportItem) {
                alert(`Rapport "${reportName}" introuvable.`);
                return;
            }
        }
        if (confirm(`Êtes-vous sûr de vouloir supprimer le rapport "${reportName}" ?`)) {
            // Animation de suppression
            reportItem.style.opacity = '0';
            reportItem.style.transition = 'opacity 0.3s';
            
            setTimeout(() => {
                reportItem.remove();
                alert(`Rapport "${reportName}" supprimé`);
            }, 300);
            // Ici, on supprimerait le rapport de la base de données
        }
    }

    // Fonctions pour les actions sur les graphiques
    function expandChart(chartTitle, chartContainer) {
        // Créer un modal pour afficher le graphique en grand
        const modal = document.createElement('div');
        modal.className = 'chart-modal';
        modal.innerHTML = `
            <div class="chart-modal-content">
                <div class="chart-modal-header">
                    <h3>${chartTitle}</h3>
                    <button class="close-modal"><i class="fas fa-times"></i></button>
                </div>
                <div class="chart-modal-body">
                    <div class="expanded-chart-container"></div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Ajouter le style pour le modal s'il n'existe pas déjà
        if (!document.getElementById('chart-modal-style')) {
            const style = document.createElement('style');
            style.id = 'chart-modal-style';
            style.textContent = `
                .chart-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.7);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }
                .chart-modal-content {
                    background-color: white;
                    border-radius: 8px;
                    width: 80%;
                    max-width: 1000px;
                    max-height: 90%;
                    overflow: auto;
                }
                .chart-modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1rem;
                    border-bottom: 1px solid #eee;
                }
                .chart-modal-body {
                    padding: 1rem;
                }
                .expanded-chart-container {
                    height: 500px;
                }
                .close-modal {
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    cursor: pointer;
                }
            `;
            document.head.appendChild(style);
        }
        
        // Fermer le modal quand on clique sur le bouton de fermeture
        modal.querySelector('.close-modal').addEventListener('click', function() {
            modal.remove();
        });
        
        // Fermer le modal quand on clique en dehors du contenu
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        // Recréer le graphique dans le modal
        const expandedContainer = modal.querySelector('.expanded-chart-container');
        const chartType = getChartTypeFromTitle(chartTitle);
        createChart(expandedContainer, chartType, true);
    }

    function downloadChart(chartTitle, chartContainer) {
        // Trouver le canvas du graphique
        const canvas = chartContainer.querySelector('canvas');
        if (canvas) {
            // Convertir le canvas en image
            const image = canvas.toDataURL('image/png');
            
            // Créer un lien de téléchargement
            const link = document.createElement('a');
            link.href = image;
            link.download = `${chartTitle.replace(/ /g, '_')}.png`;
            link.click();
        } else {
            alert('Impossible de télécharger le graphique. Veuillez réessayer.');
        }
    }

    // Fonction pour filtrer les rapports
    function filterReports() {
        const dateFrom = document.getElementById('date-from').value;
        const dateTo = document.getElementById('date-to').value;
        const reportType = document.getElementById('report-type').value;
        
        console.log(`Filtres appliqués:\nDu: ${dateFrom}\nAu: ${dateTo}\nType: ${reportType}`);
        
        // Simuler un chargement
        const reportItems = document.querySelectorAll('.report-item');
        reportItems.forEach(item => {
            item.style.opacity = '0.5';
        });
        
        setTimeout(() => {
            reportItems.forEach(item => {
                item.style.opacity = '1';
            });
            // Ici, on filtrerait réellement les rapports selon les critères
        }, 500);
    }

    // Fonction pour rendre tous les graphiques
    function renderAllCharts() {
        const chartContainers = document.querySelectorAll('.chart-container');
        chartContainers.forEach(container => {
            const chartCard = container.closest('.chart-card');
            const chartTitle = chartCard.querySelector('.chart-title').textContent;
            const chartType = getChartTypeFromTitle(chartTitle);
            createChart(container, chartType);
        });
    }
    
    // Fonction pour rendre les graphiques de l'onglet actif
    function renderChartsForActiveTab(tabId) {
        const chartContainers = document.querySelectorAll(`#${tabId} .chart-container`);
        chartContainers.forEach(container => {
            const chartCard = container.closest('.chart-card');
            const chartTitle = chartCard.querySelector('.chart-title').textContent;
            const chartType = getChartTypeFromTitle(chartTitle);
            createChart(container, chartType);
        });
    }
    
    // Fonction pour déterminer le type de graphique à partir du titre
    function getChartTypeFromTitle(title) {
        const titleLower = title.toLowerCase();
        
        if (titleLower.includes('nombre de séances')) {
            return 'sessionsMonthly';
        } else if (titleLower.includes('répartition des patients par âge')) {
            return 'patientsAge';
        } else if (titleLower.includes('incidents par catégorie')) {
            return 'incidentsCategories';
        } else if (titleLower.includes('consommation de médicaments')) {
            return 'consumptionCosts';
        } else if (titleLower.includes('nouveaux patients')) {
            return 'patientsNew';
        } else if (titleLower.includes('répartition par sexe')) {
            return 'patientsGender';
        } else if (titleLower.includes('séances par jour')) {
            return 'sessionsWeekdays';
        } else if (titleLower.includes('durée moyenne')) {
            return 'sessionsDuration';
        } else if (titleLower.includes('incidents par mois')) {
            return 'incidentsMonthly';
        } else if (titleLower.includes('gravité des incidents')) {
            return 'incidentsSeverity';
        } else if (titleLower.includes('consommation par catégorie')) {
            return 'consumptionCategories';
        } else if (titleLower.includes('évolution des coûts')) {
            return 'consumptionCosts';
        }
        
        return 'generic';
    }

    // Fonction pour créer un graphique
    function createChart(container, chartType, isExpanded = false) {
        // Supprimer le contenu existant
        container.innerHTML = '';
        
        // Créer un canvas pour le graphique
        const canvas = document.createElement('canvas');
        container.appendChild(canvas);
        
        // Définir les mois pour les labels
        const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
        const weekdays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
        
        // Configuration du graphique selon le type
        let chartConfig;
        
        switch(chartType) {
            case 'sessionsMonthly':
                chartConfig = {
                    type: 'bar',
                    data: {
                        labels: months,
                        datasets: [{
                            label: 'Nombre de séances',
                            data: statisticsData.sessions.monthly,
                            backgroundColor: 'rgba(44, 115, 210, 0.7)',
                            borderColor: 'rgba(44, 115, 210, 1)',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                };
                break;
                
            case 'patientsAge':
                chartConfig = {
                    type: 'pie',
                    data: {
                        labels: ['0-20 ans', '21-40 ans', '41-60 ans', '61-80 ans', '81+ ans'],
                        datasets: [{
                            data: statisticsData.patients.ageGroups,
                            backgroundColor: [
                                'rgba(255, 99, 132, 0.7)',
                                'rgba(54, 162, 235, 0.7)',
                                'rgba(255, 206, 86, 0.7)',
                                'rgba(75, 192, 192, 0.7)',
                                'rgba(153, 102, 255, 0.7)'
                            ],
                            borderColor: [
                                'rgba(255, 99, 132, 1)',
                                'rgba(54, 162, 235, 1)',
                                'rgba(255, 206, 86, 1)',
                                'rgba(75, 192, 192, 1)',
                                'rgba(153, 102, 255, 1)'
                            ],
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false
                    }
                };
                break;
                
            case 'incidentsCategories':
                chartConfig = {
                    type: 'doughnut',
                    data: {
                        labels: ['Hypotension', 'Crampes', 'Problèmes d\'accès', 'Coagulation', 'Autres'],
                        datasets: [{
                            data: statisticsData.incidents.categories,
                            backgroundColor: [
                                'rgba(255, 99, 132, 0.7)',
                                'rgba(54, 162, 235, 0.7)',
                                'rgba(255, 206, 86, 0.7)',
                                'rgba(75, 192, 192, 0.7)',
                                'rgba(153, 102, 255, 0.7)'
                            ],
                            borderColor: [
                                'rgba(255, 99, 132, 1)',
                                'rgba(54, 162, 235, 1)',
                                'rgba(255, 206, 86, 1)',
                                'rgba(75, 192, 192, 1)',
                                'rgba(153, 102, 255, 1)'
                            ],
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false
                    }
                };
                break;
                
            case 'consumptionCosts':
                chartConfig = {
                    type: 'line',
                    data: {
                        labels: months,
                        datasets: [{
                            label: 'Coûts mensuels (€)',
                            data: statisticsData.consumption.monthlyCosts,
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 2,
                            tension: 0.1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: false
                            }
                        }
                    }
                };
                break;
                
            case 'patientsNew':
                chartConfig = {
                    type: 'bar',
                    data: {
                        labels: months,
                        datasets: [{
                            label: 'Nouveaux patients',
                            data: statisticsData.patients.newMonthly,
                            backgroundColor: 'rgba(255, 159, 64, 0.7)',
                            borderColor: 'rgba(255, 159, 64, 1)',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    stepSize: 1
                                }
                            }
                        }
                    }
                };
                break;
                
            case 'patientsGender':
                chartConfig = {
                    type: 'pie',
                    data: {
                        labels: ['Hommes', 'Femmes'],
                        datasets: [{
                            data: statisticsData.patients.gender,
                            backgroundColor: [
                                'rgba(54, 162, 235, 0.7)',
                                'rgba(255, 99, 132, 0.7)'
                            ],
                            borderColor: [
                                'rgba(54, 162, 235, 1)',
                                'rgba(255, 99, 132, 1)'
                            ],
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false
                    }
                };
                break;
                
            case 'sessionsWeekdays':
                chartConfig = {
                    type: 'bar',
                    data: {
                        labels: weekdays,
                        datasets: [{
                            label: 'Nombre de séances',
                            data: statisticsData.sessions.weekdays,
                            backgroundColor: 'rgba(44, 115, 210, 0.7)',
                            borderColor: 'rgba(44, 115, 210, 1)',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                };
                break;
                
            case 'sessionsDuration':
                chartConfig = {
                    type: 'line',
                    data: {
                        labels: months,
                        datasets: [{
                            label: 'Durée moyenne (minutes)',
                            data: [240, 238, 242, 245, 240, 235, 238, 240, 242, 245, 240, 238],
                            backgroundColor: 'rgba(153, 102, 255, 0.2)',
                            borderColor: 'rgba(153, 102, 255, 1)',
                            borderWidth: 2,
                            tension: 0.1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: false,
                                min: 220,
                                max: 260
                            }
                        }
                    }
                };
                break;
                
            case 'incidentsMonthly':
                chartConfig = {
                    type: 'bar',
                    data: {
                        labels: months,
                        datasets: [{
                            label: 'Nombre d\'incidents',
                            data: statisticsData.incidents.monthly,
                            backgroundColor: 'rgba(255, 99, 132, 0.7)',
                            borderColor: 'rgba(255, 99, 132, 1)',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    stepSize: 1
                                }
                            }
                        }
                    }
                };
                break;
                
            case 'incidentsSeverity':
                chartConfig = {
                    type: 'pie',
                    data: {
                        labels: ['Mineure', 'Modérée', 'Grave'],
                        datasets: [{
                            data: statisticsData.incidents.severity,
                            backgroundColor: [
                                'rgba(255, 206, 86, 0.7)',
                                'rgba(255, 159, 64, 0.7)',
                                'rgba(255, 99, 132, 0.7)'
                            ],
                            borderColor: [
                                'rgba(255, 206, 86, 1)',
                                'rgba(255, 159, 64, 1)',
                                'rgba(255, 99, 132, 1)'
                            ],
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false
                    }
                };
                break;
                
            case 'consumptionCategories':
                chartConfig = {
                    type: 'doughnut',
                    data: {
                        labels: ['Médicaments', 'Consommables', 'Équipement', 'Autres'],
                        datasets: [{
                            data: statisticsData.consumption.categories,
                            backgroundColor: [
                                'rgba(75, 192, 192, 0.7)',
                                'rgba(153, 102, 255, 0.7)',
                                'rgba(255, 159, 64, 0.7)',
                                'rgba(201, 203, 207, 0.7)'
                            ],
                            borderColor: [
                                'rgba(75, 192, 192, 1)',
                                'rgba(153, 102, 255, 1)',
                                'rgba(255, 159, 64, 1)',
                                'rgba(201, 203, 207, 1)'
                            ],
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false
                    }
                };
                break;
                
            case 'generic':
                chartConfig = {
                    type: 'bar',
                    data: {
                        labels: ['Données 1', 'Données 2', 'Données 3', 'Données 4', 'Données 5'],
                        datasets: [{
                            label: 'Données génériques',
                            data: [12, 19, 3, 5, 2],
                            backgroundColor: 'rgba(44, 115, 210, 0.7)',
                            borderColor: 'rgba(44, 115, 210, 1)',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false
                    }
                };
                break;
        }
        
        // Créer le graphique avec Chart.js
        if (window.Chart) {
            new Chart(canvas, chartConfig);
        } else {
            container.innerHTML = `<div class="chart-placeholder">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Impossible de charger les graphiques. Veuillez réessayer.</p>
            </div>`;
        }
    }
                            backgroundColor: 'rgba(44, 115, 210, 0.7)',
                            borderColor: 'rgba(44, 115, 210, 1)',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                };
                break;
                
            case 'sessionsDuration':
                // Données fictives pour la durée moyenne des séances
                const durationData = [4.2, 4.1, 4.3, 4.0, 4.2, 4.1, 4.3, 4.2, 4.0, 4.1, 4.2, 4.3];
                
                chartConfig = {
                    type: 'line',
                    data: {
                        labels: months,
                        datasets: [{
                            label: 'Durée moyenne (heures)',
                            data: durationData,
                            backgroundColor: 'rgba(255, 206, 86, 0.2)',
                            borderColor: 'rgba(255, 206, 86, 1)',
                            borderWidth: 2,
                            tension: 0.1,
                            fill: true
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: false,
                                min: 3.5,
                                max: 4.5
                            }
                        }
                    }
                };
                break;
                
            case 'incidentsMonthly':
                chartConfig = {
                    type: 'bar',
                    data: {
                        labels: months,
                        datasets: [{
                            label: 'Nombre d\'incidents',
                            data: statisticsData.incidents.monthly,
                            backgroundColor: 'rgba(255, 99, 132, 0.7)',
                            borderColor: 'rgba(255, 99, 132, 1)',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                };
                break;
                
            case 'incidentsSeverity':
                chartConfig = {
                    type: 'pie',
                    data: {
                        labels: ['Mineur', 'Modéré', 'Majeur'],
                        datasets: [{
                            data: statisticsData.incidents.severity,
                            backgroundColor: [
                                'rgba(255, 206, 86, 0.7)',
                                'rgba(255, 159, 64, 0.7)',
                                'rgba(255, 99, 132, 0.7)'
                            ],
                            borderColor: [
                                'rgba(255, 206, 86, 1)',
                                'rgba(255, 159, 64, 1)',
                                'rgba(255, 99, 132, 1)'
                            ],
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false
                    }
                };
                break;
                
            case 'consumptionCategories':
                chartConfig = {
                    type: 'pie',
                    data: {
                        labels: ['Médicaments', 'Consommables', 'Équipement', 'Autres'],
                        datasets: [{
                            data: statisticsData.consumption.categories,
                            backgroundColor: [
                                'rgba(75, 192, 192, 0.7)',
                                'rgba(153, 102, 255, 0.7)',
                                'rgba(255, 159, 64, 0.7)',
                                'rgba(201, 203, 207, 0.7)'
                            ],
                            borderColor: [
                                'rgba(75, 192, 192, 1)',
                                'rgba(153, 102, 255, 1)',
                                'rgba(255, 159, 64, 1)',
                                'rgba(201, 203, 207, 1)'
                            ],
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false
                    }
                };
                break;
                
            default:
                // Graphique générique
                chartConfig = {
                    type: 'bar',
                    data: {
                        labels: months,
                        datasets: [{
                            label: 'Données',
                            data: [12, 19, 3, 5, 2, 3, 8, 14, 10, 9, 11, 7],
                            backgroundColor: 'rgba(44, 115, 210, 0.7)',
                            borderColor: 'rgba(44, 115, 210, 1)',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                };
        }
        
        // Créer le graphique
        new Chart(canvas, chartConfig);
    }

    // Fonction pour initialiser tous les graphiques
    function renderAllCharts() {
        const chartContainers = document.querySelectorAll('.chart-container');
        
        chartContainers.forEach(container => {
            const chartCard = container.closest('.chart-card');
            const chartTitle = chartCard.querySelector('.chart-title').textContent;
            const chartType = getChartTypeFromTitle(chartTitle);
            
            // Vérifier si le conteneur est visible (dans un onglet actif)
            const tabContent = container.closest('.tab-content');
            if (!tabContent || tabContent.classList.contains('active')) {
                createChart(container, chartType);
            }
        });
    }

    // Fonction pour initialiser les graphiques d'un onglet spécifique
    function renderChartsForActiveTab(tabId) {
        const tabContent = document.getElementById(tabId);
        const chartContainers = tabContent.querySelectorAll('.chart-container');
        
        chartContainers.forEach(container => {
            const chartCard = container.closest('.chart-card');
            const chartTitle = chartCard.querySelector('.chart-title').textContent;
            const chartType = getChartTypeFromTitle(chartTitle);
            
            createChart(container, chartType);
        });
    }

    // Initialiser l'application
    loadChartJS()
        .then(() => {
            console.log('Chart.js chargé avec succès');
            renderAllCharts();
        })
        .catch(error => {
            console.error('Erreur lors du chargement de Chart.js:', error);
            alert('Impossible de charger la bibliothèque de graphiques. Veuillez rafraîchir la page.');
        });

    // Afficher un message dans la console
    console.log('Module de statistiques et rapports chargé');
});