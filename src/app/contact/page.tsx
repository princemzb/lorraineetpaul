'use client'

import { useState, type FormEvent } from 'react'

const pageStyles = `
  .contact-page {
    min-height: 100vh;
    padding: 60px 20px;
    font-family: Arial, Helvetica, sans-serif;
    background: linear-gradient(135deg, #fffaf5 0%, #f7efe7 100%);
    color: #2b2b2b;
    line-height: 1.6;
  }

  .contact-page * {
    box-sizing: border-box;
  }

  .contact-page .container {
    max-width: 1150px;
    margin: 0 auto;
  }

  .contact-page .hero {
    text-align: center;
    margin-bottom: 45px;
  }

  .contact-page .badge {
    display: inline-block;
    padding: 8px 16px;
    margin-bottom: 18px;
    border-radius: 999px;
    background: rgba(201, 162, 39, 0.14);
    color: #6f472b;
    font-weight: 700;
    font-size: 0.9rem;
    letter-spacing: 0.3px;
  }

  .contact-page .hero h1 {
    font-size: clamp(2rem, 5vw, 3.4rem);
    color: #6f472b;
    line-height: 1.15;
    margin-bottom: 18px;
  }

  .contact-page .hero p {
    max-width: 760px;
    margin: 0 auto;
    color: #6f6f6f;
    font-size: 1.08rem;
  }

  .contact-page .promo-banner {
    position: relative;
    overflow: hidden;
    margin: 0 0 45px;
    padding: 38px 40px;
    border-radius: 24px;
    background: linear-gradient(135deg, #6f472b 0%, #c9a227 100%);
    box-shadow: 0 20px 50px rgba(111, 71, 43, 0.35);
    color: #ffffff;
    text-align: center;
  }

  .contact-page .promo-banner::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 15% 20%, rgba(255,255,255,0.18), transparent 45%),
                radial-gradient(circle at 85% 80%, rgba(255,255,255,0.14), transparent 45%);
    pointer-events: none;
  }

  .contact-page .promo-badge {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 7px 16px;
    margin-bottom: 16px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.4);
    font-weight: 700;
    font-size: 0.82rem;
    letter-spacing: 0.6px;
    text-transform: uppercase;
  }

  .contact-page .promo-banner h2 {
    position: relative;
    font-size: clamp(1.6rem, 4vw, 2.4rem);
    margin: 0 0 12px;
    line-height: 1.2;
  }

  .contact-page .promo-banner h2 strong {
    color: #fff6dd;
  }

  .contact-page .promo-banner > p {
    position: relative;
    max-width: 680px;
    margin: 0 auto 26px;
    color: rgba(255, 255, 255, 0.92);
    font-size: 1.05rem;
  }

  .contact-page .promo-steps {
    position: relative;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 18px;
    max-width: 900px;
    margin: 0 auto 22px;
    text-align: left;
  }

  .contact-page .promo-steps li {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 18px;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.14);
    border: 1px solid rgba(255, 255, 255, 0.25);
  }

  .contact-page .promo-steps .step-num {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #fff;
    color: #6f472b;
    font-weight: 800;
    font-size: 0.9rem;
  }

  .contact-page .promo-steps strong {
    font-size: 0.98rem;
  }

  .contact-page .promo-steps span {
    font-size: 0.88rem;
    color: rgba(255, 255, 255, 0.88);
  }

  .contact-page .promo-note {
    position: relative;
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.75);
    margin: 0;
  }

  @media (max-width: 700px) {
    .contact-page .promo-steps {
      grid-template-columns: 1fr;
    }
  }

  .contact-page .contact-layout {
    display: grid;
    grid-template-columns: 1fr 1.2fr;
    gap: 30px;
    align-items: start;
  }

  .contact-page .info-card,
  .contact-page .form-card {
    background: #ffffff;
    border: 1px solid #eadfd3;
    border-radius: 24px;
    box-shadow: 0 18px 45px rgba(0, 0, 0, 0.08);
    padding: 32px;
  }

  .contact-page .info-card h2,
  .contact-page .form-card h2 {
    color: #6f472b;
    margin-bottom: 14px;
    font-size: 1.5rem;
  }

  .contact-page .info-card p {
    color: #6f6f6f;
    margin-bottom: 24px;
  }

  .contact-page .service-list {
    list-style: none;
    display: grid;
    gap: 14px;
    margin: 0 0 28px;
    padding: 0;
  }

  .contact-page .service-list li {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    color: #2b2b2b;
  }

  .contact-page .service-list span {
    display: inline-flex;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    align-items: center;
    justify-content: center;
    background: #f7efe7;
    color: #6f472b;
    font-weight: 700;
    flex-shrink: 0;
  }

  .contact-page .contact-details {
    padding-top: 22px;
    border-top: 1px solid #eadfd3;
  }

  .contact-page .contact-details strong {
    display: block;
    color: #6f472b;
    margin-bottom: 6px;
  }

  .contact-page .whatsapp-link {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    margin-top: 8px;
    padding: 10px 16px;
    border-radius: 999px;
    background: #25d366;
    color: #ffffff;
    font-weight: 700;
    text-decoration: none;
    transition: background 0.2s ease, transform 0.2s ease;
  }

  .contact-page .whatsapp-link:hover {
    background: #1ebe5a;
    transform: translateY(-1px);
  }

  .contact-page .form-card p {
    color: #6f6f6f;
    margin-bottom: 24px;
  }

  .contact-page .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 18px;
  }

  .contact-page .form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .contact-page .form-group.full {
    grid-column: 1 / -1;
  }

  .contact-page label {
    font-weight: 700;
    color: #2b2b2b;
    font-size: 0.95rem;
  }

  .contact-page input,
  .contact-page select,
  .contact-page textarea {
    width: 100%;
    padding: 14px 15px;
    border: 1px solid #eadfd3;
    border-radius: 14px;
    font-size: 1rem;
    font-family: inherit;
    color: #2b2b2b;
    background: #fffdfb;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }

  .contact-page input:focus,
  .contact-page select:focus,
  .contact-page textarea:focus {
    outline: none;
    border-color: #c9a227;
    box-shadow: 0 0 0 4px rgba(201, 162, 39, 0.15);
  }

  .contact-page textarea {
    min-height: 150px;
    resize: vertical;
  }

  .contact-page .consent {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    font-size: 0.92rem;
    color: #6f6f6f;
    margin-top: 6px;
    font-weight: 400;
  }

  .contact-page .consent input {
    width: auto;
    margin-top: 4px;
  }

  .contact-page .submit-btn {
    width: 100%;
    margin-top: 22px;
    padding: 16px 22px;
    border: none;
    border-radius: 16px;
    background: #8b5e3c;
    color: #ffffff;
    font-size: 1rem;
    font-weight: 800;
    cursor: pointer;
    transition: background 0.2s ease, transform 0.2s ease;
  }

  .contact-page .submit-btn:hover {
    background: #6f472b;
    transform: translateY(-1px);
  }

  .contact-page .submit-btn:disabled {
    opacity: 0.65;
    cursor: not-allowed;
    transform: none;
  }

  .contact-page .form-message {
    margin-top: 18px;
    padding: 14px 16px;
    border-radius: 14px;
    font-weight: 700;
  }

  .contact-page .form-message.success {
    color: #2f855a;
    background: rgba(47, 133, 90, 0.1);
  }

  .contact-page .form-message.error {
    color: #c53030;
    background: rgba(197, 48, 48, 0.1);
  }

  .contact-page .small-note {
    margin-top: 16px;
    color: #6f6f6f;
    font-size: 0.88rem;
    text-align: center;
  }

  @media (max-width: 900px) {
    .contact-page .contact-layout {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 620px) {
    .contact-page {
      padding: 40px 16px;
    }

    .contact-page .info-card,
    .contact-page .form-card {
      padding: 24px;
      border-radius: 20px;
    }

    .contact-page .form-grid {
      grid-template-columns: 1fr;
    }
  }
`

