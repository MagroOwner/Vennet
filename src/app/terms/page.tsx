import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | Vennet",
  description: "Terms of Service for the Vennet digital marketplace.",
};

const sections: Array<[string, string[]]> = [
  ["1. Definitions", [
    "“Account” means a registered Vennet user account. “Buyer” means a user who purchases an Offer. “Seller” means a user who lists or sells an Offer. “Offer” means a digital-only product, service, membership, subscription, download, file, template, software license, or other non-physical offering listed on Vennet.",
    "“Vennet,” “we,” “us,” and “our” mean [Legal Company Name], a [Michigan entity type], with its principal business address at [Business Address]. “Services” means Vennet’s website, marketplace, creator tools, payment features, verification tools, and related software. “Stripe Account” means a Stripe or Stripe Connect account used to receive payouts. “Terms” means these Terms of Service and the policies incorporated by reference.",
  ]],
  ["2. Acceptance and eligibility", [
    "By creating an Account, clicking acceptance, listing an Offer, making a purchase, connecting a Stripe Account, or otherwise using the Services, you agree to these Terms. If you use the Services for an entity, you represent that you may bind that entity.",
    "You must be at least 18 to create an Account, sell, connect a Stripe Account, or use your own payment method. Users aged 13 to 17 may use the Services only with a parent or legal guardian’s consent and supervision. The parent or guardian must control the Account and be the legal owner or authorized representative of each payment account used. No one under 13 may use the Services.",
  ]],
  ["3. Digital marketplace services", [
    "Vennet is a digital-only marketplace and creator platform. It helps Sellers list Digital Offers and helps Buyers discover and purchase them. Physical goods, shipping, inventory, and in-person delivery are not permitted.",
    "Unless Vennet says otherwise in writing, the transaction for an Offer is between the Buyer and Seller. Vennet is not the Seller, does not control or guarantee an Offer, and is not a party to the Buyer-Seller contract. Sellers are responsible for accurate descriptions, delivery, rights and licenses, customer support, taxes, and compliance with law.",
  ]],
  ["4. Accounts, credentials, and security", [
    "You must provide accurate, current information and keep it updated. You may not share your credentials, impersonate another person, or let another person use your Account without written permission.",
    "You are responsible for safeguarding your password, recovery email, devices, authentication methods, and activity under your Account. Use the password-reset process if you lose access, and immediately notify us at vennetofficial@gmail.com of suspected unauthorized access. We may require identity verification before restoring access or making sensitive Account changes.",
  ]],
  ["5. Acceptable use", [
    "You may use the Services only for lawful Digital Offers and lawful purposes. You may not list physical goods; infringing, fraudulent, deceptive, harmful, regulated, or prohibited content; or anything that violates Stripe rules, card-network rules, sanctions, tax law, consumer-protection law, export controls, or another person’s rights.",
    "You may not use stolen payment methods, fake reviews, self-dealing, reputation manipulation, fraudulent chargebacks, false identities, malicious code, scraping, unauthorized security testing, or technical interference.",
    "You may not bypass Vennet or Stripe to avoid Fees, verification, payment controls, disputes, or legal obligations. You may not use contracts, technical methods, side agreements, intermediaries, entities, disclaimers, or any other workaround to transfer your payment, fraud, tax, regulatory, or legal responsibility to Vennet, Stripe, a Buyer, Seller, or another person. A violation is a material breach of these Terms.",
  ]],
  ["6. Payments, Stripe, Fees, and payouts", [
    "Vennet uses Stripe as its third-party payment processor and Stripe Connect to route eligible marketplace proceeds to Sellers. By using payment or payout features, you authorize Vennet and Stripe to process the information and instructions reasonably needed to complete transactions, manage fraud, administer refunds and disputes, and comply with law.",
    "Stripe is an independent third party and is not Vennet’s employee, agent, partner, or guarantor. Stripe’s services are governed by the Stripe Services Agreement, Stripe Connected Account Agreement, and Stripe Privacy Policy. By using payment or payout features, you agree to the applicable Stripe terms at stripe.com/legal and stripe.com/privacy.",
    "A Seller must complete Stripe Connect onboarding and maintain an eligible Stripe Account. The Seller, or its legal entity or adult parent/guardian where applicable, is the legal owner and responsible representative of that account. Stripe may reject, delay, limit, reverse, or suspend onboarding, charges, transfers, or payouts. Vennet cannot require Stripe to approve or maintain an account.",
    "For each completed marketplace transaction, Vennet retains a 5% platform fee unless a different fee is clearly disclosed before purchase. Subject to Stripe’s processing, reserves, disputes, refunds, and applicable law, the remaining amount is routed to the Seller’s connected Stripe Account. Stripe processing fees, conversion fees, taxes, refunds, chargeback fees, and other disclosed charges may also apply.",
    "Payout timing is controlled by Stripe, banking networks, risk reviews, the Seller’s Stripe settings, and law. Vennet does not guarantee a payout date or fund availability. We may delay, hold, offset, or direct a hold where reasonably necessary to address fraud, a refund, a dispute, a chargeback, a legal obligation, or a policy violation.",
  ]],
  ["7. Prices, taxes, refunds, and chargebacks", [
    "Prices and currency are shown at checkout. Buyers are responsible for the purchase price and applicable taxes, duties, conversion costs, and payment-method charges. Sellers are responsible for taxes and reporting related to Offers and payouts unless law requires otherwise.",
    "Refund rights may vary by Offer, applicable law, and Vennet’s published Refund Policy. Sellers must accurately disclose material terms, deliverables, timing, and refund conditions before a Buyer purchases. A Seller policy cannot reduce rights that law does not allow it to waive.",
    "Buyers should first try to resolve an issue with the Seller through available Vennet support or dispute tools. If a chargeback or payment dispute is opened, each party must cooperate. Vennet may provide relevant transaction, delivery, communication, and account records to Stripe, financial institutions, regulators, law enforcement, or others as permitted by law and our Privacy Policy.",
    "Sellers remain responsible for refunds, chargebacks, reversals, negative balances, Stripe fees, and losses arising from their Offers, delivery failure, misrepresentation, breach, fraud, or policy violation. Buyers remain responsible for fraudulent, abusive, or bad-faith chargebacks.",
  ]],
  ["8. Seller promises", [
    "Each Seller represents that it owns or has all rights, licenses, permissions, and authority needed to offer and deliver each Offer; describes it accurately; will deliver it as promised; and will comply with applicable law and Stripe requirements. Vennet may remove or restrict an Offer at any time. Removal does not release the Seller from obligations to Buyers, Stripe, Vennet, or third parties.",
  ]],
  ["9. Intellectual property and DMCA", [
    "Vennet and its licensors own the Services, software, branding, and Vennet-created content. Except for the limited right to use the Services, no rights are granted.",
    "You retain ownership of Content you submit, but grant Vennet a worldwide, nonexclusive, royalty-free, transferable, sublicensable license to host, reproduce, format, display, distribute, market, and use that Content as needed to operate, improve, protect, promote, and provide the Services.",
    "To submit a copyright notice, send the information required by 17 U.S.C. § 512 to: DMCA Agent, [Legal Company Name], [DMCA Mailing Address], vennetofficial@gmail.com. Include identification of the copyrighted work and the allegedly infringing Content, your contact information, good-faith and accuracy statements, and your physical or electronic signature. Vennet will process valid notices and counter-notices under applicable law.",
  ]],
  ["10. Privacy and payment data", [
    "Our Privacy Policy explains how we collect, use, retain, and disclose personal information. By using the Services, you acknowledge that policy.",
    "Vennet does not intentionally store full payment-card numbers on its servers. Payment information is submitted to and processed by Stripe or another Payment Processor using its payment tools, security controls, and tokenization. Vennet may receive transaction, payout, fraud, verification, and account information needed to operate the Services, enforce these Terms, resolve disputes, and comply with law.",
  ]],
  ["11. Disclaimers", [
    "THE SERVICES, CONTENT, AND ALL OFFERS ARE PROVIDED “AS IS” AND “AS AVAILABLE.” TO THE MAXIMUM EXTENT PERMITTED BY LAW, VENNET DISCLAIMS ALL EXPRESS, IMPLIED, AND STATUTORY WARRANTIES, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, NON-INFRINGEMENT, ACCURACY, SECURITY, AVAILABILITY, AND UNINTERRUPTED OPERATION.",
    "VENNET DOES NOT GUARANTEE AN OFFER’S quality, legality, delivery, suitability, profitability, or fitness for a Buyer’s needs. VENNET DOES NOT GUARANTEE that Stripe, a bank, a network, or another third party will be uninterrupted, secure, error-free, or available.",
  ]],
  ["12. Limitation of liability", [
    "TO THE MAXIMUM EXTENT PERMITTED BY LAW, VENNET AND ITS OWNERS, OFFICERS, EMPLOYEES, CONTRACTORS, AFFILIATES, LICENSORS, AND AGENTS WILL NOT BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, OR FOR LOST PROFITS, REVENUE, DATA, BUSINESS, GOODWILL, OR BUSINESS INTERRUPTION.",
    "VENNET’S TOTAL AGGREGATE LIABILITY ARISING FROM OR RELATING TO THE SERVICES OR THESE TERMS WILL NOT EXCEED THE GREATER OF: (A) FEES YOU PAID DIRECTLY TO VENNET IN THE 12 MONTHS BEFORE THE EVENT GIVING RISE TO THE CLAIM; OR (B) $100.",
    "Vennet is not liable for Stripe or other third-party payment failures, bank delays, conversion, payment reversals, Seller or Buyer conduct, Offer quality, delivery failures, chargebacks, or disputes, except to the extent directly caused by Vennet’s gross negligence, willful misconduct, or liability that cannot legally be limited.",
  ]],
  ["13. Indemnification", [
    "You will defend, indemnify, and hold harmless Vennet and its owners, officers, employees, contractors, affiliates, licensors, and agents from claims, liabilities, damages, losses, fines, penalties, costs, and expenses, including reasonable attorneys’ fees, arising from your Content, Offer, purchase, sale, delivery, breach of these Terms, violation of law, fraud, chargebacks, tax obligations, misuse of payment features, or attempt to circumvent these Terms or shift your responsibility through a workaround.",
  ]],
  ["14. Suspension and termination", [
    "We may suspend, restrict, remove Content from, or terminate an Account or access to the Services if we reasonably believe you violated these Terms, created risk, engaged in fraud, failed verification, caused excessive disputes or chargebacks, or if Stripe, law, a regulator, or a court requires it.",
    "Termination does not erase accrued obligations. Fees, refunds, chargebacks, reversals, disputes, indemnification duties, and provisions that should survive by their nature will survive. We may retain data as required by law or to prevent fraud, resolve disputes, and enforce these Terms.",
  ]],
  ["15. Michigan law, arbitration, and class-action waiver", [
    "These Terms are governed by Michigan law and applicable U.S. federal law, without regard to conflict-of-law rules. Except as stated below, court proceedings must be brought in the state or federal courts located in [County], Michigan.",
    "Before arbitration or court proceedings, the complaining party must send a written notice describing the dispute and requested relief. Send notices to vennetofficial@gmail.com and [Legal Notice Mailing Address]. The parties will try in good faith to resolve the dispute for 30 days.",
    "Except where prohibited by law, unresolved disputes will be resolved by binding individual arbitration under the Federal Arbitration Act, administered by the American Arbitration Association under its applicable consumer or commercial rules. Arbitration will take place in [County], Michigan, or remotely where the applicable rules allow. Either party may bring an eligible claim in small-claims court or seek injunctive relief for intellectual-property infringement, confidential-information misuse, fraud, unauthorized access, or circumvention of these Terms.",
    "YOU AND VENNET AGREE TO BRING CLAIMS ONLY IN AN INDIVIDUAL CAPACITY, NOT AS A CLASS MEMBER, REPRESENTATIVE, OR PARTICIPANT IN A CLASS, COLLECTIVE, CONSOLIDATED, OR PRIVATE-ATTORNEY-GENERAL ACTION. YOU AND VENNET WAIVE A JURY TRIAL TO THE EXTENT PERMITTED BY LAW.",
    "You may opt out of arbitration within 30 days after first accepting these Terms. Email vennetofficial@gmail.com with the subject “Arbitration Opt-Out” and include your full legal name, Account email, mailing address, and a clear statement that you opt out. This opt-out affects only arbitration and not the rest of these Terms.",
  ]],
  ["16. General terms and contact", [
    "If any provision is unenforceable, it will be enforced to the maximum extent allowed and the remaining provisions remain effective. Failure to enforce a right is not a waiver. These Terms, the Privacy Policy, Refund Policy, Seller rules, and incorporated policies are the entire agreement regarding the Services and replace prior discussions on that subject.",
    "We may update these Terms by posting a revised version and updating the effective date. Continued use after the effective date means acceptance to the extent permitted by law.",
    "For Account, marketplace, refund, or policy questions, contact Vennet at vennetofficial@gmail.com. For Stripe Account, payout, or payment-processor questions, contact Stripe through the Stripe Dashboard or Stripe Support.",
  ]],
],

  ["17. Buyer responsibilities and no-reselling", [
    "Buyers receive only the rights expressly stated in the applicable Offer and any stated license. Unless the Seller gives prior written permission, a Buyer may not resell, redistribute, repackage, sublicense, transfer, publicly post, publish, share, reproduce beyond permitted personal use, or make available to another person any Digital Offer purchased through Vennet.",
    "Buyers may not reverse engineer, decompile, disassemble, modify, extract, scrape, use unauthorized automation with, or create derivative works from a Digital Offer except where applicable law makes a restriction unenforceable. Buyers may not use a purchased Digital Offer for unlawful, deceptive, infringing, abusive, or harmful purposes.",
    "Buyers must communicate with Sellers respectfully and may not harass, threaten, abuse, dox, defame, coerce, extort, or otherwise mistreat Sellers. Buyers may not misuse Vennet’s dispute, refund, review, or chargeback processes to obtain a Digital Offer without paying for it or to pressure a Seller into providing value beyond the stated Offer.",
  ]],
  ["18. Seller digital delivery and support requirements", [
    "Sellers must deliver each Digital Offer within the time stated in the listing, or, if no time is stated, within a commercially reasonable time. Sellers must use a delivery method reasonably suited to the Offer and must retain reasonable proof of delivery, access, completion, or availability when applicable.",
    "Sellers must provide valid, accurate, and non-misleading license terms. A Seller may not sell a license it does not own or have authority to grant, imply that a license is exclusive when it is not, or represent that a Buyer receives rights that the Seller cannot legally provide.",
    "Seller support is required. Sellers must provide reasonable, timely support for access issues, delivery issues, license issues, and material defects in a Digital Offer. Sellers must provide support through the contact method and duration disclosed in the listing, or, if none is disclosed, through a reasonable support channel for a reasonable period after delivery.",
    "Sellers must not provide fake, AI-generated, or misleading deliverables, including content represented as original, human-created, custom, licensed, verified, complete, or functional when it is not. Sellers are responsible for clearly disclosing all material use of artificial intelligence, third-party assets, limitations, dependencies, and delivery conditions.",
  ]],
  ["19. Marketplace listing rules", [
    "Each listing must clearly and accurately disclose the Digital Offer’s nature, included files or services, format, compatibility, material technical requirements, delivery method, delivery timing, price, applicable license, use restrictions, support method, support duration, and any material limitations. A Seller must promptly update a listing if a disclosure becomes inaccurate.",
    "Listings may not offer physical goods, unlawful goods or services, stolen or infringing material, deceptive or misleading content, unlicensed accounts or credentials, malware, exploits, spam, fraudulent services, adult content where prohibited, regulated financial products, or any item prohibited by law, Stripe, card-network rules, or Vennet policy.",
    "Listing images, samples, descriptions, reviews, claims, availability statements, and performance claims must be accurate and substantiated. Sellers may not conceal a material limitation, use bait-and-switch tactics, or describe a Digital Offer in a way likely to mislead a reasonable Buyer.",
  ]],
  ["20. Seller verification", [
    "Vennet may require a Seller to complete identity verification, business verification, tax verification, Stripe verification, proof of ownership or licensing of Digital Offers, proof of delivery, or other information we reasonably request to prevent fraud, comply with Stripe requirements, comply with law, or protect Users.",
    "A Seller must provide complete, current, and truthful verification information. We may suspend, restrict, withhold access to, remove listings from, or terminate a Seller Account that fails, refuses, or is unable to complete verification, or where submitted information is inconsistent, inaccurate, suspicious, or unsupported.",
  ]],
  ["21. Data retention and security practices", [
    "Vennet may retain Account, identity, verification, transaction, payout, dispute, communications, device, security, fraud, and activity information for fraud prevention, Stripe compliance, legal and tax obligations, security, dispute resolution, enforcement of these Terms, audit, and legitimate business-record purposes.",
    "After Account deletion, we may retain information that is reasonably necessary for those purposes, including transaction records, payout records, dispute records, verification records, fraud and security records, support communications, and records required by law or Stripe. We will handle retained information as described in our Privacy Policy and applicable law.",
    "Vennet does not intentionally store full payment-card numbers on its servers. Payment-card information is processed by Stripe or another Payment Processor using its payment infrastructure and tokenization tools. No security system is perfect, and we do not guarantee that the Services will be free from unauthorized access, interruption, or loss.",
  ]],
  ["22. Platform modifications, downtime, and fee changes", [
    "Vennet may modify, add, remove, suspend, or discontinue any feature, listing category, policy, payment method, verification process, or part of the Services at any time. We do not guarantee uptime, uninterrupted access, error-free operation, or continued availability of any feature.",
    "To the maximum extent permitted by law, Vennet is not liable for downtime, maintenance, service interruptions, outages, data delays, failed transmissions, Stripe or bank interruptions, or modifications to the Services. Users should maintain their own appropriate backups of Content and business records.",
    "Vennet may change its platform fees by providing notice through the Services, by email, or by another reasonable method. A fee change applies only to transactions initiated after the effective date disclosed in the notice. It does not retroactively change the platform fee for a completed transaction.",
  ]],
  ["23. No API, automation, or unauthorized access", [
    "Vennet does not offer a public API. You may not access, query, copy, monitor, index, scrape, crawl, harvest, automate, or interact with the Services through bots, scripts, agents, browser automation, data-extraction tools, reverse engineering, or other automated means unless Vennet gives prior written permission.",
    "You may not attempt to discover source code, bypass access controls, interfere with the Services, create accounts or transactions by automated means, or use automation to gain an unfair commercial, technical, or marketplace advantage. This prohibition is in addition to, and does not limit, the anti-circumvention and prohibited-conduct provisions of these Terms.",
  ]],
];

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-4xl space-y-8">
      <header className="console-panel p-7 sm:p-10">
        <p className="font-mono text-xs font-bold uppercase tracking-widest text-emerald-400">Legal</p>
        <h1 className="mt-3 text-4xl font-black">Terms of Service</h1>
        <p className="mt-3 text-zinc-400">Effective date: [Month Day, Year] · Last updated: [Month Day, Year]</p>
        <p className="mt-5 leading-7 text-zinc-300">These Terms govern your use of Vennet, a digital-only marketplace for products, services, and creator offers. Please read them carefully.</p>
        <p className="mt-4 rounded-lg border border-amber-800 bg-amber-950/20 p-4 text-sm leading-6 text-amber-200">Template notice: Before publishing, replace all bracketed fields and have a qualified Michigan attorney review this page and its related policies.</p>
      </header>
      {sections.map(([heading, paragraphs]) => (
        <section key={heading} className="console-panel p-6">
          <h2 className="text-xl font-bold">{heading}</h2>
          <div className="mt-4 space-y-4 leading-7 text-zinc-300">{paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
        </section>
      ))}
      <section className="console-panel p-6">
        <h2 className="text-xl font-bold">Short checkout disclosure</h2>
        <p className="mt-4 leading-7 text-zinc-300">Payments and payouts are processed by Stripe. By continuing, you authorize Vennet and Stripe to process your payment or payout information under Vennet’s Terms and Privacy Policy and the applicable Stripe terms. Sellers receive marketplace proceeds through their connected Stripe Accounts, less Vennet’s disclosed 5% platform fee and applicable processing, refund, dispute, tax, or other charges.</p>
        <div className="mt-5 flex gap-4 text-sm"><Link href="/marketplace" className="text-emerald-400 hover:underline">Explore Vennet</Link><a href="https://stripe.com/legal" target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline">Stripe legal terms</a></div>
      </section>
    </article>
  );
}
