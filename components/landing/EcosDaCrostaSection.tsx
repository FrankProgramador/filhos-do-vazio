const paragraphs = [
  'Dentre as infinitas possibilidades, o Vazio escolheu aqui um mundo de pedra e areia — belo na sua dureza, cruel na sua indiferença. Milênios se passaram. Governos ergueram e ruíram. Civilizações foram engolidas pelo deserto e esquecidas. Mas seus ecos permanecem, cristalizados nas ruínas e nas histórias que os sobreviventes ainda contam.',
  'A Crosta é uma região de montanhas que emergem do mar de areia como ilhas de pedra. Em cada uma delas, algo encontrou uma forma de viver.',
  'Nossa história começa em uma dessas ilhas — não nas encostas, não no cume, mas dentro. No interior de uma formação rochosa diferente de tudo o que existe na região. Impenetrável por fora, surpreendentemente vasta por dentro, com câmaras que parecem ter sido moldadas por algo além da erosão e do tempo. Ninguém sabe exatamente como se formou. Os estudiosos debatem. A teocracia não encoraja o debate.',
  'Os de fora a chamam de Spelunka Vermis.',
  'Os de dentro simplesmente a chamam de lar.',
]

export default function EcosDaCrostaSection() {
  return (
    <section id="ecos-da-crosta" aria-labelledby="ecos-da-crosta-title" style={{ background: 'var(--bg)', padding: '5rem 0' }}>
      <div className="max-w-screen-md mx-auto px-6">
        <p className="lnd-label text-center" aria-hidden>Ecos da Crosta</p>

        <div className="flex justify-center mb-4" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/img/icons/kishar-icon.png"
            alt=""
            style={{ width: 50, height: 40, padding: '10px 10px 0px 10px', filter: 'drop-shadow(0 0 12px rgba(var(--gold-rgb),.55))' }}
          />
        </div>

        <h2
          id="ecos-da-crosta-title"
          className="text-center section-heading-glow mb-10"
          style={{ fontFamily: 'var(--font-cinzel)', fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 700, color: 'var(--text)' }}
        >
          Ecos da Crosta
        </h2>

        <div style={{ color: 'rgba(var(--text-rgb),.72)' }}>
          {paragraphs.map((text, i) => (
            <p
              key={i}
              className="text-center"
              style={{ fontFamily: 'var(--font-im-fell)', fontStyle: 'italic', fontSize: 'clamp(1rem, 1.8vw, 1.15rem)', lineHeight: 1.9, marginBottom: '1.1rem' }}
            >
              {text}
            </p>
          ))}
        </div>
      </div>
    </section>
  )
}
