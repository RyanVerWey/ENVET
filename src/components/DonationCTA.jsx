import React from 'react'


export default function DonationCTA(){
const href = import.meta.env.VITE_DONATION_URL || '/donate'
return (
<section className="bg-white rounded-xl shadow p-6 md:p-8 border border-slate-200">
<h3 className="text-2xl font-semibold mb-2">Help Veterans Heal</h3>
<p className="text-slate-600 mb-4">Your gift powers equine-assisted programs, horse care, and scholarships so veterans and their families can rise together.</p>
<a href={href} className="inline-block bg-brand.accent text-white px-5 py-3 rounded-lg font-semibold hover:opacity-90 focus:outline-none focus:ring-4" target={href.startsWith('http')? '_blank': undefined} rel="noreferrer">Donate Now</a>
</section>
)
}