type FormState = {
  firstName: string
  lastName: string
  email: string
  phone: string
  eventType: string
  guestCount: string
  eventDate: string
  message: string
  consent: boolean
}

const initialForm: FormState = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  eventType: '',
  guestCount: '',
  eventDate: '',
  message: '',
  consent: false,
}

export default function ContactPage() {
  const [form, setForm] = useState<FormState>(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [formMessage, setFormMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim() || !form.eventType || !form.message.trim() || !form.consent) {
      setFormMessage({ text: 'Veuillez remplir tous les champs obligatoires.', type: 'error' })
      return
    }

    setSubmitting(true)
    setFormMessage(null)
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    if (res.ok) {
      setFormMessage({
        text: 'Votre demande a bien été envoyée. Nous vous recontacterons rapidement.',
        type: 'success',
      })
      setForm(initialForm)
    } else {
      const d = await res.json()
      setFormMessage({ text: d.error || 'Une erreur est survenue. Veuillez réessayer plus tard.', type: 'error' })
    }
    setSubmitting(false)
  }

  return (
    <>
      <style>{pageStyles}</style>
      <main className="contact-page">
        <div className="container">
          <section className="hero">
            <span className="badge">Prémices et Associés Services — Division Wedding</span>
            <h1>Créons ensemble votre solution de gestion d&apos;invités</h1>
            <p>
              Vous organisez un mariage ou un événement et souhaitez une plateforme personnalisée
              pour gérer les invités, les confirmations, les tables et les informations importantes ?
              Contactez-nous pour discuter de votre projet.
            </p>
          </section>

          <section className="promo-banner">
            <span className="promo-badge">🎁 Offre Parrainage</span>
            <h2>
              Recommandez nos services et <strong>gagnez 50€</strong>
            </h2>
            <p>
              Vous êtes satisfait(e) de votre expérience avec Prémices et Associés Services ?
              Parlez-en autour de vous ! Pour chaque personne que vous nous recommandez et qui
              commande l&apos;une de nos prestations, nous vous offrons <strong>50€</strong> pour
              vous remercier. Sans limite du nombre de recommandations.
            </p>
            <ul className="promo-steps">
              <li>
                <span className="step-num">1</span>
                <strong>Vous partagez notre contact</strong>
                <span>Parlez de nous à vos proches qui organisent un mariage ou un événement.</span>
              </li>
              <li>
                <span className="step-num">2</span>
                <strong>Ils passent commande</strong>
                <span>Ils nous précisent votre nom lors de leur prise de contact avec nous.</span>
              </li>
              <li>
                <span className="step-num">3</span>
                <strong>Vous êtes récompensé(e)</strong>
                <span>Dès la validation de leur projet, vous recevez vos 50€.</span>
              </li>
            </ul>
            <p className="promo-note">
              Offre valable pour toute recommandation ayant abouti à une commande. Contactez-nous par
              WhatsApp pour plus de détails.
            </p>
          </section>

          <section className="contact-layout">
            <aside className="info-card">
              <h2>Ce que nous pouvons réaliser</h2>
              <p>
                Notre division Wedding accompagne les futurs mariés, familles et organisateurs
                dans la création d&apos;outils simples, élégants et efficaces.
              </p>

              <ul className="service-list">
                <li>
                  <span>1</span>
                  <div>
                    <strong>Page d&apos;invitation personnalisée</strong>
                    <br />
                    Présentation du mariage, programme, lieu, horaires et informations utiles.
                  </div>
                </li>
                <li>
                  <span>2</span>
                  <div>
                    <strong>Gestion des confirmations</strong>
                    <br />
                    Suivi des réponses, nombre d&apos;accompagnants, préférences alimentaires et présences.
                  </div>
                </li>
                <li>
                  <span>3</span>
                  <div>
                    <strong>Organisation des invités</strong>
                    <br />
                    Listes, groupes, familles, plans de table et export des données.
                  </div>
                </li>
                <li>
                  <span>4</span>
                  <div>
                    <strong>Projet sur mesure</strong>
                    <br />
                    Adaptation au style, aux couleurs et aux besoins spécifiques de votre événement.
                  </div>
                </li>
              </ul>

              <div className="contact-details">
                <strong>Besoin d&apos;un projet similaire ?</strong>
                <p>
                  Remplissez le formulaire ci-dessous. Nous vous recontacterons pour comprendre
                  votre besoin et vous proposer une solution adaptée.
                </p>
              </div>

              <div className="contact-details whatsapp-block">
                <strong>Nous contacter</strong>
                <a
                  href="https://wa.me/33769236062"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="whatsapp-link"
                >
                  <svg viewBox="0 0 32 32" width="22" height="22" fill="currentColor" aria-hidden="true">
                    <path d="M16.004 3C9.376 3 4 8.373 4 15c0 2.36.7 4.556 1.902 6.397L4 29l7.803-1.87A11.93 11.93 0 0 0 16.004 27C22.63 27 28 21.627 28 15S22.63 3 16.004 3Zm6.982 16.98c-.297.836-1.47 1.53-2.41 1.73-.64.136-1.475.244-4.29-.923-3.6-1.49-5.92-5.14-6.1-5.38-.176-.24-1.46-1.943-1.46-3.706 0-1.762.92-2.628 1.246-2.99.326-.362.71-.453.947-.453.237 0 .474.002.68.012.218.01.51-.083.798.61.298.71 1.012 2.472 1.1 2.652.088.18.147.393.03.633-.118.24-.177.39-.353.6-.176.21-.37.47-.53.63-.176.176-.36.367-.155.72.207.352.918 1.514 1.97 2.452 1.353 1.207 2.494 1.582 2.847 1.76.353.176.56.147.767-.093.207-.24.884-1.03 1.12-1.383.235-.353.47-.294.793-.176.323.118 2.05.967 2.402 1.144.353.176.588.264.676.412.088.147.088.85-.21 1.686Z" />
                  </svg>
                  <span>+33 7 69 23 60 62</span>
                </a>
              </div>
            </aside>

            <section className="form-card">
              <h2>Parlez-nous de votre projet</h2>
              <p>
                Donnez-nous quelques informations sur votre événement afin que nous puissions
                vous répondre efficacement.
              </p>

              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="firstName">Prénom *</label>
                    <input
                      type="text"
                      id="firstName"
                      value={form.firstName}
                      onChange={(e) => update('firstName', e.target.value)}
                      placeholder="Votre prénom"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="lastName">Nom *</label>
                    <input
                      type="text"
                      id="lastName"
                      value={form.lastName}
                      onChange={(e) => update('lastName', e.target.value)}
                      placeholder="Votre nom"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Adresse email *</label>
                    <input
                      type="email"
                      id="email"
                      value={form.email}
                      onChange={(e) => update('email', e.target.value)}
                      placeholder="exemple@email.com"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">Téléphone</label>
                    <input
                      type="tel"
                      id="phone"
                      value={form.phone}
                      onChange={(e) => update('phone', e.target.value)}
                      placeholder="+33 6 00 00 00 00"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="eventType">Type de projet *</label>
                    <select
                      id="eventType"
                      value={form.eventType}
                      onChange={(e) => update('eventType', e.target.value)}
                      required
                    >
                      <option value="">Sélectionnez une option</option>
                      <option value="mariage">Mariage</option>
                      <option value="fiancailles">Fiançailles</option>
                      <option value="anniversaire">Anniversaire</option>
                      <option value="evenement-prive">Événement privé</option>
                      <option value="autre">Autre projet</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="guestCount">Nombre estimé d&apos;invités</label>
                    <select
                      id="guestCount"
                      value={form.guestCount}
                      onChange={(e) => update('guestCount', e.target.value)}
                    >
                      <option value="">Sélectionnez une option</option>
                      <option value="moins-50">Moins de 50</option>
                      <option value="50-100">50 à 100</option>
                      <option value="100-200">100 à 200</option>
                      <option value="200-plus">Plus de 200</option>
                      <option value="non-defini">Pas encore défini</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="eventDate">Date prévue</label>
                    <input
                      type="date"
                      id="eventDate"
                      value={form.eventDate}
                      onChange={(e) => update('eventDate', e.target.value)}
                    />
                  </div>

                  <div className="form-group full">
                    <label htmlFor="message">Décrivez votre besoin *</label>
                    <textarea
                      id="message"
                      value={form.message}
                      onChange={(e) => update('message', e.target.value)}
                      placeholder="Exemple : Je souhaite une solution de gestion pour mon mariage avec une page d'invitation, un formulaire RSVP, la gestion des accompagnants et une liste des invités..."
                      required
                    />
                  </div>

                  <div className="form-group full">
                    <label className="consent">
                      <input
                        type="checkbox"
                        checked={form.consent}
                        onChange={(e) => update('consent', e.target.checked)}
                        required
                      />
                      <span>
                        J&apos;accepte que Prémices et Associés Services me contacte au sujet de ma demande.
                      </span>
                    </label>
                  </div>
                </div>

                <button type="submit" className="submit-btn" disabled={submitting}>
                  {submitting ? 'Envoi en cours...' : 'Envoyer ma demande'}
                </button>

                {formMessage && (
                  <div className={`form-message ${formMessage.type}`}>{formMessage.text}</div>
                )}

                <p className="small-note">Les champs marqués d&apos;un astérisque (*) sont obligatoires.</p>
              </form>
            </section>
          </section>
        </div>
      </main>
    </>
  )
}
