/**
 * Logo S (monograma) oficial de Smorzar — SVG inlineado.
 */
export function SmorzarLogo({ size = 36 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 1024 1024"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      style={{ display: 'block', flexShrink: 0 }}
    >
      <defs>
        <clipPath id="smz-rounded">
          <rect width="1024" height="1024" rx="224" />
        </clipPath>
        <pattern id="smz-grid" x="0" y="0" width="341.3" height="341.3" patternUnits="userSpaceOnUse">
          <line x1="341.3" y1="0" x2="341.3" y2="341.3" stroke="#32302A" strokeWidth="2" />
          <line x1="0" y1="341.3" x2="341.3" y2="341.3" stroke="#32302A" strokeWidth="2" />
        </pattern>
      </defs>
      <rect width="1024" height="1024" rx="224" fill="#26231E" />
      <g clipPath="url(#smz-rounded)">
        <rect width="1024" height="1024" fill="url(#smz-grid)" />
        <text x="518" y="652" textAnchor="middle"
          fontFamily="'Playfair Display SC', 'Playfair Display', Georgia, serif"
          fontSize="680" fontWeight="700" fill="#4A2C04">S</text>
        <text x="512" y="640" textAnchor="middle"
          fontFamily="'Playfair Display SC', 'Playfair Display', Georgia, serif"
          fontSize="680" fontWeight="700" fill="#C97B0A">S</text>
        <text x="512" y="630" textAnchor="middle"
          fontFamily="'Playfair Display SC', 'Playfair Display', Georgia, serif"
          fontSize="680" fontWeight="700" fill="#E8960E" opacity="0.42">S</text>
      </g>
    </svg>
  )
}

/**
 * Logo SMORZAR completo (nombre) — SVG inlineado.
 * Aspect ratio 1:1 con el nombre centrado y líneas ornamentales.
 */
export function SmorzarLogoName({ size = 120 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 1024 1024"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      style={{ display: 'block', flexShrink: 0 }}
    >
      <defs>
        <clipPath id="smzn-rounded">
          <rect width="1024" height="1024" rx="224" />
        </clipPath>
        <pattern id="smzn-grid" x="0" y="0" width="341.3" height="341.3" patternUnits="userSpaceOnUse">
          <line x1="341.3" y1="0" x2="341.3" y2="341.3" stroke="#32302A" strokeWidth="2" />
          <line x1="0" y1="341.3" x2="341.3" y2="341.3" stroke="#32302A" strokeWidth="2" />
        </pattern>
      </defs>
      <rect width="1024" height="1024" rx="224" fill="#26231E" />
      <g clipPath="url(#smzn-rounded)">
        <rect width="1024" height="1024" fill="url(#smzn-grid)" />
        <line x1="140" y1="430" x2="884" y2="430" stroke="#7A4A06" strokeWidth="3" />
        <line x1="140" y1="594" x2="884" y2="594" stroke="#7A4A06" strokeWidth="3" />
        <text x="516" y="584" textAnchor="middle"
          fontFamily="'Playfair Display SC', 'Playfair Display', Georgia, serif"
          fontSize="148" fontWeight="700" fill="#4A2C04" letterSpacing="14">SMORZAR</text>
        <text x="512" y="580" textAnchor="middle"
          fontFamily="'Playfair Display SC', 'Playfair Display', Georgia, serif"
          fontSize="148" fontWeight="700" fill="#C97B0A" letterSpacing="14">SMORZAR</text>
        <text x="512" y="575" textAnchor="middle"
          fontFamily="'Playfair Display SC', 'Playfair Display', Georgia, serif"
          fontSize="148" fontWeight="700" fill="#E8960E" letterSpacing="14" opacity="0.38">SMORZAR</text>
      </g>
    </svg>
  )
}
