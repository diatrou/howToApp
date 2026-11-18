# HowToApp

Τοπική εφαρμογή web για οργάνωση οδηγιών και βημάτων. Χρησιμοποιεί HTML, CSS, vanilla JavaScript και LocalStorage· δεν απαιτεί λογαριασμό ή backend.

## Χρήση

Ανοίξτε το `index.html` σε σύγχρονο browser. Για σταθερή συμπεριφορά αποθήκευσης, ειδικά όταν το `file://` περιορίζεται από τον browser, σερβίρετε το φάκελο μέσω ενός τοπικού static server.

Μπορείτε να προσθέσετε και να επεξεργαστείτε βήματα, να τα σημειώσετε ως ολοκληρωμένα, να αναζητήσετε/φιλτράρετε ανά κατηγορία και υποκατηγορία, και να αλλάξετε τη σειρά εμφάνισης. Η γλώσσα επιλέγεται από την επικεφαλίδα και αποθηκεύεται στον ίδιο browser.

Το περιεχόμενο μπορεί επίσης να οργανωθεί με ετικέτες και ημερομηνίες ολοκλήρωσης, να ταξινομηθεί με μεταφορά στοιχείων και να εμφανιστεί σε προβολή παρουσίασης βήμα προς βήμα. Οι περιγραφές αναγνωρίζουν Markdown για τίτλους, λίστες, έμφαση, συνδέσους, εισαγωγικά και μπλοκ κώδικα· η παρουσίαση έχει ομαλή εναλλαγή διαφανειών και προσαρμόζει αυτόματα τα μεγέθη γραμματοσειράς ώστε να μη χρησιμοποιείται κύλιση. Μη αποθηκευμένα προσχέδια ανακτώνται κατά την επόμενη φόρτωση. Η διαγραφή υποστηρίζει σύντομη αναίρεση.
Με το κουμπί «Διαγραφή όλων των βημάτων» γίνεται αυτόματη εξαγωγή αντιγράφου ασφαλείας και επιβεβαιωμένη διαγραφή όλων των βημάτων ή μόνο της επιλεγμένης κατηγορίας/υποκατηγορίας. Το όνομα του αρχείου ασφαλείας περιλαμβάνει την κατηγορία, την υποκατηγορία και την τοπική ημερομηνία και ώρα.

Η εφαρμογή παρέχει PWA manifest και offline service worker, επομένως μπορεί να χρησιμοποιηθεί ως standalone εφαρμογή και να ανοίγει χωρίς σύνδεση αφού φορτωθεί μία φορά στον browser.

## Αντίγραφα ασφαλείας και εικόνες

- **Εξαγωγή αντιγράφου** κατεβάζει αρχείο JSON. Η εισαγωγή μπορεί είτε να αντικαταστήσει τα υπάρχοντα βήματα (με επιβεβαίωση) είτε να τα συγχωνεύσει με βάση το ID.
- **Εισαγωγή Markdown** δημιουργεί ένα βήμα για κάθε μη κενή γραμμή του αρχείου. Κατά την εισαγωγή ζητούνται κατηγορία, υποκατηγορία, ετικέτες και ημερομηνία, οι οποίες εφαρμόζονται σε όλα τα βήματα· η σειρά ξεκινά από 1.
- Οι εικόνες PNG, JPEG και WebP περιορίζονται σε 5 MB πριν από τη φόρτωση, αλλάζουν μέγεθος έως 1200 px και αποθηκεύονται στο LocalStorage. Ο διαθέσιμος χώρος εξαρτάται από τον browser· σε περίπτωση υπέρβασης εμφανίζεται μήνυμα σφάλματος.
- Τα βήματα και οι εικόνες παραμένουν στον συγκεκριμένο browser/προφίλ και δεν συγχρονίζονται αυτόματα. Κρατήστε τακτικά εξαγόμενα αντίγραφα.

## English

HowToApp is a local web application for organizing instructions and steps. It uses HTML, CSS, vanilla JavaScript, and browser LocalStorage; no account or backend is required.

Open `index.html` in a modern browser. For consistent persistence—particularly when the browser restricts storage on `file://` URLs—serve the folder with a local static server.

Create and edit steps, mark them complete, search and filter by category/subcategory, and choose a sort order. Select Greek or English in the header; the preference is saved in the current browser.

Export downloads a JSON backup. Import can replace existing steps (after confirmation) or merge by step ID. PNG, JPEG, and WebP images are limited to 5 MB before processing, resized to at most 1200 px, and stored in LocalStorage. Storage capacity varies by browser. Data stays in the current browser profile and is not synchronized, so keep regular backups.

Steps can also be organized with tags and due dates, reordered by drag and drop, and displayed in a full-screen step-by-step presentation. Descriptions support Markdown for headings, lists, emphasis, links, blockquotes, and code blocks; presentation slides transition smoothly and fit their text automatically so scrolling is unnecessary. Unsaved form drafts are restored after the next page load, and deletion provides a short undo window.

The app includes a PWA manifest and offline service worker, so it can be installed as a standalone app and opened offline after its first successful load.

The “Delete all steps” button exports a safety backup automatically before an explicit confirmation and then deletes all steps or only the currently selected category/subcategory. The backup filename includes the category, subcategory, and local date and time.
