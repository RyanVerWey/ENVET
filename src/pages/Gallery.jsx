import React from 'react'


export default function Gallery() {
    const imgs = [
        '/images/horse1.jpg', '/images/horse2.jpg', '/images/horse3.jpg',
        '/images/arena.jpg', '/images/hero.jpg'
    ]
    return (
        <section>
            <h2 className="text-2xl font-semibold mb-4">Gallery</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {imgs.map((src) => (
                    <img key={src} src={src} alt="ENVET" className="w-full h-56 object-cover rounded-xl shadow" />
                ))}
            </div>
        </section>
    )
}