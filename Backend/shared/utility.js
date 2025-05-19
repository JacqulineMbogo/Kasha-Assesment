function formatPhone(phone) {
  if (!phone) return '';

  try {
    const raw = String(phone).trim().replace(/\s+/g, '').replace(/^\+/, '');

    if (raw.startsWith('07') || raw.startsWith('01')) {
      return '254' + raw.slice(1);
    }

    if (raw.startsWith('2547') || raw.startsWith('2541')) {
      return raw;
    }

    if (/^[71]\d{8}$/.test(raw)) {
      return '254' + raw;
    }

    return raw;
  } catch (error) {
    return '';
  }
}

module.exports = { formatPhone };
