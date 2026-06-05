export default function Footer() {
  return (
    <div className="app-footer">
      <div className="app-footer-name">QUINIELA MUNDIAL 2026</div>
      <div className="app-footer-contact">
        Responsable: <strong style={{ color: 'var(--text)' }}>Edgar Castillo</strong>
      </div>
      <div className="app-footer-contact" style={{ marginTop: 4 }}>
        Contacto:{' '}
        <a className="app-footer-wa" href="https://wa.me/573004542491" target="_blank" rel="noopener noreferrer">
          📱 +57 300 454 2491
        </a>
      </div>
      <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 8, lineHeight: 1.6 }}>
        Exacto: 5pts · Ganador + un gol: 4pts · Solo ganador: 3pts · Solo un gol: 1pt
      </div>
    </div>
  )
}
