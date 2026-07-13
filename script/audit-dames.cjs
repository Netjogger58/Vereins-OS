const Database = require("better-sqlite3");
const db = new Database("data.db", { readonly: true });

console.log("=== internal_category mit 'Dame' ===");
console.table(db.prepare("SELECT internal_category ic, COUNT(*) n FROM members WHERE internal_category LIKE '%Dame%' GROUP BY internal_category").all());

console.log("=== flh_category mit 'Dame' ===");
console.table(db.prepare("SELECT flh_category fc, COUNT(*) n FROM members WHERE flh_category LIKE '%Dame%' GROUP BY flh_category").all());

console.log("=== AKTIVE Mitglieder: hat cat_code? ===");
console.table(db.prepare("SELECT (cat_code IS NULL) AS ohne_catcode, COUNT(*) n FROM members WHERE membership_status='active' GROUP BY (cat_code IS NULL)").all());

console.log("=== AKTIVE ohne cat_code, aber flh/internal enthält 'Dame' ===");
console.table(db.prepare("SELECT id, name, flh_category, internal_category FROM members WHERE membership_status='active' AND cat_code IS NULL AND (flh_category LIKE '%Dame%' OR internal_category LIKE '%Dame%')").all());

console.log("=== cat_code Verteilung (aktiv) ===");
console.table(db.prepare("SELECT cat_code, COUNT(*) n FROM members WHERE membership_status='active' GROUP BY cat_code ORDER BY cat_code").all());
db.close();
