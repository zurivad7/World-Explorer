// Feedback address for the "Contact Me" link. Set this to the address you want
// shown publicly on the live site. Until it is a real address the footer shows a
// neutral line with no mailto, so we never ship a broken/placeholder link.
const FEEDBACK_EMAIL = '';

/** App footer with a Contact link for feedback, suggestions and corrections. */
export function AppFooter() {
  const email = FEEDBACK_EMAIL.trim();
  const subject = encodeURIComponent('World Explorer — feedback');

  return (
    <footer className="app-footer">
      {email ? (
        <p>
          Have feedback, an idea, or spotted a mistake?{' '}
          <a href={`mailto:${email}?subject=${subject}`}>Contact Me</a>
        </p>
      ) : (
        <p>Made for curious young explorers.</p>
      )}
    </footer>
  );
}
