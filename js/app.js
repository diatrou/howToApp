// Κεντρική λογική εφαρμογής και διαχείριση UI
// Main application logic and UI management
document.addEventListener('DOMContentLoaded', () => {
    // Αναφορές σε στοιχεία του DOM
    // DOM elements references
    const stepForm = document.getElementById('step-form');
    const stepsContainer = document.getElementById('steps-container');
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    const subcategoryFilter = document.getElementById('subcategory-filter');
    const sortSelect = document.getElementById('sort-select');
    const importFileInput = document.getElementById('import-file');
    const importModeSelect = document.getElementById('import-mode');
    const exportButton = document.getElementById('export-steps');
    const cancelEditButton = document.getElementById('cancel-edit');
    const statusMessage = document.getElementById('status-message');
    const submitButton = stepForm.querySelector('button[type="submit"]');
    let editingStepId = null;

    // Φόρτωση και εμφάνιση βημάτων κατά την εκκίνηση
    // Load and render steps on startup
    renderSteps();

    // Διαχείριση υποβολής φόρμας (Προσθήκη νέου βήματος)
    // Handle form submission (Add new step)
    stepForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Λήψη τιμών από τα πεδία
        // Get values from fields
        const category = document.getElementById('category').value.trim();
        const subcategory = document.getElementById('subcategory').value.trim();
        const title = document.getElementById('title').value.trim();
        const order = document.getElementById('step-order').value;
        const description = document.getElementById('description').value.trim();
        const imageInput = document.getElementById('step-image');
        let existingStep;
        try {
            existingStep = editingStepId
                ? StorageManager.getSteps().find(step => step.id === editingStepId)
                : null;
        } catch (error) {
            showError(error);
            return;
        }

        const processAndSave = (imageUrl = existingStep?.image || '') => {
            const stepData = {
                category,
                subcategory,
                title,
                order,
                description,
                image: imageUrl
            };

            try {
                if (editingStepId) {
                    StorageManager.updateStep(editingStepId, stepData);
                    stopEditing();
                } else {
                    StorageManager.saveStep({ ...stepData, completed: false });
                    stepForm.reset();
                }
                renderSteps();
                showStatus('Step saved. / Το βήμα αποθηκεύτηκε.');
            } catch (error) {
                showError(error);
            }
        };

        if (imageInput.files && imageInput.files[0]) {
            readAndCompressImage(imageInput.files[0])
                .then(processAndSave)
                .catch(error => {
                    imageInput.value = '';
                    showError(error);
                });
        } else {
            processAndSave();
        }
    });

    // Διαχείριση αναζήτησης/φιλτραρίσματος
    // Handle search/filtering
    searchInput.addEventListener('input', renderSteps);

    categoryFilter.addEventListener('change', () => {
        subcategoryFilter.value = '';
        renderSteps();
    });
    subcategoryFilter.addEventListener('change', renderSteps);
    sortSelect.addEventListener('change', renderSteps);

    exportButton.addEventListener('click', () => {
        try {
            const backup = {
                version: 1,
                exportedAt: new Date().toISOString(),
                steps: StorageManager.getSteps()
            };
            const url = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' }));
            const link = document.createElement('a');
            link.href = url;
            link.download = `howtoapp-backup-${new Date().toISOString().slice(0, 10)}.json`;
            link.click();
            setTimeout(() => URL.revokeObjectURL(url), 0);
            showStatus('Backup exported. / Το αντίγραφο ασφαλείας εξήχθη.');
        } catch (error) {
            showError(error);
        }
    });

    importFileInput.addEventListener('change', async () => {
        const file = importFileInput.files[0];
        if (!file) return;

        try {
            const parsed = JSON.parse(await file.text());
            const records = Array.isArray(parsed) ? parsed : parsed?.version === 1 ? parsed.steps : null;
            if (!Array.isArray(records) || !records.every(isValidImportedStep)) {
                throw new Error('The selected file is not a valid HowToApp backup.');
            }

            const normalizedSteps = records.map(step => ({
                id: typeof step.id === 'string' && step.id ? step.id : createImportedStepId(),
                category: step.category.trim(),
                subcategory: (step.subcategory || '').trim(),
                title: step.title.trim(),
                order: Number(step.order),
                description: step.description.trim(),
                image: step.image || '',
                completed: Boolean(step.completed)
            }));
            const replaceExisting = importModeSelect.value === 'replace';
            if (replaceExisting && !confirm('This will replace all existing steps. Continue? / Η εισαγωγή θα αντικαταστήσει όλα τα υπάρχοντα βήματα. Συνέχεια;')) {
                return;
            }

            StorageManager.importSteps(normalizedSteps, replaceExisting);
            renderSteps();
            showStatus(`Imported ${normalizedSteps.length} steps. / Εισήχθησαν ${normalizedSteps.length} βήματα.`);
        } catch (error) {
            showError(new Error(`Import failed: ${error.message} / Αποτυχία εισαγωγής.`));
        } finally {
            importFileInput.value = '';
        }
    });

    cancelEditButton.addEventListener('click', stopEditing);

    stepsContainer.addEventListener('click', (event) => {
        const button = event.target.closest('button[data-action]');
        if (!button) return;

        try {
            const step = StorageManager.getSteps().find(item => item.id === button.dataset.id);
            if (!step) return;

            if (button.dataset.action === 'edit') {
                editingStepId = step.id;
                document.getElementById('category').value = step.category;
                document.getElementById('subcategory').value = step.subcategory || '';
                document.getElementById('title').value = step.title;
                document.getElementById('step-order').value = step.order;
                document.getElementById('description').value = step.description;
                submitButton.textContent = 'Ενημέρωση Βήματος / Update Step';
                cancelEditButton.hidden = false;
                document.getElementById('title').focus();
            } else if (button.dataset.action === 'delete' &&
                confirm('Είστε σίγουρος ότι θέλετε να διαγράψετε αυτό το βήμα; / Are you sure you want to delete this step?')) {
                StorageManager.deleteStep(step.id);
                renderSteps();
                showStatus('Step deleted. / Το βήμα διαγράφηκε.');
            }
        } catch (error) {
            showError(error);
        }
    });

    stepsContainer.addEventListener('change', (event) => {
        const checkbox = event.target.closest('input[data-action="toggle-complete"]');
        if (!checkbox) return;

        try {
            const step = StorageManager.getSteps().find(item => item.id === checkbox.dataset.id);
            if (!step) return;
            StorageManager.updateStep(step.id, { completed: checkbox.checked });
            renderSteps();
        } catch (error) {
            showError(error);
            renderSteps();
        }
    });

    function stopEditing() {
        editingStepId = null;
        stepForm.reset();
        submitButton.textContent = 'Αποθήκευση Βήματος / Save Step';
        cancelEditButton.hidden = true;
    }

    // Συνάρτηση προβολής βημάτων στην οθόνη
    // Function to render steps on the screen
    function renderSteps() {
        stepsContainer.innerHTML = '';
        try {
            renderSavedSteps();
        } catch (error) {
            stepsContainer.innerHTML = '';
            showError(error);
        }
    }

    function renderSavedSteps() {
        const steps = StorageManager.getSteps();
        updateFilterOptions(steps);
        const searchText = searchInput.value.trim().toLocaleLowerCase();

        const filteredSteps = steps.filter(step => {
            const matchesSearch = [
                step.title, step.category, step.subcategory || '', step.description
            ].some(value => value.toLocaleLowerCase().includes(searchText));
            return matchesSearch &&
                (!categoryFilter.value || step.category === categoryFilter.value) &&
                (!subcategoryFilter.value || step.subcategory === subcategoryFilter.value);
        });

        const collator = new Intl.Collator(undefined, { sensitivity: 'base', numeric: true });
        filteredSteps.sort((a, b) => {
            if (sortSelect.value === 'step') {
                return Number(a.order) - Number(b.order) || collator.compare(a.title, b.title);
            }
            if (sortSelect.value === 'title') return collator.compare(a.title, b.title);
            if (sortSelect.value === 'recent') return getStepTimestamp(b.id) - getStepTimestamp(a.id);
            return collator.compare(a.category, b.category) ||
                collator.compare(a.subcategory || '', b.subcategory || '') ||
                Number(a.order) - Number(b.order);
        });

        if (filteredSteps.length === 0) {
            stepsContainer.innerHTML = '<p class="no-steps">Δεν βρέθηκαν βήματα. / No steps found.</p>';
            return;
        }

        // Δημιουργία HTML για κάθε βήμα
        // Create HTML for each step
        let previousCategory = null;
        filteredSteps.forEach(step => {
            if (sortSelect.value === 'category' && step.category !== previousCategory) {
                const heading = document.createElement('h3');
                heading.className = 'category-heading';
                heading.textContent = step.category;
                stepsContainer.appendChild(heading);
                previousCategory = step.category;
            }
            const stepCard = document.createElement('div');
            stepCard.className = 'step-card card';
            if (step.completed) stepCard.classList.add('is-complete');
            stepCard.style.marginBottom = '15px';

            stepCard.innerHTML = `
                <div class="step-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <div>
                        <span class="badge" style="background: #e0e7ff; color: #4f46e5; padding: 3px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: bold;">${escapeHtml(step.category)}</span>
                        ${step.subcategory ? `<span class="badge" style="background: #f3f4f6; color: #374151; padding: 3px 8px; border-radius: 4px; font-size: 0.8rem; margin-left: 5px;">${escapeHtml(step.subcategory)}</span>` : ''}
                    </div>
                    <span class="step-num" style="font-weight: bold; color: #6b7280;">Βήμα / Step: ${step.order}</span>
                </div>
                <label class="completion-control">
                    <input type="checkbox" data-action="toggle-complete" data-id="${escapeHtml(step.id)}" ${step.completed ? 'checked' : ''}>
                    <span>${step.completed ? 'Ολοκληρώθηκε / Completed' : 'Σήμανση ως ολοκληρωμένο / Mark as complete'}</span>
                </label>
                <h3 style="margin: 5px 0 10px 0; font-size: 1.1rem;">${escapeHtml(step.title)}</h3>
                <p style="white-space: pre-line; color: #4b5563; font-size: 0.95rem;">${escapeHtml(step.description)}</p>
                ${step.image ? `<div class="step-img-container" style="margin-top: 10px;"><img src="${step.image}" alt="Step image" style="max-width: 100%; max-height: 200px; border-radius: 4px;"></div>` : ''}
                <div class="step-actions">
                    <button type="button" data-action="edit" data-id="${escapeHtml(step.id)}" class="btn-secondary">Επεξεργασία / Edit</button>
                    <button type="button" data-action="delete" data-id="${escapeHtml(step.id)}" class="btn-danger">Διαγραφή / Delete</button>
                </div>
            `;

            stepsContainer.appendChild(stepCard);
        });
    }

    function updateFilterOptions(steps) {
        const selectedCategory = categoryFilter.value;
        const categories = [...new Set(steps.map(step => step.category))].sort((a, b) => a.localeCompare(b));
        categoryFilter.innerHTML = '<option value="">Όλες οι κατηγορίες / All categories</option>';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
        categoryFilter.value = categories.includes(selectedCategory) ? selectedCategory : '';

        const selectedSubcategory = subcategoryFilter.value;
        const subcategories = [...new Set(steps
            .filter(step => !categoryFilter.value || step.category === categoryFilter.value)
            .map(step => step.subcategory)
            .filter(Boolean))].sort((a, b) => a.localeCompare(b));
        subcategoryFilter.innerHTML = '<option value="">Όλες οι υποκατηγορίες / All subcategories</option>';
        subcategories.forEach(subcategory => {
            const option = document.createElement('option');
            option.value = subcategory;
            option.textContent = subcategory;
            subcategoryFilter.appendChild(option);
        });
        subcategoryFilter.disabled = subcategories.length === 0;
        subcategoryFilter.value = subcategories.includes(selectedSubcategory) ? selectedSubcategory : '';
    }

    function isValidImportedStep(step) {
        return step &&
            typeof step.category === 'string' && step.category.trim() &&
            typeof step.title === 'string' && step.title.trim() &&
            typeof step.description === 'string' && step.description.trim() &&
            Number.isFinite(Number(step.order)) && Number(step.order) >= 1 &&
            Number.isInteger(Number(step.order)) &&
            (!step.subcategory || typeof step.subcategory === 'string') &&
            (!step.image || (
                typeof step.image === 'string' &&
                step.image.length <= 1_500_000 &&
                /^data:image\/(?:png|jpeg|webp);base64,/i.test(step.image)
            )) &&
            (step.id === undefined || typeof step.id === 'string') &&
            (step.completed === undefined || typeof step.completed === 'boolean');
    }

    function readAndCompressImage(file) {
        const supportedTypes = ['image/png', 'image/jpeg', 'image/webp'];
        if (!supportedTypes.includes(file.type)) {
            return Promise.reject(new Error('Choose a PNG, JPEG, or WebP image. / Επιλέξτε εικόνα PNG, JPEG ή WebP.'));
        }
        if (file.size > 5 * 1024 * 1024) {
            return Promise.reject(new Error('Images must be 5 MB or smaller. / Οι εικόνες πρέπει να είναι έως 5 MB.'));
        }

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = () => reject(new Error('Could not read the selected image. / Δεν ήταν δυνατή η ανάγνωση της εικόνας.'));
            reader.onload = () => {
                const image = new Image();
                image.onerror = () => reject(new Error('The selected file is not a valid image. / Το αρχείο δεν είναι έγκυρη εικόνα.'));
                image.onload = () => {
                    if (image.width * image.height > 40_000_000) {
                        reject(new Error('Image dimensions are too large. / Οι διαστάσεις της εικόνας είναι υπερβολικά μεγάλες.'));
                        return;
                    }

                    try {
                        const scale = Math.min(1, 1200 / Math.max(image.width, image.height));
                        const canvas = document.createElement('canvas');
                        canvas.width = Math.max(1, Math.round(image.width * scale));
                        canvas.height = Math.max(1, Math.round(image.height * scale));
                        canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
                        const imageData = canvas.toDataURL(file.type, 0.82);
                        if (imageData.length > 1_500_000) {
                            throw new Error('The optimized image is still too large. Choose a smaller image. / Η εικόνα παραμένει μεγάλη· επιλέξτε μικρότερη.');
                        }
                        resolve(imageData);
                    } catch (error) {
                        reject(error);
                    }
                };
                image.src = reader.result;
            };
            reader.readAsDataURL(file);
        });
    }

    function createImportedStepId() {
        const uniquePart = window.crypto && typeof window.crypto.randomUUID === 'function'
            ? window.crypto.randomUUID()
            : `${Date.now()}_${Math.random().toString(36).slice(2)}`;
        return `step_${uniquePart}`;
    }

    function getStepTimestamp(id) {
        return Number(id.match(/^step_(\d+)/)?.[1]) || 0;
    }

    function showStatus(message) {
        statusMessage.textContent = message;
        statusMessage.hidden = !message;
        statusMessage.classList.remove('is-error');
    }

    function showError(error) {
        statusMessage.textContent = error.message;
        statusMessage.hidden = false;
        statusMessage.classList.add('is-error');
    }
});

// Απλή ασφάλεια έναντι XSS (HTML escaping)
// Simple security against XSS (HTML escaping)
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#039;");
}