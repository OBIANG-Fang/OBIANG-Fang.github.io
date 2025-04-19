// Script pour la gestion de la pharmacie et des consommables - NephroSys

document.addEventListener('DOMContentLoaded', function() {
    // Données de test pour l'inventaire (à remplacer par une API ou une base de données)
    const inventoryData = [
        // 1. Médicaments d'urgence (réanimation / choc / crise)
        {
            id: 'URG-001',
            reference: 'URG-001',
            nom: 'Adrénaline (1 mg/mL)',
            categorie: 'medicaments',
            stock: 20,
            stockMin: 10,
            dateExpiration: '2024-12-15',
            fournisseur: 'Laboratoire Pharma',
            prix: 8.50,
            notes: 'Réanimation cardio-respiratoire'
        },
        {
            id: 'URG-002',
            reference: 'URG-002',
            nom: 'Atropine',
            categorie: 'medicaments',
            stock: 15,
            stockMin: 8,
            dateExpiration: '2024-10-20',
            fournisseur: 'BioPharm',
            prix: 7.80,
            notes: 'Bradycardie sévère'
        },
        {
            id: 'URG-003',
            reference: 'URG-003',
            nom: 'Salbutamol (Ventoline)',
            categorie: 'medicaments',
            stock: 12,
            stockMin: 5,
            dateExpiration: '2025-02-28',
            fournisseur: 'MediSupply',
            prix: 9.20,
            notes: 'Bronchospasmes, crise d\'asthme'
        },
        {
            id: 'URG-004',
            reference: 'URG-004',
            nom: 'Glucose hypertonique (30%)',
            categorie: 'medicaments',
            stock: 25,
            stockMin: 10,
            dateExpiration: '2025-04-15',
            fournisseur: 'DialySolutions',
            prix: 6.40,
            notes: 'Hypoglycémie sévère'
        },
        {
            id: 'URG-005',
            reference: 'URG-005',
            nom: 'Flumazénil',
            categorie: 'medicaments',
            stock: 8,
            stockMin: 4,
            dateExpiration: '2024-09-10',
            fournisseur: 'Laboratoire Pharma',
            prix: 22.50,
            notes: 'Antidote des benzodiazépines'
        },
        {
            id: 'URG-006',
            reference: 'URG-006',
            nom: 'Naloxone',
            categorie: 'medicaments',
            stock: 10,
            stockMin: 5,
            dateExpiration: '2024-11-30',
            fournisseur: 'BioPharm',
            prix: 18.90,
            notes: 'Antidote des opioïdes'
        },
        {
            id: 'URG-007',
            reference: 'URG-007',
            nom: 'Corticoïdes injectables (Solumédrol)',
            categorie: 'medicaments',
            stock: 18,
            stockMin: 8,
            dateExpiration: '2025-01-20',
            fournisseur: 'MediSupply',
            prix: 15.30,
            notes: 'Réaction allergique grave (choc anaphylactique)'
        },
        {
            id: 'URG-008',
            reference: 'URG-008',
            nom: 'Diazépam (Valium) IV',
            categorie: 'medicaments',
            stock: 15,
            stockMin: 7,
            dateExpiration: '2024-08-25',
            fournisseur: 'Laboratoire Pharma',
            prix: 11.75,
            notes: 'Crises convulsives'
        },
        {
            id: 'URG-009',
            reference: 'URG-009',
            nom: 'Furosémide (Lasilix)',
            categorie: 'medicaments',
            stock: 22,
            stockMin: 10,
            dateExpiration: '2025-03-15',
            fournisseur: 'BioPharm',
            prix: 8.90,
            notes: 'OAP, surcharge hydrosodée'
        },
        
        // 2. Solutés et perfusions
        {
            id: 'SOL-001',
            reference: 'SOL-001',
            nom: 'Chlorure de sodium 0,9 %',
            categorie: 'solutions',
            stock: 50,
            stockMin: 20,
            dateExpiration: '2025-06-30',
            fournisseur: 'DialySolutions',
            prix: 4.25,
            notes: 'Réhydratation, dilution médicamenteuse'
        },
        {
            id: 'SOL-002',
            reference: 'SOL-002',
            nom: 'Glucose 5 %',
            categorie: 'solutions',
            stock: 45,
            stockMin: 20,
            dateExpiration: '2025-05-15',
            fournisseur: 'DialySolutions',
            prix: 4.50,
            notes: 'Apport calorique, hypoglycémie'
        },
        {
            id: 'SOL-003',
            reference: 'SOL-003',
            nom: 'Bicarbonate de sodium',
            categorie: 'solutions',
            stock: 30,
            stockMin: 15,
            dateExpiration: '2024-12-20',
            fournisseur: 'DialySolutions',
            prix: 6.80,
            notes: 'Acidose métabolique'
        },
        {
            id: 'SOL-004',
            reference: 'SOL-004',
            nom: 'Calcium Gluconate',
            categorie: 'solutions',
            stock: 25,
            stockMin: 12,
            dateExpiration: '2024-10-10',
            fournisseur: 'MediSupply',
            prix: 7.90,
            notes: 'Hypocalcémie, hyperkaliémie grave'
        },
        {
            id: 'SOL-005',
            reference: 'SOL-005',
            nom: 'KCl injectable',
            categorie: 'solutions',
            stock: 20,
            stockMin: 10,
            dateExpiration: '2024-11-25',
            fournisseur: 'Laboratoire Pharma',
            prix: 5.60,
            notes: 'Hypokaliémie (attention à l\'administration lente)'
        },
        
        // 3. Médicaments spécifiques à la dialyse
        {
            id: 'MED-001',
            reference: 'MED-001',
            nom: 'Héparine sodique / Calciparine',
            categorie: 'medicaments',
            stock: 45,
            stockMin: 15,
            dateExpiration: '2024-09-30',
            fournisseur: 'Laboratoire Pharma',
            prix: 12.50,
            notes: 'Anticoagulation pendant la séance'
        },
        {
            id: 'MED-002',
            reference: 'MED-002',
            nom: 'Erythropoïétine (EPO)',
            categorie: 'medicaments',
            stock: 18,
            stockMin: 10,
            dateExpiration: '2024-08-15',
            fournisseur: 'BioPharm',
            prix: 85.20,
            notes: 'Traitement de l\'anémie chez l\'insuffisant rénal'
        },
        {
            id: 'MED-003',
            reference: 'MED-003',
            nom: 'Chélateurs de phosphate (Sevelamer, carbonate de calcium)',
            categorie: 'medicaments',
            stock: 120,
            stockMin: 30,
            dateExpiration: '2025-01-10',
            fournisseur: 'MediSupply',
            prix: 2.35,
            notes: 'Hyperphosphatémie'
        },
        {
            id: 'MED-004',
            reference: 'MED-004',
            nom: 'Vitamine D active (Alfacalcidol, Calcitriol)',
            categorie: 'medicaments',
            stock: 35,
            stockMin: 15,
            dateExpiration: '2024-12-05',
            fournisseur: 'BioPharm',
            prix: 18.40,
            notes: 'Hypocalcémie, prévention ostéodystrophie'
        },
        {
            id: 'MED-005',
            reference: 'MED-005',
            nom: 'Fer injectable (Venofer, Ferinject)',
            categorie: 'medicaments',
            stock: 28,
            stockMin: 12,
            dateExpiration: '2024-10-20',
            fournisseur: 'Laboratoire Pharma',
            prix: 32.60,
            notes: 'Traitement de l\'anémie ferriprive'
        },
        {
            id: 'MED-006',
            reference: 'MED-006',
            nom: 'Antihypertenseurs (Amlodipine, Labetalol)',
            categorie: 'medicaments',
            stock: 40,
            stockMin: 20,
            dateExpiration: '2025-02-15',
            fournisseur: 'MediSupply',
            prix: 14.80,
            notes: 'HTA fréquente chez dialysés'
        },
        
        // 4. Traitements symptomatiques / Confort du patient
        {
            id: 'SYM-001',
            reference: 'SYM-001',
            nom: 'Paracétamol',
            categorie: 'medicaments',
            stock: 60,
            stockMin: 25,
            dateExpiration: '2025-04-10',
            fournisseur: 'Laboratoire Pharma',
            prix: 3.20,
            notes: 'Douleur ou fièvre'
        },
        {
            id: 'SYM-002',
            reference: 'SYM-002',
            nom: 'Antiémétiques (Metoclopramide, Ondansetron)',
            categorie: 'medicaments',
            stock: 30,
            stockMin: 15,
            dateExpiration: '2024-11-30',
            fournisseur: 'BioPharm',
            prix: 9.75,
            notes: 'Nausées et vomissements'
        },
        {
            id: 'SYM-003',
            reference: 'SYM-003',
            nom: 'Spasfon injectable',
            categorie: 'medicaments',
            stock: 25,
            stockMin: 10,
            dateExpiration: '2024-10-15',
            fournisseur: 'MediSupply',
            prix: 6.90,
            notes: 'Crampes'
        },
        {
            id: 'SYM-004',
            reference: 'SYM-004',
            nom: 'Anxiolytiques légers (Alprazolam)',
            categorie: 'medicaments',
            stock: 20,
            stockMin: 10,
            dateExpiration: '2024-09-20',
            fournisseur: 'Laboratoire Pharma',
            prix: 8.40,
            notes: 'Anxiété liée à la dialyse (si prescription)'
        },
        {
            id: 'SYM-005',
            reference: 'SYM-005',
            nom: 'Collyres, pommades ophtalmiques',
            categorie: 'medicaments',
            stock: 15,
            stockMin: 8,
            dateExpiration: '2024-08-30',
            fournisseur: 'BioPharm',
            prix: 7.60,
            notes: 'Yeux secs (fréquent chez dialysés)'
        },
        {
            id: 'SYM-006',
            reference: 'SYM-006',
            nom: 'Crèmes hydratantes / soins dermatologiques',
            categorie: 'medicaments',
            stock: 22,
            stockMin: 10,
            dateExpiration: '2025-03-15',
            fournisseur: 'MediSupply',
            prix: 5.90,
            notes: 'Peau sèche ou prurit'
        },
        
        // 5. Produits de soins / dispositifs médicaux
        {
            id: 'CON-001',
            reference: 'CON-001',
            nom: 'Gels hydroalcooliques',
            categorie: 'consommables',
            stock: 50,
            stockMin: 20,
            dateExpiration: '2025-06-30',
            fournisseur: 'MedicalEquip',
            prix: 4.25,
            notes: 'Hygiène des mains'
        },
        {
            id: 'CON-002',
            reference: 'CON-002',
            nom: 'Gants stériles / non stériles',
            categorie: 'consommables',
            stock: 200,
            stockMin: 100,
            dateExpiration: '2025-05-15',
            fournisseur: 'DialySupplies',
            prix: 0.35,
            notes: 'Manipulations'
        },
        {
            id: 'CON-003',
            reference: 'CON-003',
            nom: 'Compresses stériles',
            categorie: 'consommables',
            stock: 300,
            stockMin: 150,
            dateExpiration: '2025-04-20',
            fournisseur: 'MedicalEquip',
            prix: 0.15,
            notes: 'Pansements post-pontage'
        },
        {
            id: 'CON-004',
            reference: 'CON-004',
            nom: 'Antiseptiques (Bétadine, Chlorhexidine)',
            categorie: 'consommables',
            stock: 40,
            stockMin: 20,
            dateExpiration: '2024-12-15',
            fournisseur: 'DialySupplies',
            prix: 5.80,
            notes: 'Désinfection cutanée'
        },
        {
            id: 'CON-005',
            reference: 'CON-005',
            nom: 'Cathéters, aiguilles AV fistule',
            categorie: 'consommables',
            stock: 350,
            stockMin: 100,
            dateExpiration: '2025-02-28',
            fournisseur: 'MedicalEquip',
            prix: 0.85,
            notes: 'Accès vasculaire'
        },
        {
            id: 'CON-006',
            reference: 'CON-006',
            nom: 'Bandes, sparadraps, pansements',
            categorie: 'consommables',
            stock: 180,
            stockMin: 80,
            dateExpiration: '2025-01-10',
            fournisseur: 'DialySupplies',
            prix: 0.45,
            notes: 'Soins post-dialyse'
        },
        
        // 6. Dispositifs d'urgence
        {
            id: 'DIS-001',
            reference: 'DIS-001',
            nom: 'Tensiomètre, saturomètre, ECG',
            categorie: 'consommables',
            stock: 10,
            stockMin: 5,
            dateExpiration: '2026-12-31',
            fournisseur: 'MedicalEquip',
            prix: 120.50,
            notes: 'Surveillance des constantes'
        },
        {
            id: 'DIS-002',
            reference: 'DIS-002',
            nom: 'Chariot d\'urgence avec oxygène',
            categorie: 'consommables',
            stock: 2,
            stockMin: 1,
            dateExpiration: '2026-12-31',
            fournisseur: 'MedicalEquip',
            prix: 850.00,
            notes: 'Intervention immédiate'
        },
        {
            id: 'DIS-003',
            reference: 'DIS-003',
            nom: 'Défibrillateur semi-automatique',
            categorie: 'consommables',
            stock: 2,
            stockMin: 1,
            dateExpiration: '2026-12-31',
            fournisseur: 'MedicalEquip',
            prix: 1200.00,
            notes: 'Arrêt cardiaque'
        },
        {
            id: 'DIS-004',
            reference: 'DIS-004',
            nom: 'Sucre oral ou injectable',
            categorie: 'consommables',
            stock: 40,
            stockMin: 20,
            dateExpiration: '2025-06-15',
            fournisseur: 'DialySupplies',
            prix: 2.30,
            notes: 'Hypoglycémie'
        },
        
        // Autres produits existants
        {
            id: 'DIA-001',
            reference: 'DIA-001',
            nom: 'Dialyseur FX80',
            categorie: 'dialyseurs',
            stock: 65,
            stockMin: 20,
            dateExpiration: '2024-08-20',
            fournisseur: 'Fresenius Medical',
            prix: 28.50,
            notes: 'Membrane polysulfone, surface 1.8m²'
        }
    ];

    // Éléments du DOM
    const inventoryTable = document.getElementById('inventory-table');
    const categoryFilter = document.getElementById('category-filter');
    const stockFilter = document.getElementById('stock-filter');
    const searchInput = document.getElementById('search-inventory');
    const addProductBtn = document.getElementById('add-product-btn');
    const productForm = document.getElementById('product-form');
    const stockMovementForm = document.getElementById('stock-movement-form');
    const addProductForm = document.getElementById('add-product-form');
    const addMovementForm = document.getElementById('add-movement-form');
    const cancelProductBtn = document.getElementById('cancel-product-btn');
    const cancelMovementBtn = document.getElementById('cancel-movement-btn');
    const printInventoryBtn = document.getElementById('print-inventory-btn');
    const exportInventoryBtn = document.getElementById('export-inventory-btn');

    // Initialisation
    setupEventListeners();
    displayInventory(inventoryData);

    // Configuration des écouteurs d'événements
    function setupEventListeners() {
        // Filtres et recherche
        if (categoryFilter) {
            categoryFilter.addEventListener('change', filterInventory);
        }
        if (stockFilter) {
            stockFilter.addEventListener('change', filterInventory);
        }
        if (searchInput) {
            searchInput.addEventListener('input', filterInventory);
        }

        // Bouton d'ajout de produit
        if (addProductBtn) {
            addProductBtn.addEventListener('click', function() {
                // Réinitialiser le formulaire
                document.getElementById('form-title').textContent = 'Ajouter un nouveau produit';
                document.getElementById('add-product-form').reset();
                document.getElementById('product-form').style.display = 'block';
            });
        }

        // Fermeture des modales
        document.querySelectorAll('.close-modal').forEach(function(closeBtn) {
            closeBtn.addEventListener('click', function() {
                this.closest('.modal').style.display = 'none';
            });
        });

        // Annulation du formulaire de produit
        if (cancelProductBtn) {
            cancelProductBtn.addEventListener('click', function() {
                productForm.style.display = 'none';
            });
        }

        // Annulation du formulaire de mouvement
        if (cancelMovementBtn) {
            cancelMovementBtn.addEventListener('click', function() {
                stockMovementForm.style.display = 'none';
            });
        }

        // Soumission du formulaire de produit
        if (addProductForm) {
            addProductForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // Récupération des valeurs du formulaire
                const reference = document.getElementById('product-reference').value;
                const nom = document.getElementById('product-name').value;
                const categorie = document.getElementById('product-category').value;
                const stock = parseInt(document.getElementById('product-stock').value);
                const stockMin = parseInt(document.getElementById('product-min-stock').value);
                const dateExpiration = document.getElementById('product-expiry').value;
                const fournisseur = document.getElementById('product-supplier').value;
                const prix = parseFloat(document.getElementById('product-price').value || 0);
                const notes = document.getElementById('product-notes').value;

                // Création d'un nouvel objet produit
                const newProduct = {
                    id: reference,
                    reference,
                    nom,
                    categorie,
                    stock,
                    stockMin,
                    dateExpiration,
                    fournisseur,
                    prix,
                    notes
                };

                // Ajout du produit aux données (simulation)
                inventoryData.push(newProduct);
                
                // Mise à jour de l'affichage
                displayInventory(inventoryData);
                productForm.style.display = 'none';
                
                // Message de confirmation
                alert('Produit ajouté avec succès!');
            });
        }

        // Soumission du formulaire de mouvement de stock
        if (addMovementForm) {
            addMovementForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // Récupération des valeurs du formulaire
                const productId = document.getElementById('movement-product-id').value;
                const type = document.getElementById('movement-type').value;
                const quantity = parseInt(document.getElementById('movement-quantity').value);
                const reason = document.getElementById('movement-reason').value;
                const notes = document.getElementById('movement-notes').value;

                // Recherche du produit dans les données
                const product = inventoryData.find(item => item.id === productId);
                if (product) {
                    // Mise à jour du stock (simulation)
                    if (type === 'in') {
                        product.stock += quantity;
                    } else if (type === 'out') {
                        if (product.stock >= quantity) {
                            product.stock -= quantity;
                        } else {
                            alert('Erreur: Stock insuffisant!');
                            return;
                        }
                    }
                    
                    // Mise à jour de l'affichage
                    displayInventory(inventoryData);
                    stockMovementForm.style.display = 'none';
                    
                    // Message de confirmation
                    alert('Mouvement de stock enregistré avec succès!');
                }
            });
        }

        // Impression de l'inventaire
        if (printInventoryBtn) {
            printInventoryBtn.addEventListener('click', function() {
                window.print();
            });
        }

        // Export de l'inventaire (simulation)
        if (exportInventoryBtn) {
            exportInventoryBtn.addEventListener('click', function() {
                alert('Export en cours... Cette fonctionnalité sera disponible prochainement.');
            });
        }
    }

    // Afficher l'inventaire
    function displayInventory(data) {
        if (!inventoryTable) return;
        
        const tbody = inventoryTable.querySelector('tbody');
        tbody.innerHTML = '';
        
        data.forEach(item => {
            const row = document.createElement('tr');
            
            // Ajouter une classe pour les produits en stock bas ou en rupture
            if (item.stock <= 0) {
                row.classList.add('stock-out');
            } else if (item.stock < item.stockMin) {
                row.classList.add('stock-low');
            }
            
            // Formater la date d'expiration
            const expiryDate = item.dateExpiration ? new Date(item.dateExpiration) : null;
            const formattedDate = expiryDate ? expiryDate.toLocaleDateString('fr-FR') : '-';
            
            // Créer les cellules du tableau
            row.innerHTML = `
                <td>${item.reference}</td>
                <td>${item.nom}</td>
                <td>${getCategoryName(item.categorie)}</td>
                <td class="${getStockClass(item.stock, item.stockMin)}">${item.stock}</td>
                <td>${item.stockMin}</td>
                <td>${formattedDate}</td>
                <td>${item.fournisseur || '-'}</td>
                <td class="actions">
                    <button class="btn icon" onclick="openStockMovement('${item.id}')"><i class="fas fa-exchange-alt" title="Mouvement de stock"></i></button>
                    <button class="btn icon" onclick="editProduct('${item.id}')"><i class="fas fa-edit" title="Modifier"></i></button>
                    <button class="btn icon" onclick="deleteProduct('${item.id}')"><i class="fas fa-trash" title="Supprimer"></i></button>
                </td>
            `;
            
            tbody.appendChild(row);
        });
    }

    // Filtrer l'inventaire
    function filterInventory() {
        const categoryValue = categoryFilter ? categoryFilter.value : 'all';
        const stockValue = stockFilter ? stockFilter.value : 'all';
        const searchValue = searchInput ? searchInput.value.toLowerCase() : '';
        
        const filteredData = inventoryData.filter(item => {
            // Filtre par catégorie
            let categoryMatch = categoryValue === 'all' || item.categorie === categoryValue;
            
            // Filtre spécial pour les médicaments d'urgence
            if (categoryValue === 'urgence') {
                categoryMatch = item.reference.startsWith('URG-');
            }
            
            // Filtre par niveau de stock
            let stockMatch = true;
            if (stockValue === 'low') {
                stockMatch = item.stock > 0 && item.stock < item.stockMin;
            } else if (stockValue === 'out') {
                stockMatch = item.stock <= 0;
            }
            
            // Filtre par recherche
            const searchMatch = !searchValue || 
                item.reference.toLowerCase().includes(searchValue) || 
                item.nom.toLowerCase().includes(searchValue) || 
                (item.fournisseur && item.fournisseur.toLowerCase().includes(searchValue)) ||
                (item.notes && item.notes.toLowerCase().includes(searchValue));
            
            return categoryMatch && stockMatch && searchMatch;
        });
        
        displayInventory(filteredData);
    }

    // Obtenir le nom de la catégorie
    function getCategoryName(categoryCode) {
        const categories = {
            'medicaments': 'Médicaments',
            'consommables': 'Consommables',
            'dialyseurs': 'Dialyseurs',
            'solutions': 'Solutions'
        };
        return categories[categoryCode] || categoryCode;
    }

    // Obtenir la classe CSS pour le niveau de stock
    function getStockClass(stock, stockMin) {
        if (stock <= 0) return 'stock-out';
        if (stock < stockMin) return 'stock-low';
        return '';
    }

    // Fonctions globales pour les actions sur les produits
    window.openStockMovement = function(productId) {
        const product = inventoryData.find(item => item.id === productId);
        if (product) {
            document.getElementById('movement-product-id').value = productId;
            document.getElementById('add-movement-form').reset();
            document.getElementById('stock-movement-form').style.display = 'block';
        }
    };

    window.editProduct = function(productId) {
        const product = inventoryData.find(item => item.id === productId);
        if (product) {
            // Remplir le formulaire avec les données du produit
            document.getElementById('form-title').textContent = 'Modifier le produit';
            document.getElementById('product-reference').value = product.reference;
            document.getElementById('product-name').value = product.nom;
            document.getElementById('product-category').value = product.categorie;
            document.getElementById('product-stock').value = product.stock;
            document.getElementById('product-min-stock').value = product.stockMin;
            document.getElementById('product-expiry').value = product.dateExpiration || '';
            document.getElementById('product-supplier').value = product.fournisseur || '';
            document.getElementById('product-price').value = product.prix || '';
            document.getElementById('product-notes').value = product.notes || '';
            
            // Afficher le formulaire
            document.getElementById('product-form').style.display = 'block';
        }
    };

    window.deleteProduct = function(productId) {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce produit?')) {
            // Supprimer le produit des données (simulation)
            const index = inventoryData.findIndex(item => item.id === productId);
            if (index !== -1) {
                inventoryData.splice(index, 1);
                displayInventory(inventoryData);
                alert('Produit supprimé avec succès!');
            }
        }
    };
});