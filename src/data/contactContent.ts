/**
 * Central editable Contact Smartphone configuration.
 * Update your Email, LinkedIn, GitHub, and WhatsApp details here at any time.
 */
export type ContactChannelId = 'email' | 'linkedin' | 'github' | 'whatsapp'

export interface ContactChannelItem {
  id: ContactChannelId
  label: string
  /** Display value shown inside the smartphone interface */
  value: string
  /** Action URL or protocol target (mailto:, https://, https://wa.me/) */
  href: string
}

export interface ContactContentConfig {
  /** Lock screen & app header title */
  headline: string
  /** Intro message shown beneath LET'S CONNECT */
  message: string
  /** Contact channels list */
  channels: ContactChannelItem[]
  /** Prominent primary CTA button label */
  ctaLabel: string
  /** Primary CTA action href (defaults to mailto) */
  ctaHref: string
}

export const CONTACT_CONTENT: ContactContentConfig = {
  headline: "LET'S CONNECT",
  message:
    '"Have a project in mind or just want to say hello? I\'d love to hear from you."',
  channels: [
    {
      id: 'email',
      label: 'Email',
      value: 'benny457@gmail.com',
      href: 'mailto:benny457@gmail.com',
    },
  ],
  ctaLabel: 'Get in Touch',
  ctaHref: 'mailto:benny457@gmail.com?subject=Project%20Inquiry',
}
