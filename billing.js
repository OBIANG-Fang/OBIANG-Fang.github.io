// Script pour la gestion de la facturation - NephroSys

document.addEventListener('DOMContentLoaded', function() {
    // Récupération des données patients et produits pharmaceutiques
    const patients = JSON.parse(localStorage.getItem('nephrosys_patients')) || [];
    const inventoryData = JSON.parse(localStorage.getItem('nephrosys_inventory')) || [];

    // Données de test pour les factures (à remplacer par une API ou une base de données)
    let invoiceData = JSON.parse(localStorage.getItem('nephrosys_invoices')) || [
        {
            id: 'CDL-2023-00001',
            patient: 'Dupont Jean',
            patientId: 'P-001',
            date: '05/06/2023',
            montant: 255000,
            statut: 'paid',
            organisme: 'CNAMGS',
            tauxCouverture: 80,
            details: [
                { description: 'Séance d\'hémodialyse', quantite: 3, prixUnitaire: 85000 }
            ]
        },
        {
            id: 'CDL-2023-00002',
            patient: 'Martin Sophie',
            patientId: 'P-002',
            date: '08/06/2023',
            montant: 195000,
            statut: 'paid',
            organisme: 'CNSS',
            tauxCouverture: 100,
            details: [
                { description: 'Séance d\'hémodialyse', quantite: 2, prixUnitaire: 85000 },
                { description: 'Consultation néphrologique', quantite: 1, prixUnitaire: 25000 }
            ]
        },
        {
            id: 'CDL-2023-00003',
            patient: 'Petit Robert',
            patientId: 'P-003',
            date: '10/06/2023',
            montant: 305000,
            statut: 'pending',
            organisme: 'ASCOMA',
            tauxCouverture: 75,
            details: [
                { description: 'Séance d\'hémodialyse', quantite: 3, prixUnitaire: 85000 },
                { description: 'Médicaments', quantite: 1, prixUnitaire: 50000 }
            ]
        },
        {
            id: 'CDL-2023-00004',
            patient: 'Dubois Marie',
            patientId: 'P-004',
            date: '12/06/2023',
            montant: 230000,
            statut: 'overdue',
            organisme: 'CNAMGS',
            tauxCouverture: 80,
            details: [
                { description: 'Séance d\'hémodialyse', quantite: 2, prixUnitaire: 85000 },
                { description: 'Analyses biologiques', quantite: 1, prixUnitaire: 60000 }
            ]
        },
        {
            id: 'CDL-2023-00005',
            patient: 'Leroy Thomas',
            patientId: 'P-005',
            date: '15/06/2023',
            montant: 205000,
            statut: 'pending',
            organisme: 'NSIA',
            tauxCouverture: 90,
            details: [
                { description: 'Séance d\'hémodialyse', quantite: 2, prixUnitaire: 85000 },
                { description: 'Consultation néphrologique', quantite: 1, prixUnitaire: 35000 }
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
        const filteredInvoices = invoiceData.filter(invoice => {
            // Appliquer les filtres actuels
            const dateFrom = document.getElementById('date-from').value;
            const dateTo = document.getElementById('date-to').value;
            const status = document.getElementById('status-filter').value;
            const insurance = document.getElementById('insurance-filter').value;
            
            // Convertir les dates pour la comparaison
            const fromDate = new Date(dateFrom);
            const toDate = new Date(dateTo);
            toDate.setHours(23, 59, 59); // Inclure toute la journée de fin
            
            const invoiceDate = parseDate(invoice.date);
            
            // Vérifier la plage de dates
            const dateMatch = invoiceDate >= fromDate && invoiceDate <= toDate;
            
            // Vérifier le statut
            const statusMatch = status === 'all' || invoice.statut === status;
            
            // Vérifier l'organisme payeur
            const insuranceMatch = insurance === 'all' || invoice.organisme === insurance;
            
            return dateMatch && statusMatch && insuranceMatch;
        });
        
        // Créer l'en-tête du CSV
        let csvContent = "N° Facture;Patient;Date;Montant;Statut;Organisme;Taux de couverture\n";
        
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
            csvContent += `${invoice.id};${invoice.patient};${invoice.date};${formattedAmount};${statusText};${invoice.organisme};${invoice.tauxCouverture}%\n`;
        });
        
        // Créer un objet Blob pour le téléchargement
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        // Créer un lien de téléchargement
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `factures_cdl_${new Date().toISOString().slice(0,10)}.csv`);
        link.style.visibility = 'hidden';
        
        // Ajouter le lien au document
        document.body.appendChild(link);
        
        // Cliquer sur le lien pour déclencher le téléchargement
        link.click();
        
        // Nettoyer
        document.body.removeChild(link);
    }

    // Fonction pour imprimer toutes les factures
    function printAllInvoices() {
        // Filtrer les factures selon les critères actuels
        const dateFrom = document.getElementById('date-from').value;
        const dateTo = document.getElementById('date-to').value;
        const status = document.getElementById('status-filter').value;
        const insurance = document.getElementById('insurance-filter').value;
        
        // Convertir les dates pour la comparaison
        const fromDate = new Date(dateFrom);
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59); // Inclure toute la journée de fin
        
        // Filtrer les factures
        const filteredInvoices = invoiceData.filter(invoice => {
            const invoiceDate = parseDate(invoice.date);
            
            // Vérifier la plage de dates
            const dateMatch = invoiceDate >= fromDate && invoiceDate <= toDate;
            
            // Vérifier le statut
            const statusMatch = status === 'all' || invoice.statut === status;
            
            // Vérifier l'organisme payeur
            const insuranceMatch = insurance === 'all' || invoice.organisme === insurance;
            
            return dateMatch && statusMatch && insuranceMatch;
        });
        
        if (filteredInvoices.length === 0) {
            alert('Aucune facture à imprimer avec les filtres actuels.');
            return;
        }
        
        // Créer une nouvelle fenêtre pour l'impression
        const printWindow = window.open('', '_blank');
        
        // Créer le contenu HTML pour l'impression
        let printContent = `
            <!DOCTYPE html>
            <html lang="fr">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Factures - Centre de Dialyse de Libreville</title>
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
                
                <h1>Liste des factures - Centre de Dialyse de Libreville</h1>
                <p class="text-center">Période du ${formatDateFr(fromDate)} au ${formatDateFr(toDate)}</p>
                
                <div class="invoice-list">
                    <table>
                        <thead>
                            <tr>
                                <th>N° Facture</th>
                                <th>Patient</th>
                                <th>Date</th>
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
                                <td colspan="5" class="text-right"><strong>Total général:</strong></td>
                                <td class="text-right"><strong>${formattedTotal}</strong></td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                
                <div class="page-break"></div>
        `;
        
        // Ajouter chaque facture individuelle
        filteredInvoices.forEach((invoice, index) => {
            printContent += generateInvoiceHTML(invoice, true);
            
            // Ajouter un saut de page sauf pour la dernière facture
            if (index < filteredInvoices.length - 1) {
                printContent += '<div class="page-break"></div>';
            }
        });
        
        // Fermer le document HTML
        printContent += `
                <div class="footer">
                    <p>Centre de Dialyse de Libreville - Soins de qualité pour tous les patients insuffisants rénaux</p>
                    <p>Document généré le ${formatDateFr(new Date())}</p>
                </div>
            </body>
            </html>
        `;
        
        // Écrire le contenu dans la nouvelle fenêtre
        printWindow.document.write(printContent);
        printWindow.document.close();
        
        // Déclencher l'impression après le chargement complet
        printWindow.onload = function() {
            printWindow.print();
        };
    }
    
    // Fonction pour formater une date pour les champs input
    function formatDateForInput(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    // Fonction pour formater une date au format français (JJ/MM/AAAA)
    function formatDateFr(date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }
    
    // Fonction pour générer le HTML d'une facture pour l'impression ou l'affichage
    function generateInvoiceHTML(invoice, forPrinting = false) {
        // Formater les montants en FCFA
        const formatFCFA = (amount) => {
            return amount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' FCFA';
        };
        
        // Calculer le montant pris en charge et le reste à charge
        const totalAmount = invoice.montant;
        const coveredAmount = (totalAmount * invoice.tauxCouverture / 100);
        const patientAmount = totalAmount - coveredAmount;
        
        // Déterminer le statut de la facture en français
        let statusText = '';
        switch(invoice.statut) {
            case 'paid': statusText = 'Payée'; break;
            case 'pending': statusText = 'En attente'; break;
            case 'overdue': statusText = 'En retard'; break;
        }
        
        // Générer les lignes de détail
        const detailRows = invoice.details.map(item => {
            const itemTotal = item.quantite * item.prixUnitaire;
            return `
                <tr>
                    <td>${item.description}</td>
                    <td class="text-center">${item.quantite}</td>
                    <td class="text-right">${formatFCFA(item.prixUnitaire)}</td>
                    <td class="text-right">${formatFCFA(itemTotal)}</td>
                </tr>
            `;
        }).join('');
        
        // Construire le HTML de la facture
        return `
            <!DOCTYPE html>
            <html lang="fr">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Facture ${invoice.id} - Centre de Dialyse de Libreville</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 20px;
                        color: #333;
                    }
                    .invoice-container {
                        max-width: 800px;
                        margin: 0 auto;
                        border: 1px solid #ddd;
                        padding: 30px;
                        position: relative;
                    }
                    .invoice-header {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 30px;
                        border-bottom: 2px solid #1a5276;
                        padding-bottom: 20px;
                    }
                    .logo-container {
                        flex: 1;
                    }
                    .logo {
                        max-width: 200px;
                        height: auto;
                    }
                    .company-info {
                        flex: 1;
                        text-align: right;
                    }
                    .invoice-title {
                        font-size: 24px;
                        font-weight: bold;
                        color: #1a5276;
                        margin-bottom: 15px;
                        text-align: center;
                    }
                    .invoice-details {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 30px;
                    }
                    .client-info, .invoice-info {
                        flex: 1;
                    }
                    .invoice-info {
                        text-align: right;
                    }
                    .invoice-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 30px;
                    }
                    .invoice-table th, .invoice-table td {
                        padding: 10px;
                        border: 1px solid #ddd;
                    }
                    .invoice-table th {
                        background-color: #f8f9fa;
                        text-align: left;
                    }
                    .text-center {
                        text-align: center;
                    }
                    .text-right {
                        text-align: right;
                    }
                    .invoice-total {
                        margin-top: 20px;
                        text-align: right;
                    }
                    .invoice-total table {
                        width: 300px;
                        margin-left: auto;
                    }
                    .invoice-total table td {
                        padding: 5px;
                    }
                    .invoice-total table tr.total-row td {
                        border-top: 2px solid #1a5276;
                        font-weight: bold;
                    }
                    .invoice-notes {
                        margin-top: 30px;
                        border-top: 1px solid #ddd;
                        padding-top: 20px;
                    }
                    .invoice-footer {
                        margin-top: 50px;
                        text-align: center;
                        font-size: 12px;
                        color: #777;
                    }
                    .status-badge {
                        display: inline-block;
                        padding: 5px 10px;
                        border-radius: 4px;
                        font-weight: bold;
                    }
                    .status-paid {
                        background-color: #d4edda;
                        color: #155724;
                    }
                    .status-pending {
                        background-color: #fff3cd;
                        color: #856404;
                    }
                    .status-overdue {
                        background-color: #f8d7da;
                        color: #721c24;
                    }
                    @media print {
                        body {
                            padding: 0;
                            background-color: white;
                        }
                        .invoice-container {
                            border: none;
                            padding: 0;
                        }
                        .no-print {
                            display: none;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="invoice-container">
                    <div class="invoice-header">
                        <div class="logo-container">
                            <!-- Logo du Centre de Dialyse de Libreville -->
                            <h2>Centre de Dialyse de Libreville</h2>
                        </div>
                        <div class="company-info">
                            <p>Centre de Dialyse de Libreville</p>
                            <p>BP 2134, Libreville, Gabon</p>
                            <p>Tél: (+241) 011 73 92 25</p>
                            <p>Email: contact@cdl-gabon.com</p>
                            <p>RCCM: GA-LBV-01-2020-B12-00123</p>
                            <p>NIF: 123456 A</p>
                        </div>
                    </div>
                    
                    <div class="invoice-title">
                        FACTURE N° ${invoice.id}
                        <div>
                            <span class="status-badge status-${invoice.statut}">${statusText}</span>
                        </div>
                    </div>
                    
                    <div class="invoice-details">
                        <div class="client-info">
                            <h3>Patient</h3>
                            <p><strong>Nom:</strong> ${invoice.patient}</p>
                            <p><strong>N° Dossier:</strong> ${invoice.patientId}</p>
                            <p><strong>Organisme payeur:</strong> ${invoice.organisme}</p>
                            <p><strong>Taux de couverture:</strong> ${invoice.tauxCouverture}%</p>
                        </div>
                        <div class="invoice-info">
                            <h3>Détails de la facture</h3>
                            <p><strong>Date d'émission:</strong> ${invoice.date}</p>
                            <p><strong>Période de soins:</strong> Du 01/${invoice.date.substring(3)} au ${invoice.date}</p>
                            <p><strong>Mode de règlement:</strong> Tiers payant</p>
                            <p><strong>Échéance:</strong> 30 jours</p>
                        </div>
                    </div>
                    
                    <table class="invoice-table">
                        <thead>
                            <tr>
                                <th>Description</th>
                                <th class="text-center">Quantité</th>
                                <th class="text-right">Prix unitaire</th>
                                <th class="text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${detailRows}
                        </tbody>
                    </table>
                    
                    <div class="invoice-total">
                        <table>
                            <tr>
                                <td>Total TTC:</td>
                                <td class="text-right">${formatFCFA(totalAmount)}</td>
                            </tr>
                            <tr>
                                <td>Montant pris en charge (${invoice.tauxCouverture}%):</td>
                                <td class="text-right">${formatFCFA(coveredAmount)}</td>
                            </tr>
                            <tr class="total-row">
                                <td>Reste à charge patient:</td>
                                <td class="text-right">${formatFCFA(patientAmount)}</td>
                            </tr>
                        </table>
                    </div>
                    
                    <div class="invoice-notes">
                        <h3>Notes</h3>
                        <p>Merci de régler cette facture dans les 30 jours suivant sa réception.</p>
                        <p>Pour toute question concernant cette facture, veuillez contacter notre service comptabilité au (+241) 011 73 92 26 ou par email à facturation@cdl-gabon.com</p>
                    </div>
                    
                    <div class="invoice-footer">
                        <p>Centre de Dialyse de Libreville - Soins de qualité pour tous les patients insuffisants rénaux</p>
                        <p>Agrément Ministère de la Santé N° 00123/MS/SG/DGPS</p>
                    </div>
                    
                    ${!forPrinting ? '<div class="no-print"><button onclick="window.print()" style="padding: 10px 20px; background-color: #1a5276; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 20px;">Imprimer la facture</button></div>' : ''}
                </div>
            </body>
            </html>
        `;
    }
    
    // Fonction pour mettre à jour une facture existante
    function updateExistingInvoice(invoiceId) {
        // Récupérer l'index de la facture à mettre à jour
        const invoiceIndex = invoiceData.findIndex(inv => inv.id === invoiceId);
        if (invoiceIndex === -1) return;
        
        // Récupérer les données du formulaire
        const invoiceDate = document.getElementById('invoice-date').value;
        const patientSelect = document.getElementById('patient-select');
        const patientId = patientSelect.value;
        const patientName = patientSelect.options[patientSelect.selectedIndex].text;
        const organisme = document.getElementById('insurance-provider').value;
        const tauxCouverture = parseInt(document.getElementById('coverage-rate').value);
        const statut = document.getElementById('invoice-status').value;
        
        // Récupérer les détails des prestations
        const details = [];
        const rows = document.querySelectorAll('#invoice-items tr');
        let montantTotal = 0;
        
        rows.forEach(row => {
            const description = row.querySelector('.item-description').value;
            const quantite = parseInt(row.querySelector('.item-quantity').value);
            const prixUnitaire = parseInt(row.querySelector('.item-price').value);
            
            details.push({
                description: description,
                quantite: quantite,
                prixUnitaire: prixUnitaire
            });
            
            montantTotal += quantite * prixUnitaire;
        });
        
        // Mettre à jour l'objet facture
        invoiceData[invoiceIndex] = {
            ...invoiceData[invoiceIndex],
            patient: patientName,
            patientId: patientId,
            date: formatDateFr(new Date(invoiceDate)),
            montant: montantTotal,
            statut: statut,
            organisme: organisme,
            tauxCouverture: tauxCouverture,
            details: details
        };
        
        // Sauvegarder les modifications
        saveInvoices();
        
        // Fermer le modal
        const modal = document.querySelector('.modal');
        document.body.removeChild(modal);
        
        // Mettre à jour l'affichage
        alert(`Facture ${invoiceId} mise à jour avec succès`);
        
        // Recharger la page pour actualiser la liste
        location.reload();
    }

    function sendInvoice(invoiceId) {
        const invoice = invoiceData.find(inv => inv.id === invoiceId);
        if (invoice) {
            // Créer un modal pour l'envoi par email
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close-modal">&times;</span>
                    <h2>Envoyer la facture ${invoice.id}</h2>
                    <form id="send-invoice-form">
                        <div class="form-group">
                            <label for="email">Adresse email</label>
                            <input type="email" id="email" required>
                        </div>
                        <div class="form-group">
                            <label for="message">Message</label>
                            <textarea id="message" rows="4">Veuillez trouver ci-joint la facture ${invoice.id} du Centre de Dialyse de Libreville.</textarea>
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="primary-btn">Envoyer</button>
                            <button type="button" class="secondary-btn cancel-btn">Annuler</button>
                        </div>
                    </form>
                </div>
            `;
            document.body.appendChild(modal);
            
            // Gestionnaires d'événements pour le modal
            modal.querySelector('.close-modal').addEventListener('click', function() {
                document.body.removeChild(modal);
            });
            
            modal.querySelector('.cancel-btn').addEventListener('click', function() {
                document.body.removeChild(modal);
            });
            
            modal.querySelector('#send-invoice-form').addEventListener('submit', function(e) {
                e.preventDefault();
                const email = document.getElementById('email').value;
                alert(`La facture ${invoice.id} a été envoyée à ${email}`);
                document.body.removeChild(modal);
                // Ici, on enverrait réellement l'email avec la facture en pièce jointe
            });
        }
    }

    function deleteInvoice(invoiceId) {
        if (confirm(`Êtes-vous sûr de vouloir supprimer la facture ${invoiceId} ?`)) {
            // Supprimer la facture du tableau
            invoiceData = invoiceData.filter(inv => inv.id !== invoiceId);
            // Sauvegarder les modifications
            saveInvoices();
            // Mettre à jour l'affichage
            alert(`Facture ${invoiceId} supprimée`);
            // Recharger la page pour actualiser la liste
            location.reload();
        }
    }

    function filterInvoices() {
        const dateFrom = document.getElementById('date-from').value;
        const dateTo = document.getElementById('date-to').value;
        const status = document.getElementById('status-filter').value;
        const insurance = document.getElementById('insurance-filter').value;
        
        // Convertir les dates pour la comparaison
        const fromDate = new Date(dateFrom);
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59); // Inclure toute la journée de fin
        
        // Filtrer les factures
        const filteredInvoices = invoiceData.filter(invoice => {
            const invoiceDate = parseDate(invoice.date);
            
            // Vérifier la plage de dates
            const dateMatch = invoiceDate >= fromDate && invoiceDate <= toDate;
            
            // Vérifier le statut
            const statusMatch = status === 'all' || invoice.statut === status;
            
            // Vérifier l'organisme payeur
            const insuranceMatch = insurance === 'all' || invoice.organisme === insurance;
            
            return dateMatch && statusMatch && insuranceMatch;
        });
        
        // Mettre à jour l'affichage
        displayInvoices(filteredInvoices);
    }
    
    // Fonction pour convertir une date au format français (JJ/MM/AAAA) en objet Date
    function parseDate(dateStr) {
        const parts = dateStr.split('/');
        return new Date(parts[2], parts[1] - 1, parts[0]);
    }
    
    // Fonction pour afficher les factures dans la liste
    function displayInvoices(invoices) {
        const invoiceList = document.querySelector('.invoice-list');
        
        // Conserver l'en-tête
        const header = invoiceList.querySelector('.invoice-list-header');
        
        // Vider la liste actuelle
        invoiceList.innerHTML = '';
        
        // Remettre l'en-tête
        invoiceList.appendChild(header);
        
        // Ajouter chaque facture
        invoices.forEach(invoice => {
            const invoiceItem = document.createElement('div');
            invoiceItem.className = 'invoice-item';
            
            // Déterminer la classe de statut
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
            
            // Formater le montant en FCFA
            const formattedAmount = invoice.montant.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' FCFA'
            
            invoiceItem.innerHTML = `
                <div>${invoice.id}</div>
                <div>${invoice.patient}</div>
                <div>${invoice.date}</div>
                <div>${formattedAmount}</div>
                <div><span class="status-badge ${statusClass}">${statusText}</span></div>
                <div class="invoice-actions">
                    <button class="view-btn"><i class="fas fa-eye"></i></button>
                    <button class="print-btn"><i class="fas fa-print"></i></button>
                    <button class="send-btn"><i class="fas fa-envelope"></i></button>
                    <button class="delete-btn"><i class="fas fa-trash"></i></button>
                </div>
            `;
            
            // Ajouter les gestionnaires d'événements pour les boutons
            invoiceItem.querySelectorAll('.invoice-actions button').forEach(button => {
                button.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const action = this.classList[0];
                    
                    switch(action) {
                        case 'view-btn':
                            viewInvoice(invoice.id);
                            break;
                        case 'print-btn':
                            printInvoice(invoice.id);
                            break;
                        case 'send-btn':
                            sendInvoice(invoice.id);
                            break;
                        case 'delete-btn':
                            deleteInvoice(invoice.id);
                            break;
                    }
                });
            });
            
            invoiceList.appendChild(invoiceItem);
        });
        
        // Mettre à jour les statistiques
        updateInvoiceStats(invoices);
    }
    
    // Fonction pour mettre à jour les statistiques de facturation
    function updateInvoiceStats(invoices) {
        const statsCards = document.querySelectorAll('.stat-card');
        
        if (statsCards.length >= 4) {
            // Calculer les montants totaux
            const totalAmount = invoices.reduce((sum, invoice) => sum + invoice.montant, 0);
            const paidAmount = invoices
                .filter(invoice => invoice.statut === 'paid')
                .reduce((sum, invoice) => sum + invoice.montant, 0);
            const pendingAmount = invoices
                .filter(invoice => invoice.statut === 'pending')
                .reduce((sum, invoice) => sum + invoice.montant, 0);
            const overdueCount = invoices.filter(invoice => invoice.statut === 'overdue').length;
            
            // Mettre à jour les statistiques
            statsCards[0].querySelector('h3').textContent = totalAmount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' FCFA';
            statsCards[1].querySelector('h3').textContent = paidAmount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' FCFA';
            statsCards[2].querySelector('h3').textContent = pendingAmount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' FCFA';
            statsCards[3].querySelector('h3').textContent = overdueCount;
        }
    }
    
    // Fonction pour générer un numéro de facture
    function generateInvoiceNumber() {
        const year = new Date().getFullYear();
        const nextNumber = invoiceData.length + 1;
        return `CDL-${year}-${String(nextNumber).padStart(5, '0')}`;
    }
    
    // Fonction pour afficher le formulaire de création/édition de facture
    function showInvoiceForm(invoice = null) {
        // Récupérer la liste des patients pour le formulaire
        const patientOptions = patients.map(patient => 
            `<option value="${patient.id}">${patient.nom}</option>`
        ).join('');
        
        // Créer le modal
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content invoice-form-modal">
                <span class="close-modal">&times;</span>
                <h2>${invoice ? 'Modifier la facture' : 'Nouvelle facture'}</h2>
                <form id="invoice-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="invoice-number">Numéro de facture</label>
                            <input type="text" id="invoice-number" value="${generateInvoiceNumber()}" readonly>
                        </div>
                        <div class="form-group">
                            <label for="invoice-date">Date d'émission</label>
                            <input type="date" id="invoice-date" value="${formatDateForInput(new Date())}" required>
                        </div>
                        <div class="form-group">
                            <label for="invoice-period-start">Période de soins du</label>
                            <input type="date" id="invoice-period-start" value="${formatDateForInput(firstDayOfMonth)}" required>
                        </div>
                        <div class="form-group">
                            <label for="invoice-period-end">au</label>
                            <input type="date" id="invoice-period-end" value="${formatDateForInput(today)}" required>
                        </div>
                    </div>
                    
                    <h3>Informations du patient</h3>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="patient-select">Patient</label>
                            <select id="patient-select" required>
                                <option value="">Sélectionnez un patient</option>
                                ${patientOptions}
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="patient-id">N° de dossier interne</label>
                            <input type="text" id="patient-id" readonly>
                        </div>
                        <div class="form-group">
                            <label for="patient-dob">Date de naissance</label>
                            <input type="text" id="patient-dob" readonly>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="patient-address">Adresse</label>
                            <input type="text" id="patient-address" readonly>
                        </div>
                        <div class="form-group">
                            <label for="patient-phone">Téléphone</label>
                            <input type="text" id="patient-phone" readonly>
                        </div>
                    </div>
                    
                    <h3>Prise en charge</h3>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="insurance-provider">Organisme payeur</label>
                            <select id="insurance-provider" required>
                                <option value="CNAMGS">CNAMGS</option>
                                <option value="CNSS">CNSS</option>
                                <option value="ASCOMA">ASCOMA</option>
                                <option value="NSIA">NSIA</option>
                                <option value="SANLAM">SANLAM</option>
                                <option value="OGAR">OGAR</option>
                                <option value="Autre">Autre</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="insurance-number">N° de carte / police</label>
                            <input type="text" id="insurance-number" value="234 567 8910" required>
                        </div>
                        <div class="form-group">
                            <label for="coverage-rate">Taux de couverture (%)</label>
                            <input type="number" id="coverage-rate" min="0" max="100" value="100" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="coverage-validity">Validité prise en charge</label>
                            <input type="text" id="coverage-validity" value="01/01/2025 - 30/06/2025" required>
                        </div>
                        <div class="form-group">
                            <label for="payment-method">Mode de règlement</label>
                            <select id="payment-method" required>
                                <option value="tiers-payant">Paiement direct par l'organisme (tiers payant)</option>
                                <option value="patient">Paiement par le patient</option>
                                <option value="mixte">Paiement mixte</option>
                            </select>
                        </div>
                    </div>
                    
                    <h3>Détail des prestations</h3>
                    <table class="invoice-details-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Acte réalisé</th>
                                <th>Quantité</th>
                                <th>Tarif unitaire (FCFA)</th>
                                <th>Total (FCFA)</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="invoice-items">
                            <tr>
                                <td><input type="date" class="item-date" value="${formatDateForInput(today)}" required></td>
                                <td>
                                    <select class="item-description" required>
                                        <option value="Séance d'hémodialyse">Séance d'hémodialyse</option>
                                        <option value="Consultation néphrologique">Consultation néphrologique</option>
                                        <option value="Bilan biologique mensuel">Bilan biologique mensuel</option>
                                        <option value="Médicaments">Médicaments</option>
                                        <option value="Analyses biologiques">Analyses biologiques</option>
                                    </select>
                                </td>
                                <td><input type="number" class="item-quantity" min="1" value="1" required></td>
                                <td><input type="number" class="item-price" min="0" value="85000" required></td>
                                <td class="item-total">85,000 FCFA</td>
                                <td><button type="button" class="delete-row-btn"><i class="fas fa-trash"></i></button></td>
                            </tr>
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="4" class="text-right"><strong>Total général TTC :</strong></td>
                                <td id="invoice-total">85,000 FCFA</td>
                                <td></td>
                            </tr>
                            <tr>
                                <td colspan="4" class="text-right"><strong>Montant pris en charge :</strong></td>
                                <td id="covered-amount">85,000 FCFA</td>
                                <td></td>
                            </tr>
                            <tr>
                                <td colspan="4" class="text-right"><strong>Reste à charge patient :</strong></td>
                                <td id="patient-amount">0 FCFA</td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                    
                    <button type="button" id="add-item-btn" class="secondary-btn"><i class="fas fa-plus"></i> Ajouter une ligne</button>
                    
                    <h3>Validation</h3>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="medical-responsible">Responsable médical</label>
                            <input type="text" id="medical-responsible" value="Dr. A. MBOUMBA" required>
                        </div>
                        <div class="form-group">
                            <label for="invoice-status">Statut de la facture</label>
                            <select id="invoice-status" required>
                                <option value="pending">En attente</option>
                                <option value="paid">Payée</option>
                                <option value="overdue">En retard</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-actions">
                        <button type="submit" class="primary-btn">Enregistrer</button>
                        <button type="button" class="secondary-btn cancel-btn">Annuler</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Gestionnaires d'événements pour le modal
        modal.querySelector('.close-modal').addEventListener('click', function() {
            document.body.removeChild(modal);
        });
        
        modal.querySelector('.cancel-btn').addEventListener('click', function() {
            document.body.removeChild(modal);
        });
        
        // Gestionnaire pour le sélecteur de patient
        const patientSelect = document.getElementById('patient-select');
        patientSelect.addEventListener('change', function() {
            const selectedPatientId = this.value;
            const selectedPatient = patients.find(p => p.id === selectedPatientId);
            
            if (selectedPatient) {
                document.getElementById('patient-id').value = selectedPatient.id;
                document.getElementById('patient-dob').value = selectedPatient.dateNaissance;
                document.getElementById('patient-address').value = selectedPatient.adresse;
                document.getElementById('patient-phone').value = selectedPatient.telephone;
            } else {
                document.getElementById('patient-id').value = '';
                document.getElementById('patient-dob').value = '';
                document.getElementById('patient-address').value = '';
                document.getElementById('patient-phone').value = '';
            }
        });
        
        // Gestionnaire pour le bouton d'ajout de ligne
        document.getElementById('add-item-btn').addEventListener('click', function() {
            addInvoiceItem();
        });
        
        // Gestionnaire pour le calcul des totaux
        document.getElementById('invoice-items').addEventListener('input', function(e) {
            if (e.target.classList.contains('item-quantity') || e.target.classList.contains('item-price')) {
                updateInvoiceTotals();
            }
        });
        
        // Gestionnaire pour le taux de couverture
        document.getElementById('coverage-rate').addEventListener('input', function() {
            updateInvoiceTotals();
        });
        
        // Gestionnaire pour la soumission du formulaire
        document.getElementById('invoice-form').addEventListener('submit', function(e) {
            e.preventDefault();
            saveInvoiceForm();
        });
        
        // Initialiser les gestionnaires pour les boutons de suppression
        initDeleteButtons();
        
        // Mettre à jour les totaux initiaux
        updateInvoiceTotals();
    }
    
    // Fonction pour ajouter une ligne d'article à la facture
    // Fonction pour mettre à jour le total d'une ligne de facture
    function updateRowTotal(row) {
        const quantity = parseInt(row.querySelector('.item-quantity').value) || 0;
        const price = parseInt(row.querySelector('.item-price').value) || 0;
        const total = quantity * price;
        
        // Mettre à jour l'affichage du total
        row.querySelector('.item-total').textContent = total.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' FCFA';
        
        return total;
    }
    
    // Fonction pour mettre à jour les totaux de la facture
    function updateInvoiceTotals() {
        const rows = document.querySelectorAll('#invoice-items tr');
        let total = 0;
        
        // Calculer le total de chaque ligne et le total général
        rows.forEach(row => {
            total += updateRowTotal(row);
        });
        
        // Mettre à jour l'affichage du total général
        document.getElementById('invoice-total').textContent = total.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' FCFA';
        
        // Calculer le montant pris en charge et le reste à charge
        const coverageRate = parseInt(document.getElementById('coverage-rate').value) || 0;
        const coveredAmount = (total * coverageRate / 100);
        const patientAmount = total - coveredAmount;
        
        // Mettre à jour l'affichage des montants
        document.getElementById('covered-amount').textContent = coveredAmount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' FCFA';
        document.getElementById('patient-amount').textContent = patientAmount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' FCFA';
    }
    
    // Fonction pour initialiser les boutons de suppression de ligne
    function initDeleteButtons() {
        document.querySelectorAll('.delete-row-btn').forEach(button => {
            button.addEventListener('click', function() {
                const row = this.closest('tr');
                const tbody = row.parentNode;
                
                // Ne pas supprimer la dernière ligne
                if (tbody.children.length > 1) {
                    tbody.removeChild(row);
                    updateInvoiceTotals();
                } else {
                    alert('Vous ne pouvez pas supprimer toutes les lignes de la facture.');
                }
            });
        });
    }
    
    function addInvoiceItem() {
        const invoiceItems = document.getElementById('invoice-items');
        const newRow = document.createElement('tr');
        
        newRow.innerHTML = `
            <td><input type="date" class="item-date" value="${formatDateForInput(new Date())}" required></td>
            <td>
                <select class="item-description" required>
                    <option value="Séance d'hémodialyse">Séance d'hémodialyse</option>
                    <option value="Consultation néphrologique">Consultation néphrologique</option>
                    <option value="Bilan biologique mensuel">Bilan biologique mensuel</option>
                    <option value="Médicaments">Médicaments</option>
                    <option value="Analyses biologiques">Analyses biologiques</option>
                </select>
            </td>
            <td><input type="number" class="item-quantity" min="1" value="1" required></td>
            <td><input type="number" class="item-price" min="0" value="85000" required></td>
            <td class="item-total">85,000 FCFA</td>
            <td><button type="button" class="delete-row-btn"><i class="fas fa-trash"></i></button></td>
        `;
        
        invoiceItems.appendChild(newRow);
        
        // Ajouter le gestionnaire d'événement pour le bouton de suppression
        const deleteBtn = newRow.querySelector('.delete-row-btn');
        deleteBtn.addEventListener('click', function() {
            invoiceItems.removeChild(newRow);
            updateInvoiceTotals();
        });
        
        // Ajouter les gestionnaires pour les champs de quantité et prix
        const quantityInput = newRow.querySelector('.item-quantity');
        const priceInput = newRow.querySelector('.item-price');
        
        quantityInput.addEventListener('input', function() {
            updateRowTotal(newRow);
            updateInvoiceTotals();
        });
        
        priceInput.addEventListener('input', function() {
            updateRowTotal(newRow);
            updateInvoiceTotals();
        });
        
        // Mettre à jour le total de la ligne
        updateRowTotal(newRow);
        // Mettre à jour les totaux de la facture
        updateInvoiceTotals();
    }
    
    // Fonction pour sauvegarder le formulaire de facture
    function saveInvoiceForm() {
        // Récupérer les données du formulaire
        const invoiceNumber = document.getElementById('invoice-number').value;
        const invoiceDate = document.getElementById('invoice-date').value;
        const patientSelect = document.getElementById('patient-select');
        const patientId = patientSelect.value;
        const patientName = patientSelect.options[patientSelect.selectedIndex].text;
        const organisme = document.getElementById('insurance-provider').value;
        const tauxCouverture = parseInt(document.getElementById('coverage-rate').value);
        const statut = document.getElementById('invoice-status').value;
        
        // Récupérer les détails des prestations
        const details = [];
        const rows = document.querySelectorAll('#invoice-items tr');
        let montantTotal = 0;
        
        rows.forEach(row => {
            const description = row.querySelector('.item-description').value;
            const quantite = parseInt(row.querySelector('.item-quantity').value);
            const prixUnitaire = parseInt(row.querySelector('.item-price').value);
            
            details.push({
                description: description,
                quantite: quantite,
                prixUnitaire: prixUnitaire
            });
            
            montantTotal += quantite * prixUnitaire;
        });
        
        // Créer l'objet facture
        const newInvoice = {
            id: invoiceNumber,
            patient: patientName,
            patientId: patientId,
            date: formatDateFr(new Date(invoiceDate)),
            montant: montantTotal,
            statut: statut,
            organisme: organisme,
            tauxCouverture: tauxCouverture,
            details: details
        };
        
        // Ajouter la facture aux données
        invoiceData.push(newInvoice);
        
        // Sauvegarder les modifications
        saveInvoices();
        
        // Fermer le modal
        const modal = document.querySelector('.modal');
        document.body.removeChild(modal);
        
        // Mettre à jour l'affichage
        alert(`Facture ${invoiceNumber} enregistrée avec succès`);
        
        // Recharger la page pour actualiser la liste
        location.reload();
    }
    
    // Fonction pour éditer une facture existante
    function editInvoice(invoiceId) {
        const invoice = invoiceData.find(inv => inv.id === invoiceId);
        if (!invoice) return;
        
        // Afficher le formulaire de facture
        showInvoiceForm(invoice);
        
        // Remplir le formulaire avec les données de la facture
        document.getElementById('invoice-number').value = invoice.id;
        
        // Convertir la date au format YYYY-MM-DD pour le champ input
        const dateParts = invoice.date.split('/');
        const dateObj = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
        document.getElementById('invoice-date').value = formatDateForInput(dateObj);
        
        // Sélectionner le patient
        const patientSelect = document.getElementById('patient-select');
        patientSelect.value = invoice.patientId;
        
        // Déclencher l'événement change pour remplir les informations du patient
        const event = new Event('change');
        patientSelect.dispatchEvent(event);
        
        // Remplir les informations de prise en charge
        document.getElementById('insurance-provider').value = invoice.organisme;
        document.getElementById('coverage-rate').value = invoice.tauxCouverture;
        document.getElementById('invoice-status').value = invoice.statut;
        
        // Supprimer la ligne d'article par défaut
        const invoiceItems = document.getElementById('invoice-items');
        invoiceItems.innerHTML = '';
        
        // Ajouter les lignes d'articles de la facture
        invoice.details.forEach(detail => {
            const newRow = document.createElement('tr');
            
            newRow.innerHTML = `
                <td><input type="date" class="item-date" value="${formatDateForInput(dateObj)}" required></td>
                <td>
                    <select class="item-description" required>
                        <option value="Séance d'hémodialyse" ${detail.description === "Séance d'hémodialyse" ? 'selected' : ''}>Séance d'hémodialyse</option>
                        <option value="Consultation néphrologique" ${detail.description === "Consultation néphrologique" ? 'selected' : ''}>Consultation néphrologique</option>
                        <option value="Bilan biologique mensuel" ${detail.description === "Bilan biologique mensuel" ? 'selected' : ''}>Bilan biologique mensuel</option>
                        <option value="Médicaments" ${detail.description === "Médicaments" ? 'selected' : ''}>Médicaments</option>
                        <option value="Analyses biologiques" ${detail.description === "Analyses biologiques" ? 'selected' : ''}>Analyses biologiques</option>
                    </select>
                </td>
                <td><input type="number" class="item-quantity" min="1" value="${detail.quantite}" required></td>
                <td><input type="number" class="item-price" min="0" value="${detail.prixUnitaire}" required></td>
                <td class="item-total">${(detail.quantite * detail.prixUnitaire).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} FCFA</td>
                <td><button type="button" class="delete-row-btn"><i class="fas fa-trash"></i></button></td>
            `;
            
            invoiceItems.appendChild(newRow);
            
            // Ajouter les gestionnaires d'événements
            const quantityInput = newRow.querySelector('.item-quantity');
            const priceInput = newRow.querySelector('.item-price');
            const deleteBtn = newRow.querySelector('.delete-row-btn');
            
            quantityInput.addEventListener('input', function() {
                updateRowTotal(newRow);
                updateInvoiceTotals();
            });
            
            priceInput.addEventListener('input', function() {
                updateRowTotal(newRow);
                updateInvoiceTotals();
            });
            
            deleteBtn.addEventListener('click', function() {
                if (invoiceItems.children.length > 1) {
                    invoiceItems.removeChild(newRow);
                    updateInvoiceTotals();
                } else {
                    alert('Vous ne pouvez pas supprimer toutes les lignes de la facture.');
                }
            });
        });
        
        // Modifier le gestionnaire de soumission du formulaire pour mettre à jour la facture existante
        const form = document.getElementById('invoice-form');
        form.removeEventListener('submit', saveInvoiceForm);
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            updateExistingInvoice(invoiceId);
        });
        
        // Mettre à jour les totaux
        updateInvoiceTotals();
    }
    
    // Fonction pour mettre à jour une facture existante
    function updateExistingInvoice(invoiceId) {
        // Récupérer l'index de la facture à mettre à jour
        const invoiceIndex = invoiceData.findIndex(inv => inv.id === invoiceId);
        if (invoiceIndex === -1) return;
        
        // Récupérer les données du formulaire
        const invoiceDate = document.getElementById('invoice-date').value;
        const patientSelect = document.getElementById('patient-select');
        const patientId = patientSelect.value;
        const patientName = patientSelect.options[patientSelect.selectedIndex].text;
        const organisme = document.getElementById('insurance-provider').value;
        const tauxCouverture = parseInt(document.getElementById('coverage-rate').value);
        const statut = document.getElementById('invoice-status').value;
        
        // Récupérer les détails des prestations
        const details = [];
        const rows = document.querySelectorAll('#invoice-items tr');
        let montantTotal = 0;
        
        rows.forEach(row => {
            const description = row.querySelector('.item-description').value;
            const quantite = parseInt(row.querySelector('.item-quantity').value);
            const prixUnitaire = parseInt(row.querySelector('.item-price').value);
            
            details.push({
                description: description,
                quantite: quantite,
                prixUnitaire: prixUnitaire
            });
            
            montantTotal += quantite * prixUnitaire;
        });
        
        // Mettre à jour l'objet facture
        invoiceData[invoiceIndex] = {
            ...invoiceData[invoiceIndex],
            patient: patientName,
            patientId: patientId,
            date: formatDateFr(new Date(invoiceDate)),
            montant: montantTotal,
            statut