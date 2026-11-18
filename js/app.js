// Κεντρική λογική εφαρμογής και διαχείριση UI
// Main application logic and UI management
document.addEventListener('DOMContentLoaded', () => {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js').catch(error => {
                console.error('HowToApp could not register offline support:', error);
            });
        });
    }
    // Αναφορές σε στοιχεία του DOM
    // DOM elements references
    const stepForm = document.getElementById('step-form');
    const stepsContainer = document.getElementById('steps-container');
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    const subcategoryFilter = document.getElementById('subcategory-filter');
    const sortSelect = document.getElementById('sort-select');
    const statusFilter = document.getElementById('status-filter');
    const tagFilter = document.getElementById('tag-filter');
    const dateFilter = document.getElementById('date-filter');
    const presentButton = document.getElementById('present-steps');
    const undoDeleteButton = document.getElementById('undo-delete');
    const statusText = document.getElementById('status-text');
    const importFileInput = document.getElementById('import-file');
    const importModeSelect = document.getElementById('import-mode');
    const exportButton = document.getElementById('export-steps');
    const cancelEditButton = document.getElementById('cancel-edit');
    const duplicateStepButton = document.getElementById('duplicate-step');
    const statusMessage = document.getElementById('status-message');
    const submitButton = stepForm.querySelector('button[type="submit"]');
    const languageSelect = document.getElementById('language-select');
    let editingStepId = null;
    let deletedStep = null;
    let undoTimer = null;
    let presentationSteps = [];
    let presentationIndex = 0;
    let preservedImage = '';
    const translations = {
        el: {
            pageTitle: 'HowToApp - Οδηγός βημάτων και συμβουλών',
            appDescription: 'Διαχειριστείτε τα βήματα και τις συμβουλές σας εύκολα και τοπικά',
            languageLabel: 'Γλώσσα:',
            categoryFilterLabel: 'Φίλτρο κατηγορίας',
            subcategoryFilterLabel: 'Φίλτρο υποκατηγορίας',
            sortLabel: 'Ταξινόμηση βημάτων',
            stepListLabel: 'Αποτελέσματα βημάτων',
            formTitle: 'Προσθήκη νέου βήματος',
            formTitleEdit: 'Επεξεργασία βήματος',
            categoryLabel: 'Κατηγορία:',
            categoryPlaceholder: 'π.χ. Προγραμματισμός',
            subcategoryLabel: 'Υποκατηγορία:',
            subcategoryPlaceholder: 'π.χ. Git',
            tagsLabel: 'Ετικέτες:',
            tagsPlaceholder: 'π.χ. δουλειά, επείγον',
            dueDateLabel: 'Ημερομηνία ολοκλήρωσης:',
            tagFilterPlaceholder: 'Ετικέτα...',
            statusFilterLabel: 'Φίλτρο κατάστασης',
            allStatuses: 'Όλες οι καταστάσεις',
            pendingStatus: 'Σε εκκρεμότητα',
            completedStatus: 'Ολοκληρωμένα',
            todayStatus: 'Για σήμερα',
            titleLabel: 'Τίτλος βήματος:',
            titlePlaceholder: 'π.χ. Αρχικοποίηση αποθετηρίου',
            orderLabel: 'Σειρά εκτέλεσης:',
            descriptionLabel: 'Περιγραφή και οδηγίες:',
            descriptionPlaceholder: 'Αναλυτική περιγραφή...',
            imageLabel: 'Προαιρετική εικόνα:',
            saveStep: 'Αποθήκευση βήματος',
            updateStep: 'Ενημέρωση βήματος',
            cancel: 'Ακύρωση',
            createDuplicate: 'Νέο βήμα με αυτά τα δεδομένα',
            dateFilterLabel: 'Ημερομηνία ολοκλήρωσης',
            listTitle: 'Λίστα βημάτων και συμβουλών',
            searchLabel: 'Αναζήτηση βημάτων',
            searchPlaceholder: 'Αναζήτηση βημάτων...',
            allCategories: 'Όλες οι κατηγορίες',
            allSubcategories: 'Όλες οι υποκατηγορίες',
            sortCategory: 'Κατηγορία και σειρά',
            sortStep: 'Σειρά βημάτων',
            sortTitle: 'Τίτλος',
            sortRecent: 'Νεότερα πρώτα',
            exportBackup: 'Εξαγωγή αντιγράφου',
            importBackup: 'Εισαγωγή αντιγράφου:',
            importModeLabel: 'Συμπεριφορά εισαγωγής',
            replaceAll: 'Αντικατάσταση όλων',
            merge: 'Συγχώνευση',
            emptyList: 'Δεν βρέθηκαν βήματα.',
            stepLabel: 'Βήμα: {{order}}',
            completed: 'Ολοκληρώθηκε',
            markComplete: 'Σήμανση ως ολοκληρωμένο',
            edit: 'Επεξεργασία',
            delete: 'Διαγραφή',
            present: 'Παρουσίαση',
            presentSteps: 'Παρουσίαση',
            previous: 'Προηγούμενο',
            next: 'Επόμενο',
            undo: 'Αναίρεση',
            noPresentation: 'Δεν υπάρχουν βήματα για παρουσίαση.',
            draftRestored: 'Το μη αποθηκευμένο προσχέδιο ανακτήθηκε.',
            dueToday: 'Για σήμερα',
            overdue: 'Εκπρόθεσμο',
            imageAlt: 'Εικόνα βήματος',
            confirmDelete: 'Θέλετε σίγουρα να διαγράψετε αυτό το βήμα;',
            confirmReplace: 'Η εισαγωγή θα αντικαταστήσει όλα τα υπάρχοντα βήματα. Συνέχεια;',
            stepSaved: 'Το βήμα αποθηκεύτηκε.',
            stepDeleted: 'Το βήμα διαγράφηκε.',
            backupExported: 'Το αντίγραφο ασφαλείας εξήχθη.',
            importSuccess: 'Εισήχθησαν {{count}} βήματα.',
            importFailed: 'Αποτυχία εισαγωγής: {{details}}',
            invalidBackup: 'Το αρχείο δεν είναι έγκυρο αντίγραφο HowToApp.',
            chooseImage: 'Επιλέξτε εικόνα PNG, JPEG ή WebP.',
            imageTooLarge: 'Οι εικόνες πρέπει να είναι έως 5 MB.',
            imageReadFailed: 'Δεν ήταν δυνατή η ανάγνωση της εικόνας.',
            invalidImage: 'Το αρχείο δεν είναι έγκυρη εικόνα.',
            imageDimensionsTooLarge: 'Οι διαστάσεις της εικόνας είναι υπερβολικά μεγάλες.',
            optimizedImageTooLarge: 'Η εικόνα παραμένει μεγάλη· επιλέξτε μικρότερη.',
            storageFull: 'Ο χώρος αποθήκευσης του browser γέμισε. Εξαγάγετε αντίγραφο και αφαιρέστε εικόνες.',
            storageRead: 'Δεν ήταν δυνατή η ανάγνωση των τοπικών δεδομένων.',
            storageWrite: 'Δεν ήταν δυνατή η αποθήκευση των τοπικών δεδομένων.',
            corruptData: 'Τα αποθηκευμένα δεδομένα δεν είναι έγκυρα. Εισαγάγετε ένα έγκυρο αντίγραφο.',
            invalidStep: 'Το βήμα περιέχει μη έγκυρα δεδομένα και δεν αποθηκεύτηκε.',
            stepNotFound: 'Δεν βρέθηκε το βήμα προς ενημέρωση.',
            genericError: 'Παρουσιάστηκε σφάλμα: {{details}}'
        },
        en: {
            pageTitle: 'HowToApp - Step and tip guide',
            appDescription: 'Manage your steps and tips easily and locally',
            languageLabel: 'Language:',
            categoryFilterLabel: 'Filter by category',
            subcategoryFilterLabel: 'Filter by subcategory',
            sortLabel: 'Sort steps',
            stepListLabel: 'Step results',
            formTitle: 'Add New Step',
            formTitleEdit: 'Edit Step',
            categoryLabel: 'Category:',
            categoryPlaceholder: 'e.g. Programming',
            subcategoryLabel: 'Subcategory:',
            subcategoryPlaceholder: 'e.g. Git',
            tagsLabel: 'Tags:',
            tagsPlaceholder: 'e.g. work, urgent',
            dueDateLabel: 'Due date:',
            tagFilterPlaceholder: 'Tag...',
            statusFilterLabel: 'Status filter',
            allStatuses: 'All statuses',
            pendingStatus: 'Pending',
            completedStatus: 'Completed',
            todayStatus: 'Due today',
            titleLabel: 'Step title:',
            titlePlaceholder: 'e.g. Initialize a repository',
            orderLabel: 'Execution order:',
            descriptionLabel: 'Description and instructions:',
            descriptionPlaceholder: 'Detailed description...',
            imageLabel: 'Optional image:',
            saveStep: 'Save Step',
            updateStep: 'Update Step',
            cancel: 'Cancel',
            createDuplicate: 'New step with these data',
            dateFilterLabel: 'Completion date',
            listTitle: 'Steps and Tips',
            searchLabel: 'Search steps',
            searchPlaceholder: 'Search steps...',
            allCategories: 'All categories',
            allSubcategories: 'All subcategories',
            sortCategory: 'Category and order',
            sortStep: 'Step order',
            sortTitle: 'Title',
            sortRecent: 'Newest first',
            exportBackup: 'Export backup',
            importBackup: 'Import backup:',
            importModeLabel: 'Import behavior',
            replaceAll: 'Replace all',
            merge: 'Merge',
            emptyList: 'No steps found.',
            stepLabel: 'Step: {{order}}',
            completed: 'Completed',
            markComplete: 'Mark as complete',
            edit: 'Edit',
            delete: 'Delete',
            present: 'Present',
            presentSteps: 'Present',
            previous: 'Previous',
            next: 'Next',
            undo: 'Undo',
            noPresentation: 'No steps are available for presentation.',
            draftRestored: 'Your unsaved draft was restored.',
            dueToday: 'Due today',
            overdue: 'Overdue',
            imageAlt: 'Step image',
            confirmDelete: 'Are you sure you want to delete this step?',
            confirmReplace: 'This will replace all existing steps. Continue?',
            stepSaved: 'Step saved.',
            stepDeleted: 'Step deleted.',
            backupExported: 'Backup exported.',
            importSuccess: 'Imported {{count}} steps.',
            importFailed: 'Import failed: {{details}}',
            invalidBackup: 'The selected file is not a valid HowToApp backup.',
            chooseImage: 'Choose a PNG, JPEG, or WebP image.',
            imageTooLarge: 'Images must be 5 MB or smaller.',
            imageReadFailed: 'Could not read the selected image.',
            invalidImage: 'The selected file is not a valid image.',
            imageDimensionsTooLarge: 'Image dimensions are too large.',
            optimizedImageTooLarge: 'The optimized image is still too large. Choose a smaller image.',
            storageFull: 'Browser storage is full. Export a backup and remove some images.',
            storageRead: 'Unable to read local data.',
            storageWrite: 'Unable to save local data.',
            corruptData: 'Saved data is invalid. Import a valid backup to recover your steps.',
            invalidStep: 'The step contains invalid data and was not saved.',
            stepNotFound: 'The step to update could not be found.',
            genericError: 'An error occurred: {{details}}'
        }
    };

    let currentLanguage = 'el';
    try {
        currentLanguage = localStorage.getItem('howto_app_language') === 'en' ? 'en' : 'el';
    } catch (error) {
        showError(error);
    }
    languageSelect.value = currentLanguage;
    applyTranslations();

    // Φόρτωση και εμφάνιση βημάτων κατά την εκκίνηση
    // Load and render steps on startup
    renderSteps();
    restoreDraft();

    stepForm.addEventListener('input', () => {
        if (!editingStepId) saveDraft();
    });

    languageSelect.addEventListener('change', () => {
        currentLanguage = languageSelect.value;
        let preferenceError = null;
        try {
            localStorage.setItem('howto_app_language', currentLanguage);
        } catch (error) {
            preferenceError = error;
        }
        applyTranslations();
        showStatus('');
        renderSteps();
        if (preferenceError) showError(preferenceError);
    });

    // Διαχείριση υποβολής φόρμας (Προσθήκη νέου βήματος)
    // Handle form submission (Add new step)
    stepForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Λήψη τιμών από τα πεδία
        // Get values from fields
        const category = normalizeText(document.getElementById('category').value);
        const subcategory = normalizeText(document.getElementById('subcategory').value);
        const title = normalizeText(document.getElementById('title').value);
        const order = document.getElementById('step-order').value;
        const description = document.getElementById('description').value.trim();
        const tags = document.getElementById('tags').value
            .split(',')
            .map(tag => tag.trim())
            .filter(Boolean);
        const dueDate = document.getElementById('due-date').value;
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

        const processAndSave = (imageUrl = existingStep?.image || preservedImage || '') => {
            const stepData = {
                category,
                subcategory,
                title,
                order,
                description,
                tags,
                dueDate,
                image: imageUrl
            };

            try {
                if (editingStepId) {
                    StorageManager.updateStep(editingStepId, stepData);
                    stopEditing();
                } else {
                    StorageManager.saveStep({ ...stepData, completed: false });
                    preservedImage = imageUrl;
                    document.getElementById('category').value = category;
                    document.getElementById('subcategory').value = subcategory;
                    document.getElementById('title').value = title;
                    document.getElementById('step-order').value = Number(order) + 1;
                    document.getElementById('description').value = '';
                    document.getElementById('tags').value = tags.join(', ');
                    document.getElementById('due-date').value = dueDate;
                    document.getElementById('step-image').value = '';
                    saveDraft();
                }
                renderSteps();
                showStatus(t('stepSaved'));
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
    statusFilter.addEventListener('change', renderSteps);
    tagFilter.addEventListener('input', renderSteps);
    dateFilter.addEventListener('change', renderSteps);

    categoryFilter.addEventListener('change', () => {
        subcategoryFilter.value = '';
        renderSteps();
    });
    subcategoryFilter.addEventListener('change', renderSteps);
    sortSelect.addEventListener('change', renderSteps);
    presentButton.addEventListener('click', () => startPresentation(getVisibleSteps()));

    const presentationModal = document.getElementById('presentation-modal');
    document.getElementById('presentation-close').addEventListener('click', closePresentation);
    document.getElementById('presentation-prev').addEventListener('click', () => movePresentation(-1));
    document.getElementById('presentation-next').addEventListener('click', () => movePresentation(1));
    document.addEventListener('keydown', (event) => {
        if (presentationModal.hidden) return;
        if (event.key === 'Escape') closePresentation();
        if (event.key === 'ArrowLeft') movePresentation(-1);
        if (event.key === 'ArrowRight') movePresentation(1);
    });
    window.addEventListener('resize', () => {
        if (!presentationModal.hidden) fitPresentationToScreen();
    });

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
            showStatus(t('backupExported'));
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
                throw new Error(t('invalidBackup'));
            }

            const normalizedSteps = records.map(step => ({
                id: typeof step.id === 'string' && step.id ? step.id : createImportedStepId(),
                category: step.category.trim(),
                subcategory: (step.subcategory || '').trim(),
                title: step.title.trim(),
                order: Number(step.order),
                description: step.description.trim(),
                tags: Array.isArray(step.tags)
                    ? [...new Set(step.tags.map(tag => tag.trim()).filter(Boolean))]
                    : typeof step.tags === 'string'
                        ? [...new Set(step.tags.split(',').map(tag => tag.trim()).filter(Boolean))]
                        : [],
                dueDate: step.dueDate || '',
                image: step.image || '',
                completed: Boolean(step.completed)
            }));
            const replaceExisting = importModeSelect.value === 'replace';
            if (replaceExisting && !confirm(t('confirmReplace'))) {
                return;
            }

            StorageManager.importSteps(normalizedSteps, replaceExisting);
            if (editingStepId) stopEditing();
            renderSteps();
            showStatus(t('importSuccess', { count: normalizedSteps.length }));
        } catch (error) {
            showError(error, 'importFailed');
        } finally {
            importFileInput.value = '';
        }
    });

    cancelEditButton.addEventListener('click', stopEditing);
    duplicateStepButton.addEventListener('click', () => {
        if (!editingStepId) return;
        try {
            const step = StorageManager.getSteps().find(item => item.id === editingStepId);
            if (!step) return;
            startDuplicate(step);
        } catch (error) {
            showError(error);
        }
    });
    undoDeleteButton.addEventListener('click', () => {
        if (!deletedStep) return;
        try {
            StorageManager.importSteps([deletedStep], false);
            deletedStep = null;
            clearTimeout(undoTimer);
            undoDeleteButton.hidden = true;
            renderSteps();
            showStatus(t('stepSaved'));
        } catch (error) {
            showError(error);
        }
    });

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
                document.getElementById('tags').value = (step.tags || []).join(', ');
                document.getElementById('due-date').value = step.dueDate || '';
                submitButton.textContent = t('updateStep');
                document.getElementById('form-heading').textContent = t('formTitleEdit');
                duplicateStepButton.hidden = false;
                preservedImage = step.image || '';
                cancelEditButton.hidden = false;
                document.getElementById('title').focus();
            } else if (button.dataset.action === 'duplicate') {
                startDuplicate(step);
            } else if (button.dataset.action === 'present') {
                const visibleSteps = getVisibleSteps();
                startPresentation(visibleSteps.length ? visibleSteps : [step]);
            } else if (button.dataset.action === 'delete' &&
                confirm(t('confirmDelete'))) {
                StorageManager.deleteStep(step.id);
                if (editingStepId === step.id) stopEditing();
                renderSteps();
                deletedStep = { ...step };
                showStatus(t('stepDeleted'), true);
                clearTimeout(undoTimer);
                undoTimer = setTimeout(() => {
                    deletedStep = null;
                    undoDeleteButton.hidden = true;
                }, 8000);
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

    stepsContainer.addEventListener('dragstart', (event) => {
        const card = event.target.closest('.step-card');
        if (!card) return;
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', card.dataset.id);
        card.classList.add('dragging');
    });

    stepsContainer.addEventListener('dragend', (event) => {
        event.target.closest('.step-card')?.classList.remove('dragging');
    });

    stepsContainer.addEventListener('dragover', (event) => {
        if (event.target.closest('.step-card')) event.preventDefault();
    });

    stepsContainer.addEventListener('drop', (event) => {
        event.preventDefault();
        const target = event.target.closest('.step-card');
        if (!target) return;
        const draggedId = event.dataTransfer.getData('text/plain');
        if (!draggedId || draggedId === target.dataset.id) return;
        try {
            const cards = [...stepsContainer.querySelectorAll('.step-card')];
            const ids = cards.map(card => card.dataset.id);
            const from = ids.indexOf(draggedId);
            const to = ids.indexOf(target.dataset.id);
            if (from >= 0 && to >= 0) {
                ids.splice(from, 1);
                ids.splice(to, 0, draggedId);
                StorageManager.reorderSteps(ids);
                renderSteps();
            }
        } catch (error) {
            showError(error);
        }
    });

    function stopEditing() {
        editingStepId = null;
        preservedImage = '';
        duplicateStepButton.hidden = true;
        stepForm.reset();
        clearDraft();
        document.getElementById('form-heading').textContent = t('formTitle');
        submitButton.textContent = t('saveStep');
        cancelEditButton.hidden = true;
    }

    function startDuplicate(step) {
        editingStepId = null;
        preservedImage = step.image || '';
        document.getElementById('category').value = step.category;
        document.getElementById('subcategory').value = step.subcategory || '';
        document.getElementById('title').value = step.title;
        document.getElementById('step-order').value = step.order;
        document.getElementById('description').value = '';
        document.getElementById('tags').value = (step.tags || []).join(', ');
        document.getElementById('due-date').value = step.dueDate || '';
        document.getElementById('step-image').value = '';
        document.getElementById('form-heading').textContent = t('formTitle');
        submitButton.textContent = t('saveStep');
        duplicateStepButton.hidden = true;
        cancelEditButton.hidden = true;
        clearDraft();
        document.getElementById('description').focus();
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
        const selectedTag = tagFilter.value.trim().toLocaleLowerCase();
        const today = new Date().toISOString().slice(0, 10);

        const filteredSteps = steps.filter(step => {
            const matchesSearch = [
                step.title, step.category, step.subcategory || '', step.description,
                ...(step.tags || [])
            ].some(value => value.toLocaleLowerCase().includes(searchText));
            const matchesStatus = !statusFilter.value ||
                (statusFilter.value === 'completed' && step.completed) ||
                (statusFilter.value === 'pending' && !step.completed) ||
                (statusFilter.value === 'today' && step.dueDate === today);
            const matchesTag = !selectedTag ||
                (step.tags || []).some(tag => tag.toLocaleLowerCase().includes(selectedTag));
            const matchesDate = !dateFilter.value || step.dueDate === dateFilter.value;
            return matchesSearch &&
                matchesStatus &&
                matchesTag &&
                matchesDate &&
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
            const emptyMessage = document.createElement('p');
            emptyMessage.className = 'no-steps';
            emptyMessage.textContent = t('emptyList');
            stepsContainer.appendChild(emptyMessage);
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
            stepCard.draggable = true;
            stepCard.dataset.id = step.id;
            if (step.completed) stepCard.classList.add('is-complete');
            stepCard.style.marginBottom = '15px';

            stepCard.innerHTML = `
                <div class="step-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <div>
                        <span class="badge" style="background: #e0e7ff; color: #4f46e5; padding: 3px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: bold;">${escapeHtml(step.category)}</span>
                        ${step.subcategory ? `<span class="badge" style="background: #f3f4f6; color: #374151; padding: 3px 8px; border-radius: 4px; font-size: 0.8rem; margin-left: 5px;">${escapeHtml(step.subcategory)}</span>` : ''}
                    </div>
                    <span class="step-num" style="font-weight: bold; color: #6b7280;">${escapeHtml(t('stepLabel', { order: step.order }))}</span>
                </div>
                <label class="completion-control">
                    <input type="checkbox" data-action="toggle-complete" data-id="${escapeHtml(step.id)}" ${step.completed ? 'checked' : ''}>
                    <span>${escapeHtml(t(step.completed ? 'completed' : 'markComplete'))}</span>
                </label>
                <h3 style="margin: 5px 0 10px 0; font-size: 1.1rem;">${escapeHtml(step.title)}</h3>
                <div class="markdown-content step-markdown">${renderMarkdown(step.description)}</div>
                ${(step.tags || []).length ? `<div class="tag-list">${step.tags.map(tag => `<span class="tag-badge">${escapeHtml(tag)}</span>`).join('')}</div>` : ''}
                ${step.dueDate ? `<p class="due-date ${getDueDateClass(step.dueDate, step.completed)}">${escapeHtml(getDueDateLabel(step.dueDate, step.completed))}: ${escapeHtml(step.dueDate)}</p>` : ''}
                ${step.image ? `<div class="step-img-container" style="margin-top: 10px;"><img src="${escapeHtml(step.image)}" alt="${escapeHtml(t('imageAlt'))}" style="max-width: 100%; max-height: 200px; border-radius: 4px;"></div>` : ''}
                <div class="step-actions">
                    <button type="button" data-action="present" data-id="${escapeHtml(step.id)}" class="btn-secondary">${escapeHtml(t('present'))}</button>
                    <button type="button" data-action="edit" data-id="${escapeHtml(step.id)}" class="btn-secondary">${escapeHtml(t('edit'))}</button>
                    <button type="button" data-action="duplicate" data-id="${escapeHtml(step.id)}" class="btn-secondary">${escapeHtml(t('createDuplicate'))}</button>
                    <button type="button" data-action="delete" data-id="${escapeHtml(step.id)}" class="btn-danger">${escapeHtml(t('delete'))}</button>
                </div>
            `;

            stepsContainer.appendChild(stepCard);
        });
    }

    function updateFilterOptions(steps) {
        const selectedCategory = categoryFilter.value;
        const categories = [...new Set(steps.map(step => step.category))].sort((a, b) => a.localeCompare(b));
        categoryFilter.replaceChildren(createOption('', t('allCategories')));
        categories.forEach(category => {
            categoryFilter.appendChild(createOption(category, category));
        });
        categoryFilter.value = categories.includes(selectedCategory) ? selectedCategory : '';

        const selectedSubcategory = subcategoryFilter.value;
        const subcategories = [...new Set(steps
            .filter(step => !categoryFilter.value || step.category === categoryFilter.value)
            .map(step => step.subcategory)
            .filter(Boolean))].sort((a, b) => a.localeCompare(b));
        subcategoryFilter.replaceChildren(createOption('', t('allSubcategories')));
        subcategories.forEach(subcategory => {
            subcategoryFilter.appendChild(createOption(subcategory, subcategory));
        });
        subcategoryFilter.disabled = subcategories.length === 0;
        subcategoryFilter.value = subcategories.includes(selectedSubcategory) ? selectedSubcategory : '';

        const tagOptions = document.getElementById('tag-options');
        const tags = [...new Set(steps.flatMap(step => step.tags || []))]
            .sort((a, b) => a.localeCompare(b));
        tagOptions.replaceChildren(...tags.map(tag => createOption(tag, tag)));
    }

    function isValidImportedStep(step) {
        return step &&
            typeof step.category === 'string' && step.category.trim() &&
            typeof step.title === 'string' && step.title.trim() &&
            typeof step.description === 'string' && step.description.trim() &&
            Number.isFinite(Number(step.order)) && Number(step.order) >= 1 &&
            Number.isInteger(Number(step.order)) &&
            (!step.subcategory || typeof step.subcategory === 'string') &&
            (step.tags === undefined || Array.isArray(step.tags) || typeof step.tags === 'string') &&
            (step.dueDate === undefined || step.dueDate === '' ||
                (typeof step.dueDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(step.dueDate))) &&
            (!step.image || (
                typeof step.image === 'string' &&
                step.image.length <= 1_500_000 &&
                /^data:image\/(?:png|jpeg|webp);base64,[a-z0-9+/]+={0,2}$/i.test(step.image)
            )) &&
            (step.id === undefined || typeof step.id === 'string') &&
            (step.completed === undefined || typeof step.completed === 'boolean');
    }

    function createOption(value, label) {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = label;
        return option;
    }

    function t(key, values = {}) {
        return Object.entries(values).reduce(
            (text, [name, value]) => text.replaceAll(`{{${name}}}`, String(value)),
            translations[currentLanguage][key] || key
        );
    }

    function applyTranslations() {
        document.documentElement.lang = currentLanguage;
        document.title = t('pageTitle');
        document.querySelectorAll('[data-i18n]').forEach(element => {
            element.textContent = t(element.dataset.i18n);
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            element.placeholder = t(element.dataset.i18nPlaceholder);
        });
        document.querySelectorAll('[data-i18n-aria-label]').forEach(element => {
            element.setAttribute('aria-label', t(element.dataset.i18nAriaLabel));
        });
        languageSelect.setAttribute('aria-label', t('languageLabel'));
        document.getElementById('form-heading').textContent = t(editingStepId ? 'formTitleEdit' : 'formTitle');
        submitButton.textContent = t(editingStepId ? 'updateStep' : 'saveStep');
    }

    function readAndCompressImage(file) {
        const supportedTypes = ['image/png', 'image/jpeg', 'image/webp'];
        if (!supportedTypes.includes(file.type)) {
            return Promise.reject(new Error(t('chooseImage')));
        }
        if (file.size > 5 * 1024 * 1024) {
            return Promise.reject(new Error(t('imageTooLarge')));
        }

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = () => reject(new Error(t('imageReadFailed')));
            reader.onload = () => {
                const image = new Image();
                image.onerror = () => reject(new Error(t('invalidImage')));
                image.onload = () => {
                    if (image.width * image.height > 40_000_000) {
                        reject(new Error(t('imageDimensionsTooLarge')));
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
                            throw new Error(t('optimizedImageTooLarge'));
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

    function normalizeText(value) {
        return value.trim().replace(/\s+/g, ' ');
    }

    function saveDraft() {
        const draft = {
            category: document.getElementById('category').value,
            subcategory: document.getElementById('subcategory').value,
            title: document.getElementById('title').value,
            order: document.getElementById('step-order').value,
            description: document.getElementById('description').value,
            tags: document.getElementById('tags').value,
            dueDate: document.getElementById('due-date').value
        };
        try {
            localStorage.setItem('howto_app_draft', JSON.stringify(draft));
        } catch (error) {
            showError(error);
        }
    }

    function restoreDraft() {
        try {
            const rawDraft = localStorage.getItem('howto_app_draft');
            if (!rawDraft) return;
            const draft = JSON.parse(rawDraft);
            document.getElementById('category').value = draft.category || '';
            document.getElementById('subcategory').value = draft.subcategory || '';
            document.getElementById('title').value = draft.title || '';
            document.getElementById('step-order').value = draft.order || 1;
            document.getElementById('description').value = draft.description || '';
            document.getElementById('tags').value = draft.tags || '';
            document.getElementById('due-date').value = draft.dueDate || '';
            showStatus(t('draftRestored'));
        } catch (error) {
            localStorage.removeItem('howto_app_draft');
        }
    }

    function clearDraft() {
        try {
            localStorage.removeItem('howto_app_draft');
        } catch (error) {
            showError(error);
        }
    }

    function getVisibleSteps() {
        return [...stepsContainer.querySelectorAll('.step-card')]
            .map(card => StorageManager.getSteps().find(step => step.id === card.dataset.id))
            .filter(Boolean);
    }

    function startPresentation(steps) {
        if (!steps.length) {
            showStatus(t('noPresentation'));
            return;
        }
        presentationSteps = steps;
        presentationIndex = 0;
        presentationModal.hidden = false;
        document.body.classList.add('presentation-open');
        renderPresentation();
        document.getElementById('presentation-close').focus();
    }

    function closePresentation() {
        presentationModal.hidden = true;
        document.body.classList.remove('presentation-open');
        presentButton.focus();
    }

    function movePresentation(delta) {
        const nextIndex = Math.max(
            0,
            Math.min(presentationSteps.length - 1, presentationIndex + delta)
        );
        if (nextIndex === presentationIndex) return;

        const slide = presentationModal.querySelector('.presentation-slide');
        slide.classList.remove('slide-enter');
        slide.classList.add('slide-leave');
        window.setTimeout(() => {
            presentationIndex = nextIndex;
            renderPresentation();
            slide.classList.remove('slide-leave');
            slide.classList.add('slide-enter');
            window.setTimeout(() => slide.classList.remove('slide-enter'), 320);
        }, 180);
    }

    function renderPresentation() {
        const step = presentationSteps[presentationIndex];
        if (!step) return;
        document.getElementById('presentation-progress').textContent =
            `${presentationIndex + 1} / ${presentationSteps.length}`;
        document.getElementById('presentation-category').textContent =
            [step.category, step.subcategory].filter(Boolean).join(' / ');
        document.getElementById('presentation-title').textContent = step.title;
        document.getElementById('presentation-description').innerHTML = renderMarkdown(step.description);
        const image = document.getElementById('presentation-image');
        if (step.image) {
            image.src = step.image;
            image.alt = t('imageAlt');
            image.hidden = false;
            image.onload = fitPresentationToScreen;
        } else {
            image.removeAttribute('src');
            image.hidden = true;
        }
        document.getElementById('presentation-prev').disabled = presentationIndex === 0;
        document.getElementById('presentation-next').disabled =
            presentationIndex === presentationSteps.length - 1;
        window.requestAnimationFrame(fitPresentationToScreen);
    }

    function fitPresentationToScreen() {
        const slide = presentationModal.querySelector('.presentation-slide');
        const title = document.getElementById('presentation-title');
        const description = document.getElementById('presentation-description');
        if (!slide || presentationModal.hidden) return;

        const mobile = window.innerWidth < 700;
        let titleSize = mobile ? 40 : 72;
        let bodySize = mobile ? 19 : 28;
        title.style.fontSize = `${titleSize}px`;
        description.style.fontSize = `${bodySize}px`;

        for (let attempt = 0; attempt < 18; attempt += 1) {
            if (slide.scrollHeight <= slide.clientHeight && slide.scrollWidth <= slide.clientWidth) break;
            if (titleSize > (mobile ? 26 : 36)) {
                titleSize -= mobile ? 2 : 3;
                title.style.fontSize = `${titleSize}px`;
            }
            if (bodySize > (mobile ? 14 : 18)) {
                bodySize -= 1;
                description.style.fontSize = `${bodySize}px`;
            }
        }
    }

    function getDueDateClass(dueDate, completed) {
        if (completed) return 'is-complete';
        const today = new Date().toISOString().slice(0, 10);
        return dueDate < today ? 'is-overdue' : dueDate === today ? 'is-today' : '';
    }

    function getDueDateLabel(dueDate, completed) {
        if (completed) return t('completed');
        const today = new Date().toISOString().slice(0, 10);
        if (dueDate < today) return t('overdue');
        if (dueDate === today) return t('dueToday');
        return t('dueDateLabel').replace(':', '');
    }

    function showStatus(message, allowUndo = false) {
        statusText.textContent = message;
        statusMessage.hidden = !message;
        undoDeleteButton.hidden = !allowUndo;
        statusMessage.classList.remove('is-error');
    }

    function showError(error, messageKey = null) {
        undoDeleteButton.hidden = true;
        statusText.textContent = messageKey
            ? t(messageKey, { details: error.message })
            : error.code && translations[currentLanguage][error.code]
            ? t(error.code)
            : t('genericError', { details: error.message });
        statusMessage.hidden = false;
        statusMessage.classList.add('is-error');
    }
});

// Απλή ασφάλεια έναντι XSS (HTML escaping)
// Simple security against XSS (HTML escaping)
function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#039;");
}

function renderInlineMarkdown(text) {
    let html = escapeHtml(text);
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    html = html.replace(/_([^_]+)_/g, '<em>$1</em>');
    return html;
}

function renderMarkdown(markdown) {
    if (!markdown) return '';
    const lines = String(markdown).replace(/\r\n?/g, '\n').split('\n');
    let html = '';
    let paragraph = [];
    let listType = null;

    const flushParagraph = () => {
        if (paragraph.length) {
            html += `<p>${paragraph.map(renderInlineMarkdown).join('<br>')}</p>`;
            paragraph = [];
        }
    };
    const closeList = () => {
        if (listType) {
            html += `</${listType}>`;
            listType = null;
        }
    };

    for (let index = 0; index < lines.length; index += 1) {
        const line = lines[index];
        if (/^```/.test(line)) {
            flushParagraph();
            closeList();
            const language = line.slice(3).trim();
            const code = [];
            index += 1;
            while (index < lines.length && !/^```/.test(lines[index])) {
                code.push(lines[index]);
                index += 1;
            }
            html += `<pre><code${language ? ` class="language-${escapeHtml(language)}"` : ''}>${escapeHtml(code.join('\n'))}</code></pre>`;
            continue;
        }

        if (!line.trim()) {
            flushParagraph();
            closeList();
            continue;
        }

        const heading = line.match(/^(#{1,6})\s+(.+)$/);
        if (heading) {
            flushParagraph();
            closeList();
            const level = heading[1].length;
            html += `<h${level}>${renderInlineMarkdown(heading[2])}</h${level}>`;
            continue;
        }

        if (/^([-*_])(?:\s*\1){2,}\s*$/.test(line)) {
            flushParagraph();
            closeList();
            html += '<hr>';
            continue;
        }

        const unordered = line.match(/^\s*[-*+]\s+(.+)$/);
        if (unordered) {
            flushParagraph();
            if (listType !== 'ul') {
                closeList();
                html += '<ul>';
                listType = 'ul';
            }
            html += `<li>${renderInlineMarkdown(unordered[1])}</li>`;
            continue;
        }

        const ordered = line.match(/^\s*\d+[.)]\s+(.+)$/);
        if (ordered) {
            flushParagraph();
            if (listType !== 'ol') {
                closeList();
                html += '<ol>';
                listType = 'ol';
            }
            html += `<li>${renderInlineMarkdown(ordered[1])}</li>`;
            continue;
        }

        const quote = line.match(/^>\s?(.+)$/);
        if (quote) {
            flushParagraph();
            closeList();
            html += `<blockquote>${renderInlineMarkdown(quote[1])}</blockquote>`;
            continue;
        }

        closeList();
        paragraph.push(line);
    }

    flushParagraph();
    closeList();
    return html;
}