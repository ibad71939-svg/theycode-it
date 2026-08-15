import { Link } from 'react-router-dom';

// PLACEHOLDER CONTENT — this is generic starter language, not a substitute
// for real legal review. Before going live, especially given this app
// collects CNIC/ID numbers, DOB, home address, and guardian contact info for
// what may include minors, have this reviewed against Pakistan's applicable
// data-protection rules and update the specifics (retention periods, who to
// contact, etc.) for your actual academy.
export default function Terms() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="font-display text-3xl font-bold mb-2">Terms & Privacy Policy</h1>
      <p className="text-muted text-sm mb-10">Last updated: — fill in when you finalize this page.</p>

      <div className="space-y-8 text-sm leading-relaxed text-ink/90">
        <section>
          <h2 className="font-display text-lg font-semibold mb-2">1. What we collect</h2>
          <p>
            When you register as a student, we collect your name, email, phone number, CNIC/ID number,
            date of birth, address, and — optionally — a guardian or emergency contact's name, relationship,
            and phone number. Payment records (amount, method, and any receipt you upload) are stored against
            your enrollment.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold mb-2">2. Why we collect it</h2>
          <p>
            This information is used to maintain your official enrollment and academic record, verify your
            identity, process fee payments, issue certificates, and contact you or your guardian about your
            enrollment, batch schedule, or fees. We do not sell your data to third parties.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold mb-2">3. Guardian / emergency contact information</h2>
          <p>
            If you provide a guardian's details, this is used only for emergency contact and academic-record
            purposes. If you are under 18, we recommend a parent or guardian review this registration with you
            before you submit it.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold mb-2">4. How we protect it</h2>
          <p>
            Payment receipts are stored in a private file store and are only ever accessible through a
            short-lived, authenticated link — never a public URL. Access to student records is limited to
            authorized academy staff.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold mb-2">5. Your rights</h2>
          <p>
            You may request a copy of the personal data we hold about you, ask us to correct inaccurate
            details, or request deletion of your account, subject to our obligation to retain academic and
            financial records as required by law. Contact the academy office to make a request.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold mb-2">6. Contact</h2>
          <p>
            Questions about this policy? Reach out via the <Link to="/contact" className="text-brand-700 font-semibold">contact page</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}