// Zentrale mehrsprachige Texte + Helfer für die Médico-Convocation.
// Wird von client (Druck-HTML) UND server (E-Mail-HTML) genutzt.
export type ConvLang = "LB" | "FR" | "DE" | "EN" | "PT" | "IT";
export const CONV_LANGS: ConvLang[] = ["LB", "FR", "DE", "EN", "PT", "IT"];

export const WEEKDAYS: Record<ConvLang, string[]> = {
  LB: ["Sonndeg", "Méindeg", "Dënschdeg", "Mëttwoch", "Donneschdeg", "Freideg", "Samschdeg"],
  FR: ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"],
  DE: ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"],
  EN: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  PT: ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"],
  IT: ["domenica", "lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato"],
};

export interface ConvTexts {
  merschLe: string;
  nom: string;
  rdv: string;
  lieu: string;
  present: string;
  checklist: string[];
  jogging: string;
  empechement: string;
  signed: string;
  // E-Mail-spezifisch
  emailSubject: string;
  emailIntro: string;      // Begrüßung/Einleitung im Mail-Body
  confirmBtn: string;      // Text auf dem Bestätigungs-Button
  confirmHint: string;     // Hinweis unter dem Button
  confirmedTitle: string;  // Titel der Bestätigungsseite
  confirmedBody: string;   // Text der Bestätigungsseite
  declineBtn: string;      // "Ich kann diesen Termin nicht"
  declinedTitle: string;   // Titel nach Absage
  declinedBody: string;    // Text nach Absage
}
export const SIGN_NAME = "Virginio Castellano";
export const SIGN_TITLE = "Secrétaire administratif Mersch 75";
export const CONTACT_NAME = "M. Castellano Virginio";
export const CONTACT_PHONE = "691 313 057";

