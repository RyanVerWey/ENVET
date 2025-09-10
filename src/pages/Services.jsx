import React from 'react'


const services = [
    { title: 'Equine-Assisted Psychotherapy (EAP)', desc: 'Licensed clinicians integrate horses into therapeutic goals such as regulation, trust, and trauma recovery.' },
    { title: 'Equine-Assisted Learning (EAL)', desc: 'Skill-building in communication, leadership, and teamwork through horse-facilitated activities.' },
    { title: 'Family & Caregiver Programs', desc: 'Workshops that strengthen bonds, understanding, and support at home.' },
    { title: 'Horsemanship & Clinics', desc: 'Foundations in horse care, groundwork, and confidence-building.' },
]


export default function Services() {
    return (
        <section>
            <h2 className="text-2xl font-semibold mb-4">Services</h2>
            <div className="grid md:grid-cols-2 gap-4">
                {services.map((s) => (
                    <div key={s.title} className="bg-white rounded-lg shadow p-5 border border-slate-200">
                        <h3 className="font-semibold text-lg mb-1">{s.title}</h3>
                        <p className="text-slate-700">{s.desc}</p>
                    </div>
                ))}
            </div>
        </section>
    )
}