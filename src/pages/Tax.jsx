import React from 'react'


export default function Tax() {
    return (
        <article className="prose prose-slate max-w-none">
            <h2>Tax & Compliance</h2>
            <p>ENVET is a registered 501(c)(3) nonprofit organization. Donations are tax-deductible to the extent allowed by law. Please consult your tax advisor for guidance.</p>
            <h3>Documents</h3>
            <ul>
                <li><a href="/docs/IRS-Determination-Letter.pdf" target="_blank" rel="noreferrer">IRS Determination Letter (PDF)</a></li>
                <li><a href="/docs/Form-990.pdf" target="_blank" rel="noreferrer">Most Recent Form 990 (PDF)</a></li>
                <li><a href="/docs/Annual-Report.pdf" target="_blank" rel="noreferrer">Annual Report (PDF)</a></li>
            </ul>
            <h3>Receipts</h3>
            <p>Online donations receive an emailed receipt immediately. For mailed donations, we will provide a written acknowledgement for gifts of $250 or more.</p>
        </article>
    )
}