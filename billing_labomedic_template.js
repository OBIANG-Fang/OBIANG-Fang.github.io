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