---
layout: default
title: Probéieren-Training | Mersch 75
permalink: /probetraining/
---

<section class="hero" style="text-align:center;padding:3rem 1rem;background:#f5f5f5;">
  <h1>Probéier een Training bei Mersch 75</h1>
  <p style="font-size:1.2rem;max-width:600px;margin:1rem auto;">
    Handball, fair Play an eng super Equipe fir Kanner a Jugendlecher. <br>
    Gratis probéieren, keng Verpflichtung.
  </p>
  <a href="#anmeldung" class="btn">Platz fir Probéieren sicheren</a>
</section>

<section style="max-width:800px;margin:2rem auto;padding:1rem;">
  <h2>Wat kanns du erwaarden?</h2>
  <ul>
    <li><strong>Erfuerene Trainer</strong> – fir all Niveau</li>
    <li><strong>Gemëschte Teams</strong> – vum Spill bis zum Training</li>
    <li><strong>Fair Play</strong> – Respekt steet bei eis uewen</li>
  </ul>
</section>

<section id="anmeldung" style="max-width:500px;margin:2rem auto;padding:1.5rem;background:#fff;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
  <h2>Jetzt unmelden</h2>
  <p style="font-size:0.95rem;color:#666;">
    Fëllt d’Formulaire aus. Mir schécken Iech all Detailer zum nächsten Training.
  </p>

  <form id="trialForm" style="display:flex;flex-direction:column;gap:1rem;margin-top:1rem;">
    <input type="text" name="childName" placeholder="Numm vum Kand" required style="padding:0.75rem;border:1px solid #ccc;border-radius:4px;" />
    <input type="number" name="age" placeholder="Alter vum Kand" required style="padding:0.75rem;border:1px solid #ccc;border-radius:4px;" />
    <input type="text" name="parentName" placeholder="Numm vum Erzéiungsberechtegten" required style="padding:0.75rem;border:1px solid #ccc;border-radius:4px;" />
    <input type="email" name="email" placeholder="E-Mail" required style="padding:0.75rem;border:1px solid #ccc;border-radius:4px;" />
    <input type="tel" name="phone" placeholder="Telefon (optional)" style="padding:0.75rem;border:1px solid #ccc;border-radius:4px;" />
    <select name="teamCategory" required style="padding:0.75rem;border:1px solid #ccc;border-radius:4px;">
      <option value="">Kategorie wielen</option>
      <option value="Mini">Mini</option>
      <option value="E-Jugend">E-Jugend</option>
      <option value="D-Jugend">D-Jugend</option>
      <option value="C-Jugend">C-Jugend</option>
      <option value="B-Jugend">B-Jugend</option>
      <option value="A-Jugend">A-Jugend</option>
      <option value="Senior">Senior</option>
    </select>
    <textarea name="note" placeholder="Nachricht / Bemierkung (optional)" rows="3" style="padding:0.75rem;border:1px solid #ccc;border-radius:4px;"></textarea>
    <label style="font-size:0.9rem;display:flex;align-items:flex-start;gap:0.5rem;">
      <input type="checkbox" required style="margin-top:0.25rem;" />
      Ech erlaben d’Kontaktaufnahm per E-Mail / Telefon fir d’Organisatioun vum Probéieren-Training.
    </label>
    <button type="submit" class="btn" style="padding:0.75rem;font-size:1rem;">Platz sichern</button>
    <p id="formMessage" style="display:none;margin-top:0.5rem;"></p>
  </form>
</section>

<script>
  const API_URL = "https://api.mersch75.lu/api/public/trial-registrations";

  document.getElementById("trialForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = Object.fromEntries(new FormData(form));
    const messageEl = document.getElementById("formMessage");

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        messageEl.textContent = "Merci! Mir schécken Iech d’Detailer per Mail.";
        messageEl.style.color = "green";
        messageEl.style.display = "block";
        form.reset();
      } else {
        const err = await res.json().catch(() => ({}));
        messageEl.textContent = err.message || "Eppes ass schif gaangen. Probéiert et spéider nees.";
        messageEl.style.color = "red";
        messageEl.style.display = "block";
      }
    } catch (error) {
      messageEl.textContent = "Verbindungsfeeler. Probéiert et nees.";
      messageEl.style.color = "red";
      messageEl.style.display = "block";
    }
  });
</script>

<style>
  .btn {
    display:inline-block;
    padding:0.75rem 1.5rem;
    background:#0055a4;
    color:#fff;
    text-decoration:none;
    border-radius:4px;
    border:none;
    cursor:pointer;
  }
  .btn:hover {
    background:#003f7a;
  }
</style>
