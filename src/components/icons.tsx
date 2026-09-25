/**
 * Small stroke-based icon set for the admin dashboard — sidebar nav and stat
 * card badges. Kept in one file since each is a few lines of SVG.
 */
type IconProps = { className?: string };

const base = "h-5 w-5";

export function DashboardIcon({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75h6.5v6.5h-6.5v-6.5ZM13.75 3.75h6.5v6.5h-6.5v-6.5ZM3.75 13.75h6.5v6.5h-6.5v-6.5ZM13.75 13.75h6.5v6.5h-6.5v-6.5Z" />
    </svg>
  );
}

export function DocumentIcon({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 3.75h7l4 4v12.5H7V3.75Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 3.75V8h4M9.5 12.5h5M9.5 15.75h5" />
    </svg>
  );
}

export function AcademicCapIcon({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m3 8.5 9-4.25 9 4.25-9 4.25L3 8.5Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 10.5v4.75c0 1.25 2.24 2.5 5 2.5s5-1.25 5-2.5V10.5M20 8.5v5.5" />
    </svg>
  );
}

export function UsersIcon({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 11a3.25 3.25 0 1 0 0-6.5A3.25 3.25 0 0 0 9 11ZM3.5 19.25c0-3 2.46-5 5.5-5s5.5 2 5.5 5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 4.83a3.25 3.25 0 0 1 0 6.34M18.5 19.25c0-2.6-1.83-4.5-4.25-4.94" />
    </svg>
  );
}

export function BellIcon({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 9.5a6 6 0 1 1 12 0c0 4 1.5 5.25 1.5 5.25H4.5S6 13.5 6 9.5Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17.5a2.25 2.25 0 0 0 4.5 0" />
    </svg>
  );
}

export function CalendarIcon({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <rect x="3.75" y="5" width="16.5" height="15" rx="2" />
      <path strokeLinecap="round" d="M8 3v4M16 3v4M3.75 10h16.5" />
    </svg>
  );
}

export function TrendUpIcon({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16.5 10 10l3.5 3.5L20 7M20 7v4.5M20 7h-4.5" />
    </svg>
  );
}

export function TrendDownIcon({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 7.5 10 14l3.5-3.5L20 17M20 17v-4.5M20 17h-4.5" />
    </svg>
  );
}

export function ClockIcon({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <circle cx="12" cy="12" r="8.25" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5V12l3 2" />
    </svg>
  );
}

export function SearchIcon({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <circle cx="10.75" cy="10.75" r="6.25" />
      <path strokeLinecap="round" d="m19.5 19.5-4.3-4.3" />
    </svg>
  );
}

export function AlertIcon({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.75 2.75 20h18.5L12 3.75Z" />
      <path strokeLinecap="round" d="M12 10v4M12 16.75h.01" />
    </svg>
  );
}

export function PaperAirplaneIcon({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 3 3 10.5l7.5 2.5L13 20l8-17Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 3 10.5 13" />
    </svg>
  );
}

export function IdCardIcon({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <rect x="3" y="5.5" width="18" height="13" rx="2" />
      <circle cx="8.5" cy="11.25" r="1.75" />
      <path strokeLinecap="round" d="M5.75 15.5c.5-1.4 1.6-2.1 2.75-2.1s2.25.7 2.75 2.1M14 9.5h5.25M14 12.75h5.25" />
    </svg>
  );
}

export function CheckCircleIcon({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <circle cx="12" cy="12" r="8.25" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.5 12.25 2.4 2.4 4.6-5.3" />
    </svg>
  );
}

export function XCircleIcon({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <circle cx="12" cy="12" r="8.25" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m9.25 9.25 5.5 5.5M14.75 9.25l-5.5 5.5" />
    </svg>
  );
}

export function RupeeIcon({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" d="M7 5h10M7 9.5h10M7 5c4.5 0 7 1.5 7 4.5S11.5 14 7 14h-.25L15 19" />
    </svg>
  );
}

export function ShieldIcon({ className = base }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.5 5 6v5.5c0 4.4 3 7.9 7 9 4-1.1 7-4.6 7-9V6l-7-2.5Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m9 12 2.2 2.2L15.5 10" />
    </svg>
  );
}
