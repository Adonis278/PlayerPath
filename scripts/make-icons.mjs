import sharp from "sharp";

// Mark: a stylised path rising through a chevron - "player path".
const svg = (size, maskable) => {
  const pad = maskable ? size * 0.18 : size * 0.08;
  const inner = size - pad * 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#0f7a4a"/>
  <g transform="translate(${pad} ${pad})">
    <path d="M ${inner * 0.16} ${inner * 0.74}
             L ${inner * 0.4} ${inner * 0.46}
             L ${inner * 0.56} ${inner * 0.6}
             L ${inner * 0.84} ${inner * 0.24}"
          fill="none" stroke="#ffffff" stroke-width="${inner * 0.1}"
          stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="${inner * 0.84}" cy="${inner * 0.24}" r="${inner * 0.085}" fill="#8ef0bd"/>
  </g>
</svg>`;
};

const out = "public";
await sharp(Buffer.from(svg(192, false))).png().toFile(`${out}/icon-192.png`);
await sharp(Buffer.from(svg(512, false))).png().toFile(`${out}/icon-512.png`);
await sharp(Buffer.from(svg(512, true))).png().toFile(`${out}/icon-maskable-512.png`);
console.log("icons written");
