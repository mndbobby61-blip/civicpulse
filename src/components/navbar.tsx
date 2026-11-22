export default function Navbar() {
  return (
    <nav className="cp-nav">
      <div className="cp-logo">
        <svg viewBox="0 0 34 18" aria-hidden="true">
          <path d="M0 9h9l3-7 5 14 4-10 2 3h11" fill="none" stroke="var(--g2)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        CivicPulse
      </div>
      <div className="cp-links">
        <a href="#how">কীভাবে কাজ করে</a>
        <a href="#map">লাইভ ম্যাপ</a>
        <a href="#rank">র‍্যাঙ্কিং</a>
        <a href="#faq">প্রশ্ন</a>
      </div>
      <button className="cp-btn" style={{ padding: "10px 22px" }}>সমস্যা জানান</button>
    </nav>
  );
}