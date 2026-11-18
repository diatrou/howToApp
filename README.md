# HowToApp

Τοπική εφαρμογή web για οργάνωση οδηγιών και βημάτων. Χρησιμοποιεί HTML, CSS, vanilla JavaScript και LocalStorage· δεν απαιτεί λογαριασμό ή backend.

## Χρήση

Ανοίξτε το `index.html` σε σύγχρονο browser. Για σταθερή συμπεριφορά αποθήκευσης, ειδικά όταν το `file://` περιορίζεται από τον browser, σερβίρετε το φάκελο μέσω ενός τοπικού static server.

Μπορείτε να προσθέσετε και να επεξεργαστείτε βήματα, να τα σημειώσετε ως ολοκληρωμένα, να αναζητήσετε/φιλτράρετε ανά κατηγορία και υποκατηγορία, και να αλλάξετε τη σειρά εμφάνισης. Η γλώσσα επιλέγεται από την επικεφαλίδα και αποθηκεύεται στον ίδιο browser.

## Αντίγραφα ασφαλείας και εικόνες

- **Εξαγωγή αντιγράφου** κατεβάζει αρχείο JSON. Η εισαγωγή μπορεί είτε να αντικαταστήσει τα υπάρχοντα βήματα (με επιβεβαίωση) είτε να τα συγχωνεύσει με βάση το ID.
- Οι εικόνες PNG, JPEG και WebP περιορίζονται σε 5 MB πριν από τη φόρτωση, αλλάζουν μέγεθος έως 1200 px και αποθηκεύονται στο LocalStorage. Ο διαθέσιμος χώρος εξαρτάται από τον browser· σε περίπτωση υπέρβασης εμφανίζεται μήνυμα σφάλματος.
- Τα βήματα και οι εικόνες παραμένουν στον συγκεκριμένο browser/προφίλ και δεν συγχρονίζονται αυτόματα. Κρατήστε τακτικά εξαγόμενα αντίγραφα.

## English

HowToApp is a local web application for organizing instructions and steps. It uses HTML, CSS, vanilla JavaScript, and browser LocalStorage; no account or backend is required.

Open `index.html` in a modern browser. For consistent persistence—particularly when the browser restricts storage on `file://` URLs—serve the folder with a local static server.

Create and edit steps, mark them complete, search and filter by category/subcategory, and choose a sort order. Select Greek or English in the header; the preference is saved in the current browser.

Export downloads a JSON backup. Import can replace existing steps (after confirmation) or merge by step ID. PNG, JPEG, and WebP images are limited to 5 MB before processing, resized to at most 1200 px, and stored in LocalStorage. Storage capacity varies by browser. Data stays in the current browser profile and is not synchronized, so keep regular backups.
