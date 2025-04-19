// Script pour le suivi médical - NephroSys

document.addEventListener('DOMContentLoaded', function() {
    // Récupérer l'ID du patient depuis l'URL si présent
    const urlParams = new URLSearchParams(window.location.search);
    const patientId = urlParams.get('patientId');
    // Données de test pour le suivi médical (à remplacer par une API ou une base de données)
    const medicalData = {
        'P-001': {
            patient: { id: 'P-001', nom: 'Dupont Jean', dateNaissance: '15/04/1965' },
            constantes: {
                poidsSec: 72.5,
                poidsAvantDialyse: 74.8,
                tensionArterielle: '145/90',
                frequenceCardiaque: 82,
                temperature: 36.8,
                spo2: 97
            },
            traitements: [
                { nom: 'Calciparine 5000 UI', posologie: '2 injections par séance de dialyse' },
                { nom: 'Aranesp 40 mcg', posologie: '1 injection par semaine' },
                { nom: 'Renvela 800 mg', posologie: '1 comprimé 3 fois par jour avec les repas' },
                { nom: 'Lovenox 4000 UI', posologie: '1 injection sous-cutanée par jour' }
            ],
            seances: [
                {
                    date: '12/06/2023',
                    duree: '4h00',
                    poidsAvant: 74.8,
                    poidsApres: 72.3,
                    uf: 2500,
                    taDebut: '145/90',
                    taFin: '135/85',
                    pouls: 82,
                    observations: 'Séance bien tolérée, pas de complications'
                },
                {
                    date: '10/06/2023',
                    duree: '4h00',
                    poidsAvant: 75.2,
                    poidsApres: 72.6,
                    uf: 2600,
                    taDebut: '150/95',
                    taFin: '130/80',
                    pouls: 85,
                    observations: 'Crampes en fin de séance, réduction de l\'UF'
                },
                {
                    date: '08/06/2023',
                    duree: '4h00',
                    poidsAvant: 74.5,
                    poidsApres: 72.2,
                    uf: 2300,
                    taDebut: '140/85',
                    taFin: '130/80',
                    pouls: 80,
                    observations: 'Séance bien tolérée'
                }
            ],
            complications: [
                {
                    date: '05/06/2023',
                    type: 'Hypotension intra-dialytique',
                    details: 'TA: 90/60 mmHg | Symptômes: Vertiges, nausées',
                    actions: 'Réduction de l\'UF, position de Trendelenburg, perfusion de sérum physiologique',
                    resolution: 'Complète après 30 minutes'
                },
                {
                    date: '28/05/2023',
                    type: 'Coagulation du circuit',
                    details: 'Cause probable: Dose d\'anticoagulant insuffisante',
                    actions: 'Changement du circuit, ajustement du protocole d\'anticoagulation',
                    resolution: 'Surveillance accrue lors des prochaines séances'
                }
            ],
            bilansSanguins: [
                {
                    date: '01/06/2023',
                    resultats: {
                        hemoglobine: 10.5,
                        hematocrite: 32,
                        leucocytes: 7500,
                        uree: 25,
                        creatinine: 850,
                        potassium: 5.2,
                        calcium: 2.2,
                        phosphore: 1.8,
                        albumine: 38,
                        crp: 5,
                        ferritine: 250,
                        cst: 25
                    }
                },
                {
                    date: '02/05/2023',
                    resultats: {
                        hemoglobine: 10.2,
                        hematocrite: 31,
                        leucocytes: 7200,
                        uree: 26,
                        creatinine: 870,
                        potassium: 5.0,
                        calcium: 2.3,
                        phosphore: 1.7,
                        albumine: 39,
                        crp: 3,
                        ferritine: 220,
                        cst: 23
                    }
                }
            ],
            prescriptions: [
                {
                    date: '05/06/2023',
                    type: 'Modification du traitement',
                    medecin: 'Dr. Lambert',
                    details: 'Ajout: Renvela 800 mg, 1 comprimé 3 fois par jour avec les repas',
                    motif: 'Hyperphosphorémie'
                },
                {
                    date: '15/05/2023',
                    type: 'Modification du protocole de dialyse',
                    medecin: 'Dr. Lambert',
                    details: 'Modification: Augmentation de la durée de dialyse à 4h30',
                    motif: 'Amélioration de l\'épuration des moyennes molécules'
                }
            ],
            alertes: [
                {
                    type: 'danger',
                    message: 'Hyperkaliémie détectée lors de la dernière séance (K+ = 6.2 mmol/L)'
                },
                {
                    type: 'info',
                    message: 'Prochain bilan sanguin prévu le 25/06/2023'
                }
            ]
        },
        // Données pour les autres patients (simplifiées pour l'exemple)
        'P-002': {
            patient: { id: 'P-002', nom: 'Martin Sophie', dateNaissance: '23/09/1972' },
            constantes: {
                poidsSec: 65.0,
                poidsAvantDialyse: 66.8,
                tensionArterielle: '130/80',
                frequenceCardiaque: 75,
                temperature: 36.5,
                spo2: 98
            },
            alertes: []
        },
        'P-003': {
            patient: { id: 'P-003', nom: 'Petit Robert', dateNaissance: '07/12/1958' },
            constantes: {
                poidsSec: 80.0,
                poidsAvantDialyse: 82.5,
                tensionArterielle: '140/85',
                frequenceCardiaque: 78,
                temperature: 36.7,
                spo2: 96
            },
            alertes: [
                {
                    type: 'info',
                    message: 'Prochain rendez-vous avec le néphrologue le 20/06/2023'
                }
            ]
        },
        'P-004': {
            patient: { id: 'P-004', nom: 'Dubois Marie', dateNaissance: '30/05/1980' },
            constantes: {
                poidsSec: 58.0,
                poidsAvantDialyse: 59.2,
                tensionArterielle: '125/75',
                frequenceCardiaque: 70,
                temperature: 36.6,
                spo2: 99
            },
            alertes: []
        },
        'P-005': {
            patient: { id: 'P-005', nom: 'Leroy Thomas', dateNaissance: '18/03/1975' },
            constantes: {
                poidsSec: 75.0,
                poidsAvantDialyse: 77.3,
                tensionArterielle: '135/85',
                frequenceCardiaque: 72,
                temperature: 36.9,
                spo2: 97
            },
            alertes: [
                {
                    type: 'danger',
                    message: 'Fistule artério-veineuse: thrill diminué, à surveiller'
                }
            ]
        }
    };

    // Éléments du DOM
    const patientSelect = document.getElementById('patient-select');
    const patientAlerts = document.getElementById('patient-alerts');
    const recordVitalsBtn = document.getElementById('record-vitals-btn');
    const vitalsForm = document.getElementById('vitals-form');
    const recordVitalsForm = document.getElementById('record-vitals-form');
    const cancelVitalsBtn = document.getElementById('cancel-vitals-btn');
    const newRecordBtn = document.getElementById('new-record-btn');
    const printBtn = document.getElementById('print-btn');
    const manageTreatmentBtn = document.getElementById('manage-treatment-btn');
    const historyTabs = document.querySelectorAll('.history-tab');
    const historyContents = document.querySelectorAll('.history-content');

    // Initialisation
    setupEventListeners();
    
    // Si un ID de patient est spécifié dans l'URL, sélectionner ce patient
    if (patientId && medicalData[patientId]) {
        patientSelect.value = patientId;
        displayPatientData(patientId);
    } else {
        hidePatientData(); // Cacher les données patient jusqu'à ce qu'un patient soit sélectionné
    }

    // Configuration des écouteurs d'événements
    function setupEventListeners() {
        // Sélection d'un patient
        if (patientSelect) {
            patientSelect.addEventListener('change', function() {
                const patientId = this.value;
                if (patientId) {
                    displayPatientData(patientId);
                } else {
                    hidePatientData();
                }
            });
        }

        // Affichage du formulaire de saisie des constantes
        if (recordVitalsBtn) {
            recordVitalsBtn.addEventListener('click', function() {
                vitalsForm.style.display = 'block';
                // Pré-remplir le formulaire avec les données actuelles si un patient est sélectionné
                const patientId = patientSelect.value;
                if (patientId && medicalData[patientId]) {
                    const constantes = medicalData[patientId].constantes;
                    document.getElementById('weight').value = constantes.poidsAvantDialyse;
                    document.getElementById('temperature').value = constantes.temperature;
                    const ta = constantes.tensionArterielle.split('/');
                    document.getElementById('systolic').value = ta[0];
                    document.getElementById('diastolic').value = ta[1];
                    document.getElementById('heart-rate').value = constantes.frequenceCardiaque;
                    document.getElementById('spo2').value = constantes.spo2;
                }
            });
        }

        // Annulation de la saisie des constantes
        if (cancelVitalsBtn) {
            cancelVitalsBtn.addEventListener('click', function() {
                vitalsForm.style.display = 'none';
            });
        }

        // Soumission du formulaire de constantes
        if (recordVitalsForm) {
            recordVitalsForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const patientId = patientSelect.value;
                if (patientId && medicalData[patientId]) {
                    // Mise à jour des données (simulation)
                    const constantes = medicalData[patientId].constantes;
                    constantes.poidsAvantDialyse = parseFloat(document.getElementById('weight').value);
                    constantes.temperature = parseFloat(document.getElementById('temperature').value);
                    constantes.tensionArterielle = `${document.getElementById('systolic').value}/${document.getElementById('diastolic').value}`;
                    constantes.frequenceCardiaque = parseInt(document.getElementById('heart-rate').value);
                    constantes.spo2 = parseInt(document.getElementById('spo2').value);
                    
                    // Mise à jour de l'affichage
                    displayPatientData(patientId);
                    vitalsForm.style.display = 'none';
                    
                    // Message de confirmation
                    alert('Constantes vitales enregistrées avec succès!');
                }
            });
        }

        // Gestion des onglets d'historique
        historyTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                // Désactiver tous les onglets
                historyTabs.forEach(t => t.classList.remove('active'));
                // Cacher tous les contenus
                historyContents.forEach(c => c.style.display = 'none');
                
                // Activer l'onglet cliqué
                this.classList.add('active');
                // Afficher le contenu correspondant
                const tabId = this.getAttribute('data-tab');
                document.getElementById(`${tabId}-content`).style.display = 'block';
            });
        });

        // Nouvelle saisie (pour l'exemple, ouvre le formulaire de constantes)
        if (newRecordBtn) {
            newRecordBtn.addEventListener('click', function() {
                if (patientSelect.value) {
                    vitalsForm.style.display = 'block';
                } else {
                    alert('Veuillez d\'abord sélectionner un patient.');
                }
            });
        }

        // Impression (simulation)
        if (printBtn) {
            printBtn.addEventListener('click', function() {
                if (patientSelect.value) {
                    window.print();
                } else {
                    alert('Veuillez d\'abord sélectionner un patient.');
                }
            });
        }

        // Gestion du traitement (simulation)
        if (manageTreatmentBtn) {
            manageTreatmentBtn.addEventListener('click', function() {
                if (patientSelect.value) {
                    alert('Fonctionnalité de gestion du traitement en cours de développement.');
                } else {
                    alert('Veuillez d\'abord sélectionner un patient.');
                }
            });
        }
    }

    // Afficher les données d'un patient
    function displayPatientData(patientId) {
        if (!medicalData[patientId]) return;
        
        const data = medicalData[patientId];
        
        // Afficher les alertes
        displayAlerts(data.alertes || []);
        
        // Afficher les constantes vitales
        if (data.constantes) {
            const constantes = data.constantes;
            const vitalSignsContainer = document.querySelector('.vital-signs');
            if (vitalSignsContainer) {
                // Mise à jour des valeurs dans le DOM
                updateVitalSign(vitalSignsContainer, 'Poids sec', `${constantes.poidsSec} kg`);
                updateVitalSign(vitalSignsContainer, 'Poids avant dialyse', `${constantes.poidsAvantDialyse} kg`, 
                    `${(constantes.poidsAvantDialyse - constantes.poidsSec).toFixed(1)} kg`, 
                    constantes.poidsAvantDialyse > constantes.poidsSec ? 'trend-up' : 'trend-down');
                updateVitalSign(vitalSignsContainer, 'Tension artérielle', constantes.tensionArterielle + ' mmHg');
                updateVitalSign(vitalSignsContainer, 'Fréquence cardiaque', constantes.frequenceCardiaque + ' bpm');
                updateVitalSign(vitalSignsContainer, 'Température', constantes.temperature + ' °C');
                updateVitalSign(vitalSignsContainer, 'SpO2', constantes.spo2 + ' %');
            }
        }
        
        // Afficher les traitements
        if (data.traitements) {
            const treatmentContainer = document.querySelector('.medical-card:nth-child(2)');
            if (treatmentContainer) {
                const treatmentItems = treatmentContainer.querySelectorAll('.history-item');
                data.traitements.forEach((traitement, index) => {
                    if (index < treatmentItems.length) {
                        const item = treatmentItems[index];
                        item.querySelector('.history-item-title').textContent = traitement.nom;
                        item.querySelector('.history-item-details').textContent = traitement.posologie;
                    }
                });
            }
        }
        
        // Afficher l'historique des séances
        if (data.seances) {
            const dialysisContent = document.getElementById('dialysis-content');
            if (dialysisContent) {
                dialysisContent.innerHTML = '';
                data.seances.forEach(seance => {
                    dialysisContent.appendChild(createHistoryItem(
                        'Séance d\'hémodialyse',
                        seance.date,
                        `Durée: ${seance.duree} | Poids avant: ${seance.poidsAvant} kg | Poids après: ${seance.poidsApres} kg | UF: ${seance.uf} ml<br>
                        TA début: ${seance.taDebut} mmHg | TA fin: ${seance.taFin} mmHg | Pouls: ${seance.pouls} bpm<br>
                        Observations: ${seance.observations}`
                    ));
                });
            }
        }
        
        // Afficher les complications
        if (data.complications) {
            const complicationsContent = document.getElementById('complications-content');
            if (complicationsContent) {
                complicationsContent.innerHTML = '';
                data.complications.forEach(complication => {
                    complicationsContent.appendChild(createHistoryItem(
                        complication.type,
                        complication.date,
                        `${complication.details}<br>
                        Actions: ${complication.actions}<br>
                        Résolution: ${complication.resolution}`
                    ));
                });
            }
        }
        
        // Afficher les bilans sanguins
        if (data.bilansSanguins) {
            const labsContent = document.getElementById('labs-content');
            if (labsContent) {
                labsContent.innerHTML = '';
                data.bilansSanguins.forEach(bilan => {
                    const resultats = bilan.resultats;
                    labsContent.appendChild(createHistoryItem(
                        'Bilan sanguin mensuel',
                        bilan.date,
                        `Hémoglobine: ${resultats.hemoglobine} g/dL | Hématocrite: ${resultats.hematocrite}% | Leucocytes: ${resultats.leucocytes}/mm³<br>
                        Urée: ${resultats.uree} mmol/L | Créatinine: ${resultats.creatinine} µmol/L | K+: ${resultats.potassium} mmol/L | Ca++: ${resultats.calcium} mmol/L<br>
                        Phosphore: ${resultats.phosphore} mmol/L | Albumine: ${resultats.albumine} g/L | CRP: ${resultats.crp} mg/L<br>
                        Ferritine: ${resultats.ferritine} µg/L | Coefficient de saturation de la transferrine: ${resultats.cst}%`
                    ));
                });
            }
        }
        
        // Afficher les prescriptions
        if (data.prescriptions) {
            const prescriptionsContent = document.getElementById('prescriptions-content');
            if (prescriptionsContent) {
                prescriptionsContent.innerHTML = '';
                data.prescriptions.forEach(prescription => {
                    prescriptionsContent.appendChild(createHistoryItem(
                        prescription.type,
                        prescription.date,
                        `Médecin: ${prescription.medecin}<br>
                        ${prescription.details}<br>
                        Motif: ${prescription.motif}`
                    ));
                });
            }
        }
    }

    // Cacher les données patient
    function hidePatientData() {
        // Cacher les alertes
        patientAlerts.innerHTML = '';
        
        // Réinitialiser les constantes vitales avec des valeurs par défaut
        const vitalSignsContainer = document.querySelector('.vital-signs');
        if (vitalSignsContainer) {
            updateVitalSign(vitalSignsContainer, 'Poids sec', '-- kg');
            updateVitalSign(vitalSignsContainer, 'Poids avant dialyse', '-- kg');
            updateVitalSign(vitalSignsContainer, 'Tension artérielle', '--/-- mmHg');
            updateVitalSign(vitalSignsContainer, 'Fréquence cardiaque', '-- bpm');
            updateVitalSign(vitalSignsContainer, 'Température', '-- °C');
            updateVitalSign(vitalSignsContainer, 'SpO2', '-- %');
        }
        
        // Vider les contenus d'historique
        document.getElementById('dialysis-content').innerHTML = '<p>Sélectionnez un patient pour afficher son historique de dialyse.</p>';
        document.getElementById('complications-content').innerHTML = '<p>Sélectionnez un patient pour afficher ses complications.</p>';
        document.getElementById('labs-content').innerHTML = '<p>Sélectionnez un patient pour afficher ses résultats de laboratoire.</p>';
        document.getElementById('prescriptions-content').innerHTML = '<p>Sélectionnez un patient pour afficher ses prescriptions.</p>';
    }

    // Mettre à jour l'affichage d'une constante vitale
    function updateVitalSign(container, label, value, trend = null, trendClass = null) {
        const items = container.querySelectorAll('.vital-sign-item');
        for (const item of items) {
            const itemLabel = item.querySelector('label');
            if (itemLabel && itemLabel.textContent === label) {
                const valueElement = item.querySelector('.value');
                if (valueElement) valueElement.textContent = value;
                
                const trendElement = item.querySelector('.trend');
                if (trendElement && trend) {
                    trendElement.textContent = trend;
                    trendElement.className = 'trend ' + (trendClass || 'trend-stable');
                } else if (trendElement) {
                    trendElement.textContent = '';
                }
                break;
            }
        }
    }

    // Afficher les alertes
    function displayAlerts(alertes) {
        patientAlerts.innerHTML = '';
        
        if (alertes.length === 0) {
            const noAlertsDiv = document.createElement('div');
            noAlertsDiv.className = 'alert alert-info';
            noAlertsDiv.innerHTML = `
                <i class="fas fa-info-circle"></i>
                <div>
                    <strong>Information:</strong> Aucune alerte médicale pour ce patient.
                </div>
            `;
            patientAlerts.appendChild(noAlertsDiv);
            return;
        }
        
        alertes.forEach(alerte => {
            const alertDiv = document.createElement('div');
            alertDiv.className = `alert alert-${alerte.type}`;
            alertDiv.innerHTML = `
                <i class="fas fa-${alerte.type === 'danger' ? 'exclamation-triangle' : 'info-circle'}"></i>
                <div>
                    <strong>${alerte.type === 'danger' ? 'Alerte médicale:' : 'Information:'}</strong> ${alerte.message}
                </div>
            `;
            patientAlerts.appendChild(alertDiv);
        });
    }

    // Créer un élément d'historique
    function createHistoryItem(title, date, details) {
        const item = document.createElement('div');
        item.className = 'history-item';
        item.innerHTML = `
            <div class="history-item-header">
                <div class="history-item-title">${title}</div>
                <div class="history-item-date">${date}</div>
            </div>
            <div class="history-item-details">${details}</div>
        `;
        return item;
    }
});