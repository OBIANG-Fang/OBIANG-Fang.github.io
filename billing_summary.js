// Script pour le récapitulatif des factures et honoraires médicaux - NephroSys

document.addEventListener('DOMContentLoaded', function() {
    // Récupération des données de facturation
    const invoiceData = JSON.parse(localStorage.getItem('nephrosys_invoices')) || [];
    
    // Initialisation des éléments DOM
    initSummaryTabs();
    initDatePickers();
    loadSummaryData();
    setupEventListeners();
    
    // Fonction pour initialiser les onglets du récapitulatif
    function initSummaryTabs() {
        const tabsContainer = document.querySelector('.summary-tabs');
        if (tabsContainer) {
            tabsContainer.addEventListener('click', function(e) {
                if (e.target.classList.contains('summary-tab')) {
                    // Désactiver tous les onglets
                    document.querySelectorAll('.summary-tab').forEach(tab => {
                        tab.classList.remove('active');
                    });
                    
                    // Activer l'onglet cliqué
                    e.target.classList.add('active');
                    
                    // Afficher le contenu correspondant
                    const tabId = e.target.getAttribute('data-tab');
                    document.querySelectorAll('.summary-content').forEach(content => {
                        content.classList.remove('active');
                    });
                    document.getElementById(tabId).classList.add('active');
                    
                    // Charger les données spécifiques à l'onglet
                    loadSummaryData(tabId);
                }
            });
        }
    }
    
    // Fonction pour initialiser les sélecteurs de date
    function initDatePickers() {
        // Initialiser avec le mois en cours
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        
        const dateFromInput = document.getElementById('summary-date-from');
        const dateToInput = document.getElementById('summary-date-to');
        
        if (dateFromInput && dateToInput) {
            dateFromInput.valueAsDate = firstDayOfMonth;
            dateToInput.valueAsDate = today;
        }
    }
    
    // Configuration des écouteurs d'événements
    function setupEventListeners() {
        // Écouteur pour le bouton de filtrage
        const filterBtn = document.querySelector('.summary-filter-btn');
        if (filterBtn) {
            filterBtn.addEventListener('click', function() {
                const activeTab = document.querySelector('.summary-tab.active');
                if (activeTab) {
                    loadSummaryData(activeTab.getAttribute('data-tab'));
                } else {
                    loadSummaryData();
                }
            });
        }
        
        // Écouteur pour le bouton d'exportation
        const exportBtn = document.querySelector('.summary-export-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', function() {
                exportSummaryToCSV();
            });
        }
        
        // Écouteur pour le bouton d'impression
        const printBtn = document.querySelector('.summary-print-btn');
        if (printBtn) {
            printBtn.addEventListener('click', function() {
                printSummary();
            });
        }
    }
    
    // Fonction pour charger les données du récapitulatif
    function loadSummaryData(tabId = 'period-summary') {
        // Récupérer les dates de filtrage
        const dateFrom = new Date(document.getElementById('summary-date-from').value);
        const dateTo = new Date(document.getElementById('summary-date-to').value);
        dateTo.setHours(23, 59, 59); // Inclure toute la journée de fin
        
        // Filtrer les factures selon la période
        const filteredInvoices = invoiceData.filter(invoice => {
            const invoiceDate = parseDate(invoice.date);
            return invoiceDate >= dateFrom && invoiceDate <= dateTo;
        });
        
        // Afficher les données selon l'onglet actif
        switch(tabId) {
            case 'period-summary':
                displayPeriodSummary(filteredInvoices);
                break;
            case 'insurance-summary':
                displayInsuranceSummary(filteredInvoices);
                break;
            case 'doctor-fees':
                displayDoctorFeesSummary(filteredInvoices);
                break;
            default:
                displayPeriodSummary(filteredInvoices);
        }
    }
    
    // Fonction pour afficher le récapitulatif par période
    function displayPeriodSummary(invoices) {
        const summaryContainer = document.getElementById('period-summary');
        if (!summaryContainer) return;
        
        // Calculer les statistiques
        const totalAmount = invoices.reduce((sum, invoice) => sum + invoice.montant, 0);
        const paidAmount = invoices.filter(inv => inv.statut === 'paid')
                                  .reduce((sum, invoice) => sum + invoice.montant, 0);
        const pendingAmount = invoices.filter(inv => inv.statut === 'pending')
                                     .reduce((sum, invoice) => sum + invoice.montant, 0);
        const overdueAmount = invoices.filter(inv => inv.statut === 'overdue')
                                     .reduce((sum, invoice) => sum + invoice.montant, 0);
        
        // Grouper par mois
        const monthlyData = {};
        invoices.forEach(invoice => {
            const date = parseDate(invoice.date);
            const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
            
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = {
                    month: `${getMonthName(date.getMonth())} ${date.getFullYear()}`,
                    count: 0,
                    amount: 0,
                    paid: 0,
                    pending: 0,
                    overdue: 0
                };
            }
            
            monthlyData[monthKey].count++;
            monthlyData[monthKey].amount += invoice.montant;
            
            switch(invoice.statut) {
                case 'paid':
                    monthlyData[monthKey].paid += invoice.montant;
                    break;
                case 'pending':
                    monthlyData[monthKey].pending += invoice.montant;
                    break;
                case 'overdue':
                    monthlyData[monthKey].overdue += invoice.montant;
                    break;
            }
        });
        
        // Convertir en tableau et trier par date
        const monthlyArray = Object.values(monthlyData).sort((a, b) => {
            return new Date(b.month) - new Date(a.month);
        });
        
        // Générer le HTML pour les statistiques
        let statsHTML = `
            <div class="summary-stats">
                <div class="stat-card">
                    <h3>${formatMoney(totalAmount)}</h3>
                    <p>Montant total</p>
                </div>
                <div class="stat-card">
                    <h3>${formatMoney(paidAmount)}</h3>
                    <p>Montant payé</p>
                </div>
                <div class="stat-card">
                    <h3>${formatMoney(pendingAmount)}</h3>
                    <p>En attente</p>
                </div>
                <div class="stat-card">
                    <h3>${formatMoney(overdueAmount)}</h3>
                    <p>En retard</p>
                </div>
                <div class="stat-card">
                    <h3>${invoices.length}</h3>
                    <p>Nombre de factures</p>
                </div>
            </div>
        `;
        
        // Générer le HTML pour le tableau mensuel
        let tableHTML = `
            <div class="summary-table-container">
                <h3>Récapitulatif mensuel</h3>
                <table class="summary-table">
                    <thead>
                        <tr>
                            <th>Mois</th>
                            <th>Nombre de factures</th>
                            <th>Montant total</th>
                            <th>Payé</th>
                            <th>En attente</th>
                            <th>En retard</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        if (monthlyArray.length === 0) {
            tableHTML += `
                <tr>
                    <td colspan="6" class="text-center">Aucune donnée disponible pour cette période</td>
                </tr>
            `;
        } else {
            monthlyArray.forEach(month => {
                tableHTML += `
                    <tr>
                        <td>${month.month}</td>
                        <td>${month.count}</td>
                        <td>${formatMoney(month.amount)}</td>
                        <td>${formatMoney(month.paid)}</td>
                        <td>${formatMoney(month.pending)}</td>
                        <td>${formatMoney(month.overdue)}</td>
                    </tr>
                `;
            });
        }
        
        tableHTML += `
                    </tbody>
                </table>
            </div>
        `;
        
        // Mettre à jour le contenu
        summaryContainer.innerHTML = statsHTML + tableHTML;
    }
    
    // Fonction pour afficher le récapitulatif par organisme payeur
    function displayInsuranceSummary(invoices) {
        const summaryContainer = document.getElementById('insurance-summary');
        if (!summaryContainer) return;
        
        // Grouper par organisme payeur
        const insuranceData = {};
        invoices.forEach(invoice => {
            const organisme = invoice.organisme || 'Non spécifié';
            
            if (!insuranceData[organisme]) {
                insuranceData[organisme] = {
                    name: organisme,
                    count: 0,
                    amount: 0,
                    paid: 0,
                    pending: 0,
                    overdue: 0,
                    coverage: invoice.tauxCouverture || 0
                };
            }
            
            insuranceData[organisme].count++;
            insuranceData[organisme].amount += invoice.montant;
            
            // Calculer la moyenne du taux de couverture
            insuranceData[organisme].coverage = 
                ((insuranceData[organisme].coverage * (insuranceData[organisme].count - 1)) + 
                 (invoice.tauxCouverture || 0)) / insuranceData[organisme].count;
            
            switch(invoice.statut) {
                case 'paid':
                    insuranceData[organisme].paid += invoice.montant;
                    break;
                case 'pending':
                    insuranceData[organisme].pending += invoice.montant;
                    break;
                case 'overdue':
                    insuranceData[organisme].overdue += invoice.montant;
                    break;
            }
        });
        
        // Convertir en tableau et trier par montant total
        const insuranceArray = Object.values(insuranceData).sort((a, b) => {
            return b.amount - a.amount;
        });
        
        // Générer le HTML pour le tableau des organismes
        let tableHTML = `
            <div class="summary-table-container">
                <h3>Récapitulatif par organisme payeur</h3>
                <table class="summary-table">
                    <thead>
                        <tr>
                            <th>Organisme</th>
                            <th>Nombre de factures</th>
                            <th>Taux moyen</th>
                            <th>Montant total</th>
                            <th>Payé</th>
                            <th>En attente</th>
                            <th>En retard</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        if (insuranceArray.length === 0) {
            tableHTML += `
                <tr>
                    <td colspan="7" class="text-center">Aucune donnée disponible pour cette période</td>
                </tr>
            `;
        } else {
            insuranceArray.forEach(org => {
                tableHTML += `
                    <tr>
                        <td>${org.name}</td>
                        <td>${org.count}</td>
                        <td>${org.coverage.toFixed(1)}%</td>
                        <td>${formatMoney(org.amount)}</td>
                        <td>${formatMoney(org.paid)}</td>
                        <td>${formatMoney(org.pending)}</td>
                        <td>${formatMoney(org.overdue)}</td>
                    </tr>
                `;
            });
        }
        
        tableHTML += `
                    </tbody>
                </table>
            </div>
        `;
        
        // Générer le graphique (représentation visuelle)
        let chartHTML = `
            <div class="summary-chart-container">
                <h3>Répartition par organisme payeur</h3>
                <div class="chart-container">
                    <div class="bar-chart">
        `;
        
        // Calculer le montant total pour les pourcentages
        const totalAmount = insuranceArray.reduce((sum, org) => sum + org.amount, 0);
        
        insuranceArray.forEach(org => {
            const percentage = totalAmount > 0 ? (org.amount / totalAmount * 100).toFixed(1) : 0;
            chartHTML += `
                <div class="chart-item">
                    <div class="chart-label">${org.name}</div>
                    <div class="chart-bar-container">
                        <div class="chart-bar" style="width: ${percentage}%;"></div>
                        <div class="chart-value">${formatMoney(org.amount)} (${percentage}%)</div>
                    </div>
                </div>
            `;
        });
        
        chartHTML += `
                    </div>
                </div>
            </div>
        `;
        
        // Mettre à jour le contenu
        summaryContainer.innerHTML = tableHTML + chartHTML;
    }
    
    // Fonction pour afficher le récapitulatif des honoraires médicaux
    function displayDoctorFeesSummary(invoices) {
        const summaryContainer = document.getElementById('doctor-fees');
        if (!summaryContainer) return;
        
        // Filtrer les factures qui contiennent des honoraires médicaux
        const feesInvoices = invoices.filter(invoice => {
            return invoice.details && invoice.details.some(detail => 
                detail.description.toLowerCase().includes('consultation') || 
                detail.description.toLowerCase().includes('honoraire') ||
                detail.description.toLowerCase().includes('médecin') ||
                detail.description.toLowerCase().includes('acte médical')
            );
        });
        
        // Extraire et grouper les honoraires par médecin
        const doctorFeesData = {};
        
        feesInvoices.forEach(invoice => {
            invoice.details.forEach(detail => {
                // Vérifier si c'est un honoraire médical
                if (detail.description.toLowerCase().includes('consultation') || 
                    detail.description.toLowerCase().includes('honoraire') ||
                    detail.description.toLowerCase().includes('médecin') ||
                    detail.description.toLowerCase().includes('acte médical')) {
                    
                    // Extraire le nom du médecin si disponible, sinon utiliser "Non spécifié"
                    let doctorName = 'Non spécifié';
                    if (detail.medecin) {
                        doctorName = detail.medecin;
                    } else if (detail.description.includes(':')) {
                        doctorName = detail.description.split(':')[1].trim();
                    }
                    
                    if (!doctorFeesData[doctorName]) {
                        doctorFeesData[doctorName] = {
                            name: doctorName,
                            count: 0,
                            amount: 0,
                            consultations: 0,
                            actes: 0
                        };
                    }
                    
                    doctorFeesData[doctorName].count += detail.quantite || 1;
                    doctorFeesData[doctorName].amount += (detail.prixUnitaire * (detail.quantite || 1));
                    
                    // Classifier le type d'acte
                    if (detail.description.toLowerCase().includes('consultation')) {
                        doctorFeesData[doctorName].consultations += detail.quantite || 1;
                    } else {
                        doctorFeesData[doctorName].actes += detail.quantite || 1;
                    }
                }
            });
        });
        
        // Convertir en tableau et trier par montant
        const doctorFeesArray = Object.values(doctorFeesData).sort((a, b) => {
            return b.amount - a.amount;
        });
        
        // Générer le HTML pour les statistiques
        const totalFees = doctorFeesArray.reduce((sum, doctor) => sum + doctor.amount, 0);
        const totalConsultations = doctorFeesArray.reduce((sum, doctor) => sum + doctor.consultations, 0);
        const totalActes = doctorFeesArray.reduce((sum, doctor) => sum + doctor.actes, 0);
        
        let statsHTML = `
            <div class="summary-stats">
                <div class="stat-card">
                    <h3>${formatMoney(totalFees)}</h3>
                    <p>Total honoraires</p>
                </div>
                <div class="stat-card">
                    <h3>${totalConsultations}</h3>
                    <p>Consultations</p>
                </div>
                <div class="stat-card">
                    <h3>${totalActes}</h3>
                    <p>Actes médicaux</p>
                </div>
                <div class="stat-card">
                    <h3>${doctorFeesArray.length}</h3>
                    <p>Médecins</p>
                </div>
            </div>
        `;
        
        // Générer le HTML pour le tableau des honoraires par médecin
        let tableHTML = `
            <div class="summary-table-container">
                <h3>Honoraires par médecin</h3>
                <table class="summary-table">
                    <thead>
                        <tr>
                            <th>Médecin</th>
                            <th>Nombre d'actes</th>
                            <th>Consultations</th>
                            <th>Autres actes</th>
                            <th>Montant total</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        if (doctorFeesArray.length === 0) {
            tableHTML += `
                <tr>
                    <td colspan="5" class="text-center">Aucun honoraire médical trouvé pour cette période</td>
                </tr>
            `;
        } else {
            doctorFeesArray.forEach(doctor => {
                tableHTML += `
                    <tr>
                        <td>${doctor.name}</td>
                        <td>${doctor.count}</td>
                        <td>${doctor.consultations}</td>
                        <td>${doctor.actes}</td>
                        <td>${formatMoney(doctor.amount)}</td>
                    </tr>
                `;
            });
        }
        
        tableHTML += `
                    </tbody>
                </table>
            </div>
        `;
        
        // Mettre à jour le contenu
        summaryContainer.innerHTML = statsHTML + tableHTML;
    }
    
    // Fonction pour exporter le récapitulatif au format CSV
    function exportSummaryToCSV() {
        // Récupérer l'onglet actif
        const activeTab = document.querySelector('.summary-tab.active');
        if (!activeTab) return;
        
        const tabId = activeTab.getAttribute('data-tab');
        const dateFrom = document.getElementById('summary-date-from').value;
        const dateTo = document.getElementById('summary-date-to').value;
        
        // Filtrer les factures selon la période
        const filteredInvoices = invoiceData.filter(invoice => {
            const invoiceDate = parseDate(invoice.date);
            return invoiceDate >= new Date(dateFrom) && invoiceDate <= new Date(dateTo);
        });
        
        let csvContent = '';
        let fileName = '';
        
        // Générer le contenu CSV selon l'onglet actif
        switch(tabId) {
            case 'period-summary':
                csvContent = generatePeriodSummaryCSV(filteredInvoices);
                fileName = `recap_periode_${formatDateForFileName(new Date())}.csv`;
                break;
            case 'insurance-summary':
                csvContent = generateInsuranceSummaryCSV(filteredInvoices);
                fileName = `recap_organismes_${formatDateForFileName(new Date())}.csv`;
                break;
            case 'doctor-fees':
                csvContent = generateDoctorFeesCSV(filteredInvoices);
                fileName = `honoraires_medicaux_${formatDateForFileName(new Date())}.csv`;
                break;
        }
        
        // Créer un objet Blob pour le téléchargement
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        // Créer un lien de téléchargement
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", fileName);
        link.style.visibility = 'hidden';
        
        // Ajouter le lien au document
        document.body.appendChild(link);
        
        // Cliquer sur le lien pour déclencher le téléchargement
        link.click();
        
        // Nettoyer
        document.body.removeChild(link);
    }
    
    // Fonction pour générer le CSV du récapitulatif par période
    function generatePeriodSummaryCSV(invoices) {
        // Grouper par mois
        const monthlyData = {};
        invoices.forEach(invoice => {
            const date = parseDate(invoice.date);
            const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
            
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = {
                    month: `${getMonthName(date.getMonth())} ${date.getFullYear()}`,
                    count: 0,
                    amount: 0,
                    paid: 0,
                    pending: 0,
                    overdue: 0
                };
            }
            
            monthlyData[monthKey].count++;
            monthlyData[monthKey].amount += invoice.montant;
            
            switch(invoice.statut) {
                case 'paid':
                    monthlyData[monthKey].paid += invoice.montant;
                    break;
                case 'pending':
                    monthlyData[monthKey].pending += invoice.montant;
                    break;
                case 'overdue':
                    monthlyData[monthKey].overdue += invoice.montant;
                    break;
            }
        });
        
        // Convertir en tableau et trier par date
        const monthlyArray = Object.values(monthlyData).sort((a, b) => {
            return new Date(b.month) - new Date(a.month);
        });
        
        // Créer l'en-tête du CSV
        let csvContent = "Mois;Nombre de factures;Montant total;Payé;En attente;En retard\n";
        
        // Ajouter les données de chaque mois
        monthlyArray.forEach(month => {
            csvContent += `${month.month};${month.count};${month.amount};${month.paid};${month.pending};${month.overdue}\n`;
        });
        
        return csvContent;
    }
    
    // Fonction pour générer le CSV du récapitulatif par organisme
    function generateInsuranceSummaryCSV(invoices) {
        // Grouper par organisme payeur
        const insuranceData = {};
        invoices.forEach(invoice => {
            const organisme = invoice.organisme || 'Non spécifié';
            
            if (!insuranceData[organisme]) {
                insuranceData[organisme] = {
                    name: organisme,
                    count: 0,
                    amount: 0,
                    paid: 0,
                    pending: 0,
                    overdue: 0,
                    coverage: invoice.tauxCouverture || 0
                };
            }
            
            insuranceData[organisme].count++;
            insuranceData[organisme].amount += invoice.montant;
            
            // Calculer la moyenne du taux de couverture
            insuranceData[organisme].coverage = 
                ((insuranceData[organisme].coverage * (insuranceData[organisme].count - 1)) + 
                 (invoice.tauxCouverture || 0)) / insuranceData[organisme].count;
            
            switch(invoice.statut) {
                case 'paid':
                    insuranceData[organisme].paid += invoice.montant;
                    break;
                case 'pending':
                    insuranceData[organisme].pending += invoice.montant;
                    break;
                case 'overdue':
                    insuranceData[organisme].overdue += invoice.montant;
                    break;
            }
        });
        
        // Convertir en tableau et trier par montant total
        const insuranceArray = Object.values(insuranceData).sort((a, b) => {
            return b.amount - a.amount;
        });
        
        // Créer l'en-tête du CSV
        let csvContent = "Organisme;Nombre de factures;Taux moyen;Montant total;Payé;En attente;En retard\n";
        
        // Ajouter les données de chaque organisme
        insuranceArray.forEach(org => {
            csvContent += `${org.name};${org.count};${org.coverage.toFixed(1)}%;${org.amount};${org.paid};${org.pending};${org.overdue}\n`;
        });
        
        return csvContent;
    }
    
    // Fonction pour générer le CSV des honoraires médicaux
    function generateDoctorFeesCSV(invoices) {
        // Filtrer les factures qui contiennent des honoraires médicaux
        const feesInvoices = invoices.filter(invoice => {
            return invoice.details && invoice.details.some(detail => 
                detail.description.toLowerCase().includes('consultation') || 
                detail.description.toLowerCase().includes('honoraire') ||
                detail.description.toLowerCase().includes('médecin') ||
                detail.description.toLowerCase().includes('acte médical')
            );
        });
        
        // Extraire et grouper les honoraires par médecin
        const doctorFeesData = {};
        
        feesInvoices.forEach(invoice => {
            invoice.details.forEach(detail => {
                // Vérifier si c'est un honoraire médical
                if (detail.description.toLowerCase().includes('consultation') || 
                    detail.description.toLowerCase().includes('honoraire') ||
                    detail.description.toLowerCase().includes('médecin') ||
                    detail.description.toLowerCase().includes('acte médical')) {
                    
                    // Extraire le nom du médecin si disponible, sinon utiliser "Non spécifié"
                    let doctorName = 'Non spécifié';
                    if (detail.medecin) {
                        doctorName = detail.medecin;
                    } else if (detail.description.includes(':')) {
                        doctorName = detail.description.split(':')[1].trim();
                    }
                    
                    if (!doctorFeesData[doctorName]) {
                        doctorFeesData[doctorName] = {
                            name: doctorName,
                            count: 0,
                            amount: 0,
                            consultations: 0,
                            actes: 0
                        };
                    }
                    
                    doctorFeesData[doctorName].count += detail.quantite || 1;
                    doctorFeesData[doctorName].amount += (detail.prixUnitaire * (detail.quantite || 1));
                    
                    // Classifier le type d'acte
                    if (detail.description.toLowerCase().includes('consultation')) {
                        doctorFeesData[doctorName].consultations += detail.quantite || 1;
                    } else {
                        doctorFeesData[doctorName].actes += detail.quantite || 1;
                    }
                }
            });
        });