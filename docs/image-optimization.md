# Image-Optimierung

Dës Dokument beschreift d'Image-Optiméierungs-Strategie vun Mersch75 an d'Méiglechkeet fir se am **M75-Manager (Vereins-OS)** ze re-applyen.

## Status Quo: mersch75.lu

D'statesch Websäit [`mersch75test.github.io`](https://github.com/Netjogger58/mersch75test.github.io) ass vollstänneg op **WebP/AVIF + Lazy-Loading** migriert:

- **Tool:** `tools/convert-images.mjs` (Node.js + `sharp` + `node-html-parser`)
- **Funktioun:**
  - Konvertéiert all `*.png`, `*.jpg`, `*.jpeg`, `*.webp`, `*.avif` a WebP (Qualitéit 82) a AVIF (Qualitéit 70).
  - Setzt `<picture>`-Elementer mat `<source srcset>` fir AVIF/WebP a läit d'Original als Fallback-`<img>`.
  - Setzt `loading="lazy"` op all Biller; Hero-Biller op `index.html` bleiwen `loading="eager"`.
  - Huet `974 Biller` veraarbecht a `26 HTML-Säiten` aktualiséiert.
- **Dokumentatioun an der Schwëster-Repo:** [`docs/image-optimization.md`](https://github.com/Netjogger58/mersch75test.github.io/blob/main/docs/image-optimization.md)

## Relevanz fir Vereins-OS

D'M75-Manager-App benotzt aktuell wéineg bis keng onoptiméiert Biller; vill Säiten sinn administrativ an de Schwerpunkt läit op Donnéeën. Wann awer spéider z. B. Member-Fotoen, Team-Fotoen oder Dokumenten-Previewer agebaut ginn, kann déi selwecht Technik adaptéiert ginn:

- **Upload-Pipeline:** Bild-Uploads automatesch an WebP/AVIF konvertéieren (Server-Säit `sharp` oder Client-Säit `canvas`/Service-Worker).
- **Lazy-Loading:** `<img loading="lazy">` an React-Komponenten benotzen.
- **API-Response:** mee `image/webp` an `image/avif` Varianten an der DB späicheren a per API ausliwweren.

## Offen Punkte

- [ ] M75-Manager brauch aktuell keng Image-Konversioun.
- [ ] Bei Member/Team-Fotoen: Upload-Optiméierung integréieren.
- [ ] Statische Dateien (`qa-*.png`) kéinten och an WebP/AVIF konvertéiert ginn.

## Verknäppt Dokumenter

- [`README.md`](../README.md)
- [`mersch75test.github.io/docs/image-optimization.md`](https://github.com/Netjogger58/mersch75test.github.io/blob/main/docs/image-optimization.md)