export const CONV_TEXTS: Record<ConvLang, ConvTexts> = {
  LB: {
    merschLe: "Mersch, den", nom: "Numm:", rdv: "Rendez-vous:", lieu: "Plaz:",
    present: "Beim Dokter virzeweisen:",
    checklist: ["Impfkaart", "Brëll (falls néideg)", "Identitéitskaart", "Sozialversécherungskaart (CNS)"],
    jogging: "Wgl. e Jogging undoen",
    empechement: `Am Fall vun engem Empêchement, wgl. uruffen beim ${CONTACT_NAME} ënner der Nummer: ${CONTACT_PHONE}. Merci!`,
    signed: "gezeechent",
    emailSubject: "Convocation Médico — HB Mersch 75",
    emailIntro: "Salut,\n\ndu bass fir de Médico (medezinesch Untersuchung) convoquéiert. Hei drënner déng Détailer. Wgl. de Rendez-vous confirméieren:",
    confirmBtn: "Rendez-vous confirméieren",
    confirmHint: "Klick op de Knäppchen fir dem Sekretariat ze soen datt s du de Rendez-vous kritt hues.",
    confirmedTitle: "Merci — Rendez-vous confirméiert!",
    confirmedBody: "Deng Confirmatioun ass beim Sekretariat ukomm. Bis geschwënn!",
    declineBtn: "Ech kann dësen Termin net",
    declinedTitle: "Merci fir Bescheed ze soen",
    declinedBody: "D'Sekretariat gouf informéiert datt s du dësen Termin net kanns unhuelen. Mir mellen dir en neien Rendez-vous.",
  },
  FR: {
    merschLe: "Mersch, le", nom: "Nom :", rdv: "Rendez-vous :", lieu: "Lieu :",
    present: "À présenter au docteur :",
    checklist: ["CARTE de VACCINATION", "LUNETTES", "CARTE D'IDENTITÉ", "CARTE de SÉCURITÉ SOCIALE"],
    jogging: "Veuillez mettre un jogging",
    empechement: `En cas d'empêchement, veuillez téléphoner à ${CONTACT_NAME} au numéro : ${CONTACT_PHONE}. Merci !`,
    signed: "signé",
    emailSubject: "Convocation Médico — HB Mersch 75",
    emailIntro: "Bonjour,\n\nvous êtes convoqué(e) pour la visite médicale (médico). Vous trouverez les détails ci-dessous. Merci de confirmer le rendez-vous :",
    confirmBtn: "Confirmer le rendez-vous",
    confirmHint: "Cliquez sur le bouton pour informer le secrétariat que vous avez bien reçu le rendez-vous.",
    confirmedTitle: "Merci — rendez-vous confirmé !",
    confirmedBody: "Votre confirmation a bien été reçue par le secrétariat. À bientôt !",
    declineBtn: "Je ne peux pas à cette date",
    declinedTitle: "Merci de nous avoir prévenus",
    declinedBody: "Le secrétariat a été informé que vous ne pouvez pas venir à ce rendez-vous. Nous vous proposerons une nouvelle date.",
  },
  DE: {
    merschLe: "Mersch, den", nom: "Name:", rdv: "Termin:", lieu: "Ort:",
    present: "Dem Arzt vorzulegen:",
    checklist: ["Impfpass", "Brille (falls nötig)", "Personalausweis", "Sozialversicherungskarte (CNS)"],
    jogging: "Bitte eine Jogginghose mitbringen",
    empechement: `Bei Verhinderung bitte ${CONTACT_NAME} anrufen unter der Nummer: ${CONTACT_PHONE}. Danke!`,
    signed: "gez.",
    emailSubject: "Einladung Médico — HB Mersch 75",
    emailIntro: "Guten Tag,\n\nSie sind zur medizinischen Untersuchung (Médico) eingeladen. Die Details finden Sie unten. Bitte bestätigen Sie den Termin:",
    confirmBtn: "Termin bestätigen",
    confirmHint: "Klicken Sie auf den Button, um dem Sekretariat den Erhalt des Termins zu bestätigen.",
    confirmedTitle: "Danke — Termin bestätigt!",
    confirmedBody: "Ihre Bestätigung ist beim Sekretariat eingegangen. Bis bald!",
    declineBtn: "Ich kann diesen Termin nicht",
    declinedTitle: "Danke für die Rückmeldung",
    declinedBody: "Das Sekretariat wurde informiert, dass Sie diesen Termin nicht wahrnehmen können. Wir melden Ihnen einen neuen Termin.",
  },
  EN: {
    merschLe: "Mersch,", nom: "Name:", rdv: "Appointment:", lieu: "Location:",
    present: "To present to the doctor:",
    checklist: ["Vaccination card", "Glasses (if needed)", "Identity card", "Social security card (CNS)"],
    jogging: "Please wear a tracksuit",
    empechement: `If you are unable to attend, please call ${CONTACT_NAME} on: ${CONTACT_PHONE}. Thank you!`,
    signed: "signed",
    emailSubject: "Médico appointment — HB Mersch 75",
    emailIntro: "Hello,\n\nyou are invited for the medical check-up (médico). Please find the details below and confirm the appointment:",
    confirmBtn: "Confirm appointment",
    confirmHint: "Click the button to let the secretariat know you received the appointment.",
    confirmedTitle: "Thank you — appointment confirmed!",
    confirmedBody: "Your confirmation has reached the secretariat. See you soon!",
    declineBtn: "I can't make this date",
    declinedTitle: "Thanks for letting us know",
    declinedBody: "The secretariat has been informed that you cannot attend this appointment. We will propose a new date.",
  },
  PT: {
    merschLe: "Mersch,", nom: "Nome:", rdv: "Marcação:", lieu: "Local:",
    present: "A apresentar ao médico:",
    checklist: ["Cartão de vacinação", "Óculos (se necessário)", "Cartão de identidade", "Cartão de segurança social (CNS)"],
    jogging: "Por favor, use um fato de treino",
    empechement: `Em caso de impedimento, ligue ao ${CONTACT_NAME} para o número: ${CONTACT_PHONE}. Obrigado!`,
    signed: "assinado",
    emailSubject: "Convocatória Médico — HB Mersch 75",
    emailIntro: "Olá,\n\nestá convocado(a) para o exame médico (médico). Encontra os detalhes abaixo. Por favor, confirme a marcação:",
    confirmBtn: "Confirmar marcação",
    confirmHint: "Clique no botão para informar a secretaria de que recebeu a marcação.",
    confirmedTitle: "Obrigado — marcação confirmada!",
    confirmedBody: "A sua confirmação chegou à secretaria. Até breve!",
    declineBtn: "Não posso nesta data",
    declinedTitle: "Obrigado por avisar",
    declinedBody: "A secretaria foi informada de que não pode comparecer a esta marcação. Iremos propor uma nova data.",
  },
  IT: {
    merschLe: "Mersch,", nom: "Nome:", rdv: "Appuntamento:", lieu: "Luogo:",
    present: "Da presentare al medico:",
    checklist: ["Tessera vaccinale", "Occhiali (se necessario)", "Carta d'identità", "Tessera sanitaria (CNS)"],
    jogging: "Si prega di indossare una tuta",
    empechement: `In caso di impedimento, telefonare al ${CONTACT_NAME} al numero: ${CONTACT_PHONE}. Grazie!`,
    signed: "firmato",
    emailSubject: "Convocazione Médico — HB Mersch 75",
    emailIntro: "Buongiorno,\n\nè convocato/a per la visita medica (médico). Trova i dettagli qui sotto. La preghiamo di confermare l'appuntamento:",
    confirmBtn: "Conferma appuntamento",
    confirmHint: "Clicca sul pulsante per informare la segreteria di aver ricevuto l'appuntamento.",
    confirmedTitle: "Grazie — appuntamento confermato!",
    confirmedBody: "La tua conferma è arrivata alla segreteria. A presto!",
    declineBtn: "Non posso in questa data",
    declinedTitle: "Grazie per l'avviso",
    declinedBody: "La segreteria è stata informata che non puoi presentarti a questo appuntamento. Ti proporremo una nuova data.",
  },
};

export const ADDRESS_LINES = ["École Nik Welter", "15, Place de l'Église — L-7523 Mersch", "Entrée côté Square Princesse Marie-Astrid"];
export const ADDRESS_HTML = ADDRESS_LINES.join("<br/>");

export function pad2(n: number) { return String(n).padStart(2, "0"); }
export function fmtDate(d: Date) { return `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}.${d.getFullYear()}`; }

// RDV-Zeile in der jeweiligen Sprache aus einem Date.
export function fmtRdv(lang: ConvLang, d: Date): string {
  const wd = WEEKDAYS[lang][d.getDay()];
  const date = fmtDate(d);
  const hh = pad2(d.getHours()), mm = pad2(d.getMinutes());
  switch (lang) {
    case "FR": return `${wd}, le ${date} à ${hh}h${mm} hrs`;
    case "LB": return `${wd}, den ${date} um ${hh}:${mm} Auer`;
    case "DE": return `${wd}, den ${date} um ${hh}:${mm} Uhr`;
    case "EN": return `${wd}, ${date} at ${hh}:${mm}`;
    case "PT": return `${wd}, ${date} às ${hh}h${mm}`;
    case "IT": return `${wd}, ${date} alle ${hh}:${mm}`;
  }
}

export const escHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
