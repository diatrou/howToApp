// Κεντρική λογική εφαρμογής και διαχείριση UI
// Main application logic and UI management
document.addEventListener('DOMContentLoaded', () => {
    // Αναφορές σε στοιχεία του DOM
    // DOM elements references
    const stepForm = document.getElementById('step-form');
    const stepsContainer = document.getElementById('steps-container');
    const searchInput = document.getElementById('search-input');

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

        // Συνάρτηση μετατροπής εικόνας σε Base64 για τοπική αποθήκευση
        // Function to convert image to Base64 for local storage
        const processAndSave = (imageUrl = '') => {
            const newStep = {
                category,
                subcategory,
                title,
                order,
                description,
                image: imageUrl
            };

            StorageManager.saveStep(newStep);
            stepForm.reset();
            renderSteps();
        };

        // Έλεγχος αν έχει επιλεγεί εικόνα
        // Check if an image has been selected
        if (imageInput.files && imageInput.files[0]) {
            const reader = new FileReader();
            reader.onload = function(event) {
                processAndSave(event.target.result);
            };
            reader.readAsDataURL(imageInput.files[0]);
        } else {
            processAndSave();
        }
    });

    // Διαχείριση αναζήτησης/φιλτραρίσματος
    // Handle search/filtering
    searchInput.addEventListener('input', (e) => {
        renderSteps(e.target.value);
    });

    // Συνάρτηση προβολής βημάτων στην οθόνη
    // Function to render steps on the screen
    function renderSteps(filterText = '') {
        const steps = StorageManager.getSteps();
        stepsContainer.innerHTML = '';

        // Φιλτράρισμα βάσει κειμένου αναζήτησης
        // Filter based on search text
        const filteredSteps = steps.filter(step => {
            const searchText = filterText.toLowerCase();
            return step.title.toLowerCase().includes(searchText) ||
                   step.category.toLowerCase().includes(searchText) ||
                   (step.subcategory && step.subcategory.toLowerCase().includes(searchText)) ||
                   step.description.toLowerCase().includes(searchText);
        });

        if (filteredSteps.length === 0) {
            stepsContainer.innerHTML = '<p class="no-steps">Δεν βρέθηκαν βήματα. / No steps found.</p>';
            return;
        }

        // Δημιουργία HTML για κάθε βήμα
        // Create HTML for each step
        filteredSteps.forEach(step => {
            const stepCard = document.createElement('div');
            stepCard.className = 'step-card card';
            stepCard.style.marginBottom = '15px';

            stepCard.innerHTML = `
                <div class="step-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <div>
                        <span class="badge" style="background: #e0e7ff; color: #4f46e5; padding: 3px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: bold;">${escapeHtml(step.category)}</span>
                        ${step.subcategory ? `<span class="badge" style="background: #f3f4f6; color: #374151; padding: 3px 8px; border-radius: 4px; font-size: 0.8rem; margin-left: 5px;">${escapeHtml(step.subcategory)}</span>` : ''}
                    </div>
                    <span class="step-num" style="font-weight: bold; color: #6b7280;">Βήμα / Step: ${step.order}</span>
                </div>
                <h3 style="margin: 5px 0 10px 0; font-size: 1.1rem;">${escapeHtml(step.title)}</h3>
                <p style="white-space: pre-line; color: #4b5563; font-size: 0.95rem;">${escapeHtml(step.description)}</p>
                ${step.image ? `<div class="step-img-container" style="margin-top: 10px;"><img src="${step.image}" alt="Step image" style="max-width: 100%; max-height: 200px; border-radius: 4px;"></div>` : ''}
                <div style="text-align: right; margin-top: 10px;">
                    <button onclick="deleteStepItem('${step.id}')" style="background: #fee2e2; color: #dc2626; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 0.85rem;">Διαγραφή / Delete</button>
                </div>
            `;

            stepsContainer.appendChild(stepCard);
        });
    }
});

// Καθολική συνάρτηση διαγραφής βήματος
// Global function to delete a step
window.deleteStepItem = function(id) {
    if (confirm('Είστε σίγουρος ότι θέλετε να διαγράψετε αυτό το βήμα; / Are you sure you want to delete this step?')) {
        StorageManager.deleteStep(id);
        // Επαναφόρτωση λίστας
        // Reload list
        const searchInput = document.getElementById('search-input');
        const event = new Event('input');
        searchInput.dispatchEvent(event);
        location.reload(); // Ανανέωση προβολής / Refresh view
    }
};

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