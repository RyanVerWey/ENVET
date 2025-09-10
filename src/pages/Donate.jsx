import React from 'react'


export default function Donate() {
    const donationUrl = import.meta.env.VITE_DONATION_URL || 'https://www.paypal.com/donate'
    return (
        <section className="grid md:grid-cols-2 gap-6 items-start">
            <div className="bg-white rounded-xl shadow p-6 border border-slate-200">
                <h2 className="text-2xl font-semibold mb-2">Donate to ENVET</h2>
                <p className="text-slate-700 mb-4">Your generosity funds direct services, scholarships, and horse care. Every dollar helps a veteran take the next step.</p>
                <a className="inline-block bg-brand.accent text-white px-5 py-3 rounded-lg font-semibold hover:opacity-90 focus:outline-none focus:ring-4" href={donationUrl} target="_blank" rel="noreferrer">Donate Securely</a>
                <p className="text-xs text-slate-500 mt-3">ENVET is a 501(c)(3) nonprofit. Contributions may be tax-deductible to the extent allowed by law.</p>
            </div>
            <img src="/images/donate.jpg" alt="Support our herd" className="w-full h-64 md:h-full object-cover rounded-xl shadow" />
        </section>
    )
}