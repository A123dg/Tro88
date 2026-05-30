import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

function Icon({ children, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      {children}
    </svg>
  )
}

export const Home = (props: IconProps) => <Icon {...props}><path d="m3 11 9-8 9 8" /><path d="M5 10v10h14V10" /><path d="M9 20v-6h6v6" /></Icon>
export const Building2 = (props: IconProps) => <Icon {...props}><path d="M4 21V5a2 2 0 0 1 2-2h9v18" /><path d="M15 8h3a2 2 0 0 1 2 2v11" /><path d="M8 7h3M8 11h3M8 15h3" /></Icon>
export const Menu = (props: IconProps) => <Icon {...props}><path d="M4 7h16M4 12h16M4 17h16" /></Icon>
export const FileText = (props: IconProps) => <Icon {...props}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M8 13h8M8 17h8M8 9h2" /></Icon>
export const CreditCard = (props: IconProps) => <Icon {...props}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18" /></Icon>
export const Receipt = (props: IconProps) => <Icon {...props}><path d="M6 2h12v20l-3-2-3 2-3-2-3 2z" /><path d="M8 7h8M8 11h8M8 15h5" /></Icon>
export const Zap = (props: IconProps) => <Icon {...props}><path d="m13 2-9 13h8l-1 7 9-13h-8z" /></Icon>
export const Wrench = (props: IconProps) => <Icon {...props}><path d="M14.7 6.3a4 4 0 0 0-5 5L3 18l3 3 6.7-6.7a4 4 0 0 0 5-5l-2.6 2.6-3-3z" /></Icon>
export const Settings = (props: IconProps) => <Icon {...props}><path d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5z" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2 3.4-.2-.1a1.7 1.7 0 0 0-2 .3l-.3.2a1.7 1.7 0 0 0-.9 1.6V22H10v-.3a1.7 1.7 0 0 0-.9-1.6l-.3-.2a1.7 1.7 0 0 0-2-.3l-.2.1-2-3.4.1-.1A1.7 1.7 0 0 0 5 15v-.4a1.7 1.7 0 0 0-1.1-1.4l-.3-.1V9.2l.3-.1A1.7 1.7 0 0 0 5 7.7v-.4a1.7 1.7 0 0 0-.3-1.9l-.1-.1 2-3.4.2.1a1.7 1.7 0 0 0 2-.3l.3-.2A1.7 1.7 0 0 0 10 .2V0h4v.3a1.7 1.7 0 0 0 .9 1.6l.3.2a1.7 1.7 0 0 0 2 .3l.2-.1 2 3.4-.1.1A1.7 1.7 0 0 0 19 7.7v.4a1.7 1.7 0 0 0 1.1 1.4l.3.1v3.9l-.3.1a1.7 1.7 0 0 0-1.1 1.4z" /></Icon>
export const ChartBar = (props: IconProps) => <Icon {...props}><path d="M4 19V9M10 19V5M16 19v-8M22 19H2" /></Icon>
export const Bot = (props: IconProps) => <Icon {...props}><rect x="4" y="7" width="16" height="12" rx="3" /><path d="M12 3v4M8 12h.01M16 12h.01M9 16h6" /></Icon>
export const Bell = (props: IconProps) => <Icon {...props}><path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></Icon>
export const User = (props: IconProps) => <Icon {...props}><path d="M20 21a8 8 0 0 0-16 0" /><circle cx="12" cy="7" r="4" /></Icon>
export const LogOut = (props: IconProps) => <Icon {...props}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5M21 12H9" /></Icon>
export const Plus = (props: IconProps) => <Icon {...props}><path d="M12 5v14M5 12h14" /></Icon>
