/** Compact brand marks for Control Plane payment allowlist cards. */

type LogoProps = { className?: string };

export function PaymentMethodLogo({ method, className }: { method: string; className?: string }) {
  switch (method) {
    case 'STRIPE':
      return <StripeLogo className={className} />;
    case 'PAYPAL':
      return <PayPalLogo className={className} />;
    case 'LIQPAY':
      return <LiqPayLogo className={className} />;
    case 'WAYFORPAY':
      return <WayForPayLogo className={className} />;
    case 'MONOPAY':
      return <MonoPayLogo className={className} />;
    case 'PADDLE':
      return <PaddleLogo className={className} />;
    case 'LEMON_SQUEEZY':
      return <LemonSqueezyLogo className={className} />;
    case 'MANUAL_INVOICE':
      return <ManualInvoiceLogo className={className} />;
    default:
      return <GenericLogo className={className} label={method.slice(0, 2)} />;
  }
}

function StripeLogo({ className }: LogoProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 7.667 0 4.508 2.443 4.508 6.482c0 4.037 2.647 5.791 6.921 7.402 2.368.896 3.162 1.527 3.162 2.496 0 .957-.816 1.508-2.309 1.508-1.973 0-4.76-.921-6.73-2.141l-.911 5.626C6.209 22.922 9.259 24 12.602 24c4.735 0 7.87-2.359 7.87-6.498 0-4.046-2.521-5.807-6.496-8.352z"
      />
    </svg>
  );
}

function PayPalLogo({ className }: LogoProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a.3.3 0 0 1-.032.15c-1.05 5.39-4.64 7.25-9.22 7.25H9.86c-.52 0-.96.38-1.05.9L7.6 22.4h3.52c.46 0 .85-.33.92-.79l.04-.2.73-4.63.05-.25c.07-.46.46-.79.92-.79h.58c3.76 0 6.7-1.53 7.56-5.94.36-1.85.17-3.39-.76-4.48z"
      />
    </svg>
  );
}

function LiqPayLogo({ className }: LogoProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <text
        x="12"
        y="16"
        textAnchor="middle"
        fill="currentColor"
        fontSize="9"
        fontWeight="700"
        fontFamily="system-ui, sans-serif"
      >
        LP
      </text>
    </svg>
  );
}

function WayForPayLogo({ className }: LogoProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <text
        x="12"
        y="16"
        textAnchor="middle"
        fill="currentColor"
        fontSize="8"
        fontWeight="700"
        fontFamily="system-ui, sans-serif"
      >
        WFP
      </text>
    </svg>
  );
}

function MonoPayLogo({ className }: LogoProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <text
        x="12"
        y="16"
        textAnchor="middle"
        fill="currentColor"
        fontSize="8"
        fontWeight="700"
        fontFamily="system-ui, sans-serif"
      >
        mono
      </text>
    </svg>
  );
}

function PaddleLogo({ className }: LogoProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M8.5 4h7a2 2 0 0 1 2 2v3.2c0 3.4-2.2 6.3-5.3 7.3L12 20l-.2-3.5C8.7 15.5 6.5 12.6 6.5 9.2V6a2 2 0 0 1 2-2zm1.2 3.2v2c0 2.1 1.2 4 3.1 4.8.2.1.4.1.6 0 1.9-.8 3.1-2.7 3.1-4.8v-2H9.7z"
      />
    </svg>
  );
}

function LemonSqueezyLogo({ className }: LogoProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M12 3c-2.2 0-4 2.4-4 5.4 0 2.2.9 4.1 2.2 5.1L9 20h6l-1.2-6.5c1.3-1 2.2-2.9 2.2-5.1C16 5.4 14.2 3 12 3zm0 2.2c.9 0 1.8 1.2 1.8 3.2S12.9 11.6 12 11.6 10.2 10.4 10.2 8.4 11.1 5.2 12 5.2z"
      />
    </svg>
  );
}

function ManualInvoiceLogo({ className }: LogoProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M6 2h9l5 5v15a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zm8 1.5V8h4.5L14 3.5zM8 11h8v1.5H8V11zm0 3.5h8V16H8v-1.5zm0 3.5h5V19H8v-1z"
      />
    </svg>
  );
}

function GenericLogo({ className, label }: LogoProps & { label: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <text
        x="12"
        y="16"
        textAnchor="middle"
        fill="currentColor"
        fontSize="9"
        fontWeight="700"
        fontFamily="system-ui, sans-serif"
      >
        {label}
      </text>
    </svg>
  );
}
