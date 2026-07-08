const paragraphs = [
  'Antes do primeiro raio de luz.',
  'Antes da primeira pedra.',
  'Antes do primeiro sopro de vida.',
  'Existia o Vazio. E isto não significicava que não havia nada.',
  'O vazio não tinha formas, nomes ou destinos., mas nele havia todas as infinitas possibilidades de ser.',
  'Havia apenas tudo aquilo que ainda poderia existir.',
  'Então o impossível aconteceu.',
  'O Vazio começou a tomar forma.',
  'E a cada forma escolhida, incontáveis outras deixaram de existir.',
  'Uma pedra jamais seria uma árvore.',
  'Uma árvore jamais seria um rio.',
  'Um rio jamais seria uma estrela.',
  'Toda existência é, ao mesmo tempo, uma criação e uma renúncia.',
  'O Vazio nunca desapareceu.',
  'Ele permanece além daquilo que conhecemos — silencioso, infinito, repleto de possibilidades que jamais encontraram um lugar no mundo.',
  'Às vezes, porém, uma delas escapa.',
  'Uma ideia. Uma lembrança. Um sonho.',
  'Um Fragmento.',
  'E quando isso acontece, a realidade volta a se lembrar de que poderia ter sido diferente.',
  'Porque antes de pertencermos a qualquer reino, qualquer espécie, qualquer mundo, todos tivemos a mesma origem.',
]

export default function PrologoSection() {
  return (
    <section id="prologo" aria-labelledby="prologo-title" style={{ background: 'var(--bg)', padding: '5rem 0' }}>
      <div className="max-w-screen-md mx-auto px-6">
        <p className="lnd-label text-center" aria-hidden>Prólogo</p>

        <div className="flex justify-center mb-4" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/img/icons/kishar-icon.png"
            alt=""
            style={{ width: 50, height: 40, padding: '10px 10px 0px 10px', filter: 'drop-shadow(0 0 12px rgba(var(--gold-rgb),.55))' }}
          />
        </div>

        <h2
          id="prologo-title"
          className="text-center section-heading-glow mb-10"
          style={{ fontFamily: 'var(--font-cinzel)', fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 700, color: 'var(--text)' }}
        >
          Prólogo
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

        <p
          className="text-center gold-glow"
          style={{ fontFamily: 'var(--font-cinzel)', fontSize: 'clamp(1.1rem, 2.2vw, 1.4rem)', fontWeight: 700, color: 'var(--gold)', marginTop: '2.5rem' }}
        >
          Todos somos Filhos do Vazio.
        </p>
      </div>
    </section>
  )
}
