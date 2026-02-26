import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-14">
      <section className="grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="flex flex-col gap-6">
          <span className="tag">Encrypted Sharing</span>
          <h1 className="text-4xl font-semibold tracking-tight text-green-300 sm:text-5xl">
            Share sensitive files with confidence.
          </h1>
          <p className="text-green-200/80">
            SecureShare encrypts uploads, protects links with optional
            passwords, and gives you clear control over access. Built for
            teams that need speed without compromising security.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/dashboard" className="btn btn-primary">
              Launch Dashboard
            </Link>
            <Link href="/signup" className="btn btn-ghost">
              Create Account
            </Link>
          </div>
          <div className="flex flex-wrap gap-6 text-xs uppercase tracking-[0.2em] text-green-400/70">
            <span>Encrypted Uploads</span>
            <span>Password Control</span>
            <span>Audit Friendly</span>
          </div>
        </div>
        <div className="card">
          <div className="flex flex-col gap-6">
            <div>
              <p className="label">Quick Start</p>
              <h2 className="text-xl font-semibold text-green-200">
                Upload in seconds
              </h2>
            </div>
            <div className="space-y-4 text-sm text-green-200/80">
              <div className="card-soft">
                <p className="font-semibold text-green-300">
                  1. Authenticate
                </p>
                <p>Log in and access the secure dashboard.</p>
              </div>
              <div className="card-soft">
                <p className="font-semibold text-green-300">2. Protect</p>
                <p>Add a password before generating a link.</p>
              </div>
              <div className="card-soft">
                <p className="font-semibold text-green-300">3. Share</p>
                <p>Send the private link to your recipient.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="card-soft">
          <p className="label">Granular Control</p>
          <h3 className="mt-3 text-lg font-semibold text-green-200">
            Optional password protection
          </h3>
          <p className="mt-2 text-sm text-green-200/80">
            Add a passphrase to every share and keep access restricted to
            the right people.
          </p>
        </div>
        <div className="card-soft">
          <p className="label">Reliable Delivery</p>
          <h3 className="mt-3 text-lg font-semibold text-green-200">
            Built on resilient storage
          </h3>
          <p className="mt-2 text-sm text-green-200/80">
            Files are stored securely and served through a hardened
            delivery layer.
          </p>
        </div>
        <div className="card-soft">
          <p className="label">Operational Insight</p>
          <h3 className="mt-3 text-lg font-semibold text-green-200">
            Download visibility
          </h3>
          <p className="mt-2 text-sm text-green-200/80">
            Track download activity and understand when files are accessed.
          </p>
        </div>
      </section>
    </div>
  );
}
