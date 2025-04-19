// Script pour la gestion de la facturation - LaboMedic Gabon

document.addEventListener('DOMContentLoaded', function() {
    // Récupération des données patients et produits pharmaceutiques
    const patients = JSON.parse(localStorage.getItem('nephrosys_patients')) || [];
    const inventoryData = JSON.parse(localStorage.getItem('nephrosys_inventory')) || [];

    // Données de test pour les factures (à remplacer par une API ou une base de données)
    let invoiceData = JSON.parse(localStorage.getItem('nephrosys_invoices')) || [
        {
            id: 'DIAL-2025-00001',
            patient: 'MBOUMBA Jean',
            patientId: 'P-001',
            dateNaissance: '12/05/1972',
            date: '19/04/2025',
            periodeDu: '01/04/2025',
            periodeAu: '15/04/2025',
            montant: 375000,
            statut: 'paid',
            organisme: 'CNAMGS',
            typeAssurance: 'Fonction publique',
            numeroIdentification: '023456789123',
            medecinReferent: 'Dr. Ella Biyoghe',
            tauxCouverture: 90,
            montantPrisEnCharge: 337500,
            ticketModerateur: 37500,
            modePaiementAssurance: 'Facturation directe',
            modePaiementPatient: 'Mobile money (Airtel Money)',
            details: [
                { date: '01/04/2025', description: 'Séance de dialyse', quantite: 1, prixUnitaire: 75000 },
                { date: '04/04/2025', description: 'Séance de dialyse', quantite: 1, prixUnitaire: 75000 },
                { date: '08/04/2025', description: 'Séance de dialyse', quantite: 1, prixUnitaire: 75000 },
                { date: '11/04/2025', description: 'Séance de dialyse', quantite: 1, prixUnitaire: 75000 },
                { date: '15/04/2025', description: 'Séance de dialyse', quantite: 1, prixUnitaire: 75000 }
            ]
        },
        {
            id: 'DIAL-2025-00002',
            patient: 'OBAME Marie',
            patientId: 'P-002',
            dateNaissance: '23/09/1968',
            date: '20/04/2025',
            periodeDu: '01/04/2025',
            periodeAu: '16/04/2025',
            montant: 300000,
            statut: 'pending',
            organisme: 'CNSS',
            typeAssurance: 'Secteur privé',
            numeroIdentification: '034567891234',
            medecinReferent: 'Dr. Ndong Mba',
            tauxCouverture: 80,
            montantPrisEnCharge: 240000,
            ticketModerateur: 60000,
            modePaiementAssurance: 'Facturation directe',
            modePaiementPatient: 'Espèces',
            details: [
                { date: '02/04/2025', description: 'Séance de dialyse', quantite: 1, prixUnitaire: 75000 },
                { date: '06/04/2025', description: 'Séance de dialyse', quantite: 1, prixUnitaire: 75000 },
                { date: '10/04/2025', description: 'Séance de dialyse', quantite: 1, prixUnitaire: 75000 },
                { date: '16/04/2025', description: 'Séance de dialyse', quantite: 1, prixUnitaire: 75000 }
            ]
        }
    ];

    // Fonction pour sauvegarder les factures dans le localStorage
    function saveInvoices() {
        localStorage.setItem('nephrosys_invoices', JSON.stringify(invoiceData));
    }

    // Initialisation des filtres avec la date du jour
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    document.getElementById('date-from').valueAsDate = firstDayOfMonth;
    document.getElementById('date-to').valueAsDate = today;

    // Initialiser l'affichage des factures
    displayInvoices(invoiceData);

    // Gestionnaire d'événements pour les boutons d'action
    document.querySelectorAll('.invoice-actions button').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const action = this.classList[0];
            const invoiceItem = this.closest('.invoice-item');
            const invoiceId = invoiceItem.querySelector('div:first-child').textContent;
            
            switch(action) {
                case 'view-btn':
                    viewInvoice(invoiceId);
                    break;
                case 'print-btn':
                    printInvoice(invoiceId);
                    break;
                case 'send-btn':
                    sendInvoice(invoiceId);
                    break;
                case 'delete-btn':
                    deleteInvoice(invoiceId);
                    break;
            }
        });
    });

    // Gestionnaire pour le bouton "Nouvelle facture"
    document.querySelector('.billing-actions .primary-btn').addEventListener('click', function() {
        showInvoiceForm();
    });
    
    // Ajouter un gestionnaire d'événement pour éditer une facture en cliquant sur la ligne
    document.addEventListener('click', function(e) {
        const invoiceItem = e.target.closest('.invoice-item');
        if (invoiceItem && !e.target.closest('.invoice-actions')) {
            const invoiceId = invoiceItem.querySelector('div:first-child').textContent;
            viewInvoice(invoiceId);
        }
    });

    // Gestionnaire pour le bouton "Exporter"
    document.querySelector('.billing-actions button:nth-child(2)').addEventListener('click', function() {
        exportInvoicesToCSV();
    });

    // Gestionnaire pour le bouton "Imprimer"
    document.querySelector('.billing-actions button:nth-child(3)').addEventListener('click', function() {
        printAllInvoices();
    });

    // Gestionnaire pour le bouton "Filtrer"
    document.querySelector('.billing-filters .primary-btn').addEventListener('click', function() {
        filterInvoices();
    });

    // Fonctions pour les actions sur les factures
    function viewInvoice(invoiceId) {
        const invoice = invoiceData.find(inv => inv.id === invoiceId);
        if (invoice) {
            // Créer un modal pour afficher les détails de la facture
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content invoice-details-modal">
                    <span class="close-modal">&times;</span>
                    <div class="invoice-preview">
                        ${generateInvoiceHTML(invoice)}
                    </div>
                    <div class="invoice-actions-bar">
                        <button class="primary-btn edit-invoice-btn"><i class="fas fa-edit"></i> Modifier</button>
                        <button class="secondary-btn print-invoice-btn"><i class="fas fa-print"></i> Imprimer</button>
                        <button class="secondary-btn send-invoice-btn"><i class="fas fa-envelope"></i> Envoyer</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            
            // Gestionnaire d'événement pour fermer le modal
            modal.querySelector('.close-modal').addEventListener('click', function() {
                document.body.removeChild(modal);
            });
            
            // Gestionnaire pour le bouton d'édition
            modal.querySelector('.edit-invoice-btn').addEventListener('click', function() {
                document.body.removeChild(modal);
                editInvoice(invoiceId);
            });
            
            // Gestionnaire pour le bouton d'impression
            modal.querySelector('.print-invoice-btn').addEventListener('click', function() {
                printInvoice(invoiceId);
            });
            
            // Gestionnaire pour le bouton d'envoi
            modal.querySelector('.send-invoice-btn').addEventListener('click', function() {
                document.body.removeChild(modal);
                sendInvoice(invoiceId);
            });
        }
    }

    function printInvoice(invoiceId) {
        const invoice = invoiceData.find(inv => inv.id === invoiceId);
        if (invoice) {
            // Ouvrir une nouvelle fenêtre avec le modèle de facture formaté pour l'impression
            const printWindow = window.open('', '_blank');
            printWindow.document.write(generateInvoiceHTML(invoice, true));
            printWindow.document.close();
            // Déclencher l'impression après le chargement complet
            printWindow.onload = function() {
                printWindow.print();
                // printWindow.close(); // Optionnel: fermer après impression
            };
        }
    }
    
    // Fonction pour exporter les factures au format CSV
    function exportInvoicesToCSV() {
        // Préparer les données pour l'export
        const filteredInvoices = getFilteredInvoices();
        
        // Créer l'en-tête du CSV
        let csvContent = "N° Facture;Patient;Date;Période;Montant;Statut;Organisme;Taux de couverture\n";
        
        // Ajouter les données de chaque facture
        filteredInvoices.forEach(invoice => {
            // Convertir le statut en français
            let statusText = '';
            switch(invoice.statut) {
                case 'paid': statusText = 'Payée'; break;
                case 'pending': statusText = 'En attente'; break;
                case 'overdue': statusText = 'En retard'; break;
            }
            
            // Formater le montant
            const formattedAmount = invoice.montant.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' FCFA';
            
            // Ajouter la ligne au CSV
            csvContent += `${invoice.id};${invoice.patient};${invoice.date};${invoice.periodeDu} au ${invoice.periodeAu};${formattedAmount};${statusText};${invoice.organisme};${invoice.tauxCouverture}%\n`;
        });
        
        // Créer un objet Blob pour le téléchargement
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        // Créer un lien de téléchargement
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `factures_labomedic_${new Date().toISOString().slice(0,10)}.csv`);
        link.style.visibility = 'hidden';
        
        // Ajouter le lien au document
        document.body.appendChild(link);
        
        // Cliquer sur le lien pour déclencher le téléchargement
        link.click();
        
        // Nettoyer
        document.body.removeChild(link);
    }

    // Fonction pour obtenir les factures filtrées
    function getFilteredInvoices() {
        // Récupérer les valeurs des filtres
        const dateFrom = document.getElementById('date-from').value;
        const dateTo = document.getElementById('date-to').value;
        const status = document.getElementById('status-filter').value;
        const insurance = document.getElementById('insurance-filter').value;
        
        // Convertir les dates pour la comparaison
        const fromDate = new Date(dateFrom);
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59); // Inclure toute la journée de fin
        
        // Filtrer les factures
        return invoiceData.filter(invoice => {
            const invoiceDate = parseDate(invoice.date);
            
            // Vérifier la plage de dates
            const dateMatch = invoiceDate >= fromDate && invoiceDate <= toDate;
            
            // Vérifier le statut
            const statusMatch = status === 'all' || invoice.statut === status;
            
            // Vérifier l'organisme payeur
            const insuranceMatch = insurance === 'all' || invoice.organisme === insurance;
            
            return dateMatch && statusMatch && insuranceMatch;
        });
    }

    // Fonction pour imprimer toutes les factures
    function printAllInvoices() {
        // Filtrer les factures selon les critères actuels
        const filteredInvoices = getFilteredInvoices();
        
        if (filteredInvoices.length === 0) {
            alert('Aucune facture à imprimer avec les filtres actuels.');
            return;
        }
        
        // Récupérer les dates de filtrage pour l'affichage
        const dateFrom = document.getElementById('date-from').value;
        const dateTo = document.getElementById('date-to').value;
        const fromDate = new Date(dateFrom);
        const toDate = new Date(dateTo);
        
        // Créer une nouvelle fenêtre pour l'impression
        const printWindow = window.open('', '_blank');
        
        // Créer le contenu HTML pour l'impression
        let printContent = `
            <!DOCTYPE html>
            <html lang="fr">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Factures - LaboMedic Gabon</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                    .page-break { page-break-after: always; }
                    h1 { text-align: center; color: #1a5276; }
                    .invoice-list { margin-bottom: 20px; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    .text-right { text-align: right; }
                    .text-center { text-align: center; }
                    .footer { text-align: center; font-size: 12px; color: #777; margin-top: 30px; }
                    @media print {
                        body { padding: 0; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="no-print">
                    <button onclick="window.print()" style="padding: 10px 20px; background-color: #1a5276; color: white; border: none; border-radius: 4px; cursor: pointer; margin-bottom: 20px;">Imprimer toutes les factures</button>
                </div>
                
                <h1>Liste des factures - LaboMedic Gabon</h1>
                <p class="text-center">Période du ${formatDateFr(fromDate)} au ${formatDateFr(toDate)}</p>
                
                <div class="invoice-list">
                    <table>
                        <thead>
                            <tr>
                                <th>N° Facture</th>
                                <th>Patient</th>
                                <th>Date</th>
                                <th>Période</th>
                                <th>Organisme</th>
                                <th>Taux</th>
                                <th class="text-right">Montant</th>
                                <th>Statut</th>
                            </tr>
                        </thead>
                        <tbody>
        `;
        
        // Ajouter chaque facture à la liste
        let totalAmount = 0;
        
        filteredInvoices.forEach(invoice => {
            // Convertir le statut en français
            let statusText = '';
            switch(invoice.statut) {
                case 'paid': statusText = 'Payée'; break;
                case 'pending': statusText = 'En attente'; break;
                case 'overdue': statusText = 'En retard'; break;
            }
            
            // Formater le montant
            const formattedAmount = invoice.montant.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' FCFA';
            
            // Ajouter la ligne au tableau
            printContent += `
                <tr>
                    <td>${invoice.id}</td>
                    <td>${invoice.patient}</td>
                    <td>${invoice.date}</td>
                    <td>${invoice.periodeDu} au ${invoice.periodeAu}</td>
                    <td>${invoice.organisme}</td>
                    <td>${invoice.tauxCouverture}%</td>
                    <td class="text-right">${formattedAmount}</td>
                    <td>${statusText}</td>
                </tr>
            `;
            
            totalAmount += invoice.montant;
        });
        
        // Ajouter le total général
        const formattedTotal = totalAmount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' FCFA';
        
        printContent += `
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="6" class="text-right"><strong>Total:</strong></td>
                                <td class="text-right"><strong>${formattedTotal}</strong></td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                
                <div class="footer">
                    <p>LaboMedic Gabon - Centre de Dialyse | Libreville, Quartier Glass | Tél: +241 XX XX XX XX</p>
                </div>
            </body>
            </html>
        `;
        
        // Écrire le contenu dans la nouvelle fenêtre
        printWindow.document.write(printContent);
        printWindow.document.close();
        
        // Déclencher l'impression après le chargement complet
        printWindow.onload = function() {
            // printWindow.print();
            // printWindow.close(); // Optionnel: fermer après impression
        };
    }

    // Fonction pour envoyer une facture par email
    function sendInvoice(invoiceId) {
        const invoice = invoiceData.find(inv => inv.id === invoiceId);
        if (invoice) {
            // Créer un modal pour le formulaire d'envoi
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close-modal">&times;</span>
                    <h2>Envoyer la facture ${invoice.id}</h2>
                    <form id="send-invoice-form">
                        <div class="form-group">
                            <label for="recipient-email">Email du destinataire:</label>
                            <input type="email" id="recipient-email" required>
                        </div>
                        <div class="form-group">
                            <label for="email-subject">Objet:</label>
                            <input type="text" id="email-subject" value="Facture ${invoice.id} - LaboMedic Gabon" required>
                        </div>
                        <div class="form-group">
                            <label for="email-message">Message:</label>
                            <textarea id="email-message" rows="5">Bonjour,

Veuillez trouver ci-joint votre facture ${invoice.id} pour la période du ${invoice.periodeDu} au ${invoice.periodeAu}.

Cordialement,
L'équipe LaboMedic Gabon</textarea>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="secondary-btn" id="cancel-send">Annuler</button>
                            <button type="submit" class="primary-btn">Envoyer</button>
                        </div>
                    </form>
                </div>
            `;
            document.body.appendChild(modal);
            
            // Gestionnaire pour fermer le modal
            modal.querySelector('.close-modal').addEventListener('click', function() {
                document.body.removeChild(modal);
            });
            
            // Gestionnaire pour le bouton d'annulation
            modal.querySelector('#cancel-send').addEventListener('click', function() {
                document.body.removeChild(modal);
            });
            
            // Gestionnaire pour le formulaire d'envoi
            modal.querySelector('#send-invoice-form').addEventListener('submit', function(e) {
                e.preventDefault();
                const email = document.getElementById('recipient-email').value;
                const subject = document.getElementById('email-subject').value;
                const message = document.getElementById('email-message').value;
                
                // Simuler l'envoi de l'email
                setTimeout(function() {
                    document.body.removeChild(modal);
                    alert(`La facture ${invoice.id} a été envoyée à ${email}`);
                }, 1000);
                
                // Ici, on implémenterait l'envoi réel de l'email avec la facture en pièce jointe
            });
        }
    }

    // Fonction pour supprimer une facture
    function deleteInvoice(invoiceId) {
        const invoice = invoiceData.find(inv => inv.id === invoiceId);
        if (invoice) {
            if (confirm(`Êtes-vous sûr de vouloir supprimer la facture ${invoiceId} ?`)) {
                // Supprimer la facture du tableau
                invoiceData = invoiceData.filter(inv => inv.id !== invoiceId);
                
                // Sauvegarder les modifications
                saveInvoices();
                
                // Mettre à jour l'affichage
                displayInvoices(invoiceData);
                
                // Notification
                alert(`La facture ${invoiceId} a été supprimée.`);
            }
        }
    }

    // Fonction pour filtrer les factures
    function filterInvoices() {
        const filteredInvoices = getFilteredInvoices();
        displayInvoices(filteredInvoices);
    }

    // Fonction pour afficher les factures
    function displayInvoices(invoices) {
        const invoiceList = document.querySelector('.invoice-list');
        if (!invoiceList) return;
        
        // Vider la liste actuelle (sauf l'en-tête)
        const header = invoiceList.querySelector('.invoice-list-header');
        invoiceList.innerHTML = '';
        if (header) {
            invoiceList.appendChild(header.cloneNode(true));
        } else {
            // Créer l'en-tête si elle n'existe pas
            const newHeader = document.createElement('div');
            newHeader.className = 'invoice-list-header';
            newHeader.innerHTML = `
                <div>N° Facture</div>
                <div>Patient</div>
                <div>Date</div>
                <div>Montant</div>
                <div>Statut</div>
                <div>Actions</div>
            `;
            invoiceList.appendChild(newHeader);
        }
        
        // Ajouter chaque facture à la liste
        if (invoices.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-list-message';
            emptyMessage.textContent = 'Aucune facture trouvée.';
            invoiceList.appendChild(emptyMessage);
        } else {
            invoices.forEach(invoice => {
                const invoiceItem = document.createElement('div');
                invoiceItem.className = 'invoice-item';
                
                // Convertir le statut en classe CSS et texte
                let statusClass = '';
                let statusText = '';
                switch(invoice.statut) {
                    case 'paid':
                        statusClass = 'status-paid';
                        statusText = 'Payée';
                        break;
                    case 'pending':
                        statusClass = 'status-pending';
                        statusText = 'En attente';
                        break;
                    case 'overdue':
                        statusClass = 'status-overdue';
                        statusText = 'En retard';
                        break;
                }
                
                // Formater le montant
                const formattedAmount = invoice.montant.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' FCFA';
                
                // Remplir l'élément avec les données de la facture
                invoiceItem.innerHTML = `
                    <div>${invoice.id}</div>
                    <div>${invoice.patient}</div>
                    <div>${invoice.date}</div>
                    <div>${formattedAmount}</div>
                    <div><span class="status-badge ${statusClass}">${statusText}</span></div>
                    <div class="invoice-actions">
                        <button class="view-btn" title="Voir"><i class="fas fa-eye"></i></button>
                        <button class="print-btn" title="Imprimer"><i class="fas fa-print"></i></button>
                        <button class="send-btn" title="Envoyer"><i class="fas fa-envelope"></i></button>
                        <button class="delete-btn" title="Supprimer"><i class="fas fa-trash"></i></button>
                    </div>
                `;
                
                invoiceList.appendChild(invoiceItem);
            });
            
            // Ajouter les gestionnaires d'événements pour les boutons d'action
            document.querySelectorAll('.invoice-actions button').forEach(button => {
                button.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const action = this.classList[0];
                    const invoiceItem = this.closest('.invoice-item');
                    const invoiceId = invoiceItem.querySelector('div:first-child').textContent;
                    
                    switch(action) {
                        case 'view-btn':
                            viewInvoice(invoiceId);
                            break;
                        case 'print-btn':
                            printInvoice(invoiceId);
                            break;
                        case 'send-btn':
                            sendInvoice(invoiceId);
                            break;
                        case 'delete-btn':
                            deleteInvoice(invoiceId);
                            break;
                    }
                });
            });
            
            // Ajouter un gestionnaire d'événement pour éditer une facture en cliquant sur la ligne
            document.querySelectorAll('.invoice-item').forEach(item => {
                item.addEventListener('click', function(e) {
                    if (!e.target.closest('.invoice-actions')) {
                        const invoiceId = this.querySelector('div:first-child').textContent;
                        viewInvoice(invoiceId);
                    }
                });
            });
        }
        
        // Mettre à jour les statistiques
        updateStatistics(invoices);
    }

    // Fonction pour mettre à jour les statistiques
    function updateStatistics(invoices) {
        const totalAmount = invoices.reduce((sum, invoice) => sum + invoice.montant, 0);
        const paidAmount = invoices.filter(inv => inv.statut === 'paid')
                                  .reduce((sum, invoice) => sum + invoice.montant, 0);
        const pendingAmount = invoices.filter(inv => inv.statut === 'pending')
                                     .reduce((sum, invoice) => sum + invoice.montant, 0);
        const overdueAmount = invoices.filter(inv => inv.statut === 'overdue')
                                     .reduce((sum, invoice) => sum + invoice.montant, 0);
        
        // Formater les montants
        const formatAmount = amount => amount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' FCFA';
        
        // Mettre à jour les éléments HTML
        document.querySelector('.stat-card:nth-child(1) h3').textContent = formatAmount(totalAmount);
        document.querySelector('.stat-card:nth-child(2) h3').textContent = formatAmount(paidAmount);
        document.querySelector('.stat-card:nth-child(3) h3').textContent = formatAmount(pendingAmount);
        document.querySelector('.stat-card:nth-child(4) h3').textContent = formatAmount(overdueAmount);
        document.querySelector('.stat-card:nth-child(5) h3').textContent = invoices.length.toString();
    }

    // Fonction pour afficher le formulaire de création/édition de facture
    function showInvoiceForm(invoiceId = null) {
        // Récupérer la facture à éditer si un ID est fourni
        const invoice = invoiceId ? invoiceData.find(inv => inv.id === invoiceId) : null;
        
        // Créer un modal pour le formulaire
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content invoice-form-modal">
                <span class="close-modal">&times;</span>
                <h2>${invoice ? 'Modifier la facture' : 'Nouvelle facture'}</h2>
                <form id="invoice-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="invoice-number">N° Facture:</label>
                            <input type="text" id="invoice-number" value="${invoice ? invoice.id : generateInvoiceNumber()}" required>
                        </div>
                        <div class="form-group">
                            <label for="invoice-date">Date d'émission:</label>
                            <input type="date" id="invoice-date" value="${invoice ? convertToISODate(invoice.date) : new Date().toISOString().split('T')[0]}" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="period-from">Période du:</label>
                            <input type="date" id="period-from" value="${invoice ? convertToISODate(invoice.periodeDu) : ''}" required>
                        </div>
                        <div class="form-group">
                            <label for="period-to">au:</label>
                            <input type="date" id="period-to" value="${invoice ? convertToISODate(invoice.periodeAu) : ''}" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="patient-select">Patient:</label>
                            <select id="patient-select" required>
                                <option value="">Sélectionner un patient</option>
                                ${generatePatientOptions(invoice ? invoice.patientId : null)}
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="patient-dob">Date de naissance:</label>
                            <input type="text" id="patient-dob" value="${invoice ? invoice.dateNaissance : ''}" readonly>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="insurance-select">Organisme payeur:</label>
                            <select id="insurance-select" required>
                                <option value="">Sélectionner un organisme</option>
                                <option value="CNAMGS" ${invoice && invoice.organisme === 'CNAMGS' ? 'selected' : ''}>CNAMGS</option>
                                <option value="CNSS" ${invoice && invoice.organisme === 'CNSS' ? 'selected' : ''}>CNSS</option>
                                <option value="NSIA" ${invoice && invoice.organisme === 'NSIA' ? 'selected' : ''}>NSIA</option>
                                <option value="ASCOMA" ${invoice && invoice.organisme === 'ASCOMA' ? 'selected' : ''}>ASCOMA</option>
                                <option value="Autre" ${invoice && !['CNAMGS', 'CNSS', 'NSIA', 'ASCOMA'].includes(invoice.organisme) ? 'selected' : ''}>Autre</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="insurance-type">Type d'assurance:</label>
                            <input type="text" id="insurance-type" value="${invoice ? invoice.typeAssurance : ''}" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="patient-id">N° Identification:</label>
                            <input type="text" id="patient-id" value="${invoice ? invoice.numeroIdentification : ''}" required>
                        </div>
                        <div class="form-group">
                            <label for="doctor-name">Médecin référent:</label>
                            <input type="text" id="doctor-name" value="${invoice ? invoice.medecinReferent : ''}" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="coverage-rate">Taux de couverture (%):</label>
                            <input type="number" id="coverage-rate" min="0" max="100" value="${invoice ? invoice.tauxCouverture : '90'}" required>
                        </div>
                        <div class="form-group">
                            <label for="invoice-status">Statut:</label>
                            <select id="invoice-status" required>
                                <option value="pending" ${invoice && invoice.statut === 'pending' ? 'selected' : ''}>En attente</option>
                                <option value="paid" ${invoice && invoice.statut === 'paid' ? 'selected' : ''}>Payée</option>
                                <option value="overdue" ${invoice && invoice.statut === 'overdue' ? 'selected' : ''}>En retard</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="payment-method-insurance">Mode de paiement (Assurance):</label>
                            <select id="payment-method-insurance" required>
                                <option value="Facturation directe" ${invoice && invoice.modePaiementAssurance === 'Facturation directe' ? 'selected' : ''}>Facturation directe</option>
                                <option value="Remboursement" ${invoice && invoice.modePaiementAssurance === 'Remboursement' ? 'selected' : ''}>Remboursement</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="payment-method-patient">Mode de paiement (Patient):</label>
                            <select id="payment-method-patient" required>
                                <option value="Mobile money (Airtel Money)" ${invoice && invoice.modePaiementPatient === 'Mobile money (Airtel Money)' ? 'selected' : ''}>Mobile money (Airtel Money)</option>
                                <option value="Mobile money (Moov Money)" ${invoice && invoice.modePaiementPatient === 'Mobile money (Moov Money)' ? 'selected' : ''}>Mobile money (Moov Money)</option>
                                <option value="Espèces" ${invoice && invoice.modePaiementPatient === 'Espèces' ? 'selected' : ''}>Espèces</option>
                                <option value="Carte bancaire" ${invoice && invoice.modePaiementPatient === 'Carte bancaire' ? 'selected' : ''}>Carte bancaire</option>
                                <option value="Chèque" ${invoice && invoice.modePaiementPatient === 'Chèque' ? 'selected' : ''}>Chèque</option>
                            </select>
                        </div>
                    </div>
                    
                    <h3>Détails de la facture</h3>
                    <table class="invoice-details-table" id="invoice-details-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Description</th>
                                <th>Quantité</th>
                                <th>Prix unitaire (FCFA)</th>
                                <th>Total (FCFA)</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="invoice-details-body">
                            ${invoice && invoice.details.length > 0 ? generateDetailsRows(invoice.details) : generateEmptyDetailRow()}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="6">
                                    <button type="button" class="secondary-btn" id="add-detail-row"><i class="fas fa-plus"></i> Ajouter une ligne</button>
                                </td>
                            </tr>
                            <tr>
                                <td colspan="4" class="text-right"><strong>Total:</strong></td>
                                <td id="invoice-total" class="text-right"><strong>${invoice ? formatAmount(invoice.montant) : '0 FCFA'}</strong></td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                    
                    <div class="form-actions">
                        <button type="button" class="secondary-btn" id="cancel-invoice">Annuler</button>
                        <button type="submit" class="primary-btn">${invoice ? 'Mettre à jour' : 'Créer'} la facture</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Gestionnaire pour fermer le modal
        modal.querySelector('.close-modal').addEventListener('click', function() {
            document.body.removeChild(modal);
        });
        
        // Gestionnaire pour le bouton d'annulation
        modal.querySelector('#cancel-invoice').addEventListener('click', function() {
            document.body.removeChild(modal);
        });
        
        // Gestionnaire pour le bouton d'ajout de ligne
        modal.querySelector('#add-detail-row').addEventListener('click', function() {
            const tbody = document.getElementById('invoice-details-body');
            const newRow = document.createElement('tr');
            newRow.innerHTML = generateEmptyDetailRow(true);
            tbody.appendChild(newRow);
            
            // Ajouter les gestionnaires d'événements pour la nouvelle ligne
            addDetailRowEventListeners(newRow);
        });
        
        // Ajouter les gestionnaires d'événements pour les lignes existantes
        document.querySelectorAll('#invoice-details-body tr').forEach(row => {
            addDetailRowEventListeners(row);
        });
        
        // Gestionnaire pour le changement de patient
        document.getElementById('patient-select').addEventListener('change', function() {
            const patientId = this.value;
            const patient = patients.find(p => p.id === patientId);
            if (patient) {
                document.getElementById('patient-dob').value = patient.dateNaissance || '';
            } else {
                document.getElementById('patient-dob').value = '';
            }
        });
        
        // Gestionnaire pour le formulaire
        document.getElementById('invoice-form').addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Récupérer les valeurs du formulaire
            const invoiceNumber = document.getElementById('invoice-number').value;
            const invoiceDate = formatDateFr(new Date(document.getElementById('invoice-date').value));
            const periodFrom = formatDateFr(new Date(document.getElementById('period-from').value));
            const periodTo = formatDateFr(new Date(document.getElementById('period-to').value));
            const patientId = document.getElementById('patient-select').value;
            const patientSelect = document.getElementById('patient-select');
            const patientName = patientSelect.options[patientSelect.selectedIndex].text;
            const patientDob = document.getElementById('patient-dob').value;
            const insurance = document.getElementById('insurance-select').value;
            const insuranceType = document.getElementById('insurance-type').value;
            const patientIdNumber = document.getElementById('patient-id').value;
            const doctorName = document.getElementById('doctor-name').value;
            const coverageRate = parseInt(document.getElementById('coverage-rate').value);
            const status = document.getElementById('invoice-status').value;
            const paymentMethodInsurance = document.getElementById('payment-method-insurance').value;
            const paymentMethodPatient = document.getElementById('payment-method-patient').value;
            
            // Récupérer les détails de la facture
            const details = [];
            let totalAmount = 0;
            
            document.querySelectorAll('#invoice-details-body tr').forEach(row => {
                const date = row.querySelector('input[name="detail-date"]').value;
                const description = row.querySelector('input[name="detail-description"]').value;
                const quantity = parseInt(row.querySelector('input[name="detail-quantity"]').value);
                const unitPrice = parseInt(row.querySelector('input[name="detail-price"]').value);
                const itemTotal = quantity * unitPrice;
                
                if (date && description && quantity && unitPrice) {
                    details.push({
                        date: formatDateFr(new Date(date)),
                        description,
                        quantite: quantity,
                        prixUnitaire: unitPrice
                    });
                    
                    totalAmount += itemTotal;
                }
            });
            
            // Calculer les montants
            const montantPrisEnCharge = Math.round(totalAmount * coverageRate / 100);
            const ticketModerateur = totalAmount - montantPrisEnCharge;
            
            // Créer ou mettre à jour la facture
            const newInvoice = {
                id: invoiceNumber,
                patient: patientName,
                patientId,
                dateNaissance: patientDob,
                date: invoiceDate,
                periodeDu: periodFrom,
                periodeAu: periodTo,
                montant: totalAmount,
                statut: status,
                organisme: insurance,
                typeAssurance: insuranceType,
                numeroIdentification: patientIdNumber,
                medecinReferent: doctorName,
                tauxCouverture: coverageRate,
                montantPrisEnCharge,
                ticketModerateur,
                modePaiementAssurance: paymentMethodInsurance,
                modePaiementPatient: paymentMethodPatient,
                details
            };
            
            if (invoice) {
                // Mettre à jour la facture existante
                const index = invoiceData.findIndex(inv => inv.id === invoice.id);
                if (index !== -1) {
                    invoiceData[index] = newInvoice;
                }
            } else {
                // Ajouter la nouvelle facture
                invoiceData.push(newInvoice);
            }
            
            // Sauvegarder les modifications
            saveInvoices();
            
            // Mettre à jour l'affichage
            displayInvoices(invoiceData);
            
            // Fermer le modal
            document.body.removeChild(modal);
            
            // Notification
            alert(`La facture ${invoiceNumber} a été ${invoice ? 'mise à jour' : 'créée'} avec succès.`);
        });
    }
    
    // Fonction pour ajouter les gestionnaires d'événements aux lignes de détail
    function addDetailRowEventListeners(row) {
        // Gestionnaire pour le bouton de suppression
        const deleteBtn = row.querySelector('.delete-row-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', function() {
                if (document.querySelectorAll('#invoice-details-body tr').length > 1) {
                    row.remove();
                    updateInvoiceTotal();
                } else {
                    alert('Vous ne pouvez pas supprimer toutes les lignes. Au moins une ligne est requise.');
                }
            });
        }
        
        // Gestionnaires pour les champs de quantité et de prix
        const quantityInput = row.querySelector('input[name="detail-quantity"]');
        const priceInput = row.querySelector('input[name="detail-price"]');
        const totalCell = row.querySelector('.detail-total');
        
        if (quantityInput && priceInput && totalCell) {
            const updateRowTotal = function() {
                const quantity = parseInt(quantityInput.value) || 0;
                const price = parseInt(priceInput.value) || 0;
                const total = quantity * price;
                totalCell.textContent = formatAmount(total);
                updateInvoiceTotal();
            };
            
            quantityInput.addEventListener('input', updateRowTotal);
            priceInput.addEventListener('input', updateRowTotal);
        }
    }
    
    // Fonction pour mettre à jour le total de la facture
    function updateInvoiceTotal() {
        let total = 0;
        
        document.querySelectorAll('#invoice-details-body tr').forEach(row => {
            const quantityInput = row.querySelector('input[name="detail-quantity"]');
            const priceInput = row.querySelector('input[name="detail-price"]');
            
            if (quantityInput && priceInput) {
                const quantity = parseInt(quantityInput.value) || 0;
                const price = parseInt(priceInput.value) || 0;
                total += quantity * price;
            }
        });
        
        const totalElement = document.getElementById('invoice-total');
        if (totalElement) {
            totalElement.textContent = formatAmount(total);
        }
        
        // Mettre à jour les montants de prise en charge
        const coverageRateInput = document.getElementById('coverage-rate');
        if (coverageRateInput) {
            const coverageRate = parseInt(coverageRateInput.value) || 0;
            const montantPrisEnCharge = Math.round(total * coverageRate / 100);
            const ticketModerateur = total - montantPrisEnCharge;
            
            // Mettre à jour les champs si nécessaire
        }
    }
    
    // Fonction pour générer un numéro de facture
    function generateInvoiceNumber() {
        const today = new Date();
        const year = today.getFullYear();
        const lastInvoice = invoiceData
            .filter(inv => inv.id.startsWith(`DIAL-${year}`))
            .sort((a, b) => b.id.localeCompare(a.id))[0];
        
        let number = 1;
        if (lastInvoice) {
            const lastNumber = parseInt(lastInvoice.id.split('-')[2]);
            number = lastNumber + 1;
        }
        
        return `DIAL-${year}-${number.toString().padStart(5, '0')}`;
    }
    
    // Fonction pour générer les options de patients
    function generatePatientOptions(selectedId = null) {
        return patients.map(patient => {
            return `<option value="${patient.id}" ${patient.id === selectedId ? 'selected' : ''}>${patient.nom}</option>`;
        }).join('');
    }
    
    // Fonction pour générer les lignes de détail
    function generateDetailsRows(details) {
        return details.map(detail => {
            const total = detail.quantite * detail.prixUnitaire;
            return `
                <tr>
                    <td><input type="date" name="detail-date" value="${convertToISODate(detail.date)}" required></td>
                    <td><input type="text" name="detail-description" value="${detail.description}" required></td>
                    <td><input type="number" name="detail-quantity" value="${detail.quantite}" min="1" required></td>
                    <td><input type="number" name="detail-price" value="${detail.prixUnitaire}" min="0" required></td>
                    <td class="text-right detail-total">${formatAmount(total)}</td>
                    <td><button type="button" class="delete-row-btn"><i class="fas fa-trash"></i></button></td>
                </tr>
            `;
        }).join('');
    }
    
    // Fonction pour générer une ligne de détail vide
    function generateEmptyDetailRow() {
        return `
            <tr>
                <td><input type="date" name="detail-date" required></td>
                <td><input type="text" name="detail-description" value="Séance de dialyse" required></td>
                <td><input type="number" name="detail-quantity" value="1" min="1" required></td>
                <td><input type="number" name="detail-price" value="75000" min="0" required></td>
                <td class="text-right detail-total">75 000 FCFA</td>
                <td><button type="button" class="delete-row-btn"><i class="fas fa-trash"></i></button></td>
            </tr>
        `;
    }
    
    // Fonction pour convertir une date au format français vers ISO
    function convertToISODate(dateStr) {
        const parts = dateStr.split('/');
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    // Fonction pour générer le HTML d'une facture
    function generateInvoiceHTML(invoice, forPrinting = false) {
        // Formater les montants
        const formatAmount = amount => amount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' FCFA';
        
        // Calculer le total
        const total = invoice.details.reduce((sum, item) => sum + (item.quantite * item.prixUnitaire), 0);
        
        // Créer le HTML de la facture
        let invoiceHTML = `
            <!DOCTYPE html>
            <html lang="fr">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Facture ${invoice.id} - LaboMedic Gabon</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; padding: ${forPrinting ? '0' : '20px'}; }
                    .invoice-container { max-width: 800px; margin: 0 auto; padding: 20px; border: ${forPrinting ? 'none' : '1px solid #ddd'}; }
                    .invoice-header { display: flex; justify-content: space-between; margin-bottom: 30px; }
                    .invoice-logo { font-size: 20px; font-weight: bold; }
                    .invoice-logo span { font-size: 14px; font-weight: normal; display: block; color: #666; }
                    .invoice-info { text-align: right; font-size: 14px; }
                    .invoice-title { text-align: center; font-size: 22px; margin: 20px 0; font-weight: bold; }
                    .invoice-details { margin-bottom: 20px; }
                    .invoice-details-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
                    .invoice-details-col { width: 48%; }
                    .invoice-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    .invoice-table th, .invoice-table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                    .invoice-table th { background-color: #f5f5f5; }
                    .text-right { text-align: right; }
                    .text-center { text-align: center; }
                    .invoice-summary { margin-top: 20px; border-top: 1px solid #ddd; padding-top: 20px; }
                    .invoice-summary-table { width: 100%; border-collapse: collapse; }
                    .invoice-summary-table th, .invoice-summary-table td { padding: 8px; text-align: left; }
                    .invoice-payment { margin-top: 30px; }
                    .invoice-footer { margin-top: 50px; text-align: center; font-size: 12px; color: #777; }
                    @media print {
                        body { padding: 0; }
                        .invoice-container { border: none; padding: 0; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                ${forPrinting ? '' : '<div class="no-print"><button onclick="window.print()" style="padding: 10px 20px; background-color: #1a5276; color: white; border: none; border-radius: 4px; cursor: pointer; margin-bottom: 20px;">Imprimer</button></div>'}
                
                <div class="invoice-container">
                    <div class="invoice-header">
                        <div class="invoice-logo">
                            🧾 LaboMedic – Centre de Dialyse
                            <span>Libreville, Quartier Glass</span>
                            <span>Tél: +241 XX XX XX XX</span>
                            <span>Email: contact@labomedic.ga</span>
                            <span>N° RCCM: GA-LBV-2023-B-12345</span>
                            <span>NIF: 123456789</span>
                        </div>
                        <div class="invoice-info">
                            <p><strong>Facture N°:</strong> ${invoice.id}</p>
                            <p><strong>Date d'émission:</strong> ${invoice.date}</p>
                            <p><strong>Période de traitement:</strong> du ${invoice.periodeDu} au ${invoice.periodeAu}</p>
                        </div>
                    </div>
                    
                    <div class="invoice-title">Facture de Dialyse</div>
                    
                    <div class="invoice-details">
                        <div class="invoice-details-row">
                            <div class="invoice-details-col">
                                <h3>Informations du patient:</h3>
                                <p><strong>Nom & Prénom:</strong> ${invoice.patient}</p>
                                <p><strong>Date de naissance:</strong> ${invoice.dateNaissance}</p>
                                <p><strong>Numéro d'identification CNAMGS/CNSS:</strong> ${invoice.numeroIdentification}</p>
                            </div>
                            <div class="invoice-details-col">
                                <h3>Assurance / Organisme payeur:</h3>
                                <p>${invoice.organisme} – ${invoice.typeAssurance}</p>
                                <p><strong>Médecin référent:</strong> ${invoice.medecinReferent}</p>
                            </div>
                        </div>
                    </div>
                    
                    <h3>💉 Détail des prestations</h3>
                    <table class="invoice-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Prestation</th>
                                <th class="text-center">Qté</th>
                                <th class="text-right">PU (FCFA)</th>
                                <th class="text-right">Total (FCFA)</th>
                            </tr>
                        </thead>
                        <tbody>
        `;
        
        // Ajouter les détails de la facture
        invoice.details.forEach(item => {
            const itemTotal = item.quantite * item.prixUnitaire;
            invoiceHTML += `
                <tr>
                    <td>${item.date}</td>
                    <td>${item.description}</td>
                    <td class="text-center">${item.quantite}</td>
                    <td class="text-right">${formatAmount(item.prixUnitaire)}</td>
                    <td class="text-right">${formatAmount(itemTotal)}</td>
                </tr>
            `;
        });
        
        // Ajouter le total
        invoiceHTML += `
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="4" class="text-right"><strong>Total Brut</strong></td>
                                <td class="text-right"><strong>${formatAmount(total)}</strong></td>
                            </tr>
                        </tfoot>
                    </table>
                    
                    <h3>💳 Récapitulatif du règlement</h3>
                    <table class="invoice-table">
                        <thead>
                            <tr>
                                <th>Organisme payeur</th>
                                <th class="text-right">Montant pris en charge</th>
                                <th class="text-right">% prise en charge</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>${invoice.organisme} (${invoice.typeAssurance})</td>
                                <td class="text-right">${formatAmount(invoice.montantPrisEnCharge)}</td>
                                <td class="text-right">${invoice.tauxCouverture}%</td>
                            </tr>
                            <tr>
                                <td>Ticket modérateur (Patient)</td>
                                <td class="text-right">${formatAmount(invoice.ticketModerateur)}</td>
                                <td class="text-right">${100 - invoice.tauxCouverture}%</td>
                            </tr>
                            <tr>
                                <td><strong>Total à payer</strong></td>
                                <td class="text-right"><strong>${formatAmount(total)}</strong></td>
                                <td class="text-right">100%</td>
                            </tr>
                        </tbody>
                    </table>
                    
                    <div class="invoice-payment">
                        <h3>Mode de paiement:</h3>
                        <p>✅ ${invoice.organisme} – ${invoice.modePaiementAssurance}</p>
                        <p>✅ Patient – ${invoice.modePaiementPatient}</p>
                    </div>
                    
                    <div class="invoice-footer">
                        <p>LaboMedic Gabon - Centre de Dialyse | Libreville, Quartier Glass | Tél: +241 XX XX XX XX</p>
                    </div>
                </div>
            </body>
            </html>
        `;
        
        return invoiceHTML;
    }

    // Fonction pour parser une date au format français (JJ/MM/AAAA)
    function parseDate(dateStr) {
        const parts = dateStr.split('/');
        return new Date(parts[2], parts[1] - 1, parts[0]);
    }

    // Fonction pour formater une date au format français
    function formatDateFr(date) {
        return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    // Fonction pour obtenir le nom du mois
    function getMonthName(monthIndex) {
        const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
        return months[monthIndex];
    }

    // Fonction pour formater un montant en FCFA
    function formatMoney(amount) {
        return amount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' FCFA';
    }