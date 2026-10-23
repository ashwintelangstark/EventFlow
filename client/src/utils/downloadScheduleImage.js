// Safe roundRect helper for full cross-browser compatibility
function drawRoundedRect(ctx, x, y, width, height, radius = 8) {
  if (typeof ctx.roundRect === 'function') {
    try {
      ctx.roundRect(x, y, width, height, radius);
      return;
    } catch {
      // fallback
    }
  }
  const r = typeof radius === 'number' ? radius : (Array.isArray(radius) ? radius[0] : 8);
  ctx.rect(x, y, width, height);
}

// Utility to render and download the Event Flow schedule as a high-resolution PNG image
export const downloadEventFlowAsImage = (stagesList = []) => {
  if (!stagesList || stagesList.length === 0) {
    alert('No event flow stages available to download.');
    return;
  }

  const items = stagesList.map((s, idx) => ({
    number: s.stage || s.step || idx + 1,
    title: s.title || `Stage ${idx + 1}`,
    time: s.time || (s.startTime && s.endTime ? `${s.startTime} – ${s.endTime}` : ''),
    speaker: s.speaker || s.description || s.desc || '',
    activities: Array.isArray(s.activities) ? s.activities : (Array.isArray(s.key_activities) ? s.key_activities : [])
  }));

  // Setup canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const width = 1200;
  const paddingX = 48;
  const cardWidth = width - (paddingX * 2);

  // Measure dynamic height
  const headerHeight = 240;
  const footerHeight = 100;
  
  // Calculate each card's height based on content
  const cardHeights = items.map((item) => {
    let h = 76; // base for title and speaker
    if (item.speaker) h += 24;
    if (item.activities.length > 0) {
      h += 16 + (item.activities.length * 24);
    }
    return Math.max(90, h);
  });

  const cardsTotalHeight = cardHeights.reduce((acc, h) => acc + h + 16, 0);
  const totalHeight = headerHeight + cardsTotalHeight + footerHeight;

  // Retina scale
  const scale = 2;
  canvas.width = width * scale;
  canvas.height = totalHeight * scale;
  ctx.scale(scale, scale);

  // Background gradient
  const bgGrad = ctx.createLinearGradient(0, 0, width, totalHeight);
  bgGrad.addColorStop(0, '#060a14');
  bgGrad.addColorStop(0.3, '#0a1020');
  bgGrad.addColorStop(0.7, '#070c18');
  bgGrad.addColorStop(1, '#050811');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, totalHeight);

  // Ambient glow effects
  const glow1 = ctx.createRadialGradient(200, 120, 10, 200, 120, 400);
  glow1.addColorStop(0, 'rgba(28, 127, 255, 0.18)');
  glow1.addColorStop(1, 'rgba(28, 127, 255, 0)');
  ctx.fillStyle = glow1;
  ctx.fillRect(0, 0, width, 500);

  const glow2 = ctx.createRadialGradient(width - 200, 200, 10, width - 200, 200, 350);
  glow2.addColorStop(0, 'rgba(150, 70, 255, 0.15)');
  glow2.addColorStop(1, 'rgba(150, 70, 255, 0)');
  ctx.fillStyle = glow2;
  ctx.fillRect(0, 0, width, 500);

  // Grid lines subtle background
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
  ctx.lineWidth = 1;
  for (let x = 0; x < width; x += 60) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, totalHeight);
    ctx.stroke();
  }
  for (let y = 0; y < totalHeight; y += 60) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // --- HEADER ---
  let curY = 44;

  // Pill badge: AU-QUASAR
  ctx.fillStyle = 'rgba(19, 220, 229, 0.12)';
  ctx.strokeStyle = 'rgba(19, 220, 229, 0.35)';
  ctx.lineWidth = 1;
  const badgeText = 'AU-QUASAR INNOVATION CENTER  ·  ALLIANCE UNIVERSITY';
  ctx.font = '600 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  const badgeWidth = ctx.measureText(badgeText).width + 24;
  
  ctx.beginPath();
  drawRoundedRect(ctx, paddingX, curY, badgeWidth, 26, 13);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#13dce5';
  ctx.fillText(badgeText, paddingX + 12, curY + 17);

  curY += 50;

  // Event Main Title
  ctx.font = '800 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  const titleGrad = ctx.createLinearGradient(paddingX, curY, paddingX + 500, curY);
  titleGrad.addColorStop(0, '#ffffff');
  titleGrad.addColorStop(0.5, '#54b2ff');
  titleGrad.addColorStop(1, '#9646ff');
  ctx.fillStyle = titleGrad;
  ctx.fillText('IDEA  →  AI  →  IMPACT', paddingX, curY);

  curY += 32;

  // Subtitle
  ctx.font = '500 17px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('Official Event Flow & Program Schedule Breakdown', paddingX, curY);

  curY += 28;

  // Metadata chips (Date, Time, Venue)
  const metaChips = [
    { icon: '📅', text: 'Sat, 24 Oct 2026' },
    { icon: '⏰', text: '10:00 AM – 1:00 PM IST' },
    { icon: '📍', text: 'AU-QUASAR Center, Bengaluru' }
  ];

  let chipX = paddingX;
  metaChips.forEach((chip) => {
    ctx.font = '500 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    const label = `${chip.icon}  ${chip.text}`;
    const w = ctx.measureText(label).width + 20;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    drawRoundedRect(ctx, chipX, curY, w, 28, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#e2e8f0';
    ctx.fillText(label, chipX + 10, curY + 18);
    chipX += w + 12;
  });

  curY += 55;

  // Section Header Line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(paddingX, curY);
  ctx.lineTo(width - paddingX, curY);
  ctx.stroke();

  curY += 25;

  // --- STAGES CARDS ---
  const badgeColors = [
    { bg: 'rgba(16, 212, 163, 0.2)', border: '#10d4a3', text: '#10d4a3' },
    { bg: 'rgba(28, 127, 255, 0.2)', border: '#1c7fff', text: '#54b2ff' },
    { bg: 'rgba(150, 70, 255, 0.2)', border: '#9646ff', text: '#ba75ff' },
    { bg: 'rgba(224, 36, 165, 0.2)', border: '#e024a5', text: '#ff5ec7' },
    { bg: 'rgba(245, 166, 35, 0.2)', border: '#f5a623', text: '#f5a623' },
    { bg: 'rgba(19, 220, 229, 0.2)', border: '#13dce5', text: '#13dce5' }
  ];

  items.forEach((item, idx) => {
    const cardH = cardHeights[idx];
    const color = badgeColors[idx % badgeColors.length];

    // Card background
    ctx.fillStyle = 'rgba(18, 24, 38, 0.7)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    drawRoundedRect(ctx, paddingX, curY, cardWidth, cardH, 10);
    ctx.fill();
    ctx.stroke();

    // Left accent bar
    ctx.fillStyle = color.border;
    ctx.beginPath();
    drawRoundedRect(ctx, paddingX, curY, 4, cardH, [10, 0, 0, 10]);
    ctx.fill();

    // Stage number circle
    const numCircleX = paddingX + 28;
    const numCircleY = curY + 28;
    ctx.fillStyle = color.bg;
    ctx.strokeStyle = color.border;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(numCircleX, numCircleY, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(String(item.number), numCircleX, numCircleY + 5);
    ctx.textAlign = 'left';

    // Title
    ctx.fillStyle = '#f8fafc';
    ctx.font = '700 17px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(item.title, paddingX + 54, curY + 28);

    // Time pill (top right)
    if (item.time) {
      ctx.font = '600 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      const timeWidth = ctx.measureText(item.time).width + 20;
      const timeX = width - paddingX - timeWidth - 14;
      const timeY = curY + 16;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.beginPath();
      drawRoundedRect(ctx, timeX, timeY, timeWidth, 24, 12);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.fillText(item.time, timeX + 10, timeY + 16);
    }

    // Speaker / Subtitle
    let textY = curY + 50;
    if (item.speaker) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '500 13.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(`🎙️  ${item.speaker}`, paddingX + 54, textY);
      textY += 22;
    }

    // Activities list
    if (item.activities && item.activities.length > 0) {
      ctx.fillStyle = '#64748b';
      ctx.font = '600 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('KEY HIGHLIGHTS:', paddingX + 54, textY);
      textY += 16;

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '400 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      item.activities.forEach((act) => {
        ctx.fillText(`●  ${act}`, paddingX + 60, textY);
        textY += 20;
      });
    }

    curY += cardH + 14;
  });

  // --- FOOTER ---
  curY += 10;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(paddingX, curY);
  ctx.lineTo(width - paddingX, curY);
  ctx.stroke();

  curY += 30;

  ctx.fillStyle = '#64748b';
  ctx.font = '500 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('EventFlow Operations Platform  ·  AU-QUASAR DeepTech Labs  ·  STPI Bengaluru', paddingX, curY);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText('events.datadice.in  ·  24 Oct 2026', width - paddingX, curY);
  ctx.textAlign = 'left';

  // Export to PNG & download
  try {
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'IDEA-AI-IMPACT_Event_Flow_Schedule.png';
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error('Image export failed:', err);
    alert('Failed to generate image. Please try again.');
  }
};
