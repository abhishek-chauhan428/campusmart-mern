const getEmailDomain = (email = '') => {
  const value = String(email).trim().toLowerCase();
  const at = value.lastIndexOf('@');
  return at === -1 ? '' : value.slice(at + 1);
};

const getAllowedCollegeDomains = () =>
  String(process.env.COLLEGE_EMAIL_DOMAINS || '')
    .split(',')
    .map((domain) => domain.trim().toLowerCase())
    .filter(Boolean);

const isAllowedCollegeEmail = (email) => {
  const domain = getEmailDomain(email);
  const allowed = getAllowedCollegeDomains();

  return Boolean(domain) && allowed.includes(domain);
};

module.exports = {
  getEmailDomain,
  getAllowedCollegeDomains,
  isAllowedCollegeEmail,
};
