// Διαχείριση τοπικής αποθήκευσης δεδομένων (LocalStorage)
// Local storage data management
const StorageManager = {
    // Κλειδί αποθήκευσης στη μνήμη του browser
    // Storage key in browser memory
    STORAGE_KEY: 'howto_app_steps',

    // Ανάκτητη όλων των αποθηκευμένων βημάτων
    // Retrieve all saved steps
    getSteps() {
        // Ανάκτηση δεδομένων από το LocalStorage ή επιστροφή κενής λίστας
        // Get data from LocalStorage or return empty list
        const data = localStorage.getItem(this.STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    },

    // Αποθήκευση νέου βήματος στη λίστα
    // Save new step to the list
    saveStep(stepData) {
        const steps = this.getSteps();
        
        // Προσθήκη μοναδικού ID και timestamp βάσει χρόνου
        // Add unique ID and timestamp based on time
        stepData.id = 'step_' + Date.now();
        
        steps.push(stepData);
        
        // Ταξινόμηση ανά κατηγορία, υποκατηγορία και σειρά εκτέλεσης
        // Sort by category, subcategory and execution order
        steps.sort((a, b) => {
            if (a.category !== b.category) return a.category.localeCompare(b.category);
            if (a.subcategory !== b.subcategory) return (a.subcategory || '').localeCompare(b.subcategory || '');
            return Number(a.order) - Number(b.order);
        });

        // Αποθήκευση στο LocalStorage
        // Save to LocalStorage
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(steps));
        return steps;
    },

    // Διαγραφή βήματος βάσει ID
    // Delete step by ID
    deleteStep(stepId) {
        let steps = this.getSteps();
        steps = steps.filter(step => step.id !== stepId);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(steps));
        return steps;
    }
};